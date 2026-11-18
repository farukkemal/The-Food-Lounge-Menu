import {
  memo,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  Plus,
  Search,
  LogOut,
  ExternalLink,
  Pencil,
  Trash2,
  Package,
  Layers,
  CheckCircle2,
  X,
  HardDrive,
  QrCode,
  Star,
} from 'lucide-react';
import logoImg from '../../assets/logo.webp';
import { useMenu } from '../../context/MenuContext';
import LazyImage from '../LazyImage';
import ProductFormModal from './ProductFormModal';
import CategoryManager from './CategoryManager';
import QrCodeGenerator from './QrCodeGenerator';

const PAGE_SIZE = 40;

const ToggleSwitch = memo(function ToggleSwitch({
  checked,
  onChange,
  label,
  activeColorClass = 'bg-emerald-500',
  ariaLabel,
  icon = null,
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel || label}
      onClick={onChange}
      className="inline-flex items-center gap-1.5 rounded-xl border border-[#EAE6DF] bg-[#FAF9F6] px-2.5 py-1.5 text-[11px] font-semibold text-[#3F3B36] transition-transform duration-150 hover:border-[#D8D3CA] active:scale-[0.97]"
    >
      {icon}
      <span>{label}</span>
      <span
        className={`relative ml-0.5 inline-flex h-4.5 w-8 shrink-0 items-center rounded-full transition-colors duration-150 ${
          checked ? activeColorClass : 'bg-[#D6D1C8]'
        }`}
      >
        <span
          className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow-xs transition-transform duration-150 ${
            checked ? 'translate-x-4' : 'translate-x-0.5'
          }`}
        />
      </span>
    </button>
  );
});

const AdminProductRow = memo(function AdminProductRow({
  item,
  onInlineSaveTitle,
  onInlineSavePrice,
  onToggleActive,
  onToggleFeatured,
  onEdit,
  onDelete,
}) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState(item.title);
  const titleInputRef = useRef(null);

  const [editingPrice, setEditingPrice] = useState(false);
  const [priceDraft, setPriceDraft] = useState(
    item.price !== null && item.price !== undefined ? String(item.price) : ''
  );
  const priceInputRef = useRef(null);

  useEffect(() => {
    setTitleDraft(item.title);
  }, [item.title]);

  useEffect(() => {
    setPriceDraft(
      item.price !== null && item.price !== undefined ? String(item.price) : ''
    );
  }, [item.price]);

  useEffect(() => {
    if (editingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [editingTitle]);

  useEffect(() => {
    if (editingPrice && priceInputRef.current) {
      priceInputRef.current.focus();
      priceInputRef.current.select();
    }
  }, [editingPrice]);

  const commitTitle = () => {
    setEditingTitle(false);
    const cleaned = titleDraft.trim();
    if (!cleaned || cleaned === item.title) {
      setTitleDraft(item.title);
      return;
    }
    onInlineSaveTitle(item.id, cleaned);
  };

  const commitPrice = () => {
    setEditingPrice(false);
    const parsed = Number.parseFloat(String(priceDraft).replace(',', '.'));
    if (Number.isNaN(parsed) || parsed < 0 || parsed === item.price) {
      setPriceDraft(
        item.price !== null && item.price !== undefined ? String(item.price) : ''
      );
      return;
    }
    onInlineSavePrice(item.id, parsed, item.title);
  };

  const isActive = item.active !== false;
  const isFeatured = Boolean(item.featured);

  return (
    <div
      className={`gpu-card cv-auto-card flex flex-col gap-3 rounded-2xl border bg-white p-3.5 transition-colors sm:flex-row sm:items-center sm:justify-between ${
        !isActive
          ? 'border-dashed border-[#D8D3CA] bg-[#FAF9F7] opacity-75'
          : isFeatured
            ? 'border-amber-300/90 bg-amber-50/20'
            : 'border-[#EAE6DF]'
      }`}
    >
      {/* Left: Thumbnail + Click-to-Edit Title & Category */}
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <LazyImage
          src={item.image}
          alt={item.title}
          width={52}
          height={52}
          sizes="52px"
          containerClassName="aspect-square h-13 w-13 shrink-0 rounded-xl ring-1 ring-black/5"
          fallbackIconSize={18}
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="rounded-md bg-[#F3F1EC] px-2 py-0.5 text-[10px] font-semibold text-[#666057]">
              {item.category}
            </span>
            {item.subcategory && (
              <span className="rounded-md bg-[#CA2F2D]/10 px-2 py-0.5 text-[10px] font-semibold text-[#CA2F2D]">
                {item.subcategory}
              </span>
            )}
            {isFeatured && (
              <span className="inline-flex items-center gap-0.5 rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                <Star size={10} className="fill-amber-500 text-amber-500" />
                Öne Çıkan
              </span>
            )}
            {!isActive && (
              <span className="rounded-md bg-stone-200 px-2 py-0.5 text-[10px] font-bold text-stone-700">
                Pasif
              </span>
            )}
          </div>

          {/* Click-to-Edit Inline Product Name */}
          <div className="mt-1">
            {editingTitle ? (
              <input
                ref={titleInputRef}
                type="text"
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                onBlur={commitTitle}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    commitTitle();
                  } else if (e.key === 'Escape') {
                    setTitleDraft(item.title);
                    setEditingTitle(false);
                  }
                }}
                aria-label="Ürün adını düzenle"
                className="h-8 w-full rounded-lg border border-[#CA2F2D] bg-white px-2.5 text-sm font-bold text-[#181716] ring-2 ring-[#CA2F2D]/15 focus:outline-none"
              />
            ) : (
              <button
                type="button"
                onClick={() => setEditingTitle(true)}
                title="Adı değiştirmek için tıklayın"
                className="group/title flex max-w-full items-center gap-1.5 rounded-md text-left hover:text-[#CA2F2D] focus:outline-none"
              >
                <span className="truncate text-sm font-bold text-[#181716] group-hover/title:text-[#CA2F2D] group-hover/title:underline group-hover/title:decoration-dashed group-hover/title:underline-offset-4">
                  {item.title}
                </span>
              </button>
            )}
          </div>

          {item.description && (
            <p className="mt-0.5 line-clamp-1 text-xs text-[#7C766E]">
              {item.description}
            </p>
          )}
        </div>
      </div>

      {/* Right: Click-to-Edit Inline Price + One-Click Switches + Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#F2EFEA] pt-2.5 sm:justify-end sm:border-t-0 sm:pt-0">
        {/* Click-to-Edit Inline Price */}
        {editingPrice ? (
          <div className="relative">
            <input
              ref={priceInputRef}
              type="number"
              step="0.01"
              min="0"
              value={priceDraft}
              onChange={(e) => setPriceDraft(e.target.value)}
              onBlur={commitPrice}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  commitPrice();
                } else if (e.key === 'Escape') {
                  setPriceDraft(
                    item.price !== null && item.price !== undefined
                      ? String(item.price)
                      : ''
                  );
                  setEditingPrice(false);
                }
              }}
              aria-label={`${item.title} fiyatını düzenle`}
              className="h-9 w-26 rounded-xl border border-[#CA2F2D] bg-white pr-6 pl-2.5 text-right text-sm font-extrabold text-[#CA2F2D] ring-2 ring-[#CA2F2D]/15 focus:outline-none"
            />
            <span className="pointer-events-none absolute top-1/2 right-2.5 -translate-y-1/2 text-xs font-bold text-[#8C857C]">
              ₺
            </span>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setEditingPrice(true)}
            title="Fiyatı hızlıca değiştirmek için tıklayın"
            className="inline-flex h-9 min-w-[84px] items-center justify-center rounded-xl border border-[#E7E3DC] bg-[#FAF9F6] px-3 text-sm font-extrabold tracking-tight text-[#CA2F2D] transition-colors hover:border-[#CA2F2D] hover:bg-white active:scale-[0.97]"
          >
            {item.priceFormatted || '—'}
          </button>
        )}

        {/* Side-by-Side One-Click Switches */}
        <div className="flex flex-wrap items-center gap-1.5">
          <ToggleSwitch
            checked={isFeatured}
            onChange={() => onToggleFeatured(item)}
            label="Öne Çıkar"
            activeColorClass="bg-amber-500"
            ariaLabel={`${item.title} öne çıkar`}
            icon={
              <Star
                size={12}
                className={
                  isFeatured
                    ? 'fill-amber-500 text-amber-500'
                    : 'text-[#9A938A]'
                }
              />
            }
          />

          <ToggleSwitch
            checked={isActive}
            onChange={() => onToggleActive(item)}
            label="Aktif"
            activeColorClass="bg-emerald-500"
            ariaLabel={`${item.title} aktiflik durumu`}
          />

          <button
            type="button"
            onClick={() => onEdit(item)}
            title="Detaylı düzenle (açıklama, görsel, kategori)"
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#E7E3DC] bg-white text-[#4A4641] transition-colors hover:border-[#181716] hover:text-[#181716] active:scale-95"
            aria-label="Ürünü detaylı düzenle"
          >
            <Pencil size={14} />
          </button>

          <button
            type="button"
            onClick={() => onDelete(item)}
            title="Ürünü sil"
            className="flex h-8 w-8 items-center justify-center rounded-xl border border-[#E7E3DC] bg-white text-[#8C857C] transition-colors hover:border-red-200 hover:bg-red-50 hover:text-[#CA2F2D] active:scale-95"
            aria-label="Ürünü sil"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
});

export default function AdminDashboard({ user, onLogout, onOpenMenu }) {
  const {
    index,
    saving,
    lastSavedAt,
    persistenceMode,
    updateItem,
    addItem,
    deleteItem,
    toggleItemActive,
    toggleItemFeatured,
    addCategory,
    updateCategory,
    deleteCategory,
  } = useMenu();

  const [activeTab, setActiveTab] = useState('products'); // 'products' | 'categories' | 'qr'
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'featured' | 'active' | 'passive'
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [toast, setToast] = useState(null);

  const searchInputRef = useRef(null);
  const deferredQuery = useDeferredValue(searchQuery);

  const showToast = useCallback((detail = '', type = 'success') => {
    setToast({
      id: Date.now(),
      title: type === 'error' ? 'İşlem Başarısız' : 'Değişiklikler Kaydedildi',
      detail,
      type,
    });
  }, []);

  // Quick 1.8s auto-dismiss feedback toast
  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 1800);
    return () => window.clearTimeout(t);
  }, [toast]);

  // Press "/" to focus search instantly on desktop
  useEffect(() => {
    const onKey = (e) => {
      if (
        e.key === '/' &&
        activeTab === 'products' &&
        !modalOpen &&
        document.activeElement?.tagName !== 'INPUT' &&
        document.activeElement?.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [activeTab, modalOpen]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [deferredQuery, categoryFilter, statusFilter]);

  const filteredItems = useMemo(
    () =>
      index.searchItems(deferredQuery, {
        categoryId: categoryFilter === 'all' ? null : categoryFilter,
        includeInactive: true,
        statusFilter,
      }),
    [index, deferredQuery, categoryFilter, statusFilter]
  );

  const visibleItems = useMemo(
    () => filteredItems.slice(0, visibleCount),
    [filteredItems, visibleCount]
  );

  const passiveCount = index.stats.totalItems - index.stats.activeItems;
  const featuredCount = index.stats.featuredItems ?? index.featuredItems.length;

  const handleAuthError = useCallback(
    (res) => {
      if (res?.unauthorized) {
        showToast('Oturum süresi doldu, lütfen yeniden giriş yapın.', 'error');
        onLogout();
        return true;
      }
      return false;
    },
    [onLogout, showToast]
  );

  const handleInlineSaveTitle = useCallback(
    async (itemId, newTitle) => {
      const res = await updateItem(itemId, { title: newTitle });
      if (handleAuthError(res)) return;
      showToast(`Ürün adı: "${newTitle}"`);
    },
    [updateItem, handleAuthError, showToast]
  );

  const handleInlineSavePrice = useCallback(
    async (itemId, newPrice, title) => {
      const res = await updateItem(itemId, { price: newPrice });
      if (handleAuthError(res)) return;
      showToast(`${title} • ${newPrice} ₺`);
    },
    [updateItem, handleAuthError, showToast]
  );

  const handleToggleActive = useCallback(
    async (item) => {
      const res = await toggleItemActive(item.id);
      if (handleAuthError(res)) return;
      showToast(
        `${item.title} • ${item.active === false ? 'Aktif edildi' : 'Pasife alındı'}`
      );
    },
    [toggleItemActive, handleAuthError, showToast]
  );

  const handleToggleFeatured = useCallback(
    async (item) => {
      const res = await toggleItemFeatured(item.id);
      if (handleAuthError(res)) return;
      showToast(
        item.featured
          ? `${item.title} • Öne çıkarılanlardan kaldırıldı`
          : `${item.title} • Öne çıkarıldı`
      );
    },
    [toggleItemFeatured, handleAuthError, showToast]
  );

  const handleDeleteItem = useCallback(
    async (item) => {
      if (!window.confirm(`"${item.title}" ürününü kalıcı olarak silmek istiyor musunuz?`)) {
        return;
      }
      const res = await deleteItem(item.id);
      if (handleAuthError(res)) return;
      showToast(`"${item.title}" silindi`);
    },
    [deleteItem, handleAuthError, showToast]
  );

  const handleOpenAddModal = useCallback(() => {
    setEditingItem(null);
    setModalOpen(true);
  }, []);

  const handleOpenEditModal = useCallback((item) => {
    setEditingItem(item);
    setModalOpen(true);
  }, []);

  const handleSubmitModal = useCallback(
    async (formValues) => {
      if (editingItem) {
        const res = await updateItem(editingItem.id, formValues);
        if (handleAuthError(res)) return;
        showToast(`"${formValues.title}" güncellendi`);
      } else {
        const res = await addItem(formValues);
        if (handleAuthError(res)) return;
        showToast(`"${formValues.title}" menüye eklendi`);
      }
    },
    [editingItem, updateItem, addItem, handleAuthError, showToast]
  );

  return (
    <div className="min-h-dvh bg-[#F6F5F1] text-[#181716]">
      {/* Sticky Admin Header */}
      <header className="no-print sticky top-0 z-30 border-b border-[#EAE6DF] bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl shadow-xs ring-1 ring-[#CA2F2D]/20">
              <img
                src={logoImg}
                alt="The Food Lounge"
                width={40}
                height={40}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <h1
                className="truncate text-xl leading-tight font-bold text-[#181716]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                The Food Lounge Admin
              </h1>
              <div className="flex items-center gap-2 text-[11px] font-medium text-[#7A746C]">
                <span className="inline-flex items-center gap-1 text-emerald-700">
                  <HardDrive size={11} />
                  {saving
                    ? 'Kaydediliyor...'
                    : persistenceMode === 'file'
                      ? 'Canlı kayıt aktif'
                      : 'Tarayıcı belleği aktif'}
                </span>
                {lastSavedAt && !saving && (
                  <span className="hidden sm:inline">
                    •{' '}
                    {new Date(lastSavedAt).toLocaleTimeString('tr-TR', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={onOpenMenu}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl border border-[#E5E1D9] bg-[#FAF9F6] px-3 text-xs font-semibold text-[#181716] transition-colors hover:bg-[#EFECE6]"
            >
              <ExternalLink size={14} className="text-[#CA2F2D]" />
              <span className="hidden sm:inline">Müşteri Menüsü</span>
              <span className="sm:hidden">Menü</span>
            </button>

            <button
              type="button"
              onClick={onLogout}
              title={`${user?.username || 'admin'} oturumunu kapat`}
              className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-[#181716] px-3 text-xs font-semibold text-white transition-colors hover:bg-[#CA2F2D]"
            >
              <LogOut size={14} />
              <span className="hidden sm:inline">Çıkış</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-4 pb-16">
        {/* Compact KPI Strip */}
        <section className="no-print grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
          <button
            type="button"
            onClick={() => {
              setActiveTab('products');
              setStatusFilter('all');
            }}
            className="rounded-2xl border border-[#EAE6DF] bg-white p-3 text-left transition-colors hover:border-[#CBC5BC]"
          >
            <p className="text-[11px] font-semibold text-[#8A837A]">Toplam Ürün</p>
            <p className="mt-0.5 text-2xl font-extrabold text-[#181716]">
              {index.stats.totalItems}
            </p>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('products');
              setStatusFilter((prev) => (prev === 'featured' ? 'all' : 'featured'));
            }}
            className={`rounded-2xl border p-3 text-left transition-colors ${
              statusFilter === 'featured'
                ? 'border-amber-400 bg-amber-50'
                : 'border-[#EAE6DF] bg-white hover:border-amber-300'
            }`}
          >
            <p className="flex items-center gap-1 text-[11px] font-semibold text-amber-700">
              <Star size={11} className="fill-amber-500 text-amber-500" />
              Öne Çıkanlar
            </p>
            <p className="mt-0.5 text-2xl font-extrabold text-amber-700">
              {featuredCount}
            </p>
            <p className="text-[10px] font-medium text-[#8A837A]">
              {featuredCount > 0 ? 'Öncelikli gösterimde' : 'Otomatik saat modu'}
            </p>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('products');
              setStatusFilter((prev) => (prev === 'passive' ? 'all' : 'passive'));
            }}
            className={`rounded-2xl border p-3 text-left transition-colors ${
              statusFilter === 'passive'
                ? 'border-stone-400 bg-stone-100'
                : 'border-[#EAE6DF] bg-white hover:border-[#CBC5BC]'
            }`}
          >
            <p className="text-[11px] font-semibold text-emerald-700">Aktif / Pasif</p>
            <p className="mt-0.5 text-2xl font-extrabold text-emerald-700">
              {index.stats.activeItems}
              <span className="ml-1.5 text-sm font-semibold text-[#8A837A]">
                / {passiveCount}
              </span>
            </p>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('categories')}
            className="rounded-2xl border border-[#EAE6DF] bg-white p-3 text-left transition-colors hover:border-[#CA2F2D]/40"
          >
            <p className="text-[11px] font-semibold text-[#CA2F2D]">Kategoriler</p>
            <p className="mt-0.5 text-2xl font-extrabold text-[#CA2F2D]">
              {index.stats.totalCategories}
            </p>
          </button>
        </section>

        {/* Navigation Tabs + Quick Add Button */}
        <div className="no-print mt-4 flex flex-wrap items-center justify-between gap-2.5">
          <div className="no-scrollbar touch-scroll-free inline-flex max-w-full overflow-x-auto rounded-2xl border border-[#E5E1D9] bg-[#EFECE6] p-1">
            <button
              type="button"
              onClick={() => setActiveTab('products')}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-colors ${
                activeTab === 'products'
                  ? 'bg-white text-[#181716] shadow-2xs'
                  : 'text-[#6B665F] hover:text-[#181716]'
              }`}
            >
              <Package size={14} />
              Ürünler ({index.stats.totalItems})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('categories')}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-colors ${
                activeTab === 'categories'
                  ? 'bg-white text-[#181716] shadow-2xs'
                  : 'text-[#6B665F] hover:text-[#181716]'
              }`}
            >
              <Layers size={14} />
              Kategoriler ({index.stats.totalCategories})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('qr')}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-colors ${
                activeTab === 'qr'
                  ? 'bg-white text-[#181716] shadow-2xs'
                  : 'text-[#6B665F] hover:text-[#181716]'
              }`}
            >
              <QrCode size={14} />
              QR Kodları
            </button>
          </div>

          {activeTab === 'products' && (
            <button
              type="button"
              onClick={handleOpenAddModal}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#CA2F2D] px-4 py-2.5 text-xs font-bold text-white shadow-xs transition-transform hover:bg-[#B02422] active:scale-[0.97]"
            >
              <Plus size={15} />
              Yeni Ürün Ekle
            </button>
          )}
        </div>

        {/* Tab 1: Speed-First Products Management */}
        {activeTab === 'products' ? (
          <section className="mt-3.5 space-y-3.5">
            {/* Sticky Instant Search & Quick Filters */}
            <div className="sticky top-[65px] z-20 space-y-2.5 rounded-2xl border border-[#EAE6DF] bg-white p-3 shadow-xs">
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-12">
                <div className="relative sm:col-span-6">
                  <Search
                    size={16}
                    className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-[#9A938A]"
                  />
                  <input
                    ref={searchInputRef}
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Hızlı ürün ara... (örn. Serpme, Burger, Negroni)"
                    className="h-10 w-full rounded-xl border border-[#E5E1D9] bg-[#FAF9F6] pr-9 pl-10 text-sm text-[#181716] placeholder:text-[#9A938A] focus:border-[#CA2F2D] focus:bg-white focus:outline-none"
                    autoComplete="off"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute top-1/2 right-2.5 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-[#E7E3DC] text-[#4A4641] hover:bg-[#D8D3CA]"
                      aria-label="Aramayı temizle"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>

                <div className="sm:col-span-3">
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    aria-label="Kategori filtresi"
                    className="h-10 w-full rounded-xl border border-[#E5E1D9] bg-[#FAF9F6] px-3 text-xs font-semibold text-[#181716] focus:border-[#CA2F2D] focus:bg-white focus:outline-none"
                  >
                    <option value="all">Tüm Kategoriler ({index.stats.totalItems})</option>
                    {index.categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name} ({cat.totalItemCount ?? cat.itemCount})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-3">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    aria-label="Durum filtresi"
                    className="h-10 w-full rounded-xl border border-[#E5E1D9] bg-[#FAF9F6] px-3 text-xs font-semibold text-[#181716] focus:border-[#CA2F2D] focus:bg-white focus:outline-none"
                  >
                    <option value="all">Tüm Durumlar</option>
                    <option value="featured">Sadece Öne Çıkanlar ({featuredCount})</option>
                    <option value="active">Sadece Aktif</option>
                    <option value="passive">Sadece Pasif ({passiveCount})</option>
                  </select>
                </div>
              </div>

              {/* 1-Tap Horizontal Category Quick Pills */}
              <div className="no-scrollbar touch-scroll-free flex items-center gap-1.5 overflow-x-auto pb-0.5">
                <button
                  type="button"
                  onClick={() => setCategoryFilter('all')}
                  className={`shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-bold transition-colors ${
                    categoryFilter === 'all'
                      ? 'bg-[#181716] text-white'
                      : 'bg-[#F3F1EC] text-[#5E5850] hover:bg-[#E7E3DC]'
                  }`}
                >
                  Tümü
                </button>
                {index.categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryFilter(cat.id)}
                    className={`shrink-0 rounded-lg px-2.5 py-1 text-[11px] font-semibold transition-colors ${
                      categoryFilter === cat.id
                        ? 'bg-[#CA2F2D] text-white'
                        : 'bg-[#F3F1EC] text-[#5E5850] hover:bg-[#E7E3DC]'
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Result Counter & Inline Editing Hint */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-[#7C766E]">
              <span>
                <strong className="text-[#181716]">{filteredItems.length}</strong> ürün
                listeleniyor
              </span>
              <span className="text-[11px]">
                Hızlı Düzenleme: <strong className="text-[#181716]">Ad</strong> veya{' '}
                <strong className="text-[#CA2F2D]">Fiyat</strong> üzerine tıklayın, değiştirip{' '}
                <strong className="text-[#181716]">Enter</strong> veya dışına tıklayın — otomatik kaydedilir.
              </span>
            </div>

            {/* Product Rows */}
            {visibleItems.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-[#DFDAD1] bg-white px-6 py-12 text-center">
                <p className="text-sm font-semibold text-[#3A3733]">
                  Filtrelere uygun ürün bulunamadı.
                </p>
              </div>
            ) : (
              <div className="gpu-list space-y-2">
                {visibleItems.map((item) => (
                  <AdminProductRow
                    key={item.id}
                    item={item}
                    onInlineSaveTitle={handleInlineSaveTitle}
                    onInlineSavePrice={handleInlineSavePrice}
                    onToggleActive={handleToggleActive}
                    onToggleFeatured={handleToggleFeatured}
                    onEdit={handleOpenEditModal}
                    onDelete={handleDeleteItem}
                  />
                ))}
              </div>
            )}

            {/* Progressive Load More */}
            {visibleCount < filteredItems.length && (
              <div className="flex justify-center pt-2">
                <button
                  type="button"
                  onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                  className="rounded-xl border border-[#E5E1D9] bg-white px-5 py-2.5 text-xs font-bold text-[#181716] transition-colors hover:border-[#CA2F2D] hover:text-[#CA2F2D]"
                >
                  Daha Fazla Göster ({filteredItems.length - visibleCount} ürün kaldı)
                </button>
              </div>
            )}
          </section>
        ) : activeTab === 'categories' ? (
          <section className="mt-4">
            <CategoryManager
              categories={index.categories}
              onAddCategory={addCategory}
              onUpdateCategory={updateCategory}
              onDeleteCategory={deleteCategory}
              onNotify={(msg) => showToast(msg)}
            />
          </section>
        ) : (
          <section className="mt-4">
            <QrCodeGenerator onNotify={(msg, type) => showToast(msg, type)} />
          </section>
        )}
      </main>

      {/* Product Add / Full Edit Modal */}
      <ProductFormModal
        open={modalOpen}
        item={editingItem}
        categories={index.categories}
        defaultCategoryId={categoryFilter !== 'all' ? categoryFilter : index.categories[0]?.id}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmitModal}
      />

      {/* Top-Right Instant Save Toast (1.8s auto-dismiss) */}
      {toast && (
        <div
          key={toast.id}
          role="status"
          aria-live="polite"
          className={`animate-fade-in fixed top-16 right-4 z-50 flex max-w-xs items-start gap-2.5 rounded-2xl px-4 py-3 text-white shadow-xl ${
            toast.type === 'error' ? 'bg-[#CA2F2D]' : 'bg-[#181716]'
          }`}
        >
          <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-emerald-400" />
          <div className="min-w-0">
            <p className="text-xs font-bold leading-tight">{toast.title}</p>
            {toast.detail && (
              <p className="mt-0.5 truncate text-[11px] text-white/80">
                {toast.detail}
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
