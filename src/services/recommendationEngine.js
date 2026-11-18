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

/** Deterministic daily index (changes automatically every day at local midnight) */
function getLocalDayNumber() {
  const now = new Date();
  return Math.floor(
    Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86_400_000
  );
}

function pickFromPool(pool, dayNumber, offset = 0) {
  if (!pool.length) return null;
  const idx = Math.abs(dayNumber + offset) % pool.length;
  return pool[idx];
}

function resolveCuratedItems(
  menuIndex,
  specs,
  lang,
  localeData,
  fallbackCategoryIds = [],
  excludeIds = new Set()
) {
  const resolved = [];
  const usedIds = new Set(excludeIds);

  for (const spec of specs) {
    if (!spec || resolved.length >= CAROUSEL_LIMIT) continue;
    const item = menuIndex.getItemById(spec.id);
    if (item && !usedIds.has(item.id)) {
      usedIds.add(item.id);
      resolved.push({
        ...item,
        recommendationTag:
          pickLang(spec.tag, lang) ||
          getLocalizedItemCategory(item, lang, localeData),
        highlightNote: spec.note ? pickLang(spec.note, lang) : '',
        visualTheme: spec.visualTheme || null,
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
            highlightNote: '',
            visualTheme: null,
          });
        }
      }
    }
  }

  return resolved.slice(0, CAROUSEL_LIMIT);
}

// --- POOLS ---
const SOUP_SPECS = [
  {
    id: 'tfl-066', // 1. GÜNÜN ÇORBASI
    tag: { tr: 'Günün Çorbası', en: 'Soup of the Day', de: 'Tagessuppe', es: 'Sopa del Día', ar: 'شوربة اليوم', zh: '今日例汤', ru: 'Суп дня' },
  },
  {
    id: 'tfl-067', // 2. MİNESTRONE ÇORBA (İtalyan Sebze Çorbası)
    tag: { tr: 'İtalyan Sebze Çorbası', en: 'Italian Vegetable Soup', de: 'Italienische Gemüsesuppe', es: 'Sopa Italiana de Verduras', ar: 'شوربة خضار إيطالية', zh: '意式蔬菜浓汤', ru: 'Итальянский овощной суп' },
  },
];

const MORNING_EXTRA_POOL_A = [
  { id: 'tfl-009', tag: { tr: 'Gurme Kahvaltı', en: 'Gourmet', de: 'Gourmet', es: 'Gourmet', ar: 'غورميه', zh: '精致早午餐', ru: 'Гурмэ' } },
  { id: 'tfl-008', tag: { tr: 'Şefin Önerisi', en: "Chef's Pick", de: 'Chef-Tipp', es: 'Elección del Chef', ar: 'اختيار الشيف', zh: '主厨推荐', ru: 'Выбор шефа' } },
  { id: 'tfl-013', tag: { tr: 'Sıcak Omlet', en: 'Hot Omelette', de: 'Omelett', es: 'Tortilla', ar: 'أومليت ساخن', zh: '鲜菇欧姆蛋', ru: 'Омлет' } },
];

const MORNING_EXTRA_POOL_B = [
  { id: 'tfl-007', tag: { tr: 'Sıcak Tava', en: 'Hot Pan', de: 'Pfannengericht', es: 'En Sartén', ar: 'طاوة ساخنة', zh: '铁锅煎蛋', ru: 'На сковороде' } },
  { id: 'tfl-005', tag: { tr: 'Klasik Tava', en: 'Classic Pan', de: 'Klassiker', es: 'Clásico', ar: 'كلاسيكي', zh: '经典香肠煎蛋', ru: 'Классика' } },
  { id: 'tfl-015', tag: { tr: 'İspanyol Omlet', en: 'Spanish Omelette', de: 'Spanisches Omelett', es: 'Tortilla Española', ar: 'أومليت إسباني', zh: '西班牙煎蛋', ru: 'Испанский омлет' } },
];

const LUNCH_EXTRA_POOL_A = [
  { id: 'tfl-106', tag: { tr: 'Risotto', en: 'Risotto', de: 'Risotto', es: 'Risotto', ar: 'ريزوتو', zh: '意式烩饭', ru: 'Ризотто' } },
  { id: 'tfl-117', tag: { tr: 'Bonfile Makarna', en: 'Beef Pasta', de: 'Pasta mit Filet', es: 'Pasta con Solomillo', ar: 'معكرونة باللحم', zh: '牛柳意面', ru: 'Паста с вырезкой' } },
  { id: 'tfl-151', tag: { tr: 'Tex-Mex', en: 'Tex-Mex', de: 'Tex-Mex', es: 'Tex-Mex', ar: 'تيكس-ميكس', zh: '墨式风味', ru: 'Текс-Мекс' } },
];

const LUNCH_EXTRA_POOL_B = [
  { id: 'tfl-059', tag: { tr: 'Atıştırmalık', en: 'Shareable', de: 'Zum Teilen', es: 'Para Compartir', ar: 'للمشاركة', zh: '分享小食', ru: 'На компанию' } },
  { id: 'tfl-100', tag: { tr: 'Uzak Doğu', en: 'Asian Noodle', de: 'Nudeln', es: 'Noodles', ar: 'نودلز آسيوي', zh: '鲜虾炒面', ru: 'Лапша' } },
  { id: 'tfl-091', tag: { tr: 'Hafif Salata', en: 'Fresh Salad', de: 'Frischer Salat', es: 'Ensalada Fresca', ar: 'سلطة طازجة', zh: '鲜爽沙拉', ru: 'Свежий салат' } },
];

