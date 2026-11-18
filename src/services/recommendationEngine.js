import { TIME_SLOT_IDS } from '../hooks/useTimeSlot';
import { formatPriceTL } from './menuRepository';
import {
  getLocalizedItemCategory,
  getLocalizedItemSubcategory,
} from '../context/LanguageContext';

const CAROUSEL_LIMIT = 4;

function pickLang(dict, lang) {
  if (!dict) return '';
  return dict[lang] || dict.en || dict.tr || '';
}

function resolveCuratedItems(
  menuIndex,
  specs,
  lang,
  localeData,
  fallbackCategoryIds = []
) {
  const resolved = [];
  const usedIds = new Set();

  for (const spec of specs) {
    if (resolved.length >= CAROUSEL_LIMIT) break;
    const item = menuIndex.getItemById(spec.id);
    if (item && !usedIds.has(item.id)) {
      usedIds.add(item.id);
      resolved.push({
        ...item,
        recommendationTag:
          pickLang(spec.tag, lang) ||
          getLocalizedItemCategory(item, lang, localeData),
      });
    }
  }

  if (resolved.length < CAROUSEL_LIMIT && fallbackCategoryIds.length > 0) {
    for (const catId of fallbackCategoryIds) {
      const catItems = menuIndex
        .getItemsByCategory(catId)
        .filter((i) => i.image);
      for (const item of catItems) {
        if (!usedIds.has(item.id) && resolved.length < CAROUSEL_LIMIT) {
          usedIds.add(item.id);
          resolved.push({
            ...item,
            recommendationTag: getLocalizedItemCategory(item, lang, localeData),
          });
        }
      }
    }
  }

  return resolved.slice(0, CAROUSEL_LIMIT);
}

