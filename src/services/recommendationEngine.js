import { TIME_SLOT_IDS } from '../hooks/useTimeSlot';
import { formatPriceTL } from './menuRepository';
import {
  getLocalizedItemCategory,
  getLocalizedItemSubcategory,
} from '../context/LanguageContext';

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

  if (resolved.length < 4 && fallbackCategoryIds.length > 0) {
    for (const catId of fallbackCategoryIds) {
      const catItems = menuIndex
        .getItemsByCategory(catId)
        .filter((i) => i.image);
      for (const item of catItems) {
        if (!usedIds.has(item.id) && resolved.length < 6) {
          usedIds.add(item.id);
          resolved.push({
            ...item,
            recommendationTag: getLocalizedItemCategory(item, lang, localeData),
          });
        }
      }
    }
  }

  return resolved;
}

const EVENING_PAIRING_SPECS = [
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
      en: 'Juicy aged Dallas Steak paired with refreshing bourbon-infused citrus notes for an unforgettable dinner.',
      de: 'Saftiges gereiftes Dallas Steak kombiniert mit erfrischenden Zitrusnoten auf Bourbon-Basis.',
      es: 'Jugoso Dallas Steak madurado acompañado de refrescantes notas cítricas con base de bourbon.',
      ar: 'ستيك دالاس المعتّق والعصاري يتكامل مع نكهات الحمضيات المنعشة والبوربون لعشاء لا يُنسى.',
      zh: '多汁熟成达拉斯牛排搭配清爽的波本柑橘风味鸡尾酒，成就难忘晚餐。',
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
  {
    id: 'pair-lokum-espresso',
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
      tr: 'Gece Klasiği',
      en: 'Night Classic',
      de: 'Abend-Klassiker',
      es: 'Clásico Nocturno',
      ar: 'كلاسيكي مسائي',
      zh: '夜晚经典',
      ru: 'Вечерняя классика',
    },
    headline: {
      tr: 'Lokum Bonfile + Espresso Martini',
      en: 'Lokum Tenderloin + Espresso Martini',
      de: 'Lokum Filet + Espresso Martini',
      es: 'Solomillo Lokum + Espresso Martini',
      ar: 'فيليه لوكوم مشوي + إسبريسو مارتيني',
      zh: '炭烤菲力牛柳 + 浓缩咖啡马提尼',
      ru: 'Вырезка Локум + Эспрессо Мартини',
    },
    sommelierNote: {
      tr: 'Izgara bonfile keyfini kadifemsi espresso ve kahve likörü notalarıyla taçlandıran sofistike ikili.',
      en: 'Chargrilled tenderloin elevated by the velvety richness of a freshly shaken Espresso Martini.',
      de: 'Gegrilltes Rinderfilet veredelt durch die samtige Note eines frisch geschüttelten Espresso Martini.',
      es: 'Solomillo a la parrilla elevado por la cremosidad de un Espresso Martini recién agitado.',
      ar: 'فيليه مشوي على الفحم يتكامل مع قوام إسبريسو مارتيني المخملي الغني بالقهوة.',
      zh: '炭烤菲力牛排搭配丝滑浓郁的现调浓缩咖啡马提尼，尽显优雅格调。',
      ru: 'Вырезка на гриле, дополненная бархатистой глубиной свежеприготовленного Эспрессо Мартини.',
    },
    foodId: 'tfl-186',
    cocktailId: 'tfl-327',
    discountRate: 0.1,
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

function resolveEveningPairings(menuIndex, lang) {
  const pairings = [];
  for (const spec of EVENING_PAIRING_SPECS) {
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
  return pairings;
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

  // Priority 2: Automatic Time-Based Recommendations
  // 03:00 - 15:00 -> Breakfast
  if (slotId === TIME_SLOT_IDS.MORNING) {
    const spotlight =
      menuIndex.getItemById('tfl-001') ||
      menuIndex.getItemsByCategory('cat-82')[0] ||
      null;
    const items = resolveCuratedItems(
      menuIndex,
      [
        {
          id: 'tfl-004',
          tag: { tr: 'Sıcak Kahvaltı', en: 'Hot Breakfast', de: 'Warmes Frühstück', es: 'Desayuno Caliente', ar: 'إفطار ساخن', zh: '热食早餐', ru: 'Горячий завтрак' },
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
          id: 'tfl-009',
          tag: { tr: 'Gurme Kahvaltı', en: 'Gourmet', de: 'Gourmet', es: 'Gourmet', ar: 'غورميه', zh: '精致早午餐', ru: 'Гурмэ' },
        },
        {
          id: 'tfl-007',
          tag: { tr: 'Sıcak Tava', en: 'Hot Pan', de: 'Pfannengericht', es: 'En Sartén', ar: 'طاوة ساخنة', zh: '铁锅煎蛋', ru: 'На сковороде' },
        },
        {
          id: 'tfl-008',
          tag: { tr: 'Şefin Önerisi', en: "Chef's Pick", de: 'Chef-Tipp', es: 'Elección del Chef', ar: 'اختيار الشيف', zh: '主厨推荐', ru: 'Выбор шефа' },
        },
        {
          id: 'tfl-013',
          tag: { tr: 'Omlet', en: 'Omelette', de: 'Omelett', es: 'Tortilla', ar: 'أومليت', zh: '欧姆蛋', ru: 'Омлет' },
        },
      ],
      lang,
      localeData,
      ['cat-82']
    );

    const breakfastCount = menuIndex.getItemsByCategory('cat-82').length;

    return {
      slotId,
      mode: 'featured',
      eyebrow: pickLang(
        {
          tr: 'Günün Önerisi',
          en: "Today's Pick",
          de: 'Tagesempfehlung',
          es: 'Sugerencia de Hoy',
          ar: 'توصية اليوم',
          zh: '今日推荐',
          ru: 'Рекомендация дня',
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
          tr: 'Bu saat aralığında yalnızca Serpme Kahvaltı ve taptaze kahvaltı sofralarımızı öne çıkarıyoruz.',
          en: 'Start your day with our signature Turkish spread breakfast and fresh morning plates.',
          de: 'Starten Sie Ihren Tag mit unserem reichhaltigen türkischen Frühstück und frischen Morgenklassikern.',
          es: 'Empieza el día con nuestro tradicional desayuno turco completo y platos frescos de mañana.',
          ar: 'ابدأ يومك بإفطارنا التركي الغني وأشهى الأطباق الصباحية الطازجة.',
          zh: '以丰盛正宗的土耳其特色拼盘早餐和新鲜晨间美味开启美好一天。',
          ru: 'Начните утро с фирменного турецкого завтрака серпме и свежих утренних блюд.',
        },
        lang
      ),
      spotlight: spotlight
        ? {
            item: spotlight,
            badge: pickLang(
              {
                tr: 'Sabahın Yıldızı',
                en: 'Morning Star',
                de: 'Morgen-Favorit',
                es: 'Estrella de la Mañana',
                ar: 'نجم الصباح',
                zh: '人气必点',
                ru: 'Хит утра',
              },
              lang
            ),
            highlightNote: pickLang(
              {
                tr: 'Min. 2 kişilik • Sınırsız demleme çay ile',
                en: 'Prepared for min. 2 guests • With unlimited Turkish tea',
                de: 'Für mind. 2 Personen • Inkl. unbegrenztem türkischem Tee',
                es: 'Para mín. 2 personas • Con té turco ilimitado',
                ar: 'لشخصين على الأقل • مع شاي تركي غير محدود',
                zh: '2人起订 · 享无限续杯土耳其红茶',
                ru: 'Минимум на 2 персоны • Безлимитный турецкий чай',
              },
              lang
            ),
          }
        : null,
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

  // 15:00 - 19:00 -> World Cuisine
  if (slotId === TIME_SLOT_IDS.AFTERNOON) {
    const spotlight =
      menuIndex.getItemById('tfl-138') ||
      menuIndex.getItemsByCategory('cat-88')[0] ||
      null;
    const items = resolveCuratedItems(
      menuIndex,
      [
        { id: 'tfl-123', tag: { tr: 'Makarna', en: 'Pasta', de: 'Pasta', es: 'Pasta', ar: 'معكرونة', zh: '意面', ru: 'Паста' } },
        { id: 'tfl-059', tag: { tr: 'Atıştırmalık', en: 'Starter', de: 'Vorspeise', es: 'Entrante', ar: 'مقبلات', zh: '开胃小吃', ru: 'Закуска' } },
        { id: 'tfl-166', tag: { tr: 'Ana Yemek', en: 'Main Dish', de: 'Hauptgericht', es: 'Principal', ar: 'طبق رئيسي', zh: '主菜', ru: 'Основное' } },
        { id: 'tfl-106', tag: { tr: 'Dünya Mutfağı', en: 'World Cuisine', de: 'Weltküche', es: 'Cocina Global', ar: 'مطبخ عالمي', zh: '环球美食', ru: 'Мировая кухня' } },
        { id: 'tfl-117', tag: { tr: 'Makarna', en: 'Pasta', de: 'Pasta', es: 'Pasta', ar: 'معكرونة', zh: '意面', ru: 'Паста' } },
        { id: 'tfl-151', tag: { tr: 'Tex-Mex', en: 'Tex-Mex', de: 'Tex-Mex', es: 'Tex-Mex', ar: 'تيكس-ميكس', zh: '墨式风味', ru: 'Текс-Мекс' } },
        { id: 'tfl-163', tag: { tr: 'Ana Yemek', en: 'Healthy Bowl', de: 'Healthy Bowl', es: 'Bowl Saludable', ar: 'طبق صحي', zh: '健康能量碗', ru: 'Боул' } },
        { id: 'tfl-068', tag: { tr: 'Atıştırmalık', en: 'Shareable', de: 'Zum Teilen', es: 'Para Compartir', ar: 'للمشاركة', zh: '分享小食', ru: 'На компанию' } },
      ],
      lang,
      localeData,
      ['cat-86', 'cat-83', 'cat-92', 'cat-88']
    );

    return {
      slotId,
      mode: 'featured',
      eyebrow: pickLang(
        {
          tr: 'Dünya Mutfağı',
          en: 'World Cuisine',
          de: 'Weltküche',
          es: 'Cocina Internacional',
          ar: 'المطبخ العالمي',
          zh: '环球风味',
          ru: 'Мировая кухня',
        },
        lang
      ),
      title: pickLang(
        {
          tr: 'Öğle & Akşamüstü Seçkisi',
          en: 'Lunch & Afternoon Selection',
          de: 'Mittags- & Nachmittagsauswahl',
          es: 'Selección de Almuerzo y Tarde',
          ar: 'مختارات الغداء وبعد الظهر',
          zh: '午后与主厨精选',
          ru: 'Дневная коллекция блюд',
        },
        lang
      ),
      subtitle: pickLang(
        {
          tr: 'Dünya mutfağından seçkin makarnalar, paylaşmalık atıştırmalıklar ve şefin ana yemekleri.',
          en: 'Handcrafted pastas, shareable starters, and signature world cuisine main dishes.',
          de: 'Handgemachte Pasta, Vorspeisen zum Teilen und internationale Spezialitäten unseres Küchenchefs.',
          es: 'Pastas artesanales, entrantes para compartir y platos principales de cocina internacional.',
          ar: 'معكرونة محضرة يدوياً، مقبلات للمشاركة، وأطباق رئيسية من المطبخ العالمي.',
          zh: '手工意面、分享开胃菜与主厨招牌环球主菜。',
          ru: 'Домашняя паста, закуски для компании и фирменные горячие блюда мировой кухни.',
        },
        lang
      ),
      spotlight: spotlight
        ? {
            item: spotlight,
            badge: pickLang(
              {
                tr: 'İmza Ana Yemek',
                en: 'Signature Main',
                de: 'Signature-Gericht',
                es: 'Plato de Autor',
                ar: 'طبق رئيسي مميز',
                zh: '招牌主菜',
                ru: 'Фирменное блюдо',
              },
              lang
            ),
            highlightNote: pickLang(
              {
                tr: 'Günün öne çıkan dünya mutfağı tavsiyesi',
                en: "Today's highlighted world cuisine recommendation",
                de: 'Unsere heutige Empfehlung aus der Weltküche',
                es: 'Nuestra recomendación internacional destacada de hoy',
                ar: 'أبرز توصيات المطبخ العالمي اليوم',
                zh: '今日环球风味主厨力荐',
                ru: 'Главная рекомендация дня из мировой кухни',
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
          label: pickLang({ tr: 'Atıştırmalıklar', en: 'Starters', de: 'Vorspeisen', es: 'Entrantes', ar: 'المقبلات', zh: '开胃前菜', ru: 'Закуски' }, lang),
          categoryId: 'cat-83',
        },
        {
          label: pickLang({ tr: 'Tavuk & Ana Yemekler', en: 'Chicken & Mains', de: 'Hähnchen & Hauptgerichte', es: 'Pollo y Principales', ar: 'أطباق الدجاج', zh: '鸡肉主菜', ru: 'Блюда из курицы' }, lang),
          categoryId: 'cat-92',
        },
        {
          label: pickLang({ tr: 'Burgerler', en: 'Burgers', de: 'Burger', es: 'Hamburguesas', ar: 'البرغر', zh: '招牌汉堡', ru: 'Бургеры' }, lang),
          categoryId: 'cat-88',
        },
      ],
    };
  }

  // 19:00 - 00:00 -> Evening Pairings
  const pairings = resolveEveningPairings(menuIndex, lang);
  const steakCount = menuIndex.getItemsByCategory('cat-124').length;
  const cocktailCount = menuIndex.getItemsByCategory('cat-123', 'KOKTEYLLER').length;

  return {
    slotId: TIME_SLOT_IDS.EVENING,
    mode: 'pairings',
    eyebrow: pickLang(
      {
        tr: 'Alkollü Mekan & Dünya Mutfağı',
        en: 'Lounge & World Cuisine',
        de: 'Lounge-Bar & Weltküche',
        es: 'Lounge y Cocina Internacional',
        ar: 'لاونج والمطبخ العالمي',
        zh: '微醺酒廊 · 环球美食',
        ru: 'Лаунж-бар и мировая кухня',
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
        tr: 'Özel soslu bifteklerimiz ile miksoloji barımızın imza kokteyllerinden avantajlı akşam eşleştirmeleri.',
        en: 'Curated evening pairings combining our signature steaks with handcrafted bar cocktails.',
        de: 'Abendliche Genuss-Kombinationen aus unseren erlesenen Steaks und hausgemachten Signature-Cocktails.',
        es: 'Maridajes nocturnos exclusivos que combinan nuestros steaks de autor con cócteles artesanales.',
        ar: 'توليفات مسائية فاخرة تجمع بين أشهى شرائح الستيك وكوكتيلاتنا المميزة.',
        zh: '精选秘制牛排与调酒师招牌鸡尾酒的晚间特惠搭配。',
        ru: 'Вечерние гастрономические пары: фирменные стейки и авторские коктейли нашего бара.',
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