// Dinner 4 Big Hero Spotlights (Daily Rotating):
// 1. Et/Steak | 2. Balık | 3. Şarap | 4. Kokteyl
const DINNER_STEAK_POOL = [
  {
    id: 'tfl-184',
    tag: { tr: 'Et & Steak', en: 'Meat & Steak', de: 'Fleisch & Steak', es: 'Carne y Steak', ar: 'اللحوم والستيك', zh: '精选牛排', ru: 'Мясо и стейк' },
    note: { tr: 'Şefin bugüne özel et & steak seçimi', en: "Chef's daily steak selection", de: 'Heutige Steak-Auswahl des Küchenchefs', es: 'Selección diaria de steak del chef', ar: 'اختيار الشيف اليومي للستيك', zh: '主厨今日精选牛排', ru: 'Стейк дня от шеф-повара' },
  },
  {
    id: 'tfl-183',
    tag: { tr: 'Özel Soslu Steak', en: 'Signature Steak', de: 'Signature Steak', es: 'Steak de Autor', ar: 'ستيك بصلصة خاصة', zh: '秘制酱汁牛排', ru: 'Фирменный стейк' },
    note: { tr: 'Şefin bugüne özel et & steak seçimi', en: "Chef's daily steak selection", de: 'Heutige Steak-Auswahl des Küchenchefs', es: 'Selección diaria de steak del chef', ar: 'اختيار الشيف اليومي للستيك', zh: '主厨今日精选牛排', ru: 'Стейк дня от шеф-повара' },
  },
  {
    id: 'tfl-189',
    tag: { tr: 'Karabiber Soslu', en: 'Pepper Steak', de: 'Pfeffersteak', es: 'Steak a la Pimienta', ar: 'بيبر ستيك', zh: '黑椒牛排', ru: 'Пеппер стейк' },
    note: { tr: 'Şefin bugüne özel et & steak seçimi', en: "Chef's daily steak selection", de: 'Heutige Steak-Auswahl des Küchenchefs', es: 'Selección diaria de steak del chef', ar: 'اختيار الشيف اليومي للستيك', zh: '主厨今日精选牛排', ru: 'Стейк дня от шеф-повара' },
  },
  {
    id: 'tfl-190',
    tag: { tr: 'Izgara Et', en: 'Chargrilled Lamb', de: 'Lammkoteletts', es: 'Chuletas de Cordero', ar: 'ريش غنم مشوية', zh: '炭烤羊排', ru: 'Каре ягнёнка' },
    note: { tr: 'Şefin bugüne özel et & steak seçimi', en: "Chef's daily steak selection", de: 'Heutige Steak-Auswahl des Küchenchefs', es: 'Selección diaria de steak del chef', ar: 'اختيار الشيف اليومي للستيك', zh: '主厨今日精选牛排', ru: 'Стейк дня от шеф-повара' },
  },
  {
    id: 'tfl-191',
    tag: { tr: 'Lokum Bonfile', en: 'Butter Tenderloin', de: 'Rinderfilet Lokum', es: 'Solomillo Lokum', ar: 'فيليه لوكوم', zh: '黄油嫩煎菲力', ru: 'Вырезка Локум' },
    note: { tr: 'Şefin bugüne özel et & steak seçimi', en: "Chef's daily steak selection", de: 'Heutige Steak-Auswahl des Küchenchefs', es: 'Selección diaria de steak del chef', ar: 'اختيار الشيف اليومي للستيك', zh: '主厨今日精选牛排', ru: 'Стейк дня от шеф-повара' },
  },
  {
    id: 'tfl-186',
    tag: { tr: 'Izgara Bonfile', en: 'Grilled Tenderloin', de: 'Gegrilltes Filet', es: 'Solomillo a la Parrilla', ar: 'فيليه مشوي', zh: '炭烤菲力牛柳', ru: 'Вырезка на гриле' },
    note: { tr: 'Şefin bugüne özel et & steak seçimi', en: "Chef's daily steak selection", de: 'Heutige Steak-Auswahl des Küchenchefs', es: 'Selección diaria de steak del chef', ar: 'اختيار الشيف اليومي للستيك', zh: '主厨今日精选牛排', ru: 'Стейк дня от шеф-повара' },
  },
];

const DINNER_FISH_POOL = [
  {
    id: 'tfl-209',
    tag: { tr: 'Günün Balığı', en: 'Catch of the Day', de: 'Fisch des Tages', es: 'Pescado del Día', ar: 'سمك اليوم', zh: '今日鲜鱼', ru: 'Рыба дня' },
    note: { tr: 'Her gün yenilenen taze deniz ürünü tavsiyesi', en: 'Fresh daily fish recommendation', de: 'Frische tägliche Fischempfehlung', es: 'Recomendación diaria de pescado fresco', ar: 'توصية السمك الطازج اليومية', zh: '每日精选新鲜海鱼推荐', ru: 'Свежая рыба дня' },
  },
  {
    id: 'tfl-210',
    tag: { tr: 'Günün Balığı', en: 'Catch of the Day', de: 'Fisch des Tages', es: 'Pescado del Día', ar: 'سمك اليوم', zh: '今日鲜鱼', ru: 'Рыба дня' },
    note: { tr: 'Her gün yenilenen taze deniz ürünü tavsiyesi', en: 'Fresh daily fish recommendation', de: 'Frische tägliche Fischempfehlung', es: 'Recomendación diaria de pescado fresco', ar: 'توصية السمك الطازج اليومية', zh: '每日精选新鲜海鱼推荐', ru: 'Свежая рыба дня' },
  },
  {
    id: 'tfl-211',
    tag: { tr: 'Günün Balığı', en: 'Catch of the Day', de: 'Fisch des Tages', es: 'Pescado del Día', ar: 'سمك اليوم', zh: '今日鲜鱼', ru: 'Рыба дня' },
    note: { tr: 'Her gün yenilenen taze deniz ürünü tavsiyesi', en: 'Fresh daily fish recommendation', de: 'Frische tägliche Fischempfehlung', es: 'Recomendación diaria de pescado fresco', ar: 'توصية السمك الطازج اليومية', zh: '每日精选新鲜海鱼推荐', ru: 'Свежая рыба дня' },
  },
];

