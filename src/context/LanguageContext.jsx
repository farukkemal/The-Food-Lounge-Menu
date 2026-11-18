import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import { SUPPORTED_LANGUAGES } from '../components/LanguageFlags';

const LANG_STORAGE_KEY = 'tfl_lang_v1';
const VALID_CODES = new Set(SUPPORTED_LANGUAGES.map((l) => l.code));

const localeCache = new Map();

async function loadLocalePack(lang) {
  if (lang === 'tr' || lang === 'en') return null;
  if (localeCache.has(lang)) return localeCache.get(lang);

  let mod;
  if (lang === 'ar') {
    mod = await import('../locales/ar.json');
  } else if (lang === 'zh') {
    mod = await import('../locales/zh.json');
  } else if (lang === 'ru') {
    mod = await import('../locales/ru.json');
  }

  const data = mod?.default || null;
  if (data) localeCache.set(lang, data);
  return data;
}

const UI_STRINGS = {
  tr: {
    open: 'Açık',
    closed: 'Kapalı',
    table: 'Masa',
    itemsCount: 'Ürün',
    info: 'Bilgi',
    infoAria: 'İşletme Bilgileri',
    homeAria: 'Anasayfaya dön',
    categories: 'Kategoriler',
    exploreMenu: 'Menüyü Keşfet',
    categoryUnit: 'Kategori',
    all: 'Tümü',
    backToCategories: 'Kategorilere dön',
    dishesListed: 'lezzet listeleniyor',
    spicy: 'Acılı',
    glutenFree: 'Glutensiz',
    price: 'Fiyat',
    close: 'Kapat',
    defaultDishDesc: 'Özenle hazırlanan The Food Lounge lezzeti.',
    swipe: 'Kaydır →',
    comboSpecialPrice: 'Kombo Özel Fiyatı',
    specialRecTotal: 'Özel Tavsiye Toplam',
    advantage: 'Avantaj',
    steakLabel: 'Özel Soslu Biftek / Steak',
    cocktailLabel: 'İmza Kokteyl',
    featuredOther: 'Öne Çıkarılan Diğer Lezzetler',
    breakfastHighlights: 'Kahvaltı Grubu Öne Çıkanlar',
    worldCuisineHighlights: 'Dünya Mutfağı Öne Çıkanlar',
    eveningCombosHeading: 'Avantajlı Steak & Kokteyl Komboları',
    infoSubtitle: 'İşletme Bilgileri & Çalışma Saatleri',
    officialAddress: 'Resmi Adres',
    workingHours: 'Çalışma Saatleri',
    getDirections: 'Yol Tarifi Al',
    reviewTitle: 'The Food Lounge deneyiminiz nasıldı?',
    reviewSubtitle: "Bizi Google Haritalar'da değerlendirerek destek olabilirsiniz.",
    reviewButton: "Google'da Değerlendir / Yorum Bırak",
    reviewCompactHint: 'Görüşleriniz bizim için değerli',
    digitalMenu: 'Dijital Menü',
    footerHours: 'Çalışma Saatleri',
    vatIncluded: 'Tüm fiyatlara KDV dahildir',
    activeItems: 'Aktif Ürün',
    adminLogin: 'Yönetici Girişi',
    preparingMenu: 'Menü Hazırlanıyor',
    other: 'Diğer',
    days: {
      Pazartesi: 'Pazartesi',
      Salı: 'Salı',
      Çarşamba: 'Çarşamba',
      Perşembe: 'Perşembe',
      Cuma: 'Cuma',
      Cumartesi: 'Cumartesi',
      Pazar: 'Pazar',
    },
  },
  en: {
    open: 'Open',
    closed: 'Closed',
    table: 'Table',
    itemsCount: 'Items',
    info: 'Info',
    infoAria: 'Restaurant Information',
    homeAria: 'Back to Home',
    categories: 'Categories',
    exploreMenu: 'Explore Menu',
    categoryUnit: 'Categories',
    all: 'All',
    backToCategories: 'Back to categories',
    dishesListed: 'items available',
    spicy: 'Spicy',
    glutenFree: 'Gluten-Free',
    price: 'Price',
    close: 'Close',
    defaultDishDesc: 'Freshly prepared signature dish by The Food Lounge.',
    swipe: 'Swipe →',
    comboSpecialPrice: 'Combo Special Price',
    specialRecTotal: 'Signature Pairing Total',
    advantage: 'Save',
    steakLabel: 'Signature Steak / Main',
    cocktailLabel: 'Signature Cocktail',
    featuredOther: 'More Featured Picks',
    breakfastHighlights: 'Breakfast Favorites',
    worldCuisineHighlights: 'World Cuisine Highlights',
    eveningCombosHeading: 'Steak & Cocktail Pairings',
    infoSubtitle: 'Location & Opening Hours',
    officialAddress: 'Official Address',
    workingHours: 'Opening Hours',
    getDirections: 'Get Directions',
    reviewTitle: 'How was your experience at The Food Lounge?',
    reviewSubtitle: 'Support us by leaving a quick review on Google Maps.',
    reviewButton: 'Rate Us / Leave a Google Review',
    reviewCompactHint: 'Your feedback means a lot to us',
    digitalMenu: 'Digital Menu',
    footerHours: 'Opening Hours',
    vatIncluded: 'All prices include VAT',
    activeItems: 'Active Items',
    adminLogin: 'Admin Login',
    preparingMenu: 'Preparing Menu',
    other: 'Other',
    days: {
      Pazartesi: 'Monday',
      Salı: 'Tuesday',
      Çarşamba: 'Wednesday',
      Perşembe: 'Thursday',
      Cuma: 'Friday',
      Cumartesi: 'Saturday',
      Pazar: 'Sunday',
    },
  },
  ar: {
    open: 'مفتوح',
    closed: 'مغلق',
    table: 'طاولة',
    itemsCount: 'صنف',
    info: 'معلومات',
    infoAria: 'معلومات المطعم',
    homeAria: 'العودة للرئيسية',
    categories: 'الأقسام',
    exploreMenu: 'استكشف القائمة',
    categoryUnit: 'أقسام',
    all: 'الكل',
    backToCategories: 'العودة إلى الأقسام',
    dishesListed: 'أطباق متوفرة',
    spicy: 'حار',
    glutenFree: 'خالي من الغلوتين',
    price: 'السعر',
    close: 'إغلاق',
    defaultDishDesc: 'طبق مميز محضر بعناية من ذا فود لاونج.',
    swipe: 'اسحب ←',
    comboSpecialPrice: 'سعر الكومبو الخاص',
    specialRecTotal: 'إجمالي التوصية الخاصة',
    advantage: 'وفر',
    steakLabel: 'ستيك / طبق رئيسي',
    cocktailLabel: 'كوكتيل مميز',
    featuredOther: 'مختارات مميزة أخرى',
    breakfastHighlights: 'أبرز أطباق الإفطار',
    worldCuisineHighlights: 'مختارات المطبخ العالمي',
    eveningCombosHeading: 'تشكيلات الستيك والكوكتيل',
    infoSubtitle: 'العنوان وساعات العمل',
    officialAddress: 'العنوان الرسمي',
    workingHours: 'ساعات العمل',
    getDirections: 'الحصول على الاتجاهات',
    reviewTitle: 'كيف كانت تجربتك في ذا فود لاونج؟',
    reviewSubtitle: 'ادعمنا بترك تقييمك على خرائط جوجل.',
    reviewButton: 'قيّمنا على جوجل / اترك تعليقاً',
    reviewCompactHint: 'رأيك يهمنا كثيراً',
    digitalMenu: 'القائمة الرقمية',
    footerHours: 'ساعات العمل',
    vatIncluded: 'جميع الأسعار تشمل ضريبة القيمة المضافة',
    activeItems: 'أصناف متاحة',
    adminLogin: 'دخول الإدارة',
    preparingMenu: 'جاري تحضير القائمة',
    other: 'أخرى',
    days: {
      Pazartesi: 'الاثنين',
      Salı: 'الثلاثاء',
      Çarşamba: 'الأربعاء',
      Perşembe: 'الخميس',
      Cuma: 'الجمعة',
      Cumartesi: 'السبت',
      Pazar: 'الأحد',
    },
  },
  zh: {
    open: '营业中',
    closed: '已打烊',
    table: '桌号',
    itemsCount: '道菜品',
    info: '信息',
    infoAria: '餐厅信息',
    homeAria: '返回首页',
    categories: '菜品分类',
    exploreMenu: '探索菜单',
    categoryUnit: '个分类',
    all: '全部',
    backToCategories: '返回分类',
    dishesListed: '款精选美味',
    spicy: '微辣',
    glutenFree: '无麸质',
    price: '价格',
    close: '关闭',
    defaultDishDesc: 'The Food Lounge 精心烹制的招牌风味。',
    swipe: '滑动 →',
    comboSpecialPrice: '套餐特惠价',
    specialRecTotal: '主厨推荐组合价',
    advantage: '立省',
    steakLabel: '招牌牛排 / 主菜',
    cocktailLabel: '招牌鸡尾酒',
    featuredOther: '更多精选推荐',
    breakfastHighlights: '精选早餐推荐',
    worldCuisineHighlights: '环球美食精选',
    eveningCombosHeading: '牛排与鸡尾酒臻选搭配',
    infoSubtitle: '餐厅地址与营业时间',
    officialAddress: '官方地址',
    workingHours: '营业时间',
    getDirections: '获取路线',
    reviewTitle: '您在 The Food Lounge 的用餐体验如何？',
    reviewSubtitle: '欢迎在 Google 地图上为我们留下宝贵评价。',
    reviewButton: '在 Google 上评分 / 写评价',
    reviewCompactHint: '非常感谢您的反馈',
    digitalMenu: '电子菜单',
    footerHours: '营业时间',
    vatIncluded: '所有价格均含增值税',
    activeItems: '款在售菜品',
    adminLogin: '管理员登录',
    preparingMenu: '正在准备菜单',
    other: '其他',
    days: {
      Pazartesi: '星期一',
      Salı: '星期二',
      Çarşamba: '星期三',
      Perşembe: '星期四',
      Cuma: '星期五',
      Cumartesi: '星期六',
      Pazar: '星期日',
    },
  },
  ru: {
    open: 'Открыто',
    closed: 'Закрыто',
    table: 'Стол',
    itemsCount: 'блюд',
    info: 'Инфо',
    infoAria: 'Информация о ресторане',
    homeAria: 'На главную',
    categories: 'Категории',
    exploreMenu: 'Смотреть меню',
    categoryUnit: 'категорий',
    all: 'Все',
    backToCategories: 'Назад к категориям',
    dishesListed: 'позиций в меню',
    spicy: 'Острое',
    glutenFree: 'Без глютена',
    price: 'Цена',
    close: 'Закрыть',
    defaultDishDesc: 'Фирменное блюдо от шеф-повара The Food Lounge.',
    swipe: 'Листайте →',
    comboSpecialPrice: 'Спеццена комбо',
    specialRecTotal: 'Итого за сочетание',
    advantage: 'Выгода',
    steakLabel: 'Фирменный стейк / Основное',
    cocktailLabel: 'Авторский коктейль',
    featuredOther: 'Другие рекомендации дня',
    breakfastHighlights: 'Хиты завтраков',
    worldCuisineHighlights: 'Блюда мировой кухни',
    eveningCombosHeading: 'Сочетания стейков и коктейлей',
    infoSubtitle: 'Адрес и часы работы',
    officialAddress: 'Официальный адрес',
    workingHours: 'Часы работы',
    getDirections: 'Построить маршрут',
    reviewTitle: 'Как вам визит в The Food Lounge?',
    reviewSubtitle: 'Поддержите нас, оставив отзыв на Google Картах.',
    reviewButton: 'Оценить / Оставить отзыв в Google',
    reviewCompactHint: 'Нам очень важно ваше мнение',
    digitalMenu: 'Цифровое меню',
    footerHours: 'Часы работы',
    vatIncluded: 'Все цены указаны с учётом НДС',
    activeItems: 'позиций',
    adminLogin: 'Вход для админа',
    preparingMenu: 'Подготовка меню',
    other: 'Другое',
    days: {
      Pazartesi: 'Понедельник',
      Salı: 'Вторник',
      Çarşamba: 'Среда',
      Perşembe: 'Четверг',
      Cuma: 'Пятница',
      Cumartesi: 'Суббота',
      Pazar: 'Воскресенье',
    },
  },
};

