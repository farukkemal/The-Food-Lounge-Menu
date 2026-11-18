import { TIME_SLOT_IDS } from '../hooks/useTimeSlot';
import { formatPriceTL } from './menuRepository';

function resolveCuratedItems(menuIndex, specs, fallbackCategoryIds = []) {
  const resolved = [];
  const usedIds = new Set();

  for (const spec of specs) {
    const item = menuIndex.getItemById(spec.id);
    if (item && !usedIds.has(item.id)) {
      usedIds.add(item.id);
      resolved.push({
        ...item,
        recommendationTag: spec.tag || item.category,
      });
    }
  }

  // Fallback-safe guarantee if items are deactivated/deleted via Admin Panel
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
            recommendationTag: item.category,
          });
        }
      }
    }
  }

  return resolved;
}

/**
 * 19:00 - 00:00 Evening / Night Smart Pairing Rules:
 * Dynamically combines live Steak/Main Dish prices + Signature Cocktail prices
 * from menu_data.json so Admin Panel price edits recalculate combos in real time.
 */
const EVENING_PAIRING_SPECS = [
  {
    id: 'pair-cafe-de-paris-negroni',
    badge: '%10 Kombo İndirimi',
    accentLabel: 'Özel Tavsiye',
    headline: 'Özel Soslu Cafe de Paris Bonfile + Negroni',
    sommelierNote:
      'Kremamsı Cafe de Paris soslu dana bonfilenin zengin aroması, Negroni’nin bitkisel ve dengeli dokunuşuyla kusursuz bütünleşir.',
    foodId: 'tfl-183', // CAFE DE PARİS BONFİLE
    cocktailId: 'tfl-336', // NEGRONİ
    discountRate: 0.1,
  },
  {
    id: 'pair-dallas-lynchburg',
    badge: '%10 Kombo İndirimi',
    accentLabel: 'Steakhouse Seçimi',
    headline: 'Dallas Steak + Lynchburg Lemonade',
    sommelierNote:
      'Özenle dinlendirilmiş Dallas Steak’in güçlü dokusuna, bourbon bazlı ferahlatıcı narenciye notaları eşlik eder.',
    foodId: 'tfl-184', // DALLAS STEAK
    cocktailId: 'tfl-331', // LYNCHBURG LEMONADE
    discountRate: 0.1,
  },
  {
    id: 'pair-pepper-magma',
    badge: 'Özel Tavsiye • %10',
    accentLabel: 'Ateş & Egzotik',
    headline: 'Pepper Steak + Magma Passion',
    sommelierNote:
      'Tane karabiber soslu bonfile ile acılı vodka ve passion fruit dengesinin canlı gece uyumu.',
    foodId: 'tfl-189', // PEPPER STEAK
    cocktailId: 'tfl-332', // MAGMA POSSİON
    discountRate: 0.1,
  },
  {
    id: 'pair-lokum-sensei',
    badge: 'Şefin Özel Tavsiyesi',
    accentLabel: 'İmza Eşleşme',
    headline: 'Tereyağında Lokum Bonfile + Sensei',
    sommelierNote:
      'Tereyağlı yumuşacık lokum bonfile dilimlerine, mürver çiçeği ve yaban mersini dokunuşlu aromatik imza kokteyl.',
    foodId: 'tfl-191', // TEREYAĞINDA LOKUM BONFİLE
    cocktailId: 'tfl-338', // SENSEİ
    discountRate: 0,
  },
  {
    id: 'pair-lokum-espresso',
    badge: '%10 Kombo İndirimi',
    accentLabel: 'Gece Klasiği',
    headline: 'Lokum Bonfile + Espresso Martini',
    sommelierNote:
      'Izgara bonfile keyfini kadifemsi espresso ve kahve likörü notalarıyla taçlandıran sofistike ikili.',
    foodId: 'tfl-186', // LOKUM BONFİLE
    cocktailId: 'tfl-327', // ESPRESSO MARTİNİ
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

function resolveEveningPairings(menuIndex) {
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
        badge: spec.badge,
        accentLabel: spec.accentLabel,
        headline: spec.headline,
        sommelierNote: spec.sommelierNote,
        food,
        cocktail,
        ...pricing,
      });
    }
  }
  return pairings;
}

