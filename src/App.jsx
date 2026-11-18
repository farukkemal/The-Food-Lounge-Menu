import { Suspense, lazy, useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Utensils, Shield } from 'lucide-react';
import { useMenu } from './context/MenuContext';
import {
  getLocalizedCategoryName,
  getLocalizedSubcategoryLabel,
  useLanguage,
} from './context/LanguageContext';
import { clearStoredAuth, readStoredAuth } from './services/menuRepository';
import Header from './components/Header';
import CategoryNav from './components/CategoryNav';
import SmartRecommendations from './components/SmartRecommendations';
import CategoryShowcase from './components/CategoryShowcase';
import ProductCard from './components/ProductCard';
import ProductModal from './components/ProductModal';
import InfoModal from './components/InfoModal';
import SplashScreen from './components/SplashScreen';
import GoogleReviewButton from './components/GoogleReviewButton';

// Code-split Admin bundle so QR customers never download admin/qrcode JS
const AdminLogin = lazy(() => import('./components/admin/AdminLogin'));
const AdminDashboard = lazy(() => import('./components/admin/AdminDashboard'));

function getTableParamFromUrl() {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const val = params.get('table');
  return val && val.trim() ? val.trim().slice(0, 12) : null;
}

function AdminLoadingFallback() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-[#F6F5F1] text-xs font-semibold text-[#7A746C]">
      Yönetim paneli yükleniyor...
    </div>
  );
}

const BASE_PATH = (import.meta.env.BASE_URL || '/').replace(/\/+$/, '');

function isAdminLocation() {
  if (typeof window === 'undefined') return false;
  const p = window.location.pathname.replace(/\/+$/, '');
  return (
    p === '/admin' ||
    p === `${BASE_PATH}/admin` ||
    p.endsWith('/admin') ||
    window.location.hash.startsWith('#/admin')
  );
}

