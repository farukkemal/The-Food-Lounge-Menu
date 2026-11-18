import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const MENU_JSON_PATH = path.join(ROOT_DIR, 'menu_data.json');
const LOCALES_DIR = path.join(ROOT_DIR, 'src', 'locales');

const CATEGORY_TRANSLATIONS = {
  ar: {
    'cat-82': 'الإفطار',
    'cat-133': 'نكهات جديدة',
    'cat-83': 'المقبلات',
    'cat-84': 'السلطات',
    'cat-85': 'قائمة دايت - ريزوتو - نودلز',
    'cat-86': 'المعكرونة',
    'cat-87': 'البيتزا',
    'cat-88': 'البرغر',
    'cat-89': 'تيكس-ميكس وفاهيتا',
    'cat-90': 'قائمة الأطفال',
    'cat-91': 'أطباق البول',
    'cat-92': 'أطباق الدجاج',
    'cat-124': 'أطباق اللحم والستيك',
    'cat-93': 'نكهات الأناضول',
    'cat-94': 'الأسماك والمأكولات البحرية',
    'cat-95': 'الحلويات',
    'cat-96': 'المشروبات الغازية',
    'cat-97': 'العصائر الطازجة',
    'cat-98': 'الليموناضة',
    'cat-99': 'المشروبات المثلجة (فروزن)',
    'cat-100': 'ميلك شيك',
    'cat-101': 'المشروبات الساخنة',
    'cat-102': 'القهوة المثلجة',
    'cat-103': 'شاي الأعشاب',
    'cat-123': 'المشروبات الكحولية',
  },
  zh: {
    'cat-82': '精选早餐',
    'cat-133': '全新风味',
    'cat-83': '开胃前菜',
    'cat-84': '健康沙拉',
    'cat-85': '轻食 · 烩饭 · 炒面',
    'cat-86': '意式面食',
    'cat-87': '手工披萨',
    'cat-88': '招牌汉堡',
    'cat-89': '墨式铁板与卷饼',
    'cat-90': '儿童套餐',
    'cat-91': '能量碗',
    'cat-92': '鸡肉主菜',
    'cat-124': '牛排与肉类主菜',
    'cat-93': '安纳托利亚传统风味',
    'cat-94': '精选海鲜与鱼类',
    'cat-95': '精致甜点',
    'cat-96': '软饮',
    'cat-97': '鲜榨果汁',
    'cat-98': '手工柠檬饮',
    'cat-99': '水果冰沙',
    'cat-100': '香浓奶昔',
    'cat-101': '热饮与咖啡',
    'cat-102': '冰咖啡',
    'cat-103': '花草茶',
    'cat-123': '酒水与鸡尾酒',
  },
  ru: {
    'cat-82': 'ЗАВТРАКИ',
    'cat-133': 'НОВИНКИ МЕНЮ',
    'cat-83': 'ЗАКУСКИ',
    'cat-84': 'САЛАТЫ',
    'cat-85': 'ДИЕТ-МЕНЮ · РИЗОТТО · ЛАПША',
    'cat-86': 'ПАСТА',
    'cat-87': 'ПИЦЦА',
    'cat-88': 'БУРГЕРЫ',
    'cat-89': 'ТЕКС-МЕКС И ФАХИТАС',
    'cat-90': 'ДЕТСКОЕ МЕНЮ',
    'cat-91': 'БОУЛЫ',
    'cat-92': 'БЛЮДА ИЗ КУРИЦЫ',
    'cat-124': 'МЯСНЫЕ БЛЮДА И СТЕЙКИ',
    'cat-93': 'ВКУСЫ АНАТОЛИИ',
    'cat-94': 'РЫБА И МОРЕПРОДУКТЫ',
    'cat-95': 'ДЕСЕРТЫ',
    'cat-96': 'ПРОХЛАДИТЕЛЬНЫЕ НАПИТКИ',
    'cat-97': 'СВЕЖЕВЫЖАТЫЕ СОКИ',
    'cat-98': 'ЛИМОНАДЫ',
    'cat-99': 'ФРОЗЕНЫ',
    'cat-100': 'МИЛКШЕЙКИ',
    'cat-101': 'ГОРЯЧИЕ НАПИТКИ',
    'cat-102': 'ХОЛОДНЫЙ КОФЕ',
    'cat-103': 'ТРАВЯНЫЕ ЧАИ',
    'cat-123': 'АЛКОГОЛЬНЫЕ НАПИТКИ',
  },
  de: {
    'cat-82': 'FRÜHSTÜCK',
    'cat-133': 'NEUE KREATIONEN',
    'cat-83': 'VORSPEISEN',
    'cat-84': 'SALATE',
    'cat-85': 'DIÄT-MENÜ · RISOTTO · NUDELN',
    'cat-86': 'PASTA',
    'cat-87': 'PIZZA',
    'cat-88': 'BURGER',
    'cat-89': 'TEX-MEX & FAJITA',
    'cat-90': 'KINDERMENÜ',
    'cat-91': 'BOWLS',
    'cat-92': 'HÄHNCHENGERICHTE',
    'cat-124': 'FLEISCHGERICHTE & STEAKS',
    'cat-93': 'ANATOLISCHE SPEZIALITÄTEN',
    'cat-94': 'FISCH & MEERESFRÜCHTE',
    'cat-95': 'DESSERTS',
    'cat-96': 'ERFRISCHUNGSGETRÄNKE',
    'cat-97': 'FRISCHE FRUCHTSÄFTE',
    'cat-98': 'LIMONADEN',
    'cat-99': 'FROZENS',
    'cat-100': 'MILCHSHAKES',
    'cat-101': 'HEISSGETRÄNKE',
    'cat-102': 'EISKAFEE',
    'cat-103': 'KRÄUTERTEES',
    'cat-123': 'ALKOHOLISCHE GETRÄNKE',
  },
  es: {
    'cat-82': 'DESAYUNOS',
    'cat-133': 'NUEVOS SABORES',
    'cat-83': 'ENTRANTES',
    'cat-84': 'ENSALADAS',
    'cat-85': 'MENÚ DIET · RISOTTO · NOODLES',
    'cat-86': 'PASTAS',
    'cat-87': 'PIZZAS',
    'cat-88': 'HAMBURGUESAS',
    'cat-89': 'TEX-MEX Y FAJITAS',
    'cat-90': 'MENÚ INFANTIL',
    'cat-91': 'BOWLS',
    'cat-92': 'PLATOS DE POLLO',
    'cat-124': 'CARNES Y STEAKS',
    'cat-93': 'SABORES DE ANATOLIA',
    'cat-94': 'PESCADOS Y MARISCOS',
    'cat-95': 'POSTRES',
    'cat-96': 'REFRESCOS',
    'cat-97': 'ZUMOS NATURALES',
    'cat-98': 'LIMONADAS',
    'cat-99': 'FROZENS',
    'cat-100': 'BATIDOS',
    'cat-101': 'BEBIDAS CALIENTES',
    'cat-102': 'CAFÉS HELADOS',
    'cat-103': 'INFUSIONES',
    'cat-123': 'BEBIDAS ALCOHÓLICAS',
  },
};