// 4 swipeable Night Service (20:30 - 24:00) Steak + Cocktail Pairings
const NIGHT_PAIRING_SPECS = [
  {
    id: 'pair-cafe-de-paris-negroni',
    badge: {
      tr: '%10 Kombo İndirimi',
      en: '10% Combo Deal',
      de: '10% Kombi-Rabatt',
      es: '10% Dto. Combo',
      ar: 'خصم 10% على الكومبو',
      zh: '套餐立减 10%',
      ru: 'Скидка 10% на комбо',
    },
    accentLabel: {
      tr: 'Özel Tavsiye',
      en: 'Top Pairing',
      de: 'Top-Empfehlung',
      es: 'Maridaje Top',
      ar: 'توصية خاصة',
      zh: '主厨甄选',
      ru: 'Выбор шефа',
    },
    headline: {
      tr: 'Özel Soslu Cafe de Paris Bonfile + Negroni',
      en: 'Cafe de Paris Tenderloin + Negroni',
      de: 'Rinderfilet Café de Paris + Negroni',
      es: 'Solomillo Café de París + Negroni',
      ar: 'فيليه كافيه دو باريس + نيغروني',
      zh: '巴黎风味酱牛柳 + 尼格罗尼鸡尾酒',
      ru: 'Филе-миньон «Кафе де Пари» + Негрони',
    },
    sommelierNote: {
      tr: 'Kremamsı Cafe de Paris soslu dana bonfilenin zengin aroması, Negroni’nin bitkisel ve dengeli dokunuşuyla kusursuz bütünleşir.',
      en: 'Rich, herb-butter Cafe de Paris tenderloin balanced effortlessly by the crisp botanical notes of a classic Negroni.',
      de: 'Zartes Rinderfilet in cremiger Café-de-Paris-Sauce harmoniert perfekt mit den feinen Kräuternoten eines klassischen Negroni.',
      es: 'Jugoso solomillo en cremosa salsa Café de París equilibrado con las notas botánicas de un Negroni clásico.',
      ar: 'تنسجم نكهة فيليه اللحم الغنية بصلصة كافيه دو باريس مع اللمسة العشبية المتوازنة لكوكتيل نيغروني الكلاسيكي.',
      zh: '浓郁香草黄油酱牛柳与经典尼格罗尼的草本微苦风味相得益彰，回味悠长。',
      ru: 'Насыщенная говяжья вырезка в соусе «Кафе де Пари» идеально гармонирует с травянистыми нотами классического Негрони.',
    },
    foodId: 'tfl-183',
    cocktailId: 'tfl-336',
    discountRate: 0.1,
  },
  {
    id: 'pair-dallas-lynchburg',
    badge: {
      tr: '%10 Kombo İndirimi',
      en: '10% Combo Deal',
      de: '10% Kombi-Rabatt',
      es: '10% Dto. Combo',
      ar: 'خصم 10% على الكومبو',
      zh: '套餐立减 10%',
      ru: 'Скидка 10% на комбо',
    },
    accentLabel: {
      tr: 'Steakhouse Seçimi',
      en: 'Steakhouse Pick',
      de: 'Steakhouse-Hit',
      es: 'Favorito Steakhouse',
      ar: 'اختيار الستيك هاوس',
      zh: '牛排馆推荐',
      ru: 'Хит стейкхауса',
    },
    headline: {
      tr: 'Dallas Steak + Lynchburg Lemonade',
      en: 'Dallas Steak + Lynchburg Lemonade',
      de: 'Dallas Steak + Lynchburg Lemonade',
      es: 'Dallas Steak + Lynchburg Lemonade',
      ar: 'دالاس ستيك + لينشبورغ ليموناضة',
      zh: '达拉斯战斧牛排 + 林奇堡柠檬鸡尾酒',
      ru: 'Даллас Стейк + Линчбургский Лимонад',
    },
    sommelierNote: {
      tr: 'Özenle dinlendirilmiş Dallas Steak’in güçlü dokusuna, bourbon bazlı ferahlatıcı narenciye notaları eşlik eder.',
      en: 'Juicy aged Dallas Steak paired with refreshing bourbon-infused citrus notes for an unforgettable night.',
      de: 'Saftiges gereiftes Dallas Steak kombiniert mit erfrischenden Zitrusnoten auf Bourbon-Basis.',
      es: 'Jugoso Dallas Steak madurado acompañado de refrescantes notas cítricas con base de bourbon.',
      ar: 'ستيك دالاس المعتّق والعصاري يتكامل مع نكهات الحمضيات المنعشة والبوربون لعشاء لا يُنسى.',
      zh: '多汁熟成达拉斯牛排搭配清爽的波本柑橘风味鸡尾酒，成就难忘之夜。',
      ru: 'Сочный выдержанный Даллас Стейк в дуэте с освежающим цитрусовым коктейлем на основе бурбона.',
    },
    foodId: 'tfl-184',
    cocktailId: 'tfl-331',
    discountRate: 0.1,
  },
  {
    id: 'pair-pepper-magma',
    badge: {
      tr: 'Özel Tavsiye • %10',
      en: 'Special Pick • 10%',
      de: 'Spezial-Tipp • 10%',
      es: 'Especial • 10%',
      ar: 'توصية خاصة • 10%',
      zh: '特别推荐 · 9折',
      ru: 'Спецвыбор • -10%',
    },
    accentLabel: {
      tr: 'Ateş & Egzotik',
      en: 'Spice & Exotic',
      de: 'Würzig & Exotisch',
      es: 'Picante y Exótico',
      ar: 'حار واستوائي',
      zh: '微辣与热带风情',
      ru: 'Пряность и экзотика',
    },
    headline: {
      tr: 'Pepper Steak + Magma Passion',
      en: 'Pepper Steak + Magma Passion',
      de: 'Pfeffersteak + Magma Passion',
      es: 'Pepper Steak + Magma Passion',
      ar: 'بيبر ستيك + ماغما باشن',
      zh: '黑椒牛排 + 炽热百香果鸡尾酒',
      ru: 'Пеппер Стейк + Магма Маракуйя',
    },
    sommelierNote: {
      tr: 'Tane karabiber soslu bonfile ile acılı vodka ve passion fruit dengesinin canlı gece uyumu.',
      en: 'Cracked black peppercorn steak matched with vibrant chili vodka and tropical passion fruit notes.',
      de: 'Steak in schwarzer Pfeffersauce trifft auf pikanten Chili-Wodka und exotische Passionsfrucht.',
      es: 'Solomillo a la pimienta negra en perfecta armonía con vodka picante y maracuyá tropical.',
      ar: 'فيليه بصلصة الفلفل الأسود مع مزيج حيوي من الفودكا الحارة وفاكهة الباشن فروت الاستوائية.',
      zh: '黑胡椒汁牛排碰撞微辣伏特加与热带百香果，激发层次丰富的夜晚味蕾。',
      ru: 'Стейк в перечном соусе в ярком сочетании с пряной водкой и тропической маракуйей.',
    },
    foodId: 'tfl-189',
    cocktailId: 'tfl-332',
    discountRate: 0.1,
  },
  {
    id: 'pair-lokum-sensei',
    badge: {
      tr: 'Şefin Özel Tavsiyesi',
      en: "Chef's Signature",
      de: 'Chef-Empfehlung',
      es: 'Firma del Chef',
      ar: 'توصية الشيف الخاصة',
      zh: '主厨招牌推荐',
      ru: 'Фирменный выбор шефа',
    },
    accentLabel: {
      tr: 'İmza Eşleşme',
      en: 'Signature Pair',
      de: 'Signature-Kombi',
      es: 'Pareja de Autor',
      ar: 'توليفة مميزة',
      zh: '招牌搭配',
      ru: 'Авторская пара',
    },
    headline: {
      tr: 'Tereyağında Lokum Bonfile + Sensei',
      en: 'Butter-Seared Tenderloin + Sensei',
      de: 'Butterzartes Filet Lokum + Sensei',
      es: 'Solomillo a la Mantequilla + Sensei',
      ar: 'فيليه لوكوم بالزبدة + سينسي',
      zh: '黄油嫩煎菲力牛柳 + 宗师招牌鸡尾酒',
      ru: 'Нежная вырезка на сливочном масле + Сэнсэй',
    },
    sommelierNote: {
      tr: 'Tereyağlı yumuşacık lokum bonfile dilimlerine, mürver çiçeği ve yaban mersini dokunuşlu aromatik imza kokteyl.',
      en: 'Melt-in-your-mouth butter-seared tenderloin slices paired with an aromatic elderflower and blueberry cocktail.',
      de: 'Auf der Zunge zergehendes Filet in Butter begleitet von einem aromatischen Holunderblüten-Blaubeer-Cocktail.',
      es: 'Tiernas láminas de solomillo a la mantequilla con un aromático cóctel de flor de saúco y arándanos.',
      ar: 'شرائح فيليه طرية محضرة بالزبدة مع كوكتيل عطري بنكهة زهر البيلسان والتوت الأزرق.',
      zh: '入口即化的黄油煎菲力搭配接骨木花与蓝莓果香的招牌特调鸡尾酒。',
      ru: 'Тающие во рту ломтики вырезки на сливочном масле с ароматным коктейлем из бузины и черники.',
    },
    foodId: 'tfl-191',
    cocktailId: 'tfl-338',
    discountRate: 0,
  },
];