function CustomerMenuView({ onOpenAdmin }) {
  const { index } = useMenu();
  const { lang, localeData, strings } = useLanguage();
  const restaurant = index.restaurant;
  const stats = index.stats;
  const categories = index.activeCategories;
  const tableNumber = useMemo(() => getTableParamFromUrl(), []);

  const [activeCategoryId, setActiveCategoryId] = useState('all');
  const [activeSubcategory, setActiveSubcategory] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [infoOpen, setInfoOpen] = useState(false);

  const activeCategory = useMemo(
    () => (activeCategoryId === 'all' ? null : index.getCategoryById(activeCategoryId)),
    [activeCategoryId, index]
  );

  useEffect(() => {
    if (activeCategoryId !== 'all' && !activeCategory) {
      setActiveCategoryId('all');
      setActiveSubcategory(null);
    }
  }, [activeCategoryId, activeCategory]);

  const handleSelectCategory = useCallback((categoryId, subcategory = null) => {
    setActiveCategoryId(categoryId);
    setActiveSubcategory(subcategory);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleGoHome = useCallback(() => {
    setActiveCategoryId('all');
    setActiveSubcategory(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const displayedItems = useMemo(() => {
    if (activeCategoryId === 'all') {
      return [];
    }
    return index.getItemsByCategory(activeCategoryId, activeSubcategory);
  }, [index, activeCategoryId, activeSubcategory]);

  const activeSubcategoriesForCategory = useMemo(() => {
    if (!activeCategory) return [];
    const allInCat = index.getItemsByCategory(activeCategory.id);
    const available = new Set(allInCat.map((i) => i.subcategory).filter(Boolean));
    return (activeCategory.subcategories || []).filter((s) => available.has(s));
  }, [activeCategory, index]);

  const groupedSubcategories = useMemo(() => {
    if (
      !activeCategory ||
      activeSubcategoriesForCategory.length === 0 ||
      activeSubcategory
    ) {
      return null;
    }

    const groups = new Map();
    for (const item of displayedItems) {
      const key = item.subcategory || '__other__';
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(item);
    }
    return Array.from(groups.entries());
  }, [activeCategory, activeSubcategoriesForCategory, activeSubcategory, displayedItems]);

  const isCategoryView = activeCategoryId !== 'all';

  return (
    <div
      className={`min-h-dvh text-[#181716] transition-colors duration-200 ${
        isCategoryView ? 'bg-[#FBECEF]' : 'bg-[#F8F7F4]'
      }`}
    >
      <div className="sticky top-0 z-30 shadow-[0_1px_8px_rgba(24,23,22,0.04)]">
        <Header
          restaurantName={restaurant.name}
          hoursLabel={restaurant.hoursLabel}
          tableNumber={tableNumber}
          onOpenInfo={() => setInfoOpen(true)}
          onGoHome={handleGoHome}
          totalItems={stats.activeItems}
        />

        <CategoryNav
          categories={categories}
          activeCategoryId={activeCategoryId}
          onSelectCategory={handleSelectCategory}
        />
      </div>

      <main className="mx-auto max-w-2xl pb-12">
        {activeCategoryId === 'all' ? (
          <>
            <SmartRecommendations
              onSelectItem={setSelectedItem}
              onNavigateCategory={handleSelectCategory}
            />
            <CategoryShowcase
              categories={categories}
              onSelectCategory={handleSelectCategory}
            />
          </>
        ) : (
          <section className="px-4 pt-4">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2.5">
                <button
                  type="button"
                  onClick={handleGoHome}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#E5E1D9] bg-white text-[#272626] transition-colors hover:bg-[#F3F1EC] active:scale-95"
                  aria-label={strings.backToCategories}
                >
                  <ArrowLeft size={16} />
                </button>
                <div className="min-w-0">
                  <h2
                    className="truncate text-2xl leading-tight font-bold text-[#181716]"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {getLocalizedCategoryName(activeCategory, lang, localeData)}
                  </h2>
                  <p className="text-xs font-medium text-[#7C766E]">
                    {displayedItems.length} {strings.dishesListed}
                  </p>
                </div>
              </div>
            </div>

            {activeSubcategoriesForCategory.length > 0 && (
              <div className="no-scrollbar touch-scroll-free -mx-4 mb-4 flex items-center gap-2 overflow-x-auto px-4 pb-1">
                <button
                  type="button"
                  onClick={() => setActiveSubcategory(null)}
                  className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-semibold transition-transform active:scale-95 ${
                    activeSubcategory === null
                      ? 'bg-[#181716] text-white'
                      : 'border border-[#E5E1D9] bg-white text-[#524E48]'
                  }`}
                >
                  {strings.all} ({activeCategory?.itemCount})
                </button>
                {activeSubcategoriesForCategory.map((sub) => (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => setActiveSubcategory(sub)}
                    className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-semibold transition-transform active:scale-95 ${
                      activeSubcategory === sub
                        ? 'bg-[#CA2F2D] text-white'
                        : 'border border-[#E5E1D9] bg-white text-[#524E48]'
                    }`}
                  >
                    {getLocalizedSubcategoryLabel(activeCategory, sub, lang, localeData)}
                  </button>
                ))}
              </div>
            )}

            {groupedSubcategories ? (
              <div className="gpu-list space-y-6">
                {groupedSubcategories.map(([subKey, subItems], groupIdx) => (
                  <div key={subKey}>
                    <div className="mb-2.5 flex items-center justify-between border-b border-[#E8E4DC] pb-1.5">
                      <h3 className="text-xs font-bold tracking-[0.12em] text-[#CA2F2D] uppercase">
                        {subKey === '__other__'
                          ? strings.other
                          : getLocalizedSubcategoryLabel(activeCategory, subKey, lang, localeData)}
                      </h3>
                      <span className="text-[11px] font-medium text-[#8E8880]">
                        {subItems.length}
                      </span>
                    </div>
                    <div className="flex flex-col gap-2.5">
                      {subItems.map((item, idx) => (
                        <ProductCard
                          key={item.id}
                          item={item}
                          priority={groupIdx === 0 && idx < 4}
                          onSelect={setSelectedItem}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="gpu-list flex flex-col gap-2.5">
                {displayedItems.map((item, idx) => (
                  <ProductCard
                    key={item.id}
                    item={item}
                    priority={idx < 4}
                    onSelect={setSelectedItem}
                  />
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      <footer className="border-t border-[#EBE8E2] bg-white py-7 text-center text-xs text-[#8A837A]">
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-3 px-4">
          <GoogleReviewButton href={restaurant.googleReviewUrl} variant="card" />

          <div className="mt-1 inline-flex items-center gap-1.5 font-semibold text-[#4A4641]">
            <Utensils size={13} className="text-[#CA2F2D]" />
            <span>
              {restaurant.name} {strings.digitalMenu}
            </span>
          </div>
          {restaurant.address && (
            <p className="max-w-md text-[11px] leading-relaxed text-[#7A746C]">
              {restaurant.address}
            </p>
          )}
          <p className="text-[11px]">
            {strings.footerHours}: {restaurant.hoursLabel || '08:00 – 24:00'} •{' '}
            {strings.vatIncluded} • {categories.length} {strings.categoryUnit},{' '}
            {stats.activeItems} {strings.activeItems}
          </p>
          <button
            type="button"
            onClick={onOpenAdmin}
            className="mt-1 inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-medium text-[#9A938A] transition-colors hover:bg-[#EFECE6] hover:text-[#181716]"
          >
            <Shield size={11} />
            {strings.adminLogin}
          </button>
        </div>
      </footer>

      <ProductModal item={selectedItem} onClose={() => setSelectedItem(null)} />
      <InfoModal open={infoOpen} restaurant={restaurant} onClose={() => setInfoOpen(false)} />
    </div>
  );
}

export default function App() {
  const { isReady } = useMenu();
  const [isAdminRoute, setIsAdminRoute] = useState(() => isAdminLocation());
  const [showSplash] = useState(() => !isAdminLocation());
  const [auth, setAuth] = useState(() => readStoredAuth());

  useEffect(() => {
    const handleNav = () => setIsAdminRoute(isAdminLocation());
    window.addEventListener('popstate', handleNav);
    window.addEventListener('hashchange', handleNav);
    return () => {
      window.removeEventListener('popstate', handleNav);
      window.removeEventListener('hashchange', handleNav);
    };
  }, []);

  const navigate = useCallback((path) => {
    const targetUrl =
      path === '/admin'
        ? `${BASE_PATH}/admin`
        : `${BASE_PATH || ''}/`;
    window.history.pushState({}, '', targetUrl);
    setIsAdminRoute(path === '/admin');
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const handleLogout = useCallback(() => {
    clearStoredAuth();
    setAuth(null);
  }, []);

  if (isAdminRoute) {
    return (
      <Suspense fallback={<AdminLoadingFallback />}>
        {!auth ? (
          <AdminLogin
            onSuccess={setAuth}
            onBackToMenu={() => navigate('/')}
          />
        ) : (
          <AdminDashboard
            user={auth.user}
            onLogout={handleLogout}
            onOpenMenu={() => navigate('/')}
          />
        )}
      </Suspense>
    );
  }

  return (
    <>
      {showSplash && <SplashScreen isReady={isReady} />}
      <CustomerMenuView onOpenAdmin={() => navigate('/admin')} />
    </>
  );
}
