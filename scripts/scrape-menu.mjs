import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as cheerio from 'cheerio';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');

const SOURCE_URL = 'https://thefoodlounge.akbatidijital.com/';
const BASE_ORIGIN = 'https://thefoodlounge.akbatidijital.com';

function cleanText(text) {
  if (!text) return '';
  return text
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{2,}/g, '\n')
    .trim();
}

function slugify(str) {
  const trMap = {
    ç: 'c', Ç: 'c', ğ: 'g', Ğ: 'g', ı: 'i', İ: 'i',
    ö: 'o', Ö: 'o', ş: 's', Ş: 's', ü: 'u', Ü: 'u',
  };
  return str
    .split('')
    .map((ch) => trMap[ch] || ch)
    .join('')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function resolveImageUrl(raw) {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (!trimmed) return null;
  // Ignore bare root URLs without a file path
  if (trimmed === SOURCE_URL || trimmed === BASE_ORIGIN || trimmed === '/') {
    return null;
  }
  let fullUrl;
  try {
    fullUrl = new URL(trimmed, SOURCE_URL).href;
  } catch {
    return null;
  }
  if (fullUrl === SOURCE_URL || fullUrl === `${BASE_ORIGIN}/`) {
    return null;
  }
  return fullUrl;
}

function parsePrice(rawPrice) {
  if (!rawPrice) return { value: null, formatted: '' };
  const cleaned = rawPrice.replace(/[^\d.,]/g, '').trim();
  if (!cleaned) return { value: null, formatted: cleanText(rawPrice) };

  // Turkish format: spaces/dots as thousands separator, comma as decimal separator
  // e.g. "1 590,00 ₺" -> cleaned "1590,00" -> 1590
  let normalized = cleaned;
  if (normalized.includes(',')) {
    normalized = normalized.replace(/\./g, '').replace(',', '.');
  } else {
    normalized = normalized.replace(/\./g, '');
  }

  const num = Number.parseFloat(normalized);
  if (Number.isNaN(num)) {
    return { value: null, formatted: cleanText(rawPrice) };
  }

  const hasFraction = Math.abs(num - Math.round(num)) > 0.001;
  const formatted = new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: hasFraction ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(num) + ' ₺';

  return { value: num, formatted };
}

function extractCaloriesAndDescription(rawDesc) {
  const cleaned = cleanText(rawDesc);
  if (!cleaned) return { description: '', calories: null };

  // Match patterns like "2710 kcal*", "215 kcal", "350 KCAL *"
  const kcalRegex = /(\d+(?:[.,]\d+)?)\s*kcal\*?/i;
  const match = cleaned.match(kcalRegex);
  const calories = match ? `${match[1]} kcal` : null;

  // Strip standalone calorie line/suffix for crisp UI rendering
  let description = cleaned
    .replace(/\s*\d+(?:[.,]\d+)?\s*kcal\*?\s*$/i, '')
    .replace(/^\s*\d+(?:[.,]\d+)?\s*kcal\*?\s*$/i, '')
    .replace(/\n+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();

  return { description, calories };
}

async function downloadFile(url, destPaths) {
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
    },
  });
  if (!res.ok) {
    throw new Error(`Failed to download ${url}: HTTP ${res.status}`);
  }
  const arrayBuffer = await res.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  for (const destPath of destPaths) {
    await fs.mkdir(path.dirname(destPath), { recursive: true });
    await fs.writeFile(destPath, buffer);
  }
  return buffer.length;
}