export function getLocalizedCategoryName(cat, lang, localeData = null) {
  if (!cat) return '';
  if (lang === 'tr') return cat.name;
  if (lang === 'en') return cat.nameEn || cat.name;
  return localeData?.categories?.[cat.id] || cat.nameEn || cat.name;
}

export function getLocalizedItemTitle(item, lang, localeData = null) {
  if (!item) return '';
  if (lang === 'tr') return item.title;
  if (lang === 'en') return item.titleEn || item.title;
  return localeData?.items?.[item.id]?.title || item.titleEn || item.title;
}

export function getLocalizedItemDesc(item, lang, localeData = null) {
  if (!item) return '';
  if (lang === 'tr') return item.description || '';
  if (lang === 'en') return item.descriptionEn ?? item.description ?? '';
  const locDesc = localeData?.items?.[item.id]?.description;
  if (locDesc !== undefined && locDesc !== '') return locDesc;
  return item.descriptionEn ?? item.description ?? '';
}

export function getLocalizedItemCategory(item, lang, localeData = null) {
  if (!item) return '';
  if (lang === 'tr') return item.category;
  if (lang === 'en') return item.categoryEn || item.category;
  return localeData?.categories?.[item.categoryId] || item.categoryEn || item.category;
}

export function getLocalizedItemSubcategory(item, lang, localeData = null) {
  if (!item || !item.subcategory) return null;
  if (lang === 'tr') return item.subcategory;
  if (lang === 'en') return item.subcategoryEn || item.subcategory;
  return (
    localeData?.subcategories?.[item.subcategory] ||
    item.subcategoryEn ||
    item.subcategory
  );
}