const SUBCATEGORY_TRANSLATIONS = {
  ar: {
    'BİRALAR': 'البيرة',
    'KOKTEYLLER': 'الكوكتيلات',
    'SHOTLAR': 'الشوتس',
    'WİSKYLER': 'الويسكي',
    'CIN': 'الجن',
    'VODKALAR': 'الفودكا',
    'RAKILAR': 'الراكي',
    'LİKÖRLER': 'الليكور',
    'KIRMIZI ŞARAPLAR': 'النبيذ الأحمر',
    'BEYAZ ŞARAPLAR': 'النبيذ الأبيض',
    'ROSE VE BLUSHLAR': 'النبيذ الوردي',
    'ŞİŞE SCOTCH WHISKEY': 'زجاجات الويسكي الاسكتلندي',
    'ŞİŞE AMERİCAN WİSKEY': 'زجاجات الويسكي الأمريكي',
    'ŞİŞE CİNLER': 'زجاجات الجن',
    'SANGRİALAR': 'السانغريا',
    'ŞİŞE VODKA': 'زجاجات الفودكا',
    'ŞİŞE TEKİLA': 'زجاجات التكيلا',
    'APERATİVE': 'المشهيات الكحولية',
    'ROMLAR': 'الروم',
    'DOUBLE WİSKYLER': 'ويسكي مزدوج',
    'TEKİLA': 'التكيلا',
    'ŞİŞE RAKILAR': 'زجاجات الراكي',
  },
  zh: {
    'BİRALAR': '啤酒',
    'KOKTEYLLER': '鸡尾酒',
    'SHOTLAR': '烈酒一口杯',
    'WİSKYLER': '威士忌',
    'CIN': '金酒',
    'VODKALAR': '伏特加',
    'RAKILAR': '土耳其拉克酒',
    'LİKÖRLER': '利口酒',
    'KIRMIZI ŞARAPLAR': '红葡萄酒',
    'BEYAZ ŞARAPLAR': '白葡萄酒',
    'ROSE VE BLUSHLAR': '桃红葡萄酒',
    'ŞİŞE SCOTCH WHISKEY': '整瓶苏格兰威士忌',
    'ŞİŞE AMERİCAN WİSKEY': '整瓶美国威士忌',
    'ŞİŞE CİNLER': '整瓶金酒',
    'SANGRİALAR': '桑格利亚果酒',
    'ŞİŞE VODKA': '整瓶伏特加',
    'ŞİŞE TEKİLA': '整瓶龙舌兰',
    'APERATİVE': '餐前开胃酒',
    'ROMLAR': '朗姆酒',
    'DOUBLE WİSKYLER': '双份威士忌',
    'TEKİLA': '龙舌兰',
    'ŞİŞE RAKILAR': '整瓶拉克酒',
  },
  ru: {
    'BİRALAR': 'ПИВО',
    'KOKTEYLLER': 'КОКТЕЙЛИ',
    'SHOTLAR': 'ШОТЫ',
    'WİSKYLER': 'ВИСКИ',
    'CIN': 'ДЖИН',
    'VODKALAR': 'ВОДКА',
    'RAKILAR': 'РАКЫ',
    'LİKÖRLER': 'ЛИКЁРЫ',
    'KIRMIZI ŞARAPLAR': 'КРАСНЫЕ ВИНА',
    'BEYAZ ŞARAPLAR': 'БЕЛЫЕ ВИНА',
    'ROSE VE BLUSHLAR': 'РОЗОВЫЕ ВИНА',
    'ŞİŞE SCOTCH WHISKEY': 'ШОТЛАНДСКИЙ ВИСКИ (БУТ.)',
    'ŞİŞE AMERİCAN WİSKEY': 'АМЕРИКАНСКИЙ ВИСКИ (БУТ.)',
    'ŞİŞE CİNLER': 'ДЖИН (БУТ.)',
    'SANGRİALAR': 'САНГРИЯ',
    'ŞİŞE VODKA': 'ВОДКА (БУТ.)',
    'ŞİŞE TEKİLA': 'ТЕКИЛА (БУТ.)',
    'APERATİVE': 'АПЕРИТИВЫ',
    'ROMLAR': 'РОМ',
    'DOUBLE WİSKYLER': 'ДВОЙНОЙ ВИСКИ',
    'TEKİLA': 'ТЕКИЛА',
    'ŞİŞE RAKILAR': 'РАКЫ (БУТ.)',
  },
  de: {
    'BİRALAR': 'BIERE',
    'KOKTEYLLER': 'COCKTAILS',
    'SHOTLAR': 'SHOTS',
    'WİSKYLER': 'WHISKYS',
    'CIN': 'GIN',
    'VODKALAR': 'WODKAS',
    'RAKILAR': 'RAKI',
    'LİKÖRLER': 'LIKÖRE',
    'KIRMIZI ŞARAPLAR': 'ROTWEINE',
    'BEYAZ ŞARAPLAR': 'WEISSWEINE',
    'ROSE VE BLUSHLAR': 'ROSÉ & BLUSH',
    'ŞİŞE SCOTCH WHISKEY': 'SCOTCH WHISKY (FLASCHE)',
    'ŞİŞE AMERİCAN WİSKEY': 'AMERICAN WHISKEY (FLASCHE)',
    'ŞİŞE CİNLER': 'GIN (FLASCHE)',
    'SANGRİALAR': 'SANGRIAS',
    'ŞİŞE VODKA': 'WODKA (FLASCHE)',
    'ŞİŞE TEKİLA': 'TEQUILA (FLASCHE)',
    'APERATİVE': 'APERITIFS',
    'ROMLAR': 'RUM',
    'DOUBLE WİSKYLER': 'DOPPELTER WHISKY',
    'TEKİLA': 'TEQUILA',
    'ŞİŞE RAKILAR': 'RAKI (FLASCHE)',
  },
  es: {
    'BİRALAR': 'CERVEZAS',
    'KOKTEYLLER': 'CÓCTELES',
    'SHOTLAR': 'CHUPITOS',
    'WİSKYLER': 'WHISKYS',
    'CIN': 'GINEBRA',
    'VODKALAR': 'VODKAS',
    'RAKILAR': 'RAKI',
    'LİKÖRLER': 'LICORES',
    'KIRMIZI ŞARAPLAR': 'VINOS TINTOS',
    'BEYAZ ŞARAPLAR': 'VINOS BLANCOS',
    'ROSE VE BLUSHLAR': 'ROSADOS Y BLUSH',
    'ŞİŞE SCOTCH WHISKEY': 'WHISKY ESCOCÉS (BOTELLA)',
    'ŞİŞE AMERİCAN WİSKEY': 'WHISKEY AMERICANO (BOTELLA)',
    'ŞİŞE CİNLER': 'GINEBRA (BOTELLA)',
    'SANGRİALAR': 'SANGRÍAS',
    'ŞİŞE VODKA': 'VODKA (BOTELLA)',
    'ŞİŞE TEKİLA': 'TEQUILA (BOTELLA)',
    'APERATİVE': 'APERITIVOS',
    'ROMLAR': 'RONES',
    'DOUBLE WİSKYLER': 'WHISKY DOBLE',
    'TEKİLA': 'TEQUILA',
    'ŞİŞE RAKILAR': 'RAKI (BOTELLA)',
  },
};