async function scrapeMenu() {
  console.log(`\n🔍 Kaynak site taranıyor: ${SOURCE_URL}`);

  const response = await fetch(SOURCE_URL, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml',
      'Accept-Language': 'tr-TR,tr;q=0.9,en;q=0.8',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} - ${response.statusText}`);
  }

  const html = await response.text();
  const $ = cheerio.load(html);

  // 1. Restaurant Metadata & Logo
  const brandName = cleanText($('.brand-name').first().text()) || 'The Food Lounge';
  const logoRaw = $('.brand-logo-img img').first().attr('src');
  const logoSourceUrl = resolveImageUrl(logoRaw);

  let logoBytes = 0;
  if (logoSourceUrl) {
    logoBytes = await downloadFile(logoSourceUrl, [
      path.join(ROOT_DIR, 'src', 'assets', 'logo.png'),
      path.join(ROOT_DIR, 'public', 'logo.png'),
    ]);
  }

  // Extract CSS theme tokens
  const styleText = $('head style').text();
  const getCssVar = (name, fallback) => {
    const m = styleText.match(new RegExp(`${name}:\\s*([^;\\n]+)`));
    return m ? m[1].trim() : fallback;
  };

  // Extract business info
  const features = [];
  $('#landing-info .feature-item').each((_, el) => {
    const txt = cleanText($(el).text());
    if (txt) features.push(txt);
  });

  const workingHours = [];
  $('#landing-info .hours-table tr').each((_, row) => {
    const cells = $(row).find('td');
    if (cells.length >= 2) {
      workingHours.push({
        day: cleanText($(cells[0]).text()),
        hours: cleanText($(cells[1]).text()),
      });
    }
  });

  const directionsUrl = $('#landing-info .info-actions a[target="_blank"]').attr('href') || null;
  const mapEmbedUrl = $('#landing-info .map-container iframe').attr('src') || null;
  const instagramUrl = $('.footer-socials a.ig').attr('href') || null;
  const facebookUrl = $('.footer-socials a.fb').attr('href') || null;

  // 2. Category Cover Images from Showcase
  const categoryCovers = new Map();
  $('#categoryShowcase .category-card').each((_, el) => {
    const onclick = $(el).attr('onclick') || '';
    const idMatch = onclick.match(/navigateToMenu\('([^']+)'\)/);
    const style = $(el).find('.category-card-image').attr('style') || '';
    const imgMatch = style.match(/url\(['"]?([^'")]+)['"]?\)/);
    if (idMatch) {
      categoryCovers.set(idMatch[1], resolveImageUrl(imgMatch ? imgMatch[1] : null));
    }
  });

  // 3. Parse Menu Sections & Items
  const categories = [];
  const items = [];
  let itemCounter = 0;

  $('section.menu-section').each((catIndex, sectionEl) => {
    const $section = $(sectionEl);
    const categoryId = $section.attr('id') || `cat-${catIndex + 1}`;
    const categoryTitle = cleanText($section.find('> .section-header .section-title').first().text());
    const categorySlug = slugify(categoryTitle);

    const subcategorySet = new Set();
    let categoryItemCount = 0;
    let firstItemImage = null;

    const parseCard = ($card, subcategoryName) => {
      itemCounter += 1;
      categoryItemCount += 1;

      const title = cleanText($card.attr('data-name') || $card.find('.product-name').text());
      const rawDesc = $card.attr('data-desc') ?? $card.find('.product-desc').text();
      const rawPrice = $card.attr('data-price') || $card.find('.product-price').text();
      const imgTagSrc = $card.find('img.product-image').attr('src');
      const dataImage = $card.attr('data-image');
      const imageUrl = resolveImageUrl(imgTagSrc) || resolveImageUrl(dataImage);

      if (!firstItemImage && imageUrl) {
        firstItemImage = imageUrl;
      }

      const { value: price, formatted: priceFormatted } = parsePrice(rawPrice);
      const { description, calories } = extractCaloriesAndDescription(rawDesc);

      const dietary = [];
      $card.find('.dietary-labels span').each((_, spanEl) => {
        const label = $(spanEl).attr('title') || cleanText($(spanEl).text());
        if (label) dietary.push(label);
      });

      items.push({
        id: `tfl-${String(itemCounter).padStart(3, '0')}`,
        title,
        category: categoryTitle,
        categoryId,
        subcategory: subcategoryName || null,
        price,
        priceFormatted,
        description,
        calories,
        image: imageUrl,
        dietary,
        active: true,
      });
    };

    const $subGroups = $section.find('> .subcategory-group');
    if ($subGroups.length > 0) {
      $subGroups.each((_, subEl) => {
        const $sub = $(subEl);
        const subTitle = cleanText($sub.find('.sub-section-title').first().text());
        if (subTitle) subcategorySet.add(subTitle);
        $sub.find('.product-card').each((__, cardEl) => {
          parseCard($(cardEl), subTitle || null);
        });
      });
    } else {
      $section.find('.product-card').each((_, cardEl) => {
        parseCard($(cardEl), null);
      });
    }

    const coverImage = categoryCovers.get(categoryId) || firstItemImage || null;

    categories.push({
      id: categoryId,
      name: categoryTitle,
      slug: categorySlug,
      image: coverImage,
      itemCount: categoryItemCount,
      subcategories: Array.from(subcategorySet),
    });
  });

  // 4. Assemble Output JSON
  const output = {
    restaurant: {
      name: brandName,
      sourceUrl: SOURCE_URL,
      logo: '/logo.png',
      logoSourceUrl,
      theme: {
        primary: getCssVar('--color-primary', '#272626'),
        accent: getCssVar('--color-accent', '#ca2f2d'),
        background: getCssVar('--color-bg', '#ffffff'),
      },
      features,
      workingHours,
      socials: {
        instagram: instagramUrl,
        facebook: facebookUrl,
      },
      directionsUrl,
      mapEmbedUrl,
      scrapedAt: new Date().toISOString(),
    },
    stats: {
      totalCategories: categories.length,
      totalSubcategories: categories.reduce((acc, c) => acc + c.subcategories.length, 0),
      totalItems: items.length,
      activeItems: items.filter((i) => i.active !== false).length,
      itemsWithImages: items.filter((i) => Boolean(i.image)).length,
      itemsWithDescriptions: items.filter((i) => Boolean(i.description)).length,
      itemsWithCalories: items.filter((i) => Boolean(i.calories)).length,
      itemsMissingPrice: items.filter((i) => i.price === null).length,
    },
    categories,
    items,
  };

  const outPath = path.join(ROOT_DIR, 'menu_data.json');
  await fs.writeFile(outPath, JSON.stringify(output, null, 2), 'utf-8');

  // 5. Console Verification Summary Report
  const validPrices = items.map((i) => i.price).filter((p) => typeof p === 'number');
  const minPrice = validPrices.length ? Math.min(...validPrices) : 0;
  const maxPrice = validPrices.length ? Math.max(...validPrices) : 0;
  const avgPrice = validPrices.length
    ? Math.round(validPrices.reduce((a, b) => a + b, 0) / validPrices.length)
    : 0;

  console.log('\n============================================================');
  console.log('   THE FOOD LOUNGE — VERİ KAZIMA (SCRAPING) ÖZET RAPORU');
  console.log('============================================================');
  console.log(`Kaynak URL          : ${SOURCE_URL}`);
  console.log(`Çıktı Dosyası       : ${outPath}`);
  console.log(`Logo Kaydedildi     : src/assets/logo.png & public/logo.png (${(logoBytes / 1024).toFixed(1)} KB)`);
  console.log('------------------------------------------------------------');
  console.log(`Toplam Kategori     : ${output.stats.totalCategories}`);
  console.log(`Toplam Alt Kategori : ${output.stats.totalSubcategories}`);
  console.log(`Toplam Ürün         : ${output.stats.totalItems}`);
  console.log(`Görselli Ürün       : ${output.stats.itemsWithImages} / ${output.stats.totalItems}`);
  console.log(`Açıklamalı Ürün     : ${output.stats.itemsWithDescriptions} / ${output.stats.totalItems}`);
  console.log(`Kalori Bilgili Ürün : ${output.stats.itemsWithCalories} / ${output.stats.totalItems}`);
  console.log(`Fiyatı Eksik Ürün   : ${output.stats.itemsMissingPrice}`);
  console.log(`Fiyat Aralığı       : ${minPrice} ₺ – ${maxPrice} ₺ (Ort: ${avgPrice} ₺)`);
  console.log('------------------------------------------------------------');
  console.log('KATEGORİ BAZLI DAĞILIM:');
  for (const cat of categories) {
    const withImg = items.filter((i) => i.categoryId === cat.id && i.image).length;
    const subInfo = cat.subcategories.length > 0 ? ` [${cat.subcategories.length} alt kategori]` : '';
    console.log(
      `  • ${cat.name.padEnd(28, ' ')} : ${String(cat.itemCount).padStart(3, ' ')} ürün (${String(withImg).padStart(3, ' ')} görselli)${subInfo}`
    );
  }
  console.log('============================================================\n');
}

scrapeMenu().catch((err) => {
  console.error('❌ Scraping hatası:', err);
  process.exit(1);
});
