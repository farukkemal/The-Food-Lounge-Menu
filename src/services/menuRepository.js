import bundledMenuData from '../../menu_data.json';

const LOCAL_STORAGE_KEY = 'tfl_menu_data_cache_v1';
export const AUTH_STORAGE_KEY = 'tfl_admin_auth_v1';

export function normalizeTurkish(str = '') {
  return String(str)
    .toLocaleLowerCase('tr-TR')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ı/g, 'i');
}

export function slugify(str = '') {
  const trMap = {
    ç: 'c', Ç: 'c', ğ: 'g', Ğ: 'g', ı: 'i', İ: 'i',
    ö: 'o', Ö: 'o', ş: 's', Ş: 's', ü: 'u', Ü: 'u',
  };
  return String(str)
    .split('')
    .map((ch) => trMap[ch] || ch)
    .join('')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function formatPriceTL(amount) {
  if (typeof amount !== 'number' || Number.isNaN(amount)) return '';
  const hasFraction = Math.abs(amount - Math.round(amount)) > 0.001;
  return (
    new Intl.NumberFormat('tr-TR', {
      minimumFractionDigits: hasFraction ? 2 : 0,
      maximumFractionDigits: 2,
    }).format(amount) + ' ₺'
  );
}

function resolveAssetUrl(url) {
  if (typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (/^(https?:|data:|blob:)/i.test(trimmed)) return trimmed;
  const base = import.meta.env.BASE_URL || '/';
  const cleanBase = base.endsWith('/') ? base : `${base}/`;
  const withoutBase = trimmed.startsWith(cleanBase)
    ? trimmed.slice(cleanBase.length)
    : trimmed.replace(/^\/+/, '');
  return `${cleanBase}${withoutBase}`;
}

export function recomputeMenuData(rawData) {
  const safeData = rawData && typeof rawData === 'object' ? rawData : {};
  const rawItems = Array.isArray(safeData.items) ? safeData.items : [];
  const rawCategories = Array.isArray(safeData.categories) ? safeData.categories : [];

  const items = rawItems
    .filter((item) => item && typeof item === 'object')
    .map((item, idx) => {
      const parsedPrice =
        typeof item.price === 'number'
          ? item.price
          : typeof item.price === 'string'
            ? Number.parseFloat(item.price.replace(',', '.'))
            : NaN;
      const numPrice = Number.isFinite(parsedPrice) ? parsedPrice : null;

      return {
        id: item.id || `tfl-fallback-${idx + 1}`,
        title: String(item.title || 'İsimsiz Ürün').trim(),
        titleEn: item.titleEn ? String(item.titleEn).trim() : String(item.title || 'Unnamed Item').trim(),
        category: String(item.category || 'Diğer').trim(),
        categoryEn: item.categoryEn ? String(item.categoryEn).trim() : String(item.category || 'Other').trim(),
        categoryId: String(item.categoryId || 'cat-uncategorized'),
        subcategory: item.subcategory ? String(item.subcategory).trim() : null,
        subcategoryEn: item.subcategoryEn ? String(item.subcategoryEn).trim() : (item.subcategory ? String(item.subcategory).trim() : null),
        description: item.description ? String(item.description).trim() : '',
        descriptionEn: item.descriptionEn ? String(item.descriptionEn).trim() : (item.description ? String(item.description).trim() : ''),
        calories: item.calories ? String(item.calories).trim() : null,
        image: resolveAssetUrl(item.image),
        active: item.active !== false,
        featured: Boolean(item.featured),
        price: numPrice,
        priceFormatted:
          numPrice !== null ? formatPriceTL(numPrice) : item.priceFormatted || '—',
        dietary: Array.isArray(item.dietary) ? item.dietary.filter(Boolean) : [],
      };
    });

  const categories = rawCategories
    .filter((cat) => cat && typeof cat === 'object')
    .map((cat, idx) => {
      const id = String(cat.id || `cat-fallback-${idx + 1}`);
      const name = String(cat.name || 'Kategori').trim();
      const catItems = items.filter((i) => i.categoryId === id);
      const activeCatItems = catItems.filter((i) => i.active !== false);
      const subSet = new Set(
        Array.isArray(cat.subcategories) ? cat.subcategories.filter(Boolean) : []
      );
      for (const item of catItems) {
        if (item.subcategory) subSet.add(item.subcategory);
      }
      return {
        ...cat,
        id,
        name,
        nameEn: cat.nameEn ? String(cat.nameEn).trim() : name,
        slug: cat.slug || slugify(name) || id,
        image: resolveAssetUrl(cat.image),
        itemCount: activeCatItems.length,
        totalItemCount: catItems.length,
        subcategories: Array.from(subSet),
        subcategoryLabelsEn:
          cat.subcategoryLabelsEn && typeof cat.subcategoryLabelsEn === 'object'
            ? cat.subcategoryLabelsEn
            : {},
      };
    });

  const stats = {
    totalCategories: categories.length,
    totalSubcategories: categories.reduce(
      (acc, c) => acc + c.subcategories.length,
      0
    ),
    totalItems: items.length,
    activeItems: items.filter((i) => i.active !== false).length,
    featuredItems: items.filter((i) => i.active !== false && Boolean(i.featured)).length,
    itemsWithImages: items.filter((i) => Boolean(i.image)).length,
    itemsWithDescriptions: items.filter((i) => Boolean(i.description)).length,
    itemsWithCalories: items.filter((i) => Boolean(i.calories)).length,
    itemsMissingPrice: items.filter((i) => i.price === null).length,
  };

  const fallbackRestaurant = bundledMenuData?.restaurant || {
    name: 'The Food Lounge',
    address: 'Koza Mah. 1655 Sok. Akbatı AVM No:6, D:3, 34538 Esenyurt/İstanbul',
    hoursLabel: '08:00 – 24:00',
    googleReviewUrl: 'https://maps.google.com/?cid=15489077177326640443',
    workingHours: [],
    socials: {},
  };

  return {
    restaurant: {
      ...fallbackRestaurant,
      ...(safeData.restaurant && typeof safeData.restaurant === 'object'
        ? safeData.restaurant
        : {}),
      name: safeData.restaurant?.name || fallbackRestaurant.name || 'The Food Lounge',
      address:
        safeData.restaurant?.address ||
        fallbackRestaurant.address ||
        'Koza Mah. 1655 Sok. Akbatı AVM No:6, D:3, 34538 Esenyurt/İstanbul',
      hoursLabel:
        safeData.restaurant?.hoursLabel ||
        fallbackRestaurant.hoursLabel ||
        '08:00 – 24:00',
      googleReviewUrl:
        safeData.restaurant?.googleReviewUrl ||
        fallbackRestaurant.googleReviewUrl ||
        'https://maps.google.com/?cid=15489077177326640443',
    },
    stats,
    categories,
    items,
  };
}

export function buildMenuIndex(menuData) {
  const normalized = recomputeMenuData(menuData);

  const allItems = normalized.items.map((item) => ({
    ...item,
    _searchText: normalizeTurkish(
      `${item.title} ${item.category} ${item.subcategory || ''} ${item.description || ''}`
    ),
  }));

  const activeItems = allItems.filter((i) => i.active !== false);
  const featuredItems = activeItems.filter((i) => Boolean(i.featured));

  const itemsById = new Map();
  const activeItemsByCategory = new Map();
  const allItemsByCategory = new Map();

  for (const item of allItems) {
    itemsById.set(item.id, item);

    if (!allItemsByCategory.has(item.categoryId)) {
      allItemsByCategory.set(item.categoryId, []);
    }
    allItemsByCategory.get(item.categoryId).push(item);

    if (item.active !== false) {
      if (!activeItemsByCategory.has(item.categoryId)) {
        activeItemsByCategory.set(item.categoryId, []);
      }
      activeItemsByCategory.get(item.categoryId).push(item);
    }
  }

  const categoriesById = new Map();
  for (const cat of normalized.categories) {
    categoriesById.set(cat.id, cat);
  }

  return {
    restaurant: normalized.restaurant,
    stats: normalized.stats,
    categories: normalized.categories,
    activeCategories: normalized.categories.filter((c) => c.itemCount > 0),
    allItems,
    activeItems,
    featuredItems,

    getCategoryById(categoryId) {
      return categoriesById.get(categoryId) || null;
    },

    getItemById(itemId, { includeInactive = false } = {}) {
      const item = itemsById.get(itemId) || null;
      if (!item) return null;
      if (!includeInactive && item.active === false) return null;
      return item;
    },

    getItemsByCategory(categoryId, subcategory = null, { includeInactive = false } = {}) {
      const map = includeInactive ? allItemsByCategory : activeItemsByCategory;
      const list = map.get(categoryId) || [];
      if (!subcategory) return list;
      return list.filter((item) => item.subcategory === subcategory);
    },

    searchItems(query, { categoryId = null, includeInactive = false, statusFilter = 'all' } = {}) {
      const q = normalizeTurkish(query.trim());
      let pool;
      if (categoryId) {
        const map = includeInactive ? allItemsByCategory : activeItemsByCategory;
        pool = map.get(categoryId) || [];
      } else {
        pool = includeInactive ? allItems : activeItems;
      }

      if (includeInactive && statusFilter === 'active') {
        pool = pool.filter((i) => i.active !== false);
      } else if (includeInactive && statusFilter === 'passive') {
        pool = pool.filter((i) => i.active === false);
      } else if (includeInactive && statusFilter === 'featured') {
        pool = pool.filter((i) => Boolean(i.featured));
      }

      if (!q) return pool;
      const terms = q.split(/\s+/).filter(Boolean);
      return pool.filter((item) => terms.every((t) => item._searchText.includes(t)));
    },
  };
}

export function getInitialMenuData() {
  try {
    const cached = window.localStorage.getItem(LOCAL_STORAGE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Array.isArray(parsed?.items) && Array.isArray(parsed?.categories)) {
        return recomputeMenuData(parsed);
      }
    }
  } catch {
    // ignore storage errors
  }
  return recomputeMenuData(bundledMenuData);
}

export function cacheMenuDataLocally(data) {
  try {
    window.localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(data));
  } catch {
    // ignore quota errors
  }
}

