import { memo, useState } from 'react';
import { Plus, Pencil, Trash2, Check, X, FolderPlus } from 'lucide-react';
import LazyImage from '../LazyImage';

const CategoryManager = memo(function CategoryManager({
  categories,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  onNotify,
}) {
  const [newName, setNewName] = useState('');
  const [newImage, setNewImage] = useState('');
  const [newSubs, setNewSubs] = useState('');

  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editImage, setEditImage] = useState('');
  const [editSubs, setEditSubs] = useState('');

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const subList = newSubs
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const res = await onAddCategory({
      name: newName.trim().toLocaleUpperCase('tr-TR'),
      image: newImage.trim() || null,
      subcategories: subList,
    });
    if (res?.ok) {
      setNewName('');
      setNewImage('');
      setNewSubs('');
      onNotify(`"${newName.trim()}" kategorisi eklendi.`);
    }
  };

  const startEdit = (cat) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditImage(cat.image || '');
    setEditSubs((cat.subcategories || []).join(', '));
  };

  const saveEdit = async (catId) => {
    if (!editName.trim()) return;
    const subList = editSubs
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const res = await onUpdateCategory(catId, {
      name: editName.trim(),
      image: editImage.trim() || null,
      subcategories: subList,
    });
    if (res?.ok) {
      setEditingId(null);
      onNotify('Kategori güncellendi ve ürünlerle senkronize edildi.');
    }
  };

  const handleDelete = async (cat) => {
    const count = cat.totalItemCount ?? cat.itemCount ?? 0;
    const msg =
      count > 0
        ? `"${cat.name}" kategorisinde ${count} ürün bulunuyor. Silerseniz bu kategoriye bağlı ürünler de silinecektir. Devam edilsin mi?`
        : `"${cat.name}" kategorisini silmek istediğinize emin misiniz?`;

    if (!window.confirm(msg)) return;
    const res = await onDeleteCategory(cat.id);
    if (res?.ok) {
      onNotify(`"${cat.name}" kategorisi silindi.`);
    }
  };

  return (
    <div className="space-y-5">
      {/* Add Category Form */}
      <form
        onSubmit={handleCreate}
        className="rounded-2xl border border-[#EAE6DF] bg-white p-4 shadow-2xs sm:p-5"
      >
        <div className="mb-3 flex items-center gap-2">
          <FolderPlus size={16} className="text-[#CA2F2D]" />
          <h3 className="text-sm font-bold text-[#181716]">Yeni Kategori Oluştur</h3>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="Kategori adı (örn: ŞEFİN ÖZELLERİ)"
            required
            className="h-10 rounded-xl border border-[#E5E1D9] bg-[#FAF9F6] px-3 text-sm text-[#181716] focus:border-[#CA2F2D] focus:bg-white focus:outline-none"
          />
          <input
            type="url"
            value={newImage}
            onChange={(e) => setNewImage(e.target.value)}
            placeholder="Kapak Görsel URL (opsiyonel)"
            className="h-10 rounded-xl border border-[#E5E1D9] bg-[#FAF9F6] px-3 text-xs text-[#181716] focus:border-[#CA2F2D] focus:bg-white focus:outline-none"
          />
          <input
            type="text"
            value={newSubs}
            onChange={(e) => setNewSubs(e.target.value)}
            placeholder="Alt kategoriler (virgülle ayırın)"
            className="h-10 rounded-xl border border-[#E5E1D9] bg-[#FAF9F6] px-3 text-xs text-[#181716] focus:border-[#CA2F2D] focus:bg-white focus:outline-none"
          />
        </div>
        <div className="mt-3 flex justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#181716] px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-[#CA2F2D]"
          >
            <Plus size={14} />
            Kategori Ekle
          </button>
        </div>
      </form>

      {/* Categories List */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {categories.map((cat) => {
          const isEditing = editingId === cat.id;
          return (
            <div
              key={cat.id}
              className="rounded-2xl border border-[#EAE6DF] bg-white p-3.5 shadow-2xs"
            >
              {isEditing ? (
                <div className="space-y-2.5">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="h-9 w-full rounded-xl border border-[#CA2F2D]/50 bg-white px-3 text-sm font-semibold text-[#181716] focus:outline-none"
                    placeholder="Kategori adı"
                  />
                  <input
                    type="url"
                    value={editImage}
                    onChange={(e) => setEditImage(e.target.value)}
                    className="h-9 w-full rounded-xl border border-[#E5E1D9] bg-[#FAF9F6] px-3 text-xs text-[#181716] focus:outline-none"
                    placeholder="Kapak görsel URL"
                  />
                  <input
                    type="text"
                    value={editSubs}
                    onChange={(e) => setEditSubs(e.target.value)}
                    className="h-9 w-full rounded-xl border border-[#E5E1D9] bg-[#FAF9F6] px-3 text-xs text-[#181716] focus:outline-none"
                    placeholder="Alt kategoriler (virgülle)"
                  />
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="inline-flex items-center gap-1 rounded-lg border border-[#E5E1D9] px-3 py-1.5 text-xs font-semibold text-[#5E5850]"
                    >
                      <X size={13} />
                      İptal
                    </button>
                    <button
                      type="button"
                      onClick={() => saveEdit(cat.id)}
                      className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700"
                    >
                      <Check size={13} />
                      Kaydet
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <LazyImage
                    src={cat.image}
                    alt={cat.name}
                    containerClassName="aspect-square h-14 w-14 shrink-0 rounded-xl ring-1 ring-black/5"
                  />
                  <div className="min-w-0 flex-1">
                    <h4 className="truncate text-sm font-bold text-[#181716]">
                      {cat.name}
                    </h4>
                    <p className="mt-0.5 text-xs text-[#7C766E]">
                      {cat.itemCount} aktif / {cat.totalItemCount ?? cat.itemCount} toplam ürün
                    </p>
                    {cat.subcategories?.length > 0 && (
                      <p className="mt-0.5 truncate text-[11px] text-[#CA2F2D]">
                        {cat.subcategories.length} alt kategori
                      </p>
                    )}
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => startEdit(cat)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#EAE6DF] text-[#4A4641] hover:border-[#181716] hover:text-[#181716]"
                      aria-label={`${cat.name} düzenle`}
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(cat)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#EAE6DF] text-[#8C857C] hover:border-red-200 hover:bg-red-50 hover:text-[#CA2F2D]"
                      aria-label={`${cat.name} sil`}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});

export default CategoryManager;