const DINNER_WINE_POOL = [
  { id: 'tfl-380', visualTheme: 'wine', tag: { tr: 'Günün Şarabı • Kırmızı', en: 'Wine of the Day • Red', de: 'Wein des Tages • Rot', es: 'Vino del Día • Tinto', ar: 'نبيذ اليوم • أحمر', zh: '今日精选红酒', ru: 'Вино дня • Красное' }, note: { tr: 'Akşam yemeğine özel sommelier seçimi', en: 'Sommelier selection for dinner', de: 'Sommelier-Auswahl zum Abendessen', es: 'Selección del sumiller para la cena', ar: 'اختيار السوملييه لوجبة العشاء', zh: '侍酒师晚间臻选佳酿', ru: 'Выбор сомелье к ужину' } },
  { id: 'tfl-408', visualTheme: 'wine', tag: { tr: 'Günün Şarabı • Beyaz', en: 'Wine of the Day • White', de: 'Wein des Tages • Weiß', es: 'Vino del Día • Blanco', ar: 'نبيذ اليوم • أبيض', zh: '今日精选白葡萄酒', ru: 'Вино дня • Белое' }, note: { tr: 'Akşam yemeğine özel sommelier seçimi', en: 'Sommelier selection for dinner', de: 'Sommelier-Auswahl zum Abendessen', es: 'Selección del sumiller para la cena', ar: 'اختيار السوملييه لوجبة العشاء', zh: '侍酒师晚间臻选佳酿', ru: 'Выбор сомелье к ужину' } },
  { id: 'tfl-422', visualTheme: 'wine', tag: { tr: 'Günün Şarabı • Roze', en: 'Wine of the Day • Rosé', de: 'Wein des Tages • Rosé', es: 'Vino del Día • Rosado', ar: 'نبيذ اليوم • وردي', zh: '今日精选桃红酒', ru: 'Вино дня • Розовое' }, note: { tr: 'Akşam yemeğine özel sommelier seçimi', en: 'Sommelier selection for dinner', de: 'Sommelier-Auswahl zum Abendessen', es: 'Selección del sumiller para la cena', ar: 'اختيار السوملييه لوجبة العشاء', zh: '侍酒师晚间臻选佳酿', ru: 'Выбор сомелье к ужину' } },
  { id: 'tfl-383', visualTheme: 'wine', tag: { tr: 'Günün Şarabı • Kırmızı', en: 'Wine of the Day • Red', de: 'Wein des Tages • Rot', es: 'Vino del Día • Tinto', ar: 'نبيذ اليوم • أحمر', zh: '今日精选红酒', ru: 'Вино дня • Красное' }, note: { tr: 'Akşam yemeğine özel sommelier seçimi', en: 'Sommelier selection for dinner', de: 'Sommelier-Auswahl zum Abendessen', es: 'Selección del sumiller para la cena', ar: 'اختيار السوملييه لوجبة العشاء', zh: '侍酒师晚间臻选佳酿', ru: 'Выбор сомелье к ужину' } },
  { id: 'tfl-405', visualTheme: 'wine', tag: { tr: 'Günün Şarabı • Beyaz', en: 'Wine of the Day • White', de: 'Wein des Tages • Weiß', es: 'Vino del Día • Blanco', ar: 'نبيذ اليوم • أبيض', zh: '今日精选白葡萄酒', ru: 'Вино дня • Белое' }, note: { tr: 'Akşam yemeğine özel sommelier seçimi', en: 'Sommelier selection for dinner', de: 'Sommelier-Auswahl zum Abendessen', es: 'Selección del sumiller para la cena', ar: 'اختيار السوملييه لوجبة العشاء', zh: '侍酒师晚间臻选佳酿', ru: 'Выбор сомелье к ужину' } },
  { id: 'tfl-428', visualTheme: 'wine', tag: { tr: 'Günün Şarabı • Roze', en: 'Wine of the Day • Rosé', de: 'Wein des Tages • Rosé', es: 'Vino del Día • Rosado', ar: 'نبيذ اليوم • وردي', zh: '今日精选桃红酒', ru: 'Вино дня • Розовое' }, note: { tr: 'Akşam yemeğine özel sommelier seçimi', en: 'Sommelier selection for dinner', de: 'Sommelier-Auswahl zum Abendessen', es: 'Selección del sumiller para la cena', ar: 'اختيار السوملييه لوجبة العشاء', zh: '侍酒师晚间臻选佳酿', ru: 'Выбор сомелье к ужину' } },
  { id: 'tfl-388', visualTheme: 'wine', tag: { tr: 'Günün Şarabı • Kırmızı', en: 'Wine of the Day • Red', de: 'Wein des Tages • Rot', es: 'Vino del Día • Tinto', ar: 'نبيذ اليوم • أحمر', zh: '今日精选红酒', ru: 'Вино дня • Красное' }, note: { tr: 'Akşam yemeğine özel sommelier seçimi', en: 'Sommelier selection for dinner', de: 'Sommelier-Auswahl zum Abendessen', es: 'Selección del sumiller para la cena', ar: 'اختيار السوملييه لوجبة العشاء', zh: '侍酒师晚间臻选佳酿', ru: 'Выбор сомелье к ужину' } },
  { id: 'tfl-416', visualTheme: 'wine', tag: { tr: 'Günün Şarabı • Beyaz', en: 'Wine of the Day • White', de: 'Wein des Tages • Weiß', es: 'Vino del Día • Blanco', ar: 'نبيذ اليوم • أبيض', zh: '今日精选白葡萄酒', ru: 'Вино дня • Белое' }, note: { tr: 'Akşam yemeğine özel sommelier seçimi', en: 'Sommelier selection for dinner', de: 'Sommelier-Auswahl zum Abendessen', es: 'Selección del sumiller para la cena', ar: 'اختيار السوملييه لوجبة العشاء', zh: '侍酒师晚间臻选佳酿', ru: 'Выбор сомелье к ужину' } },
];

