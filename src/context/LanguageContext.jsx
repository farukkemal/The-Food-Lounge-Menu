import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

const LANG_STORAGE_KEY = 'tfl_lang_v1';

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
};

export function getLocalizedCategoryName(cat, lang) {
  if (!cat) return '';
  return lang === 'en' ? cat.nameEn || cat.name : cat.name;
}

export function getLocalizedItemTitle(item, lang) {
  if (!item) return '';
  return lang === 'en' ? item.titleEn || item.title : item.title;
}

export function getLocalizedItemDesc(item, lang) {
  if (!item) return '';
  return lang === 'en'
    ? item.descriptionEn ?? item.description ?? ''
    : item.description || '';
}

export function getLocalizedItemCategory(item, lang) {
  if (!item) return '';
  return lang === 'en' ? item.categoryEn || item.category : item.category;
}

export function getLocalizedItemSubcategory(item, lang) {
  if (!item || !item.subcategory) return null;
  return lang === 'en'
    ? item.subcategoryEn || item.subcategory
    : item.subcategory;
}

export function getLocalizedSubcategoryLabel(category, subKey, lang) {
  if (!subKey) return '';
  if (lang === 'en') {
    return category?.subcategoryLabelsEn?.[subKey] || subKey;
  }
  return subKey;
}

const LanguageContext = createContext(null);

function readInitialLanguage() {
  if (typeof window === 'undefined') return 'tr';
  try {
    const saved = window.localStorage.getItem(LANG_STORAGE_KEY);
    if (saved === 'en' || saved === 'tr') return saved;
  } catch {
    // ignore storage errors
  }
  return 'tr';
}

export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(() => readInitialLanguage());

  useEffect(() => {
    document.documentElement.lang = lang;
    try {
      window.localStorage.setItem(LANG_STORAGE_KEY, lang);
    } catch {
      // ignore storage errors
    }
  }, [lang]);

  const setLang = useCallback((nextLang) => {
    if (nextLang === 'tr' || nextLang === 'en') {
      setLangState(nextLang);
    }
  }, []);

  const value = useMemo(
    () => ({
      lang,
      isEn: lang === 'en',
      setLang,
      strings: UI_STRINGS[lang] || UI_STRINGS.tr,
    }),
    [lang, setLang]
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
