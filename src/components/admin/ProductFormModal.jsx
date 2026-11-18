import { useEffect, useMemo, useState } from 'react';
import { X, Save, Image as ImageIcon } from 'lucide-react';
import LazyImage from '../LazyImage';

export default function ProductFormModal({
  open,
  item,
  categories,
  defaultCategoryId,
  onClose,
  onSubmit,
}) {
  const isEditing = Boolean(item);

  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [calories, setCalories] = useState('');
  const [image, setImage] = useState('');
  const [dietary, setDietary] = useState([]);
  const [active, setActive] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (item) {
      setTitle(item.title || '');
      setCategoryId(item.categoryId || categories[0]?.id || '');
      setSubcategory(item.subcategory || '');
      setPrice(item.price !== null && item.price !== undefined ? String(item.price) : '');
      setDescription(item.description || '');
      setCalories(item.calories || '');
      setImage(item.image || '');
      setDietary(Array.isArray(item.dietary) ? item.dietary : []);
      setActive(item.active !== false);
    } else {
      setTitle('');
      setCategoryId(defaultCategoryId || categories[0]?.id || '');
      setSubcategory('');
      setPrice('');
      setDescription('');
      setCalories('');
      setImage('');
      setDietary([]);
      setActive(true);
    }
  }, [open, item, categories, defaultCategoryId]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open, onClose]);

  const selectedCategory = useMemo(
    () => categories.find((c) => c.id === categoryId) || null,
    [categories, categoryId]
  );

  if (!open) return null;

  const toggleDietaryTag = (tag) => {
    setDietary((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const parsedPrice = Number.parseFloat(String(price).replace(',', '.'));
    if (!title.trim() || !categoryId || Number.isNaN(parsedPrice) || parsedPrice < 0) {
      return;
    }

    setSubmitting(true);
    await onSubmit({
      title: title.trim(),
      categoryId,
      subcategory: subcategory.trim() || null,
      price: parsedPrice,
      description: description.trim(),
      calories: calories.trim() || null,
      image: image.trim() || null,
      dietary,
      active,
    });
    setSubmitting(false);
    onClose();
  };

  return (
    <div
      className="animate-fade-in fixed inset-0 z-50 flex items-end justify-center bg-black/55 backdrop-blur-xs sm:items-center sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={isEditing ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}
    >
      <div
        className="animate-sheet-up max-h-[92vh] w-full max-w-xl overflow-y-auto rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#EEEAE3] pb-3.5">
          <div>
            <h2
              className="text-2xl font-bold text-[#181716]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {isEditing ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}
            </h2>
            <p className="text-xs text-[#7C766E]">
              Değişiklikler kaydedildiğinde menüde anında güncellenir.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F4F2ED] text-[#4A4641] hover:bg-[#E7E3DC]"
            aria-label="Kapat"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Title & Price */}
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-[#4A4641]">
                Ürün Adı *
              </label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                placeholder="Örn: TRÜFLÜ RİSOTTO"
                className="h-10 w-full rounded-xl border border-[#E5E1D9] bg-[#FAF9F6] px-3 text-sm text-[#181716] focus:border-[#CA2F2D] focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-[#4A4641]">
                Fiyat (₺) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                required
                placeholder="650"
                className="h-10 w-full rounded-xl border border-[#E5E1D9] bg-[#FAF9F6] px-3 text-sm font-bold text-[#CA2F2D] focus:border-[#CA2F2D] focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {/* Category & Subcategory */}
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-semibold text-[#4A4641]">
                Kategori *
              </label>
              <select
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);
                  setSubcategory('');
                }}
                required
                className="h-10 w-full rounded-xl border border-[#E5E1D9] bg-[#FAF9F6] px-3 text-sm text-[#181716] focus:border-[#CA2F2D] focus:bg-white focus:outline-none"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-[#4A4641]">
                Alt Kategori (Opsiyonel)
              </label>
              <input
                type="text"
                list="admin-subcategories-list"
                value={subcategory}
                onChange={(e) => setSubcategory(e.target.value)}
                placeholder="Örn: KOKTEYLLER"
                className="h-10 w-full rounded-xl border border-[#E5E1D9] bg-[#FAF9F6] px-3 text-sm text-[#181716] focus:border-[#CA2F2D] focus:bg-white focus:outline-none"
              />
              {selectedCategory?.subcategories?.length > 0 && (
                <datalist id="admin-subcategories-list">
                  {selectedCategory.subcategories.map((sub) => (
                    <option key={sub} value={sub} />
                  ))}
                </datalist>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="mb-1 block text-xs font-semibold text-[#4A4641]">
              Açıklama / İçindekiler
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ürün malzemeleri ve kısa sunum notu..."
              className="w-full rounded-xl border border-[#E5E1D9] bg-[#FAF9F6] p-3 text-sm text-[#181716] focus:border-[#CA2F2D] focus:bg-white focus:outline-none"
            />
          </div>

          {/* Image URL + Preview */}
          <div className="grid grid-cols-1 gap-3.5 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label className="mb-1 block text-xs font-semibold text-[#4A4641]">
                Görsel URL
              </label>
              <div className="relative">
                <ImageIcon
                  size={15}
                  className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-[#9A938A]"
                />
                <input
                  type="url"
                  value={image}
                  onChange={(e) => setImage(e.target.value)}
                  placeholder="https://..."
                  className="h-10 w-full rounded-xl border border-[#E5E1D9] bg-[#FAF9F6] pr-3 pl-9 text-xs text-[#181716] focus:border-[#CA2F2D] focus:bg-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-semibold text-[#4A4641]">
                Kalori
              </label>
              <input
                type="text"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                placeholder="Örn: 640 kcal"
                className="h-10 w-full rounded-xl border border-[#E5E1D9] bg-[#FAF9F6] px-3 text-sm text-[#181716] focus:border-[#CA2F2D] focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          {image.trim() && (
            <div className="flex items-center gap-3 rounded-2xl border border-[#ECE8E1] bg-[#FAF9F6] p-2.5">
              <LazyImage
                key={image.trim()}
                src={image.trim()}
                alt="Önizleme"
                priority
                containerClassName="aspect-square h-14 w-14 shrink-0 rounded-xl"
              />
              <span className="truncate text-xs text-[#6E6962]">
                Görsel önizlemesi aktif
              </span>
            </div>
          )}

          {/* Dietary & Active Toggle */}
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#ECE8E1] bg-[#FAF9F6] px-3.5 py-3">
            <div className="flex flex-wrap items-center gap-3">
              <label className="flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-[#4A4641]">
                <input
                  type="checkbox"
                  checked={dietary.includes('Spicy')}
                  onChange={() => toggleDietaryTag('Spicy')}
                  className="h-4 w-4 accent-[#CA2F2D]"
                />
                Acılı
              </label>
              <label className="flex cursor-pointer items-center gap-1.5 text-xs font-semibold text-[#4A4641]">
                <input
                  type="checkbox"
                  checked={dietary.includes('Gluten-Free')}
                  onChange={() => toggleDietaryTag('Gluten-Free')}
                  className="h-4 w-4 accent-[#CA2F2D]"
                />
                Glutensiz
              </label>
            </div>

            <label className="flex cursor-pointer items-center gap-2 text-xs font-bold text-[#181716]">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="h-4 w-4 accent-emerald-600"
              />
              <span>Menüde Aktif</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 border-t border-[#EEEAE3] pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-[#E5E1D9] bg-white px-4 py-2.5 text-xs font-semibold text-[#4A4641] hover:bg-[#F4F2ED]"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-1.5 rounded-xl bg-[#CA2F2D] px-5 py-2.5 text-xs font-bold text-white shadow-xs transition-colors hover:bg-[#B02422] disabled:opacity-60"
            >
              <Save size={14} />
              {submitting ? 'Kaydediliyor...' : isEditing ? 'Değişiklikleri Kaydet' : 'Ürünü Ekle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