const DINNER_COCKTAIL_POOL = [
  { id: 'tfl-336', visualTheme: 'cocktail', tag: { tr: 'İmza Kokteyl', en: 'Signature Cocktail', de: 'Signature Cocktail', es: 'Cóctel de Autor', ar: 'كوكتيل مميز', zh: '招牌鸡尾酒', ru: 'Авторский коктейль' }, note: { tr: 'Miksoloji barımızdan günün kokteyli', en: 'Handcrafted cocktail from our bar', de: 'Hausgemachter Cocktail unserer Bar', es: 'Cóctel artesanal de nuestra barra', ar: 'كوكتيل اليوم المحضر بعناية', zh: '调酒师今日招牌特调', ru: 'Авторский коктейль дня' } },
  { id: 'tfl-324', visualTheme: 'cocktail', tag: { tr: 'İmza Kokteyl', en: 'Signature Cocktail', de: 'Signature Cocktail', es: 'Cóctel de Autor', ar: 'كوكتيل مميز', zh: '招牌鸡尾酒', ru: 'Авторский коктейль' }, note: { tr: 'Miksoloji barımızdan günün kokteyli', en: 'Handcrafted cocktail from our bar', de: 'Hausgemachter Cocktail unserer Bar', es: 'Cóctel artesanal de nuestra barra', ar: 'كوكتيل اليوم المحضر بعناية', zh: '调酒师今日招牌特调', ru: 'Авторский коктейль дня' } },
  { id: 'tfl-327', visualTheme: 'cocktail', tag: { tr: 'İmza Kokteyl', en: 'Signature Cocktail', de: 'Signature Cocktail', es: 'Cóctel de Autor', ar: 'كوكتيل مميز', zh: '招牌鸡尾酒', ru: 'Авторский коктейль' }, note: { tr: 'Miksoloji barımızdan günün kokteyli', en: 'Handcrafted cocktail from our bar', de: 'Hausgemachter Cocktail unserer Bar', es: 'Cóctel artesanal de nuestra barra', ar: 'كوكتيل اليوم المحضر بعناية', zh: '调酒师今日招牌特调', ru: 'Авторский коктейль дня' } },
  { id: 'tfl-332', visualTheme: 'cocktail', tag: { tr: 'İmza Kokteyl', en: 'Signature Cocktail', de: 'Signature Cocktail', es: 'Cóctel de Autor', ar: 'كوكتيل مميز', zh: '招牌鸡尾酒', ru: 'Авторский коктейль' }, note: { tr: 'Miksoloji barımızdan günün kokteyli', en: 'Handcrafted cocktail from our bar', de: 'Hausgemachter Cocktail unserer Bar', es: 'Cóctel artesanal de nuestra barra', ar: 'كوكتيل اليوم المحضر بعناية', zh: '调酒师今日招牌特调', ru: 'Авторский коктейль дня' } },
  { id: 'tfl-338', visualTheme: 'cocktail', tag: { tr: 'İmza Kokteyl', en: 'Signature Cocktail', de: 'Signature Cocktail', es: 'Cóctel de Autor', ar: 'كوكتيل مميز', zh: '招牌鸡尾酒', ru: 'Авторский коктейль' }, note: { tr: 'Miksoloji barımızdan günün kokteyli', en: 'Handcrafted cocktail from our bar', de: 'Hausgemachter Cocktail unserer Bar', es: 'Cóctel artesanal de nuestra barra', ar: 'كوكتيل اليوم المحضر بعناية', zh: '调酒师今日招牌特调', ru: 'Авторский коктейль дня' } },
  { id: 'tfl-331', visualTheme: 'cocktail', tag: { tr: 'İmza Kokteyl', en: 'Signature Cocktail', de: 'Signature Cocktail', es: 'Cóctel de Autor', ar: 'كوكتيل مميز', zh: '招牌鸡尾酒', ru: 'Авторский коктейль' }, note: { tr: 'Miksoloji barımızdan günün kokteyli', en: 'Handcrafted cocktail from our bar', de: 'Hausgemachter Cocktail unserer Bar', es: 'Cóctel artesanal de nuestra barra', ar: 'كوكتيل اليوم المحضر بعناية', zh: '调酒师今日招牌特调', ru: 'Авторский коктейль дня' } },
  { id: 'tfl-334', visualTheme: 'cocktail', tag: { tr: 'İmza Kokteyl', en: 'Signature Cocktail', de: 'Signature Cocktail', es: 'Cóctel de Autor', ar: 'كوكتيل مميز', zh: '招牌鸡尾酒', ru: 'Авторский коктейль' }, note: { tr: 'Miksoloji barımızdan günün kokteyli', en: 'Handcrafted cocktail from our bar', de: 'Hausgemachter Cocktail unserer Bar', es: 'Cóctel artesanal de nuestra barra', ar: 'كوكتيل اليوم المحضر بعناية', zh: '调酒师今日招牌特调', ru: 'Авторский коктейль дня' } },
  { id: 'tfl-328', visualTheme: 'cocktail', tag: { tr: 'İmza Kokteyl', en: 'Signature Cocktail', de: 'Signature Cocktail', es: 'Cóctel de Autor', ar: 'كوكتيل مميز', zh: '招牌鸡尾酒', ru: 'Авторский коктейль' }, note: { tr: 'Miksoloji barımızdan günün kokteyli', en: 'Handcrafted cocktail from our bar', de: 'Hausgemachter Cocktail unserer Bar', es: 'Cóctel artesanal de nuestra barra', ar: 'كوكتيل اليوم المحضر بعناية', zh: '调酒师今日招牌特调', ru: 'Авторский коктейль дня' } },
];

// Dinner lower carousel (4 varied evening dishes distinct from hero spotlights)
const DINNER_LOWER_SPECS = [
  { id: 'tfl-148', tag: { tr: 'Tex-Mex Fajita', en: 'Sizzling Fajita', de: 'Heiße Fajita', es: 'Fajita Caliente', ar: 'فاهيتا ساخنة', zh: '铁板法士达', ru: 'Горячий фахитас' } }, // ETLİ FAJİTA
  { id: 'tfl-117', tag: { tr: 'İtalyan Makarna', en: 'Italian Pasta', de: 'Pasta', es: 'Pasta', ar: 'معكرونة إيطالية', zh: '意式面食', ru: 'Паста' } }, // FETUCCİNE Dİ MANZO
  { id: 'tfl-064', tag: { tr: 'Sıcak Başlangıç', en: 'Hot Starter', de: 'Warme Vorspeise', es: 'Entrante Caliente', ar: 'مقبلات ساخنة', zh: '热前菜', ru: 'Горячая закуска' } }, // KARİDES GÜVEÇ
  { id: 'tfl-181', tag: { tr: 'Anadolu Klasiği', en: 'Anatolian Classic', de: 'Anatolischer Klassiker', es: 'Clásico Anatolio', ar: 'كلاسيكي أناضولي', zh: '安纳托利亚经典', ru: 'Классика Анатолии' } }, // ALİ NAZİK
];