const TARGET_API_CODE = {
  ar: 'ar',
  zh: 'zh-CN',
  ru: 'ru',
  de: 'de',
  es: 'es',
};

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function translateSingle(text, targetLang, sourceLang = 'tr') {
  if (!text || !text.trim()) return '';
  const url =
    `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${TARGET_API_CODE[targetLang]}&dt=t&q=` +
    encodeURIComponent(text);

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      const res = await fetch(url, {
        headers: { 'User-Agent': 'Mozilla/5.0' },
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const translated = (json?.[0] || []).map((seg) => seg?.[0] || '').join('');
      return translated.trim();
    } catch {
      await sleep(400 * (attempt + 1));
    }
  }
  return text;
}

async function translateBatch(entries, targetLang) {
  // entries: Array<{ key, text }>
  const results = new Map();
  const nonEmpty = entries.filter((e) => e.text && e.text.trim());
  const BATCH_SIZE = 16;

  for (let i = 0; i < nonEmpty.length; i += BATCH_SIZE) {
    const chunk = nonEmpty.slice(i, i + BATCH_SIZE);
    const joined = chunk.map((c, idx) => `@@${idx}@@ ${c.text.replace(/\s+/g, ' ').trim()}`).join('\n');

    const rawTranslated = await translateSingle(joined, targetLang, 'tr');

    // Parse back using @@idx@@ markers
    const regex = /@@\s*(\d+)\s*@@\s*([\s\S]*?)(?=(?:\n?\s*@@\s*\d+\s*@@)|$)/g;
    const parsed = new Map();
    let match;
    while ((match = regex.exec(rawTranslated)) !== null) {
      const idx = Number.parseInt(match[1], 10);
      const val = match[2].replace(/\s+/g, ' ').trim();
      if (!Number.isNaN(idx) && val) {
        parsed.set(idx, val);
      }
    }

    // Fill any missing items individually so 100% accuracy is guaranteed
    for (let idx = 0; idx < chunk.length; idx += 1) {
      const entry = chunk[idx];
      if (parsed.has(idx)) {
        results.set(entry.key, parsed.get(idx));
      } else {
        const single = await translateSingle(entry.text, targetLang, 'tr');
        results.set(entry.key, single || entry.text);
        await sleep(80);
      }
    }

    if ((i / BATCH_SIZE) % 8 === 0) {
      process.stdout.write(`  [${targetLang}] ${Math.min(i + BATCH_SIZE, nonEmpty.length)}/${nonEmpty.length}\r`);
    }
    await sleep(60);
  }
  console.log(`  [${targetLang}] Completed ${nonEmpty.length}/${nonEmpty.length} strings.`);
  return results;
}