export function getLocalizedSubcategoryLabel(category, subKey, lang, localeData = null) {
  if (!subKey) return '';
  if (lang === 'tr') return subKey;
  if (lang === 'en') return category?.subcategoryLabelsEn?.[subKey] || subKey;
  return (
    localeData?.subcategories?.[subKey] ||
    category?.subcategoryLabelsEn?.[subKey] ||
    subKey
  );
}

const LanguageContext = createContext(null);

function readInitialLanguage() {
  if (typeof window === 'undefined') return 'tr';
  try {
    const saved = window.localStorage.getItem(LANG_STORAGE_KEY);
    if (saved && VALID_CODES.has(saved)) return saved;
  } catch {
    // ignore storage errors
  }
  return 'tr';
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => readInitialLanguage());
  const [localeData, setLocaleData] = useState(null);
  const [localeReady, setLocaleReady] = useState(
    () => lang === 'tr' || lang === 'en'
  );

  useEffect(() => {
    const langMeta =
      SUPPORTED_LANGUAGES.find((l) => l.code === lang) || SUPPORTED_LANGUAGES[0];
    document.documentElement.lang = lang;
    document.documentElement.dir = langMeta.dir;

    try {
      window.localStorage.setItem(LANG_STORAGE_KEY, lang);
    } catch {
      // ignore storage errors
    }

    if (lang === 'tr' || lang === 'en') {
      setLocaleData(null);
      setLocaleReady(true);
      return;
    }

    let active = true;
    if (localeCache.has(lang)) {
      setLocaleData(localeCache.get(lang));
      setLocaleReady(true);
      return;
    }

    setLocaleReady(false);
    loadLocalePack(lang)
      .then((pack) => {
        if (active) {
          setLocaleData(pack);
          setLocaleReady(true);
        }
      })
      .catch(() => {
        if (active) {
          setLocaleData(null);
          setLocaleReady(true);
        }
      });

    return () => {
      active = false;
    };
  }, [lang]);

  const setLang = useCallback((nextLang) => {
    if (VALID_CODES.has(nextLang)) {
      setLangState(nextLang);
    }
  }, []);

  const value = useMemo(
    () => ({
      lang,
      isRtl: lang === 'ar',
      setLang,
      localeData,
      localeReady,
      strings: UI_STRINGS[lang] || UI_STRINGS.tr,
    }),
    [lang, setLang, localeData, localeReady]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used inside LanguageProvider');
  return ctx;
}