const NIGHT_SNACK_POOL = [
  { id: 'tfl-059', tag: { tr: 'Gece Atıştırmalığı', en: 'Late-Night Snack', de: 'Nacht-Snack', es: 'Snack Nocturno', ar: 'وجبة خفيفة ليلية', zh: '夜宵小食', ru: 'Ночная закуска' }, note: { tr: 'Kokteyllerle paylaşmalık sıcak atıştırmalık', en: 'Shareable late-night bite with cocktails', de: 'Ideal zum Teilen bei Cocktails', es: 'Ideal para compartir con cócteles', ar: 'مقبلات مثالية للمشاركة مع الكوكتيلات', zh: '搭配鸡尾酒的人气分享小食', ru: 'Идеально к коктейлям для компании' } },
  { id: 'tfl-061', tag: { tr: 'Paylaşmalık Kombo', en: 'Sharing Combo', de: 'Sharing-Box', es: 'Combo para Compartir', ar: 'كومبو للمشاركة', zh: '分享拼盘', ru: 'Сет на компанию' }, note: { tr: 'Kokteyllerle paylaşmalık sıcak atıştırmalık', en: 'Shareable late-night bite with cocktails', de: 'Ideal zum Teilen bei Cocktails', es: 'Ideal para compartir con cócteles', ar: 'مقبلات مثالية للمشاركة مع الكوكتيلات', zh: '搭配鸡尾酒的人气分享小食', ru: 'Идеально к коктейлям для компании' } },
  { id: 'tfl-068', tag: { tr: 'Gece Atıştırmalığı', en: 'Late-Night Snack', de: 'Nacht-Snack', es: 'Snack Nocturno', ar: 'وجبة خفيفة ليلية', zh: '夜宵小食', ru: 'Ночная закуска' }, note: { tr: 'Kokteyllerle paylaşmalık sıcak atıştırmalık', en: 'Shareable late-night bite with cocktails', de: 'Ideal zum Teilen bei Cocktails', es: 'Ideal para compartir con cócteles', ar: 'مقبلات مثالية للمشاركة مع الكوكتيلات', zh: '搭配鸡尾酒的人气分享小食', ru: 'Идеально к коктейлям для компании' } },
  { id: 'tfl-071', tag: { tr: 'Kokteyl Eşlikçisi', en: 'Cocktail Pairing', de: 'Zum Cocktail', es: 'Para Acompañar', ar: 'مقبلات مع الكوكتيل', zh: '佐酒拼盘', ru: 'К коктейлям' }, note: { tr: 'Kokteyllerle paylaşmalık gurme peynir tabağı', en: 'Gourmet cheese platter for cocktails', de: 'Gourmet-Käseplatte zu Cocktails', es: 'Tabla de quesos gourmet para cócteles', ar: 'طبق أجبان فاخر مع الكوكتيلات', zh: '搭配鸡尾酒的精选芝士拼盘', ru: 'Сырная тарелка к коктейлям' } },
  { id: 'tfl-060', tag: { tr: 'Gece Atıştırmalığı', en: 'Late-Night Snack', de: 'Nacht-Snack', es: 'Snack Nocturno', ar: 'وجبة خفيفة ليلية', zh: '夜宵小食', ru: 'Ночная закуска' }, note: { tr: 'Kokteyllerle paylaşmalık sıcak atıştırmalık', en: 'Shareable late-night bite with cocktails', de: 'Ideal zum Teilen bei Cocktails', es: 'Ideal para compartir con cócteles', ar: 'مقبلات مثالية للمشاركة مع الكوكتيلات', zh: '搭配鸡尾酒的人气分享小食', ru: 'Идеально к коктейлям для компании' } },
];