export async function fetchLiveMenuData() {
  const res = await fetch('/api/menu', { cache: 'no-store' });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  const normalized = recomputeMenuData(data);
  cacheMenuDataLocally(normalized);
  return normalized;
}

export async function persistMenuDataToServer(data, token) {
  const cleanPayload = {
    restaurant: data.restaurant,
    categories: data.categories.map(({ totalItemCount: _ignore, ...cat }) => cat),
    items: data.items.map(({ _searchText: _ignore, ...item }) => item),
  };

  cacheMenuDataLocally(recomputeMenuData(cleanPayload));

  try {
    const res = await fetch('/api/menu', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token || ''}`,
      },
      body: JSON.stringify(cleanPayload),
    });

    if (res.status === 401) {
      return { ok: false, unauthorized: true, mode: 'file' };
    }

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const result = await res.json();
    const saved = recomputeMenuData(result.data || cleanPayload);
    cacheMenuDataLocally(saved);
    return {
      ok: true,
      mode: 'file',
      savedAt: result.savedAt || new Date().toISOString(),
      data: saved,
    };
  } catch {
    // Graceful fallback if deployed as a purely static site without Node backend
    return {
      ok: true,
      mode: 'local',
      savedAt: new Date().toISOString(),
      data: recomputeMenuData(cleanPayload),
    };
  }
}

export async function authenticateAdmin(username, password) {
  const u = String(username || '').trim();
  const p = String(password || '');

  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: u, password: p }),
    });
    const payload = await res.json();
    if (res.ok && payload.ok) {
      return { ok: true, token: payload.token, user: payload.user };
    }
    return { ok: false, error: payload.error || 'Kullanıcı adı veya şifre hatalı.' };
  } catch {
    // Fallback for static deployments without API middleware
    if (u === 'admin' && p === 'admin123') {
      return {
        ok: true,
        token: 'local-admin-token',
        user: { username: 'admin', role: 'admin' },
      };
    }
    return { ok: false, error: 'Kullanıcı adı veya şifre hatalı.' };
  }
}

export function readStoredAuth() {
  try {
    const raw =
      window.localStorage.getItem(AUTH_STORAGE_KEY) ||
      window.sessionStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed?.token && parsed?.user?.username) return parsed;
  } catch {
    // ignore
  }
  return null;
}

export function writeStoredAuth(auth, remember = true) {
  const serialized = JSON.stringify(auth);
  try {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    window.sessionStorage.removeItem(AUTH_STORAGE_KEY);
    if (remember) {
      window.localStorage.setItem(AUTH_STORAGE_KEY, serialized);
    } else {
      window.sessionStorage.setItem(AUTH_STORAGE_KEY, serialized);
    }
  } catch {
    // ignore
  }
}

export function clearStoredAuth() {
  try {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    window.sessionStorage.removeItem(AUTH_STORAGE_KEY);
  } catch {
    // ignore
  }
}