export function calculateComboPricing(foodPrice, cocktailPrice, discountRate = 0) {
  if (
    typeof foodPrice !== 'number' ||
    typeof cocktailPrice !== 'number' ||
    Number.isNaN(foodPrice) ||
    Number.isNaN(cocktailPrice)
  ) {
    return {
      regularTotal: null,
      regularTotalFormatted: '',
      comboPrice: null,
      comboPriceFormatted: '',
      savings: 0,
      savingsFormatted: '',
      discountPercent: 0,
    };
  }

  const regularTotal = foodPrice + cocktailPrice;
  const discountPercent = discountRate > 0 ? Math.round(discountRate * 100) : 0;
  const comboPrice =
    discountRate > 0
      ? Math.round((regularTotal * (1 - discountRate)) / 5) * 5
      : regularTotal;
  const savings = Math.max(0, regularTotal - comboPrice);

  return {
    regularTotal,
    regularTotalFormatted: formatPriceTL(regularTotal),
    comboPrice,
    comboPriceFormatted: formatPriceTL(comboPrice),
    savings,
    savingsFormatted: savings > 0 ? formatPriceTL(savings) : '',
    discountPercent,
  };
}

function resolveNightPairings(menuIndex, lang) {
  const pairings = [];
  for (const spec of NIGHT_PAIRING_SPECS) {
    if (pairings.length >= CAROUSEL_LIMIT) break;
    const food = menuIndex.getItemById(spec.foodId);
    const cocktail = menuIndex.getItemById(spec.cocktailId);
    if (food && cocktail) {
      const pricing = calculateComboPricing(
        food.price,
        cocktail.price,
        spec.discountRate
      );
      pairings.push({
        id: spec.id,
        badge: pickLang(spec.badge, lang),
        accentLabel: pickLang(spec.accentLabel, lang),
        headline: pickLang(spec.headline, lang),
        sommelierNote: pickLang(spec.sommelierNote, lang),
        food,
        cocktail,
        ...pricing,
      });
    }
  }
  return pairings.slice(0, CAROUSEL_LIMIT);
}