export function getRecommendationsForSlot(slotId, menuIndex) {
  // 03:00 - 15:00 -> Strictly Serpme Kahvaltı & Kahvaltı Grubu (cat-82)
  if (slotId === TIME_SLOT_IDS.MORNING) {
    const spotlight =
      menuIndex.getItemById('tfl-001') ||
      menuIndex.getItemsByCategory('cat-82')[0] ||
      null;
    const items = resolveCuratedItems(
      menuIndex,
      [
        { id: 'tfl-004', tag: 'Sıcak Kahvaltı' },
        { id: 'tfl-002', tag: 'Klasik' },
        { id: 'tfl-003', tag: 'Fit & Hafif' },
        { id: 'tfl-009', tag: 'Gurme Kahvaltı' },
        { id: 'tfl-007', tag: 'Sıcak Tava' },
        { id: 'tfl-008', tag: 'Şefin Önerisi' },
        { id: 'tfl-013', tag: 'Omlet' },
      ],
      ['cat-82']
    );

    const breakfastCount = menuIndex.getItemsByCategory('cat-82').length;

    return {
      slotId,
      mode: 'featured',
      eyebrow: 'Günün Önerisi • 03:00 – 15:00',
      title: 'Kahvaltı Keyfi',
      subtitle:
        'Bu saat aralığında yalnızca Serpme Kahvaltı ve taptaze kahvaltı sofralarımızı öne çıkarıyoruz.',
      spotlight: spotlight
        ? {
            item: spotlight,
            badge: 'Sabahın Yıldızı',
            highlightNote: 'Min. 2 kişilik • Sınırsız demleme çay ile',
          }
        : null,
      items,
      quickLinks: [
        { label: `Tüm Kahvaltılar (${breakfastCount})`, categoryId: 'cat-82' },
      ],
    };
  }

  // 15:00 - 19:00 -> Dünya Mutfağı: Makarnalar, Atıştırmalıklar, Ana Yemekler
  if (slotId === TIME_SLOT_IDS.AFTERNOON) {
    const spotlight =
      menuIndex.getItemById('tfl-138') ||
      menuIndex.getItemsByCategory('cat-88')[0] ||
      null;
    const items = resolveCuratedItems(
      menuIndex,
      [
        { id: 'tfl-123', tag: 'Makarna' }, // SPAGETTİ BURATTA
        { id: 'tfl-059', tag: 'Atıştırmalık' }, // ATIŞTIRMA SEPETİ
        { id: 'tfl-166', tag: 'Ana Yemek' }, // ASYA USULÜ TAVUK
        { id: 'tfl-106', tag: 'Dünya Mutfağı' }, // RİSOTTO Dİ FUNGHİ
        { id: 'tfl-117', tag: 'Makarna' }, // FETUCCİNE Dİ MANZO
        { id: 'tfl-151', tag: 'Tex-Mex' }, // QUESEDİLLA KABURGA
        { id: 'tfl-163', tag: 'Ana Yemek' }, // ONE BOWL IZGARA SOMON
        { id: 'tfl-068', tag: 'Atıştırmalık' }, // NACHOS ETLİ
      ],
      ['cat-86', 'cat-83', 'cat-92', 'cat-88']
    );

    return {
      slotId,
      mode: 'featured',
      eyebrow: 'Dünya Mutfağı • 15:00 – 19:00',
      title: 'Öğle & Akşamüstü Seçkisi',
      subtitle:
        'Dünya mutfağından seçkin makarnalar, paylaşmalık atıştırmalıklar ve şefin ana yemekleri.',
      spotlight: spotlight
        ? {
            item: spotlight,
            badge: 'İmza Ana Yemek',
            highlightNote: 'Günün öne çıkan dünya mutfağı tavsiyesi',
          }
        : null,
      items,
      quickLinks: [
        { label: 'Makarnalar', categoryId: 'cat-86' },
        { label: 'Atıştırmalıklar', categoryId: 'cat-83' },
        { label: 'Tavuk & Ana Yemekler', categoryId: 'cat-92' },
        { label: 'Burgerler', categoryId: 'cat-88' },
      ],
    };
  }

  // 19:00 - 00:00 (+ late-night continuation) -> Alkollü Mekan & Dünya Mutfağı Komboları
  const pairings = resolveEveningPairings(menuIndex);
  const steakCount = menuIndex.getItemsByCategory('cat-124').length;
  const cocktailCount = menuIndex.getItemsByCategory('cat-123', 'KOKTEYLLER').length;

  return {
    slotId: TIME_SLOT_IDS.EVENING,
    mode: 'pairings',
    eyebrow: 'Alkollü Mekan & Dünya Mutfağı • 19:00 – 00:00',
    title: 'İmza Kokteyl & Steak Komboları',
    subtitle:
      'Özel soslu bifteklerimiz ile miksoloji barımızın imza kokteyllerinden avantajlı akşam eşleştirmeleri.',
    pairings,
    quickLinks: [
      { label: `Et & Steak (${steakCount})`, categoryId: 'cat-124' },
      { label: `İmza Kokteyller (${cocktailCount})`, categoryId: 'cat-123', subcategory: 'KOKTEYLLER' },
      { label: 'Kırmızı Şaraplar', categoryId: 'cat-123', subcategory: 'KIRMIZI ŞARAPLAR' },
    ],
  };
}
