import { TIME_SLOT_IDS } from '../hooks/useTimeSlot';
import { formatPriceTL } from './menuRepository';
import {
  getLocalizedItemCategory,
  getLocalizedItemSubcategory,
} from '../context/LanguageContext';

function resolveCuratedItems(menuIndex, specs, lang, fallbackCategoryIds = []) {
  const isEn = lang === 'en';
  const resolved = [];
  const usedIds = new Set();

  for (const spec of specs) {
    const item = menuIndex.getItemById(spec.id);
    if (item && !usedIds.has(item.id)) {
      usedIds.add(item.id);
      resolved.push({
        ...item,
        recommendationTag: isEn
          ? spec.tagEn || getLocalizedItemCategory(item, 'en')
          : spec.tag || item.category,
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
            recommendationTag: getLocalizedItemCategory(item, lang),
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
    badge: { tr: '%10 Kombo İndirimi', en: '10% Combo Deal' },
    accentLabel: { tr: 'Özel Tavsiye', en: 'Top Pairing' },
    headline: {
      tr: 'Özel Soslu Cafe de Paris Bonfile + Negroni',
      en: 'Cafe de Paris Tenderloin + Negroni',
    },
    sommelierNote: {
      tr: 'Kremamsı Cafe de Paris soslu dana bonfilenin zengin aroması, Negroni’nin bitkisel ve dengeli dokunuşuyla kusursuz bütünleşir.',
      en: 'Rich, herb-butter Cafe de Paris tenderloin balanced effortlessly by the crisp botanical notes of a classic Negroni.',
    },
    foodId: 'tfl-183',
    cocktailId: 'tfl-336',
    discountRate: 0.1,
  },
  {
    id: 'pair-dallas-lynchburg',
    badge: { tr: '%10 Kombo İndirimi', en: '10% Combo Deal' },
    accentLabel: { tr: 'Steakhouse Seçimi', en: 'Steakhouse Pick' },
    headline: {
      tr: 'Dallas Steak + Lynchburg Lemonade',
      en: 'Dallas Steak + Lynchburg Lemonade',
    },
    sommelierNote: {
      tr: 'Özenle dinlendirilmiş Dallas Steak’in güçlü dokusuna, bourbon bazlı ferahlatıcı narenciye notaları eşlik eder.',
      en: 'Juicy aged Dallas Steak paired with refreshing bourbon-infused citrus notes for an unforgettable dinner.',
    },
    foodId: 'tfl-184',
    cocktailId: 'tfl-331',
    discountRate: 0.1,
  },
  {
    id: 'pair-pepper-magma',
    badge: { tr: 'Özel Tavsiye • %10', en: 'Special Pick • 10%' },
    accentLabel: { tr: 'Ateş & Egzotik', en: 'Spice & Exotic' },
    headline: {
      tr: 'Pepper Steak + Magma Passion',
      en: 'Pepper Steak + Magma Passion',
    },
    sommelierNote: {
      tr: 'Tane karabiber soslu bonfile ile acılı vodka ve passion fruit dengesinin canlı gece uyumu.',
      en: 'Cracked black peppercorn steak matched with vibrant chili vodka and tropical passion fruit notes.',
    },
    foodId: 'tfl-189',
    cocktailId: 'tfl-332',
    discountRate: 0.1,
  },
  {
    id: 'pair-lokum-sensei',
    badge: { tr: 'Şefin Özel Tavsiyesi', en: "Chef's Signature" },
    accentLabel: { tr: 'İmza Eşleşme', en: 'Signature Pair' },
    headline: {
      tr: 'Tereyağında Lokum Bonfile + Sensei',
      en: 'Butter-Seared Tenderloin + Sensei',
    },
    sommelierNote: {
      tr: 'Tereyağlı yumuşacık lokum bonfile dilimlerine, mürver çiçeği ve yaban mersini dokunuşlu aromatik imza kokteyl.',
      en: 'Melt-in-your-mouth butter-seared tenderloin slices paired with an aromatic elderflower and blueberry cocktail.',
    },
    foodId: 'tfl-191',
    cocktailId: 'tfl-338',
    discountRate: 0,
  },
  {
    id: 'pair-lokum-espresso',
    badge: { tr: '%10 Kombo İndirimi', en: '10% Combo Deal' },
    accentLabel: { tr: 'Gece Klasiği', en: 'Night Classic' },
    headline: {
      tr: 'Lokum Bonfile + Espresso Martini',
      en: 'Lokum Tenderloin + Espresso Martini',
    },
    sommelierNote: {
      tr: 'Izgara bonfile keyfini kadifemsi espresso ve kahve likörü notalarıyla taçlandıran sofistike ikili.',
      en: 'Chargrilled tenderloin elevated by the velvety richness of a freshly shaken Espresso Martini.',
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
  const isEn = lang === 'en';
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
        badge: isEn ? spec.badge.en : spec.badge.tr,
        accentLabel: isEn ? spec.accentLabel.en : spec.accentLabel.tr,
        headline: isEn ? spec.headline.en : spec.headline.tr,
        sommelierNote: isEn ? spec.sommelierNote.en : spec.sommelierNote.tr,
        food,
        cocktail,
        ...pricing,
      });
    }
  }
  return pairings;
}

export function getRecommendationsForSlot(slotId, menuIndex, lang = 'tr') {
  const isEn = lang === 'en';

  // Priority 1: Admin-selected Featured items
  const adminFeatured = menuIndex.featuredItems || [];
  if (adminFeatured.length > 0) {
    const spotlightItem = adminFeatured[0];
    const remainingItems = adminFeatured.slice(1).map((item) => ({
      ...item,
      recommendationTag:
        getLocalizedItemSubcategory(item, lang) ||
        getLocalizedItemCategory(item, lang),
    }));

    const uniqueQuickLinks = [];
    const seenCatIds = new Set();
    for (const item of adminFeatured) {
      if (!seenCatIds.has(item.categoryId) && uniqueQuickLinks.length < 4) {
        seenCatIds.add(item.categoryId);
        uniqueQuickLinks.push({
          label: getLocalizedItemCategory(item, lang),
          categoryId: item.categoryId,
        });
      }
    }

    const spotCatLabel =
      getLocalizedItemSubcategory(spotlightItem, lang) ||
      getLocalizedItemCategory(spotlightItem, lang);

    return {
      slotId,
      mode: 'featured',
      isAdminCurated: true,
      eyebrow: isEn ? "Featured • Today's Picks" : 'Öne Çıkanlar • Günün Önerisi',
      title: isEn ? "Chef's Special Selections" : 'Şefin Özel Seçimleri',
      subtitle: isEn
        ? 'Specially curated dishes handpicked for you today by The Food Lounge.'
        : 'The Food Lounge tarafından bugün sizin için özel olarak öne çıkarılan lezzetler.',
      spotlight: {
        item: spotlightItem,
        badge: isEn ? "Today's Pick" : 'Günün Önerisi',
        highlightNote: isEn
          ? `${spotCatLabel} • Featured Selection`
          : `${spotCatLabel} • Özel Seçim`,
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
        { id: 'tfl-004', tag: 'Sıcak Kahvaltı', tagEn: 'Hot Breakfast' },
        { id: 'tfl-002', tag: 'Klasik', tagEn: 'Classic' },
        { id: 'tfl-003', tag: 'Fit & Hafif', tagEn: 'Light & Fit' },
        { id: 'tfl-009', tag: 'Gurme Kahvaltı', tagEn: 'Gourmet' },
        { id: 'tfl-007', tag: 'Sıcak Tava', tagEn: 'Hot Pan' },
        { id: 'tfl-008', tag: 'Şefin Önerisi', tagEn: "Chef's Pick" },
        { id: 'tfl-013', tag: 'Omlet', tagEn: 'Omelette' },
      ],
      lang,
      ['cat-82']
    );

    const breakfastCount = menuIndex.getItemsByCategory('cat-82').length;

    return {
      slotId,
      mode: 'featured',
      eyebrow: isEn ? "Today's Pick" : 'Günün Önerisi',
      title: isEn ? 'Breakfast Delights' : 'Kahvaltı Keyfi',
      subtitle: isEn
        ? 'Start your day with our signature Turkish spread breakfast and fresh morning plates.'
        : 'Bu saat aralığında yalnızca Serpme Kahvaltı ve taptaze kahvaltı sofralarımızı öne çıkarıyoruz.',
      spotlight: spotlight
        ? {
            item: spotlight,
            badge: isEn ? 'Morning Star' : 'Sabahın Yıldızı',
            highlightNote: isEn
              ? 'Prepared for min. 2 guests • With unlimited Turkish tea'
              : 'Min. 2 kişilik • Sınırsız demleme çay ile',
          }
        : null,
      items,
      quickLinks: [
        {
          label: isEn
            ? `All Breakfasts (${breakfastCount})`
            : `Tüm Kahvaltılar (${breakfastCount})`,
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
        { id: 'tfl-123', tag: 'Makarna', tagEn: 'Pasta' },
        { id: 'tfl-059', tag: 'Atıştırmalık', tagEn: 'Starter' },
        { id: 'tfl-166', tag: 'Ana Yemek', tagEn: 'Main Dish' },
        { id: 'tfl-106', tag: 'Dünya Mutfağı', tagEn: 'World Cuisine' },
        { id: 'tfl-117', tag: 'Makarna', tagEn: 'Pasta' },
        { id: 'tfl-151', tag: 'Tex-Mex', tagEn: 'Tex-Mex' },
        { id: 'tfl-163', tag: 'Ana Yemek', tagEn: 'Healthy Bowl' },
        { id: 'tfl-068', tag: 'Atıştırmalık', tagEn: 'Shareable' },
      ],
      lang,
      ['cat-86', 'cat-83', 'cat-92', 'cat-88']
    );

    return {
      slotId,
      mode: 'featured',
      eyebrow: isEn ? 'World Cuisine' : 'Dünya Mutfağı',
      title: isEn ? 'Lunch & Afternoon Selection' : 'Öğle & Akşamüstü Seçkisi',
      subtitle: isEn
        ? 'Handcrafted pastas, shareable starters, and signature world cuisine main dishes.'
        : 'Dünya mutfağından seçkin makarnalar, paylaşmalık atıştırmalıklar ve şefin ana yemekleri.',
      spotlight: spotlight
        ? {
            item: spotlight,
            badge: isEn ? 'Signature Main' : 'İmza Ana Yemek',
            highlightNote: isEn
              ? "Today's highlighted world cuisine recommendation"
              : 'Günün öne çıkan dünya mutfağı tavsiyesi',
          }
        : null,
      items,
      quickLinks: [
        { label: isEn ? 'Pastas' : 'Makarnalar', categoryId: 'cat-86' },
        { label: isEn ? 'Starters' : 'Atıştırmalıklar', categoryId: 'cat-83' },
        {
          label: isEn ? 'Chicken & Mains' : 'Tavuk & Ana Yemekler',
          categoryId: 'cat-92',
        },
        { label: isEn ? 'Burgers' : 'Burgerler', categoryId: 'cat-88' },
      ],
    };
  }

  // 19:00 - 00:00 -> Evening Food & Cocktail Pairings
  const pairings = resolveEveningPairings(menuIndex, lang);
  const steakCount = menuIndex.getItemsByCategory('cat-124').length;
  const cocktailCount = menuIndex.getItemsByCategory('cat-123', 'KOKTEYLLER').length;

  return {
    slotId: TIME_SLOT_IDS.EVENING,
    mode: 'pairings',
    eyebrow: isEn
      ? 'Lounge & World Cuisine'
      : 'Alkollü Mekan & Dünya Mutfağı',
    title: isEn
      ? 'Signature Cocktail & Steak Pairings'
      : 'İmza Kokteyl & Steak Komboları',
    subtitle: isEn
      ? 'Curated evening pairings combining our signature steaks with handcrafted bar cocktails.'
      : 'Özel soslu bifteklerimiz ile miksoloji barımızın imza kokteyllerinden avantajlı akşam eşleştirmeleri.',
    pairings,
    quickLinks: [
      {
        label: isEn ? `Meat & Steak (${steakCount})` : `Et & Steak (${steakCount})`,
        categoryId: 'cat-124',
      },
      {
        label: isEn
          ? `Signature Cocktails (${cocktailCount})`
          : `İmza Kokteyller (${cocktailCount})`,
        categoryId: 'cat-123',
        subcategory: 'KOKTEYLLER',
      },
      {
        label: isEn ? 'Red Wines' : 'Kırmızı Şaraplar',
        categoryId: 'cat-123',
        subcategory: 'KIRMIZI ŞARAPLAR',
      },
    ],
  };
}