export function getRecommendationsForSlot(
  slotId,
  menuIndex,
  lang = 'tr',
  localeData = null
) {
  // Priority 1: Admin-selected Featured items
  const adminFeatured = menuIndex.featuredItems || [];
  if (adminFeatured.length > 0) {
    const spotlightItem = adminFeatured[0];
    const remainingItems = adminFeatured.slice(1).map((item) => ({
      ...item,
      recommendationTag:
        getLocalizedItemSubcategory(item, lang, localeData) ||
        getLocalizedItemCategory(item, lang, localeData),
    }));

    const uniqueQuickLinks = [];
    const seenCatIds = new Set();
    for (const item of adminFeatured) {
      if (!seenCatIds.has(item.categoryId) && uniqueQuickLinks.length < 4) {
        seenCatIds.add(item.categoryId);
        uniqueQuickLinks.push({
          label: getLocalizedItemCategory(item, lang, localeData),
          categoryId: item.categoryId,
        });
      }
    }

    const spotCatLabel =
      getLocalizedItemSubcategory(spotlightItem, lang, localeData) ||
      getLocalizedItemCategory(spotlightItem, lang, localeData);

    const featuredNoteSuffix = pickLang(
      {
        tr: 'Özel Seçim',
        en: 'Featured Selection',
        de: 'Besondere Auswahl',
        es: 'Selección Destacada',
        ar: 'اختيار مميز',
        zh: '特别精选',
        ru: 'Особый выбор',
      },
      lang
    );

    return {
      slotId,
      mode: 'featured',
      isAdminCurated: true,
      eyebrow: pickLang(
        {
          tr: 'Öne Çıkanlar • Günün Önerisi',
          en: "Featured • Today's Picks",
          de: 'Highlights • Empfehlung des Tages',
          es: 'Destacados • Sugerencias de Hoy',
          ar: 'الأطباق المميزة • توصية اليوم',
          zh: '今日精选 · 特别推荐',
          ru: 'Избранное • Рекомендации дня',
        },
        lang
      ),
      title: pickLang(
        {
          tr: 'Şefin Özel Seçimleri',
          en: "Chef's Special Selections",
          de: 'Spezialitäten des Küchenchefs',
          es: 'Selección Especial del Chef',
          ar: 'مختارات الشيف الخاصة',
          zh: '主厨特选美味',
          ru: 'Особые блюда от шефа',
        },
        lang
      ),
      subtitle: pickLang(
        {
          tr: 'The Food Lounge tarafından bugün sizin için özel olarak öne çıkarılan lezzetler.',
          en: 'Specially curated dishes handpicked for you today by The Food Lounge.',
          de: 'Heute von The Food Lounge speziell für Sie ausgewählte Gerichte.',
          es: 'Platos especialmente seleccionados hoy para ti por The Food Lounge.',
          ar: 'أطباق مختارة بعناية خصيصاً لكم اليوم من ذا فود لاونج.',
          zh: 'The Food Lounge 今日为您特别甄选的招牌美味。',
          ru: 'Блюда, специально отобранные для вас сегодня командой The Food Lounge.',
        },
        lang
      ),
      spotlight: {
        item: spotlightItem,
        badge: pickLang(
          {
            tr: 'Günün Önerisi',
            en: "Today's Pick",
            de: 'Tagesempfehlung',
            es: 'Sugerencia del Día',
            ar: 'توصية اليوم',
            zh: '今日推荐',
            ru: 'Блюдо дня',
          },
          lang
        ),
        highlightNote: `${spotCatLabel} • ${featuredNoteSuffix}`,
      },
      items: remainingItems,
      quickLinks: uniqueQuickLinks,
    };
  }

  // 1) 09:00 - 13:00 -> Sabah Servisi (Fixed 4 breakfast items + 4 swipeable cards starting with 2 soups)
  if (slotId === TIME_SLOT_IDS.MORNING) {
    const fixedItems = resolveCuratedItems(
      menuIndex,
      [
        {
          id: 'tfl-001',
          tag: { tr: 'Sabahın Yıldızı', en: 'Morning Star', de: 'Morgen-Favorit', es: 'Estrella', ar: 'نجم الصباح', zh: '人气必点', ru: 'Хит утра' },
        },
        {
          id: 'tfl-002',
          tag: { tr: 'Klasik', en: 'Classic', de: 'Klassiker', es: 'Clásico', ar: 'كلاسيكي', zh: '经典款', ru: 'Классика' },
        },
        {
          id: 'tfl-003',
          tag: { tr: 'Fit & Hafif', en: 'Light & Fit', de: 'Leicht & Fit', es: 'Ligero y Fit', ar: 'خفيف وصحي', zh: '轻食健康', ru: 'Лёгкий' },
        },
        {
          id: 'tfl-004',
          tag: { tr: 'Sıcak Kahvaltı', en: 'Hot Breakfast', de: 'Warmes Frühstück', es: 'Desayuno Caliente', ar: 'إفطار ساخن', zh: '热食早餐', ru: 'Горячий завтрак' },
        },
      ],
      lang,
      localeData,
      ['cat-82']
    );

    const items = resolveCuratedItems(
      menuIndex,
      [
        {
          id: 'tfl-066', // GÜNÜN ÇORBASI
          tag: { tr: 'Günün Çorbası', en: 'Soup of the Day', de: 'Tagessuppe', es: 'Sopa del Día', ar: 'شوربة اليوم', zh: '今日例汤', ru: 'Суп дня' },
        },
        {
          id: 'tfl-067', // MİNESTRONE ÇORBA (İtalyan Sebze Çorbası)
          tag: { tr: 'İtalyan Sebze Çorbası', en: 'Italian Vegetable Soup', de: 'Italienische Gemüsesuppe', es: 'Sopa Italiana de Verduras', ar: 'شوربة خضار إيطالية', zh: '意式蔬菜浓汤', ru: 'Итальянский овощной суп' },
        },
        {
          id: 'tfl-009', // AVAKADO SOSLU POŞE YUMURTA
          tag: { tr: 'Gurme Kahvaltı', en: 'Gourmet', de: 'Gourmet', es: 'Gourmet', ar: 'غورميه', zh: '精致早午餐', ru: 'Гурмэ' },
        },
        {
          id: 'tfl-007', // SAHANDA KAVURMALI YUMURTA
          tag: { tr: 'Sıcak Tava', en: 'Hot Pan', de: 'Pfannengericht', es: 'En Sartén', ar: 'طاوة ساخنة', zh: '铁锅煎蛋', ru: 'На сковороде' },
        },
      ],
      lang,
      localeData,
      ['cat-83', 'cat-82']
    );

    const breakfastCount = menuIndex.getItemsByCategory('cat-82').length;

    return {
      slotId,
      mode: 'featured',
      eyebrow: pickLang(
        {
          tr: 'Sabah Servisi',
          en: 'Morning Service',
          de: 'Frühstücksservice',
          es: 'Servicio de Mañana',
          ar: 'خدمة الصباح',
          zh: '早餐时段',
          ru: 'Утренний сервис',
        },
        lang
      ),
      title: pickLang(
        {
          tr: 'Kahvaltı Keyfi',
          en: 'Breakfast Delights',
          de: 'Frühstücksgenuss',
          es: 'Placeres del Desayuno',
          ar: 'متعة الإفطار التركي',
          zh: '精选土耳其早餐',
          ru: 'Идеальный завтрак',
        },
        lang
      ),
      subtitle: pickLang(
        {
          tr: 'Güne taptaze Serpme Kahvaltı ve seçkin sabah lezzetleriyle başlayın.',
          en: 'Start your morning with our signature Turkish spread breakfast and fresh plates.',
          de: 'Starten Sie Ihren Morgen mit unserem reichhaltigen türkischen Frühstück.',
          es: 'Comienza la mañana con nuestro desayuno turco completo y platos frescos.',
          ar: 'ابدأ صباحك بإفطارنا التركي الغني وأشهى الأطباق الصباحية الطازجة.',
          zh: '以丰盛正宗的土耳其特色拼盘早餐和新鲜晨间美味开启美好一天。',
          ru: 'Начните утро с фирменного турецкого завтрака серпме и свежих блюд.',
        },
        lang
      ),
      spotlight: null,
      fixedItems,
      items,
      quickLinks: [
        {
          label: `${pickLang(
            {
              tr: 'Tüm Kahvaltılar',
              en: 'All Breakfasts',
              de: 'Alle Frühstücksgerichte',
              es: 'Todos los Desayunos',
              ar: 'جميع أطباق الإفطار',
              zh: '查看全部早餐',
              ru: 'Все завтраки',
            },
            lang
          )} (${breakfastCount})`,
          categoryId: 'cat-82',
        },
      ],
    };
  }

  // 2) 13:00 - 17:00 -> Öğle Servisi (Spotlight + 4 swipeable cards starting with 2 soups)
  if (slotId === TIME_SLOT_IDS.LUNCH) {
    const spotlight =
      menuIndex.getItemById('tfl-138') ||
      menuIndex.getItemsByCategory('cat-88')[0] ||
      null;
    const items = resolveCuratedItems(
      menuIndex,
      [
        {
          id: 'tfl-066', // GÜNÜN ÇORBASI
          tag: { tr: 'Günün Çorbası', en: 'Soup of the Day', de: 'Tagessuppe', es: 'Sopa del Día', ar: 'شوربة اليوم', zh: '今日例汤', ru: 'Суп дня' },
        },
        {
          id: 'tfl-067', // MİNESTRONE ÇORBA (İtalyan Sebze Çorbası)
          tag: { tr: 'İtalyan Sebze Çorbası', en: 'Italian Vegetable Soup', de: 'Italienische Gemüsesuppe', es: 'Sopa Italiana de Verduras', ar: 'شوربة خضار إيطالية', zh: '意式蔬菜浓汤', ru: 'Итальянский овощной суп' },
        },
        { id: 'tfl-123', tag: { tr: 'Makarna', en: 'Pasta', de: 'Pasta', es: 'Pasta', ar: 'معكرونة', zh: '意面', ru: 'Паста' } },
        { id: 'tfl-163', tag: { tr: 'Hafif Kase', en: 'Healthy Bowl', de: 'Healthy Bowl', es: 'Bowl Saludable', ar: 'طبق صحي', zh: '健康能量碗', ru: 'Боул' } },
      ],
      lang,
      localeData,
      ['cat-83', 'cat-86', 'cat-91']
    );

    return {
      slotId,
      mode: 'featured',
      eyebrow: pickLang(
        {
          tr: 'Öğle Servisi',
          en: 'Lunch Service',
          de: 'Mittagsservice',
          es: 'Servicio de Almuerzo',
          ar: 'خدمة الغداء',
          zh: '午餐时段',
          ru: 'Дневной сервис',
        },
        lang
      ),
      title: pickLang(
        {
          tr: 'Dünya Mutfağı Seçkisi',
          en: 'World Cuisine Selection',
          de: 'Weltküche-Auswahl',
          es: 'Selección de Cocina Internacional',
          ar: 'مختارات المطبخ العالمي',
          zh: '环球风味午间精选',
          ru: 'Коллекция мировой кухни',
        },
        lang
      ),
      subtitle: pickLang(
        {
          tr: 'Öğle servisine özel el yapımı makarnalar, paylaşmalık atıştırmalıklar ve hafif tabaklar.',
          en: 'Handcrafted pastas, shareable starters, signature burgers, and balanced bowls.',
          de: 'Handgemachte Pasta, Vorspeisen zum Teilen, Burger und frische Bowls.',
          es: 'Pastas artesanales, entrantes para compartir, hamburguesas y bowls frescos.',
          ar: 'معكرونة محضرة يدوياً، مقبلات للمشاركة، برغر مميز وأطباق صحية.',
          zh: '手工意面、分享开胃菜、招牌汉堡与均衡轻食碗。',
          ru: 'Домашняя паста, закуски для компании, фирменные бургеры и лёгкие боулы.',
        },
        lang
      ),
      spotlight: spotlight
        ? {
            item: spotlight,
            badge: pickLang(
              {
                tr: 'Öğlenin İmza Lezzeti',
                en: 'Lunch Signature',
                de: 'Mittags-Highlight',
                es: 'Estrella del Almuerzo',
                ar: 'طبق الغداء المميز',
                zh: '午间招牌',
                ru: 'Хит обеда',
              },
              lang
            ),
            highlightNote: pickLang(
              {
                tr: 'Dünya mutfağından şefin öğle tavsiyesi',
                en: "Chef's top lunch recommendation",
                de: 'Empfehlung unseres Küchenchefs zum Mittagessen',
                es: 'Recomendación principal del chef para el almuerzo',
                ar: 'توصية الشيف الأولى لوجبة الغداء',
                zh: '主厨午间力荐环球风味',
                ru: 'Главная рекомендация шефа на обед',
              },
              lang
            ),
          }
        : null,
      items,
      quickLinks: [
        {
          label: pickLang({ tr: 'Makarnalar', en: 'Pastas', de: 'Pasta', es: 'Pastas', ar: 'المعكرونة', zh: '意式面食', ru: 'Паста' }, lang),
          categoryId: 'cat-86',
        },
        {
          label: pickLang({ tr: 'Başlangıçlar', en: 'Starters', de: 'Vorspeisen', es: 'Entrantes', ar: 'المقبلات', zh: '开胃前菜', ru: 'Закуски' }, lang),
          categoryId: 'cat-83',
        },
        {
          label: pickLang({ tr: 'Burgerler', en: 'Burgers', de: 'Burger', es: 'Hamburguesas', ar: 'البرغر', zh: '招牌汉堡', ru: 'Бургеры' }, lang),
          categoryId: 'cat-88',
        },
        {
          label: pickLang({ tr: 'Kaseler', en: 'Bowls', de: 'Bowls', es: 'Bowls', ar: 'أطباق البول', zh: '能量碗', ru: 'Боулы' }, lang),
          categoryId: 'cat-91',
        },
      ],
    };
  }

  // 3) 17:00 - 20:30 -> Akşam Servisi (Spotlight + 4 swipeable dinner/steak cards)
  if (slotId === TIME_SLOT_IDS.DINNER) {
    const spotlight =
      menuIndex.getItemById('tfl-184') ||
      menuIndex.getItemsByCategory('cat-124')[0] ||
      null;
    const items = resolveCuratedItems(
      menuIndex,
      [
        { id: 'tfl-183', tag: { tr: 'Özel Soslu Steak', en: 'Signature Steak', de: 'Signature Steak', es: 'Steak de Autor', ar: 'ستيك بصلصة خاصة', zh: '秘制牛排', ru: 'Фирменный стейк' } },
        { id: 'tfl-190', tag: { tr: 'Izgara Şef Seçimi', en: 'Chef Grill', de: 'Vom Grill', es: 'A la Parrilla', ar: 'مشويات الشيف', zh: '炭烤精选', ru: 'На гриле' } },
        { id: 'tfl-191', tag: { tr: 'Lokum Bonfile', en: 'Tenderloin', de: 'Rinderfilet', es: 'Solomillo', ar: 'فيليه طري', zh: '嫩煎菲力', ru: 'Вырезка' } },
        { id: 'tfl-148', tag: { tr: 'Tex-Mex Fajita', en: 'Sizzling Fajita', de: 'Heiße Fajita', es: 'Fajita Caliente', ar: 'فاهيتا ساخنة', zh: '铁板法士达', ru: 'Горячий фахитас' } },
      ],
      lang,
      localeData,
      ['cat-124', 'cat-89', 'cat-92']
    );

    const steakCount = menuIndex.getItemsByCategory('cat-124').length;

    return {
      slotId,
      mode: 'featured',
      eyebrow: pickLang(
        {
          tr: 'Akşam Servisi',
          en: 'Dinner Service',
          de: 'Abendservice',
          es: 'Servicio de Cena',
          ar: 'خدمة العشاء',
          zh: '晚餐时段',
          ru: 'Вечерний сервис',
        },
        lang
      ),
      title: pickLang(
        {
          tr: 'Akşam Yemeği & Steak Seçkisi',
          en: 'Dinner & Steak Selection',
          de: 'Abendessen & Steak-Auswahl',
          es: 'Selección de Cena y Steaks',
          ar: 'مختارات العشاء والستيك',
          zh: '晚间牛排与主菜精选',
          ru: 'Ужин и коллекция стейков',
        },
        lang
      ),
      subtitle: pickLang(
        {
          tr: 'Akşam yemeğine özel dinlendirilmiş steak çeşitleri, ızgara etler ve sıcak dünya mutfağı tabakları.',
          en: 'Aged prime steaks, chargrilled meats, and warm world cuisine dishes crafted for dinner.',
          de: 'Gereifte Steaks, Gegrilltes und warme Spezialitäten für ein genussvolles Abendessen.',
          es: 'Steaks madurados, carnes a la parrilla y platos calientes internacionales para la cena.',
          ar: 'أفخر أنواع الستيك المعتّق، المشويات وأطباق العشاء الساخنة من المطبخ العالمي.',
          zh: '熟成精选牛排、炭烤鲜肉与热腾腾的环球晚餐主菜。',
          ru: 'Выдержанные стейки, блюда на гриле и горячие хиты мировой кухни к ужину.',
        },
        lang
      ),
      spotlight: spotlight
        ? {
            item: spotlight,
            badge: pickLang(
              {
                tr: 'Akşamın Yıldızı',
                en: 'Dinner Star',
                de: 'Abend-Highlight',
                es: 'Estrella de la Cena',
                ar: 'نجم العشاء',
                zh: '晚餐必点',
                ru: 'Хит ужина',
              },
              lang
            ),
            highlightNote: pickLang(
              {
                tr: 'Özenle dinlendirilmiş şefin akşam steak tavsiyesi',
                en: "Chef's signature aged steak for dinner",
                de: 'Empfehlung des Küchenchefs für den Abend',
                es: 'Steak madurado recomendado por el chef',
                ar: 'توصية الشيف الخاصة لعشاء فاخر',
                zh: '主厨晚间甄选熟成牛排',
                ru: 'Фирменный выдержанный стейк от шефа',
              },
              lang
            ),
          }
        : null,
      items,
      quickLinks: [
        {
          label: `${pickLang({ tr: 'Et & Steak', en: 'Meat & Steak', de: 'Fleisch & Steaks', es: 'Carnes y Steaks', ar: 'اللحوم والستيك', zh: '牛排主菜', ru: 'Стейки и мясо' }, lang)} (${steakCount})`,
          categoryId: 'cat-124',
        },
        {
          label: pickLang({ tr: 'Tex-Mex & Fajita', en: 'Tex-Mex & Fajita', de: 'Tex-Mex & Fajita', es: 'Tex-Mex y Fajitas', ar: 'تيكس-ميكس', zh: '墨式铁板', ru: 'Текс-Мекс' }, lang),
          categoryId: 'cat-89',
        },
        {
          label: pickLang({ tr: 'Anadolu Lezzetleri', en: 'Anatolian Flavors', de: 'Anatolische Küche', es: 'Sabores de Anatolia', ar: 'نكهات الأناضول', zh: '安纳托利亚风味', ru: 'Вкусы Анатолии' }, lang),
          categoryId: 'cat-93',
        },
      ],
    };
  }

  // 4) 20:30 - 24:00 -> Gece Servisi (4 swipeable Steak + Cocktail Pairings)
  const pairings = resolveNightPairings(menuIndex, lang);
  const steakCount = menuIndex.getItemsByCategory('cat-124').length;
  const cocktailCount = menuIndex.getItemsByCategory('cat-123', 'KOKTEYLLER').length;

  return {
    slotId: TIME_SLOT_IDS.NIGHT,
    mode: 'pairings',
    eyebrow: pickLang(
      {
        tr: 'Gece Servisi',
        en: 'Night Service',
        de: 'Nachtservice',
        es: 'Servicio Nocturno',
        ar: 'الخدمة الليلية',
        zh: '夜宵酒廊时段',
        ru: 'Ночной сервис',
      },
      lang
    ),
    title: pickLang(
      {
        tr: 'İmza Kokteyl & Steak Komboları',
        en: 'Signature Cocktail & Steak Pairings',
        de: 'Signature Cocktail & Steak Kombis',
        es: 'Maridajes de Cóctel y Steak',
        ar: 'تشكيلات الستيك والكوكتيلات المميزة',
        zh: '招牌鸡尾酒与牛排臻选搭配',
        ru: 'Авторские коктейли и стейки',
      },
      lang
    ),
    subtitle: pickLang(
      {
        tr: 'Gece servisine özel bifteklerimiz ile miksoloji barımızın imza kokteyllerinden avantajlı eşleştirmeler.',
        en: 'Curated late-evening pairings combining our signature steaks with handcrafted bar cocktails.',
        de: 'Exklusive Nacht-Kombinationen aus unseren erlesenen Steaks und Signature-Cocktails.',
        es: 'Maridajes nocturnos exclusivos con nuestros steaks de autor y cócteles artesanales.',
        ar: 'توليفات ليلية فاخرة تجمع بين أشهى شرائح الستيك وكوكتيلاتنا المميزة.',
        zh: '夜宵时段专属：秘制牛排与调酒师招牌鸡尾酒的特惠搭配。',
        ru: 'Ночные гастрономические пары: фирменные стейки и авторские коктейли нашего бара.',
      },
      lang
    ),
    pairings,
    quickLinks: [
      {
        label: `${pickLang({ tr: 'Et & Steak', en: 'Meat & Steak', de: 'Fleisch & Steaks', es: 'Carnes y Steaks', ar: 'اللحوم والستيك', zh: '牛排主菜', ru: 'Стейки и мясо' }, lang)} (${steakCount})`,
        categoryId: 'cat-124',
      },
      {
        label: `${pickLang({ tr: 'İmza Kokteyller', en: 'Signature Cocktails', de: 'Signature Cocktails', es: 'Cócteles de Autor', ar: 'الكوكتيلات المميزة', zh: '招牌鸡尾酒', ru: 'Коктейли' }, lang)} (${cocktailCount})`,
        categoryId: 'cat-123',
        subcategory: 'KOKTEYLLER',
      },
      {
        label: pickLang({ tr: 'Kırmızı Şaraplar', en: 'Red Wines', de: 'Rotweine', es: 'Vinos Tintos', ar: 'النبيذ الأحمر', zh: '红葡萄酒', ru: 'Красные вина' }, lang),
        categoryId: 'cat-123',
        subcategory: 'KIRMIZI ŞARAPLAR',
      },
    ],
  };
}