const NIGHT_LOWER_SPECS = [
  { id: 'tfl-060', tag: { tr: 'Çıtır Atıştırmalık', en: 'Crispy Bite', de: 'Knusprig', es: 'Crujiente', ar: 'مقرمش', zh: '香脆小食', ru: 'Хрустящее' } },
  { id: 'tfl-071', tag: { tr: 'Peynir Tabağı', en: 'Cheese Platter', de: 'Käseplatte', es: 'Tabla de Quesos', ar: 'طبق أجبان', zh: '芝士拼盘', ru: 'Сырная тарелка' } },
  { id: 'tfl-073', tag: { tr: 'Paylaşmalık', en: 'Shareable', de: 'Zum Teilen', es: 'Para Compartir', ar: 'للمشاركة', zh: '分享小食', ru: 'На компанию' } },
  { id: 'tfl-069', tag: { tr: 'Nachos', en: 'Nachos', de: 'Nachos', es: 'Nachos', ar: 'ناتشوز', zh: '玉米片', ru: 'Начос' } },
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

export function getRecommendationsForSlot(
  slotId,
  menuIndex,
  lang = 'tr',
  localeData = null
) {
  const dayNumber = getLocalDayNumber();

  // Priority 1: Admin-selected Featured items
  const adminFeatured = menuIndex.featuredItems || [];
  if (adminFeatured.length > 0) {
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

    const spotlights = adminFeatured.slice(0, 4).map((item) => {
      const catLabel =
        getLocalizedItemSubcategory(item, lang, localeData) ||
        getLocalizedItemCategory(item, lang, localeData);
      return {
        ...item,
        recommendationTag: pickLang(
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
        highlightNote: `${catLabel} • ${featuredNoteSuffix}`,
        visualTheme: null,
      };
    });

    const remainingItems = adminFeatured.slice(4).map((item) => ({
      ...item,
      recommendationTag:
        getLocalizedItemSubcategory(item, lang, localeData) ||
        getLocalizedItemCategory(item, lang, localeData),
      visualTheme: null,
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
      spotlights,
      items: remainingItems,
      quickLinks: uniqueQuickLinks,
    };
  }

  // 1) 09:00 - 13:00 -> Sabah Servisi
  // Big 4-Slide Hero: Fixed 4 breakfasts (Serpme, Tek Kişilik, Hafif, Sıcak)
  // Lower 4-Slide Strip: 1. Günün Çorbası, 2. İtalyan Sebze Çorbası + 2 daily rotating
  if (slotId === TIME_SLOT_IDS.MORNING) {
    const spotlights = resolveCuratedItems(
      menuIndex,
      [
        {
          id: 'tfl-001',
          tag: { tr: 'Sabahın Yıldızı', en: 'Morning Star', de: 'Morgen-Favorit', es: 'Estrella', ar: 'نجم الصباح', zh: '人气必点', ru: 'Хит утра' },
          note: { tr: 'Min. 2 kişilik • Sınırsız demleme çay ile', en: 'Min. 2 guests • Unlimited Turkish tea', de: 'Für mind. 2 Personen • Inkl. Tee', es: 'Mín. 2 personas • Té turco ilimitado', ar: 'لشخصين على الأقل • شاي تركي غير محدود', zh: '2人起订 · 无限续杯红茶', ru: 'От 2 персон • Безлимитный чай' },
        },
        {
          id: 'tfl-002',
          tag: { tr: 'Klasik Kahvaltı', en: 'Classic Breakfast', de: 'Klassiker', es: 'Clásico', ar: 'كلاسيكي', zh: '经典款', ru: 'Классика' },
          note: { tr: 'İki adet demleme çay ile hazırlanır', en: 'Served with two freshly brewed Turkish teas', de: 'Serviert mit zwei Gläsern Tee', es: 'Servido con dos tés turcos', ar: 'يُقدم مع كوبين من الشاي التركي', zh: '配两杯现煮土耳其红茶', ru: 'Подаётся с двумя чашками чая' },
        },
        {
          id: 'tfl-003',
          tag: { tr: 'Fit & Hafif', en: 'Light & Fit', de: 'Leicht & Fit', es: 'Ligero y Fit', ar: 'خفيف وصحي', zh: '轻食健康', ru: 'Лёгкий' },
          note: { tr: 'Avokado, hellim ve kinoalı hafif başlangıç', en: 'Light start with avocado, halloumi & quinoa', de: 'Leicht mit Avocado, Halloumi & Quinoa', es: 'Ligero con aguacate, halloumi y quinoa', ar: 'بداية خفيفة بالأفوكادو والحلوم والكينوا', zh: '牛油果、哈罗米芝士与藜麦轻食', ru: 'Авокадо, халлуми и киноа' },
        },
        {
          id: 'tfl-004',
          tag: { tr: 'Sıcak Kahvaltı', en: 'Hot Breakfast', de: 'Warmes Frühstück', es: 'Desayuno Caliente', ar: 'إفطار ساخن', zh: '热食早餐', ru: 'Горячий завтрак' },
          note: { tr: 'Sıcak lezzetlerle zengin sabah tabağı', en: 'Rich warm breakfast platter', de: 'Reichhaltige warme Frühstücksplatte', es: 'Rico plato de desayuno caliente', ar: 'طبق إفطار ساخن غني', zh: '丰盛热食早餐拼盘', ru: 'Сытный горячий завтрак' },
        },
      ],
      lang,
      localeData,
      ['cat-82']
    );

    const items = resolveCuratedItems(
      menuIndex,
      [
        ...SOUP_SPECS,
        pickFromPool(MORNING_EXTRA_POOL_A, dayNumber),
        pickFromPool(MORNING_EXTRA_POOL_B, dayNumber),
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
        { tr: 'Sabah Servisi', en: 'Morning Service', de: 'Frühstücksservice', es: 'Servicio de Mañana', ar: 'خدمة الصباح', zh: '早餐时段', ru: 'Утренний сервис' },
        lang
      ),
      title: pickLang(
        { tr: 'Kahvaltı Keyfi', en: 'Breakfast Delights', de: 'Frühstücksgenuss', es: 'Placeres del Desayuno', ar: 'متعة الإفطار التركي', zh: '精选土耳其早餐', ru: 'Идеальный завтрак' },
        lang
      ),
      subtitle: pickLang(
        { tr: 'Güne taptaze Serpme Kahvaltı ve seçkin sabah lezzetleriyle başlayın.', en: 'Start your morning with our signature Turkish spread breakfast and fresh plates.', de: 'Starten Sie Ihren Morgen mit unserem reichhaltigen türkischen Frühstück.', es: 'Comienza la mañana con nuestro desayuno turco completo y platos frescos.', ar: 'ابدأ صباحك بإفطارنا التركي الغني وأشهى الأطباق الصباحية الطازجة.', zh: '以丰盛正宗的土耳其特色拼盘早餐和新鲜晨间美味开启美好一天。', ru: 'Начните утро с фирменного турецкого завтрака серпме и свежих блюд.' },
        lang
      ),
      spotlights,
      items,
      quickLinks: [
        {
          label: `${pickLang({ tr: 'Tüm Kahvaltılar', en: 'All Breakfasts', de: 'Alle Frühstücksgerichte', es: 'Todos los Desayunos', ar: 'جميع أطباق الإفطار', zh: '查看全部早餐', ru: 'Все завтраки' }, lang)} (${breakfastCount})`,
          categoryId: 'cat-82',
        },
      ],
    };
  }

  // 2) 13:00 - 17:00 -> Öğle Servisi
  // Big 4-Slide Hero: 4 signature lunch dishes
  // Lower 4-Slide Strip: 1. Günün Çorbası, 2. İtalyan Sebze Çorbası + 2 daily rotating
  if (slotId === TIME_SLOT_IDS.LUNCH) {
    const spotlights = resolveCuratedItems(
      menuIndex,
      [
        { id: 'tfl-138', tag: { tr: 'Öğlenin Yıldızı', en: 'Lunch Star', de: 'Mittags-Hit', es: 'Estrella del Almuerzo', ar: 'نجم الغداء', zh: '午间必点', ru: 'Хит обеда' }, note: { tr: 'İmza burger lezzetimiz', en: 'Our signature house burger', de: 'Unser Haus-Signature-Burger', es: 'Nuestra hamburguesa de autor', ar: 'برغر ذا فود لاونج المميز', zh: '本店招牌汉堡', ru: 'Наш фирменный бургер' } },
        { id: 'tfl-123', tag: { tr: 'İtalyan Makarna', en: 'Italian Pasta', de: 'Pasta', es: 'Pasta', ar: 'معكرونة إيطالية', zh: '意式面食', ru: 'Паста' }, note: { tr: 'Taze burrata peynirli özel spagetti', en: 'Fresh burrata & pesto spaghetti', de: 'Mit frischer Burrata & Pesto', es: 'Con burrata fresca y pesto', ar: 'سباغيتي بجبنة البوراتا الطازجة', zh: '新鲜布拉塔芝士意面', ru: 'Спагетти со свежей бурратой' } },
        { id: 'tfl-166', tag: { tr: 'Dünya Mutfağı', en: 'World Cuisine', de: 'Weltküche', es: 'Cocina Global', ar: 'مطبخ عالمي', zh: '环球主菜', ru: 'Мировая кухня' }, note: { tr: 'Uzak Doğu soslarıyla sote tavuk', en: 'Asian-style sautéed chicken', de: 'Asiatisch gebratenes Hähnchen', es: 'Pollo salteado estilo asiático', ar: 'دجاج سوتيه على الطريقة الآسيوية', zh: '亚式风味嫩鸡主菜', ru: 'Курица в азиатском стиле' } },
        { id: 'tfl-163', tag: { tr: 'Hafif Kase', en: 'Healthy Bowl', de: 'Healthy Bowl', es: 'Bowl Saludable', ar: 'طبق صحي', zh: '健康能量碗', ru: 'Лёгкий боул' }, note: { tr: 'Izgara somonlu dengeli öğle kasesi', en: 'Balanced grilled salmon bowl', de: 'Ausgewogene Lachs-Bowl', es: 'Bowl equilibrado de salmón', ar: 'طبق سلمون مشوي متوازن', zh: '烤三文鱼均衡轻食碗', ru: 'Сбалансированный боул с лососем' } },
      ],
      lang,
      localeData,
      ['cat-88', 'cat-86', 'cat-92', 'cat-91']
    );

    const items = resolveCuratedItems(
      menuIndex,
      [
        ...SOUP_SPECS,
        pickFromPool(LUNCH_EXTRA_POOL_A, dayNumber),
        pickFromPool(LUNCH_EXTRA_POOL_B, dayNumber),
      ],
      lang,
      localeData,
      ['cat-83', 'cat-86', 'cat-84']
    );

    return {
      slotId,
      mode: 'featured',
      eyebrow: pickLang(
        { tr: 'Öğle Servisi', en: 'Lunch Service', de: 'Mittagsservice', es: 'Servicio de Almuerzo', ar: 'خدمة الغداء', zh: '午餐时段', ru: 'Дневной сервис' },
        lang
      ),
      title: pickLang(
        { tr: 'Dünya Mutfağı Seçkisi', en: 'World Cuisine Selection', de: 'Weltküche-Auswahl', es: 'Selección de Cocina Internacional', ar: 'مختارات المطبخ العالمي', zh: '环球风味午间精选', ru: 'Коллекция мировой кухни' },
        lang
      ),
      subtitle: pickLang(
        { tr: 'Öğle servisine özel imza tabaklar, sıcacık çorbalar ve el yapımı makarnalar.', en: 'Signature lunch mains, daily soups, handcrafted pastas, and balanced bowls.', de: 'Signature-Gerichte, Tagessuppen, Pasta und frische Bowls zum Mittagessen.', es: 'Platos de autor, sopas del día, pastas artesanales y bowls frescos.', ar: 'أطباق غداء مميزة، شوربات يومية، معكرونة محضرة يدوياً وأطباق صحية.', zh: '午间招牌主菜、每日例汤、手工意面与均衡轻食碗。', ru: 'Фирменные обеденные блюда, супы дня, домашняя паста и боулы.' },
        lang
      ),
      spotlights,
      items,
      quickLinks: [
        { label: pickLang({ tr: 'Makarnalar', en: 'Pastas', de: 'Pasta', es: 'Pastas', ar: 'المعكرونة', zh: '意式面食', ru: 'Паста' }, lang), categoryId: 'cat-86' },
        { label: pickLang({ tr: 'Başlangıçlar', en: 'Starters', de: 'Vorspeisen', es: 'Entrantes', ar: 'المقبلات', zh: '开胃前菜', ru: 'Закуски' }, lang), categoryId: 'cat-83' },
        { label: pickLang({ tr: 'Burgerler', en: 'Burgers', de: 'Burger', es: 'Hamburguesas', ar: 'البرغر', zh: '招牌汉堡', ru: 'Бургеры' }, lang), categoryId: 'cat-88' },
        { label: pickLang({ tr: 'Kaseler', en: 'Bowls', de: 'Bowls', es: 'Bowls', ar: 'أطباق البول', zh: '能量碗', ru: 'Боулы' }, lang), categoryId: 'cat-91' },
      ],
    };
  }

  // 3) 17:00 - 20:30 -> Akşam Servisi
  // Big 4-Slide Hero (under "Akşam Yemeği Seçkisi"):
  //   1. Et/Steak (daily) | 2. Balık (daily) | 3. Şarap (daily) | 4. Kokteyl (daily)
  // Lower 4-Slide Strip ("Akşam Servisi Öne Çıkanlar"): 4 other varied dinner dishes
  if (slotId === TIME_SLOT_IDS.DINNER) {
    const heroSpecs = [
      pickFromPool(DINNER_STEAK_POOL, dayNumber, 0), // 1. Et / Steak
      pickFromPool(DINNER_FISH_POOL, dayNumber, 0), // 2. Balık
      pickFromPool(DINNER_WINE_POOL, dayNumber, 0), // 3. Şarap
      pickFromPool(DINNER_COCKTAIL_POOL, dayNumber, 0), // 4. Kokteyl
    ];

    const spotlights = resolveCuratedItems(
      menuIndex,
      heroSpecs,
      lang,
      localeData,
      ['cat-124', 'cat-94', 'cat-123']
    );

    const heroIdSet = new Set(spotlights.map((s) => s.id));
    const items = resolveCuratedItems(
      menuIndex,
      DINNER_LOWER_SPECS,
      lang,
      localeData,
      ['cat-89', 'cat-86', 'cat-93', 'cat-124'],
      heroIdSet
    );

    const steakCount = menuIndex.getItemsByCategory('cat-124').length;
    const fishCount = menuIndex.getItemsByCategory('cat-94').length;
    const cocktailCount = menuIndex.getItemsByCategory('cat-123', 'KOKTEYLLER').length;

    return {
      slotId,
      mode: 'featured',
      eyebrow: pickLang(
        { tr: 'Akşam Servisi', en: 'Dinner Service', de: 'Abendservice', es: 'Servicio de Cena', ar: 'خدمة العشاء', zh: '晚餐时段', ru: 'Вечерний сервис' },
        lang
      ),
      title: pickLang(
        { tr: 'Akşam Yemeği Seçkisi', en: 'Evening Dining Selection', de: 'Abendessen-Auswahl', es: 'Selección para la Cena', ar: 'مختارات العشاء الفاخرة', zh: '晚间臻选美馔', ru: 'Вечерняя коллекция ужина' },
        lang
      ),
      subtitle: pickLang(
        { tr: 'Her gün yenilenen et & steak, taze balık, özel şarap ve imza kokteyl önerilerimiz.', en: 'Daily rotating selections of prime steaks, fresh fish, curated wines, and signature cocktails.', de: 'Täglich wechselnde Empfehlungen: Steaks, frischer Fisch, erlesene Weine und Signature-Cocktails.', es: 'Selecciones renovadas cada día: steaks, pescado fresco, vinos selectos y cócteles de autor.', ar: 'مختارات متجددة يومياً من الستيك، الأسماك الطازجة، النبيذ الفاخر والكوكتيلات المميزة.', zh: '每日焕新推荐：精选牛排、鲜美海鲜、臻选葡萄酒与招牌鸡尾酒。', ru: 'Ежедневно обновляемый выбор стейков, свежей рыбы, вин и авторских коктейлей.' },
        lang
      ),
      spotlights,
      items,
      quickLinks: [
        { label: `${pickLang({ tr: 'Et & Steak', en: 'Meat & Steak', de: 'Fleisch & Steaks', es: 'Carnes y Steaks', ar: 'اللحوم والستيك', zh: '牛排主菜', ru: 'Стейки и мясо' }, lang)} (${steakCount})`, categoryId: 'cat-124' },
        { label: `${pickLang({ tr: 'Balıklar', en: 'Fish & Seafood', de: 'Fisch', es: 'Pescados', ar: 'الأسماك', zh: '海鲜与鱼类', ru: 'Рыба' }, lang)} (${fishCount})`, categoryId: 'cat-94' },
        { label: pickLang({ tr: 'Şaraplar', en: 'Wines', de: 'Weine', es: 'Vinos', ar: 'النبيذ', zh: '葡萄酒', ru: 'Вина' }, lang), categoryId: 'cat-123', subcategory: 'KIRMIZI ŞARAPLAR' },
        { label: `${pickLang({ tr: 'Kokteyller', en: 'Cocktails', de: 'Cocktails', es: 'Cócteles', ar: 'الكوكتيلات', zh: '鸡尾酒', ru: 'Коктейли' }, lang)} (${cocktailCount})`, categoryId: 'cat-123', subcategory: 'KOKTEYLLER' },
      ],
    };
  }

  // 4) 20:30 - 24:00 -> Gece Servisi
  // Big 4-Slide Hero: 1. Kokteyl #1 | 2. Kokteyl #2 | 3. Kokteyl #3 | 4. Gece Atıştırmalığı
  // Lower 4-Slide Strip: 4 extra bar snacks
  const nightHeroSpecs = [
    pickFromPool(DINNER_COCKTAIL_POOL, dayNumber, 0),
    pickFromPool(DINNER_COCKTAIL_POOL, dayNumber, 2),
    pickFromPool(DINNER_COCKTAIL_POOL, dayNumber, 4),
    pickFromPool(NIGHT_SNACK_POOL, dayNumber, 0),
  ];

  const spotlights = resolveCuratedItems(
    menuIndex,
    nightHeroSpecs,
    lang,
    localeData,
    ['cat-123', 'cat-83']
  );

  const heroIdSet = new Set(spotlights.map((s) => s.id));
  const items = resolveCuratedItems(
    menuIndex,
    NIGHT_LOWER_SPECS,
    lang,
    localeData,
    ['cat-83'],
    heroIdSet
  );

  const cocktailCount = menuIndex.getItemsByCategory('cat-123', 'KOKTEYLLER').length;
  const starterCount = menuIndex.getItemsByCategory('cat-83').length;

  return {
    slotId: TIME_SLOT_IDS.NIGHT,
    mode: 'featured',
    eyebrow: pickLang(
      { tr: 'Gece Servisi', en: 'Night Service', de: 'Nachtservice', es: 'Servicio Nocturno', ar: 'الخدمة الليلية', zh: '夜宵酒廊时段', ru: 'Ночной сервис' },
      lang
    ),
    title: pickLang(
      { tr: 'İmza Kokteyller & Gece Atıştırmalıkları', en: 'Signature Cocktails & Late-Night Bites', de: 'Signature Cocktails & Nacht-Snacks', es: 'Cócteles de Autor y Snacks Nocturnos', ar: 'كوكتيلات مميزة ومقبلات ليلية', zh: '招牌鸡尾酒与夜宵小食', ru: 'Авторские коктейли и ночные закуски' },
      lang
    ),
    subtitle: pickLang(
      { tr: 'Miksoloji barımızdan 3 özel imza kokteyl ve geceye eşlik eden paylaşmalık atıştırmalık seçkisi.', en: 'Three handcrafted signature cocktails from our bar paired with a shareable late-night snack.', de: 'Drei hausgemachte Signature-Cocktails von unserer Bar und ein köstlicher Snack zum Teilen.', es: 'Tres cócteles de autor de nuestra barra acompañados de un snack ideal para compartir.', ar: 'ثلاثة كوكتيلات مميزة من البار مع طبق مقبلات شهي للمشاركة في السهرة.', zh: '精选三款酒吧招牌特调鸡尾酒，搭配人气夜宵分享小食。', ru: 'Три авторских коктейля от нашего бара и аппетитная ночная закуска для компании.' },
      lang
    ),
    spotlights,
    items,
    quickLinks: [
      { label: `${pickLang({ tr: 'İmza Kokteyller', en: 'Signature Cocktails', de: 'Signature Cocktails', es: 'Cócteles de Autor', ar: 'الكوكتيلات المميزة', zh: '招牌鸡尾酒', ru: 'Коктейли' }, lang)} (${cocktailCount})`, categoryId: 'cat-123', subcategory: 'KOKTEYLLER' },
      { label: `${pickLang({ tr: 'Atıştırmalıklar', en: 'Snacks & Starters', de: 'Snacks & Vorspeisen', es: 'Snacks y Entrantes', ar: 'المقبلات', zh: '开胃小食', ru: 'Закуски' }, lang)} (${starterCount})`, categoryId: 'cat-83' },
      { label: pickLang({ tr: 'Tüm İçecekler', en: 'All Drinks', de: 'Alle Drinks', es: 'Todas las Bebidas', ar: 'جميع المشروبات', zh: '全部酒水', ru: 'Все напитки' }, lang), categoryId: 'cat-123' },
    ],
  };
}
