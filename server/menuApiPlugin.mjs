import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

const ADMIN_USER = 'admin';
const ADMIN_PASS = 'admin123';
const SESSION_SECRET = 'tfl-admin-session-token-v1';

function createAuthToken() {
  return crypto
    .createHash('sha256')
    .update(`${ADMIN_USER}:${ADMIN_PASS}:${SESSION_SECRET}`)
    .digest('hex');
}

const VALID_TOKEN = createAuthToken();

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(payload));
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 15 * 1024 * 1024) {
        reject(new Error('Payload too large'));
      }
    });
    req.on('end', () => {
      try {
        resolve(raw ? JSON.parse(raw) : {});
      } catch (err) {
        reject(err);
      }
    });
    req.on('error', reject);
  });
}

function normalizeAndRecomputeMenu(data) {
  const items = Array.isArray(data.items) ? data.items : [];
  const categories = Array.isArray(data.categories) ? data.categories : [];

  const updatedCategories = categories.map((cat) => {
    const catItems = items.filter((i) => i.categoryId === cat.id);
    const subSet = new Set(Array.isArray(cat.subcategories) ? cat.subcategories.filter(Boolean) : []);
    for (const item of catItems) {
      if (item.subcategory) subSet.add(item.subcategory);
    }
    return {
      ...cat,
      itemCount: catItems.length,
      subcategories: Array.from(subSet),
    };
  });

  const stats = {
    totalCategories: updatedCategories.length,
    totalSubcategories: updatedCategories.reduce((acc, c) => acc + c.subcategories.length, 0),
    totalItems: items.length,
    activeItems: items.filter((i) => i.active !== false).length,
    itemsWithImages: items.filter((i) => Boolean(i.image)).length,
    itemsWithDescriptions: items.filter((i) => Boolean(i.description)).length,
    itemsWithCalories: items.filter((i) => Boolean(i.calories)).length,
    itemsMissingPrice: items.filter((i) => i.price === null || i.price === undefined).length,
  };

  return {
    restaurant: {
      ...(data.restaurant || {}),
      updatedAt: new Date().toISOString(),
    },
    stats,
    categories: updatedCategories,
    items,
  };
}

function attachMenuApiMiddleware(middlewares, rootDir) {
  const menuFilePath = path.resolve(rootDir, 'menu_data.json');

  middlewares.use(async (req, res, next) => {
    const urlPath = (req.url || '').split('?')[0];

    // GET /api/menu -> live read from menu_data.json
    if (urlPath === '/api/menu' && req.method === 'GET') {
      try {
        const raw = await fs.readFile(menuFilePath, 'utf-8');
        const parsed = JSON.parse(raw);
        return sendJson(res, 200, parsed);
      } catch (err) {
        return sendJson(res, 500, {
          error: 'menu_data.json okunamadı',
          details: err.message,
        });
      }
    }

    // POST /api/auth/login -> authenticate admin / admin123
    if (urlPath === '/api/auth/login' && req.method === 'POST') {
      try {
        const body = await readJsonBody(req);
        const username = String(body.username || '').trim();
        const password = String(body.password || '');

        if (username === ADMIN_USER && password === ADMIN_PASS) {
          return sendJson(res, 200, {
            ok: true,
            token: VALID_TOKEN,
            user: { username: ADMIN_USER, role: 'admin' },
          });
        }
        return sendJson(res, 401, {
          ok: false,
          error: 'Kullanıcı adı veya şifre hatalı.',
        });
      } catch {
        return sendJson(res, 400, { ok: false, error: 'Geçersiz istek gövdesi.' });
      }
    }

    // PUT /api/menu -> validate token and persist directly to menu_data.json
    if (urlPath === '/api/menu' && req.method === 'PUT') {
      const authHeader = req.headers.authorization || '';
      const token = authHeader.replace(/^Bearer\s+/i, '').trim();
      if (token !== VALID_TOKEN) {
        return sendJson(res, 401, { ok: false, error: 'Yetkisiz işlem. Lütfen yeniden giriş yapın.' });
      }

      try {
        const body = await readJsonBody(req);
        if (!body || !Array.isArray(body.items) || !Array.isArray(body.categories)) {
          return sendJson(res, 400, { ok: false, error: 'Geçersiz menü veri formatı.' });
        }

        const normalized = normalizeAndRecomputeMenu(body);
        const tempPath = `${menuFilePath}.tmp`;
        await fs.writeFile(tempPath, JSON.stringify(normalized, null, 2), 'utf-8');
        await fs.rename(tempPath, menuFilePath);

        return sendJson(res, 200, {
          ok: true,
          savedAt: normalized.restaurant.updatedAt,
          data: normalized,
        });
      } catch (err) {
        return sendJson(res, 500, {
          ok: false,
          error: 'menu_data.json yazılamadı.',
          details: err.message,
        });
      }
    }

    next();
  });
}

export function menuApiPlugin() {
  let rootDir = process.cwd();

  return {
    name: 'the-food-lounge-menu-api',
    configResolved(config) {
      rootDir = config.root;
    },
    configureServer(server) {
      attachMenuApiMiddleware(server.middlewares, rootDir);
    },
    configurePreviewServer(server) {
      attachMenuApiMiddleware(server.middlewares, rootDir);
    },
    handleHotUpdate({ file }) {
      // Prevent page reload/flicker when Admin Dashboard writes to menu_data.json
      if (file.endsWith('menu_data.json')) {
        return [];
      }
    },
  };
}
