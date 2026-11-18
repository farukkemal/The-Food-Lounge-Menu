import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as cheerio from 'cheerio';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const MENU_JSON_PATH = path.join(ROOT_DIR, 'menu_data.json');
const EN_SOURCE_URL = 'https://thefoodlounge.akbatidijital.com/en';

const CATEGORY_EN_FIXES = {
  'cat-82': 'BREAKFAST',
  'cat-133': 'NEWLY ADDED FLAVORS',
  'cat-83': 'STARTERS',
  'cat-84': 'SALADS',
  'cat-85': 'DIET MENU - RISOTTO - NOODLES',
  'cat-86': 'PASTAS',
  'cat-87': 'PIZZAS',
  'cat-88': 'BURGERS',
  'cat-89': 'TEX-MEX & FAJITA',
  'cat-90': "KID'S MENU",
  'cat-91': 'BOWLS',
  'cat-92': 'CHICKEN DISHES',
  'cat-124': 'MEAT & STEAK DISHES',
  'cat-93': 'ANATOLIAN FLAVORS',
  'cat-94': 'FISH & SEAFOOD',
  'cat-95': 'DESSERTS',
  'cat-96': 'SOFT DRINKS',
  'cat-97': 'FRESH FRUIT JUICES',
  'cat-98': 'LEMONADES',
  'cat-99': 'FROZENS',
  'cat-100': 'MILKSHAKES',
  'cat-101': 'HOT DRINKS',
  'cat-102': 'ICED COFFEES',
  'cat-103': 'HERBAL TEAS',
  'cat-123': 'ALCOHOLIC BEVERAGES',
};

const SUBCATEGORY_EN_MAP = {
  'BİRALAR': 'BEERS',
  'KOKTEYLLER': 'COCKTAILS',
  'SHOTLAR': 'SHOTS',
  'WİSKYLER': 'WHISKIES',
  'CIN': 'GIN',
  'VODKALAR': 'VODKAS',
  'RAKILAR': 'RAKI',
  'LİKÖRLER': 'LIQUEURS',
  'KIRMIZI ŞARAPLAR': 'RED WINES',
  'BEYAZ ŞARAPLAR': 'WHITE WINES',
  'ROSE VE BLUSHLAR': 'ROSÉ & BLUSH',
  'ŞİŞE SCOTCH WHISKEY': 'BOTTLED SCOTCH WHISKY',
  'ŞİŞE AMERİCAN WİSKEY': 'BOTTLED AMERICAN WHISKEY',
  'ŞİŞE CİNLER': 'BOTTLED GIN',
  'SANGRİALAR': 'SANGRIAS',
  'ŞİŞE VODKA': 'BOTTLED VODKA',
  'ŞİŞE TEKİLA': 'BOTTLED TEQUILA',
  'APERATİVE': 'APERITIFS',
  'ROMLAR': 'RUMS',
  'DOUBLE WİSKYLER': 'DOUBLE WHISKIES',
  'TEKİLA': 'TEQUILA',
  'ŞİŞE RAKILAR': 'BOTTLED RAKI',
};

function cleanText(text) {
  if (!text) return '';
  return text
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{2,}/g, '\n')
    .trim();
}

function cleanEnglishTitle(text) {
  return cleanText(text)
    .replace(/İ/g, 'I')
    .replace(/^ICE AMERICANO$/i, 'ICED AMERICANO');
}

function stripCalories(rawDesc) {
  const cleaned = cleanText(rawDesc);
  if (!cleaned) return '';
  return cleaned
    .replace(/\s*\d+(?:[.,]\d+)?\s*kcal\*?\s*$/i, '')
    .replace(/^\s*\d+(?:[.,]\d+)?\s*kcal\*?\s*$/i, '')
    .replace(/\n+/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

async function run() {
  console.log(`Fetching official EN menu from ${EN_SOURCE_URL}...`);
  const res = await fetch(EN_SOURCE_URL, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      'Accept-Language': 'en-US,en;q=0.9',
    },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const html = await res.text();
  const $ = cheerio.load(html);

  const enSections = new Map();
  $('section.menu-section').each((_, sectionEl) => {
    const $section = $(sectionEl);
    const catId = $section.attr('id');
    const rawCatTitle = cleanText($section.find('> .section-header .section-title').first().text());
    const catTitleEn = CATEGORY_EN_FIXES[catId] || cleanEnglishTitle(rawCatTitle);

    const cards = [];
    $section.find('.product-card').each((__, cardEl) => {
      const $card = $(cardEl);
      const titleEn = cleanEnglishTitle($card.attr('data-name') || $card.find('.product-name').text());
      const descEn = stripCalories($card.attr('data-desc') ?? $card.find('.product-desc').text());
      cards.push({ titleEn, descEn });
    });

    enSections.set(catId, { catTitleEn, cards });
  });

  const menuData = JSON.parse(await fs.readFile(MENU_JSON_PATH, 'utf-8'));

  // Enrich categories
  for (const cat of menuData.categories) {
    const enSec = enSections.get(cat.id);
    cat.nameEn = CATEGORY_EN_FIXES[cat.id] || enSec?.catTitleEn || cat.name;
    if (Array.isArray(cat.subcategories) && cat.subcategories.length > 0) {
      const subMap = {};
      for (const sub of cat.subcategories) {
        subMap[sub] = SUBCATEGORY_EN_MAP[sub] || sub;
      }
      cat.subcategoryLabelsEn = subMap;
    }
  }

  // Enrich items 1-to-1 within each category section
  const catCursor = new Map();
  let matched = 0;
  for (const item of menuData.items) {
    const enSec = enSections.get(item.categoryId);
    const idx = catCursor.get(item.categoryId) || 0;
    catCursor.set(item.categoryId, idx + 1);

    const enCard = enSec?.cards?.[idx];
    item.categoryEn = CATEGORY_EN_FIXES[item.categoryId] || enSec?.catTitleEn || item.category;
    item.subcategoryEn = item.subcategory
      ? SUBCATEGORY_EN_MAP[item.subcategory] || item.subcategory
      : null;

    if (enCard) {
      matched += 1;
      item.titleEn = enCard.titleEn || item.title;
      item.descriptionEn = enCard.descEn || '';
    } else {
      item.titleEn = item.title;
      item.descriptionEn = item.description || '';
    }
  }

  await fs.writeFile(MENU_JSON_PATH, JSON.stringify(menuData, null, 2), 'utf-8');
  console.log(`Merged official EN translations: ${matched} / ${menuData.items.length} items, ${menuData.categories.length} categories.`);
}

run().catch((err) => {
  console.error('EN sync failed:', err);
  process.exit(1);
});