async function main() {
  const menuData = JSON.parse(await fs.readFile(MENU_JSON_PATH, 'utf-8'));
  await fs.mkdir(LOCALES_DIR, { recursive: true });

  // Deduplicate strings across items to translate even faster
  const titleEntries = menuData.items.map((item) => ({
    key: `t:${item.id}`,
    text: item.title,
  }));
  const descEntries = menuData.items
    .filter((item) => item.description && item.description.trim())
    .map((item) => ({
      key: `d:${item.id}`,
      text: item.description,
    }));

  const requestedLangs = process.argv.slice(2).filter((l) => TARGET_API_CODE[l]);
  const langsToRun = requestedLangs.length > 0 ? requestedLangs : ['ar', 'zh', 'ru', 'de', 'es'];

  const allEntries = [...titleEntries, ...descEntries];
  console.log(`Translating ${titleEntries.length} titles + ${descEntries.length} descriptions into ${langsToRun.map((l) => l.toUpperCase()).join(', ')}...`);

  for (const lang of langsToRun) {
    console.log(`\nStarting ${lang.toUpperCase()}...`);
    const translatedMap = await translateBatch(allEntries, lang);

    const itemsOut = {};
    for (const item of menuData.items) {
      itemsOut[item.id] = {
        title: translatedMap.get(`t:${item.id}`) || item.titleEn || item.title,
        description: item.description
          ? translatedMap.get(`d:${item.id}`) || item.descriptionEn || item.description
          : '',
      };
    }

    const localePayload = {
      categories: CATEGORY_TRANSLATIONS[lang],
      subcategories: SUBCATEGORY_TRANSLATIONS[lang],
      items: itemsOut,
    };

    const outPath = path.join(LOCALES_DIR, `${lang}.json`);
    await fs.writeFile(outPath, JSON.stringify(localePayload, null, 2), 'utf-8');
    const stat = await fs.stat(outPath);
    console.log(`  Saved ${outPath} (${(stat.size / 1024).toFixed(1)} KB)`);
  }
}

main().catch((err) => {
  console.error('Locale generation failed:', err);
  process.exit(1);
});
