import { Suspense, lazy, useCallback, useDeferredValue, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, SearchX, Utensils, Shield } from 'lucide-react';
import { useMenu } from './context/MenuContext';
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

function isAdminLocation() {
  if (typeof window === 'undefined') return false;
  const p = window.location.pathname.replace(/\/+$/, '');
  return p === '/admin' || window.location.hash.startsWith('#/admin');
}

function CustomerMenuView({ onOpenAdmin }) {
  const { index } = useMenu();
  const restaurant = index.restaurant;
  const stats = index.stats;
  const categories = index.activeCategories;
  const tableNumber = useMemo(() => getTableParamFromUrl(), []);

  const [activeCategoryId, setActiveCategoryId] = useState('all');
  const [activeSubcategory, setActiveSubcategory] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [infoOpen, setInfoOpen] = useState(false);

  const deferredSearch = useDeferredValue(searchQuery);
  const isSearching = deferredSearch.trim().length > 0;

  const activeCategory = useMemo(
    () => (activeCategoryId === 'all' ? null : index.getCategoryById(activeCategoryId)),
    [activeCategoryId, index]
  );

  // If an admin hides/deletes the currently viewed category, return cleanly to home
  useEffect(() => {
    if (activeCategoryId !== 'all' && !activeCategory) {
      setActiveCategoryId('all');
      setActiveSubcategory(null);
    }
  }, [activeCategoryId, activeCategory]);

  const handleSelectCategory = useCallback((categoryId, subcategory = null) => {
    setActiveCategoryId(categoryId);
    setActiveSubcategory(subcategory);
    setSearchQuery('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleGoHome = useCallback(() => {
    setActiveCategoryId('all');
    setActiveSubcategory(null);
    setSearchQuery('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
  }, []);

  const displayedItems = useMemo(() => {
    if (isSearching) {
      return index.searchItems(deferredSearch);
    }
    if (activeCategoryId === 'all') {
      return [];
    }
    return index.getItemsByCategory(activeCategoryId, activeSubcategory);
  }, [index, isSearching, deferredSearch, activeCategoryId, activeSubcategory]);

  const activeSubcategoriesForCategory = useMemo(() => {
    if (!activeCategory) return [];
    const allInCat = index.getItemsByCategory(activeCategory.id);
    const available = new Set(allInCat.map((i) => i.subcategory).filter(Boolean));
    return (activeCategory.subcategories || []).filter((s) => available.has(s));
  }, [activeCategory, index]);

  const groupedSubcategories = useMemo(() => {
    if (
      isSearching ||
      !activeCategory ||
      activeSubcategoriesForCategory.length === 0 ||
      activeSubcategory
    ) {
      return null;
    }

    const groups = new Map();
    for (const item of displayedItems) {
      const key = item.subcategory || 'Diğer';
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key).push(item);
    }
    return Array.from(groups.entries());
  }, [isSearching, activeCategory, activeSubcategoriesForCategory, activeSubcategory, displayedItems]);

  return (
    <div className="min-h-dvh bg-[#F8F7F4] text-[#181716]">
      <div className="sticky top-0 z-30 shadow-[0_1px_8px_rgba(24,23,22,0.04)]">
        <Header
          restaurantName={restaurant.name}
          hoursLabel={restaurant.hoursLabel}
          tableNumber={tableNumber}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onClearSearch={handleClearSearch}
          onOpenInfo={() => setInfoOpen(true)}
          onGoHome={handleGoHome}
          totalItems={stats.activeItems}
        />

        <CategoryNav
          categories={categories}
          activeCategoryId={isSearching ? null : activeCategoryId}
          onSelectCategory={handleSelectCategory}
        />
      </div>

      <main className="mx-auto max-w-2xl pb-12">
        {isSearching ? (
          <section className="px-4 pt-4">
            <div className="mb-3.5 flex items-center justify-between">
              <h2 className="text-sm font-bold text-[#181716]">
                Arama Sonuçları
                <span className="ml-2 rounded-full bg-[#EFECE6] px-2 py-0.5 text-xs font-semibold text-[#5E5850]">
                  {displayedItems.length}
                </span>
              </h2>
              <button
                type="button"
                onClick={handleClearSearch}
                className="text-xs font-semibold text-[#CA2F2D]"
              >
                Temizle
              </button>
            </div>

            {displayedItems.length === 0 ? (
              <div className="mt-10 flex flex-col items-center justify-center rounded-3xl border border-dashed border-[#DFDAD1] bg-white/70 px-6 py-12 text-center">
                <SearchX size={34} className="text-[#B5AEA4]" strokeWidth={1.6} />
                <p className="mt-3 text-sm font-semibold text-[#3A3733]">
                  &ldquo;{deferredSearch}&rdquo; için sonuç bulunamadı
                </p>
                <p className="mt-1 text-xs text-[#8A837A]">
                  Farklı bir ürün adı veya kategori kelimesi deneyebilirsiniz.
                </p>
              </div>
            ) : (
              <div className="gpu-list flex flex-col gap-2.5">
                {displayedItems.map((item, idx) => (
                  <ProductCard
                    key={item.id}
                    item={item}
                    priority={idx < 4}
                    onSelect={setSelectedItem}
                    showCategoryBadge
                  />
                ))}
              </div>
            )}
          </section>
        ) : activeCategoryId === 'all' ? (
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
                  aria-label="Kategorilere dön"
                >
                  <ArrowLeft size={16} />
                </button>
                <div className="min-w-0">
                  <h2
                    className="truncate text-2xl leading-tight font-bold text-[#181716]"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {activeCategory?.name}
                  </h2>
                  <p className="text-xs font-medium text-[#7C766E]">
                    {displayedItems.length} lezzet listeleniyor
                  </p>
                </div>
              </div>
            </div>

            {activeSubcategoriesForCategory.length > 0 && (
              <div className="no-scrollbar touch-scroll-free -mx-4 mb-4 flex items-center gap-2 overflow-x-auto px-4 pb-1">
                <button
                  type="button"
                  onClick={() => setActiveSubcategory(null)}
                  className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                    activeSubcategory === null
                      ? 'bg-[#181716] text-white'
                      : 'border border-[#E5E1D9] bg-white text-[#524E48]'
                  }`}
                >
                  Tümü ({activeCategory?.itemCount})
                </button>
                {activeSubcategoriesForCategory.map((sub) => (
                  <button
                    key={sub}
                    type="button"
                    onClick={() => setActiveSubcategory(sub)}
                    className={`shrink-0 rounded-xl px-3 py-1.5 text-xs font-semibold transition-all ${
                      activeSubcategory === sub
                        ? 'bg-[#CA2F2D] text-white'
                        : 'border border-[#E5E1D9] bg-white text-[#524E48]'
                    }`}
                  >
                    {sub}
                  </button>
                ))}
              </div>
            )}

            {groupedSubcategories ? (
              <div className="gpu-list space-y-6">
                {groupedSubcategories.map(([subName, subItems], groupIdx) => (
                  <div key={subName}>
                    <div className="mb-2.5 flex items-center justify-between border-b border-[#E8E4DC] pb-1.5">
                      <h3 className="text-xs font-bold tracking-[0.12em] text-[#CA2F2D] uppercase">
                        {subName}
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
            <span>{restaurant.name} Dijital Menü</span>
          </div>
          {restaurant.address && (
            <p className="max-w-md text-[11px] leading-relaxed text-[#7A746C]">
              {restaurant.address}
            </p>
          )}
          <p className="text-[11px]">
            Çalışma Saatleri: {restaurant.hoursLabel || '08:00 – 24:00'} • Tüm fiyatlara KDV dahildir • {categories.length} Kategori, {stats.activeItems} Aktif Ürün
          </p>
          <button
            type="button"
            onClick={onOpenAdmin}
            className="mt-1 inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-[11px] font-medium text-[#9A938A] transition-colors hover:bg-[#EFECE6] hover:text-[#181716]"
          >
            <Shield size={11} />
            Yönetici Girişi
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
    window.history.pushState({}, '', path);
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
