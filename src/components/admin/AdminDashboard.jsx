import {
  memo,
  useCallback,
  useDeferredValue,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  Plus,
  Search,
  LogOut,
  ExternalLink,
  Pencil,
  Trash2,
  Check,
  Eye,
  EyeOff,
  Package,
  Layers,
  CheckCircle2,
  X,
  HardDrive,
  QrCode,
} from 'lucide-react';
import logoImg from '../../assets/logo.webp';
import { useMenu } from '../../context/MenuContext';
import LazyImage from '../LazyImage';
import ProductFormModal from './ProductFormModal';
import CategoryManager from './CategoryManager';
import QrCodeGenerator from './QrCodeGenerator';

const PAGE_SIZE = 30;

const AdminProductRow = memo(function AdminProductRow({
  item,
  onQuickSavePrice,
  onToggleActive,
  onEdit,
  onDelete,
}) {
  const [priceDraft, setPriceDraft] = useState(
    item.price !== null && item.price !== undefined ? String(item.price) : ''
  );
  const [justSaved, setJustSaved] = useState(false);

  useEffect(() => {
    setPriceDraft(
      item.price !== null && item.price !== undefined ? String(item.price) : ''
    );
  }, [item.price]);

  const numericDraft = Number.parseFloat(String(priceDraft).replace(',', '.'));
  const isDirty =
    !Number.isNaN(numericDraft) &&
    numericDraft >= 0 &&
    numericDraft !== item.price;

  const handleSavePrice = async () => {
    if (!isDirty) return;
    const ok = await onQuickSavePrice(item.id, numericDraft, item.title);
    if (ok) {
      setJustSaved(true);
      window.setTimeout(() => setJustSaved(false), 1200);
    }
  };

  const isActive = item.active !== false;

  return (
    <div
      className={`cv-auto-card flex flex-col gap-3 rounded-2xl border bg-white p-3.5 shadow-2xs transition-colors sm:flex-row sm:items-center sm:justify-between ${
        isActive ? 'border-[#EAE6DF]' : 'border-dashed border-[#D8D3CA] bg-[#FAF9F7] opacity-75'
      }`}
    >
      {/* Left: Thumbnail + Info */}
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <LazyImage
          src={item.image}
          alt={item.title}
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
            {!isActive && (
              <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-800">
                Pasif (Gizli)
              </span>
            )}
          </div>

          <h4 className="mt-1 truncate text-sm font-bold text-[#181716]">
            {item.title}
          </h4>

          {item.description && (
            <p className="mt-0.5 line-clamp-1 text-xs text-[#7C766E]">
              {item.description}
            </p>
          )}
        </div>
      </div>

      {/* Right: Inline Price Editor + Action Buttons */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#F2EFEA] pt-2.5 sm:justify-end sm:border-t-0 sm:pt-0">
        {/* Inline Price Control */}
        <div className="flex items-center gap-1.5">
          <div className="relative">
            <input
              type="number"
              step="0.01"
              min="0"
              value={priceDraft}
              onChange={(e) => setPriceDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSavePrice();
                }
              }}
              aria-label={`${item.title} fiyatı`}
              className={`h-9 w-24 rounded-xl border bg-[#FAF9F6] pr-6 pl-2.5 text-right text-sm font-bold transition-colors focus:bg-white focus:outline-none ${
                isDirty
                  ? 'border-[#CA2F2D] text-[#CA2F2D] ring-2 ring-[#CA2F2D]/15'
                  : 'border-[#E5E1D9] text-[#181716]'
              }`}
            />
            <span className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-xs font-semibold text-[#8C857C]">
              ₺
            </span>
          </div>

          <button
            type="button"
            disabled={!isDirty}
            onClick={handleSavePrice}
            title="Fiyatı anında kaydet"
            className={`flex h-9 w-9 items-center justify-center rounded-xl transition-all ${
              justSaved
                ? 'bg-emerald-600 text-white'
                : isDirty
                  ? 'bg-[#CA2F2D] text-white shadow-xs hover:bg-[#B02422] active:scale-95'
                  : 'border border-[#EBE8E2] bg-[#FAF9F6] text-[#C4BEB5] cursor-not-allowed'
            }`}
            aria-label="Fiyatı kaydet"
          >
            <Check size={15} strokeWidth={2.5} />
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onToggleActive(item)}
            title={isActive ? 'Müşteri menüsünden gizle (Pasif)' : 'Müşteri menüsünde göster (Aktif)'}
            className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-colors ${
              isActive
                ? 'border-[#E7E3DC] bg-white text-emerald-700 hover:bg-emerald-50'
                : 'border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100'
            }`}
            aria-label={isActive ? 'Pasife al' : 'Aktif et'}
          >
            {isActive ? <Eye size={15} /> : <EyeOff size={15} />}
          </button>

          <button
            type="button"
            onClick={() => onEdit(item)}
            title="Ürünü düzenle"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E7E3DC] bg-white text-[#4A4641] transition-colors hover:border-[#181716] hover:text-[#181716]"
            aria-label="Ürünü düzenle"
          >
            <Pencil size={15} />
          </button>

          <button
            type="button"
            onClick={() => onDelete(item)}
            title="Ürünü sil"
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#E7E3DC] bg-white text-[#8C857C] transition-colors hover:border-red-200 hover:bg-red-50 hover:text-[#CA2F2D]"
            aria-label="Ürünü sil"
          >
            <Trash2 size={15} />
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
    addCategory,
    updateCategory,
    deleteCategory,
  } = useMenu();

  const [activeTab, setActiveTab] = useState('products'); // 'products' | 'categories'
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'active' | 'passive'
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [toast, setToast] = useState(null);

  const deferredQuery = useDeferredValue(searchQuery);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ id: Date.now(), message, type });
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 3000);
    return () => window.clearTimeout(t);
  }, [toast]);

  // Reset pagination when filters change
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

  const handleQuickSavePrice = useCallback(
    async (itemId, newPrice, title) => {
      const res = await updateItem(itemId, { price: newPrice });
      if (handleAuthError(res)) return false;
      showToast(`"${title}" fiyatı güncellendi (${newPrice} ₺).`);
      return true;
    },
    [updateItem, handleAuthError, showToast]
  );

  const handleToggleActive = useCallback(
    async (item) => {
      const res = await toggleItemActive(item.id);
      if (handleAuthError(res)) return;
      const nextState = item.active === false ? 'aktif edildi' : 'pasife alındı';
      showToast(`"${item.title}" ${nextState}.`);
    },
    [toggleItemActive, handleAuthError, showToast]
  );

  const handleDeleteItem = useCallback(
    async (item) => {
      if (!window.confirm(`"${item.title}" ürününü kalıcı olarak silmek istiyor musunuz?`)) {
        return;
      }
      const res = await deleteItem(item.id);
      if (handleAuthError(res)) return;
      showToast(`"${item.title}" menüden silindi.`);
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
        showToast(`"${formValues.title}" başarıyla güncellendi.`);
      } else {
        const res = await addItem(formValues);
        if (handleAuthError(res)) return;
        showToast(`"${formValues.title}" menüye eklendi.`);
      }
    },
    [editingItem, updateItem, addItem, handleAuthError, showToast]
  );

  return (
    <div className="min-h-dvh bg-[#F6F5F1] text-[#181716]">
      {/* Sticky Admin Header */}
      <header className="no-print sticky top-0 z-30 border-b border-[#EAE6DF] bg-white/95 backdrop-blur-md">
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
                      ? 'menu_data.json canlı bağlı'
                      : 'Tarayıcı belleği aktif'}
                </span>
                {lastSavedAt && !saving && (
                  <span className="hidden sm:inline">
                    • Son kayıt:{' '}
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

      <main className="mx-auto max-w-5xl px-4 py-5 pb-16">
        {/* KPI Overview Strip */}
        <section className="no-print grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
          <div className="rounded-2xl border border-[#EAE6DF] bg-white p-3.5 shadow-2xs">
            <p className="text-[11px] font-semibold text-[#8A837A]">Toplam Ürün</p>
            <p className="mt-1 text-2xl font-extrabold text-[#181716]">
              {index.stats.totalItems}
            </p>
          </div>
          <div className="rounded-2xl border border-[#EAE6DF] bg-white p-3.5 shadow-2xs">
            <p className="text-[11px] font-semibold text-emerald-700">Aktif Ürün</p>
            <p className="mt-1 text-2xl font-extrabold text-emerald-700">
              {index.stats.activeItems}
            </p>
          </div>
          <div className="rounded-2xl border border-[#EAE6DF] bg-white p-3.5 shadow-2xs">
            <p className="text-[11px] font-semibold text-amber-700">Pasif (Gizli)</p>
            <p className="mt-1 text-2xl font-extrabold text-amber-700">
              {passiveCount}
            </p>
          </div>
          <div className="rounded-2xl border border-[#EAE6DF] bg-white p-3.5 shadow-2xs">
            <p className="text-[11px] font-semibold text-[#CA2F2D]">Kategoriler</p>
            <p className="mt-1 text-2xl font-extrabold text-[#CA2F2D]">
              {index.stats.totalCategories}
            </p>
          </div>
        </section>

        {/* Tabs + Primary Action */}
        <div className="no-print mt-5 flex flex-wrap items-center justify-between gap-3">
          <div className="no-scrollbar touch-scroll-free inline-flex max-w-full overflow-x-auto rounded-2xl border border-[#E5E1D9] bg-[#EFECE6] p-1">
            <button
              type="button"
              onClick={() => setActiveTab('products')}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                activeTab === 'products'
                  ? 'bg-white text-[#181716] shadow-xs'
                  : 'text-[#6B665F] hover:text-[#181716]'
              }`}
            >
              <Package size={14} />
              Ürünler ({index.stats.totalItems})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('categories')}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                activeTab === 'categories'
                  ? 'bg-white text-[#181716] shadow-xs'
                  : 'text-[#6B665F] hover:text-[#181716]'
              }`}
            >
              <Layers size={14} />
              Kategoriler ({index.stats.totalCategories})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('qr')}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                activeTab === 'qr'
                  ? 'bg-white text-[#181716] shadow-xs'
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
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#CA2F2D] px-4 py-2.5 text-xs font-bold text-white shadow-xs transition-all hover:bg-[#B02422] active:scale-[0.98]"
            >
              <Plus size={15} />
              Yeni Ürün Ekle
            </button>
          )}
        </div>

        {/* Tab 1: Products Management */}
        {activeTab === 'products' ? (
          <section className="mt-4 space-y-4">
            {/* Search & Filters Bar */}
            <div className="grid grid-cols-1 gap-2.5 rounded-2xl border border-[#EAE6DF] bg-white p-3.5 shadow-2xs sm:grid-cols-12">
              <div className="relative sm:col-span-5">
                <Search
                  size={15}
                  className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[#9A938A]"
                />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Ürün adı, açıklama veya kategori ara..."
                  className="h-10 w-full rounded-xl border border-[#E5E1D9] bg-[#FAF9F6] pr-8 pl-9 text-sm text-[#181716] focus:border-[#CA2F2D] focus:bg-white focus:outline-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute top-1/2 right-2.5 -translate-y-1/2 text-[#8C857C] hover:text-[#181716]"
                    aria-label="Aramayı temizle"
                  >
                    <X size={14} />
                  </button>
                )}
              </div>

              <div className="sm:col-span-4">
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
                  <option value="active">Sadece Aktif</option>
                  <option value="passive">Sadece Pasif ({passiveCount})</option>
                </select>
              </div>
            </div>

            {/* Result Meta & Tip */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-[#7C766E]">
              <span>
                Toplam <strong className="text-[#181716]">{filteredItems.length}</strong> ürün
                listeleniyor
              </span>
              <span className="text-[11px]">
                İpucu: Fiyatı kutucuktan değiştirip <strong className="text-[#181716]">Enter</strong> veya ✓ ile anında kaydedebilirsiniz.
              </span>
            </div>

            {/* Product Rows */}
            {visibleItems.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-[#DFDAD1] bg-white/70 px-6 py-12 text-center">
                <p className="text-sm font-semibold text-[#3A3733]">
                  Filtrelere uygun ürün bulunamadı.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {visibleItems.map((item) => (
                  <AdminProductRow
                    key={item.id}
                    item={item}
                    onQuickSavePrice={handleQuickSavePrice}
                    onToggleActive={handleToggleActive}
                    onEdit={handleOpenEditModal}
                    onDelete={handleDeleteItem}
                  />
                ))}
              </div>
            )}

            {/* Progressive Pagination (keeps DOM super light & zero-lag) */}
            {visibleCount < filteredItems.length && (
              <div className="flex justify-center pt-2">
                <button
                  type="button"
                  onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
                  className="rounded-xl border border-[#E5E1D9] bg-white px-5 py-2.5 text-xs font-bold text-[#181716] shadow-2xs transition-colors hover:border-[#CA2F2D] hover:text-[#CA2F2D]"
                >
                  Daha Fazla Göster ({filteredItems.length - visibleCount} ürün kaldı)
                </button>
              </div>
            )}
          </section>
        ) : activeTab === 'categories' ? (
          /* Tab 2: Category Management */
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
          /* Tab 3: Table QR Code Generator */
          <section className="mt-4">
            <QrCodeGenerator onNotify={showToast} />
          </section>
        )}
      </main>

      {/* Product Add/Edit Modal */}
      <ProductFormModal
        open={modalOpen}
        item={editingItem}
        categories={index.categories}
        defaultCategoryId={categoryFilter !== 'all' ? categoryFilter : index.categories[0]?.id}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmitModal}
      />

      {/* Live Feedback Toast */}
      {toast && (
        <div
          role="status"
          className={`animate-sheet-up fixed right-4 bottom-5 left-4 z-50 mx-auto flex max-w-md items-center gap-2.5 rounded-2xl px-4 py-3 text-xs font-semibold text-white shadow-xl sm:left-auto ${
            toast.type === 'error' ? 'bg-[#CA2F2D]' : 'bg-[#181716]'
          }`}
        >
          <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
          <span className="flex-1">{toast.message}</span>
        </div>
      )}
    </div>
  );
}
