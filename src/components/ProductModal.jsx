import { memo, useEffect } from 'react';
import { X, Flame, WheatOff, Sparkles } from 'lucide-react';
import LazyImage from './LazyImage';
import {
  getLocalizedItemCategory,
  getLocalizedItemDesc,
  getLocalizedItemSubcategory,
  getLocalizedItemTitle,
  useLanguage,
} from '../context/LanguageContext';

const ProductModal = memo(function ProductModal({ item, onClose }) {
  const { lang, strings } = useLanguage();

  useEffect(() => {
    if (!item) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKey);
    };
  }, [item, onClose]);

  if (!item) return null;

  const title = getLocalizedItemTitle(item, lang);
  const description = getLocalizedItemDesc(item, lang);
  const categoryLabel = getLocalizedItemCategory(item, lang);
  const subcategoryLabel = getLocalizedItemSubcategory(item, lang);

  return (
    <div
      className="animate-fade-in fixed inset-0 z-50 flex items-end justify-center bg-black/55 backdrop-blur-xs sm:items-center sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-product-title"
    >
      <div
        className="animate-sheet-up pb-safe relative max-h-[90vh] w-full max-w-lg overflow-y-auto overscroll-y-contain rounded-t-3xl bg-white shadow-2xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-center pt-2.5 pb-1 sm:hidden">
          <div className="h-1 w-10 rounded-full bg-[#D8D3CA]" />
        </div>

        <button
          type="button"
          onClick={onClose}
          className="absolute top-3.5 right-3.5 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-black/80 active:scale-95"
          aria-label={strings.close}
        >
          <X size={18} />
        </button>

        {item.image && (
          <div className="w-full px-4 pt-2 sm:p-0">
            <LazyImage
              src={item.image}
              alt={title}
              width={640}
              height={400}
              priority
              containerClassName="aspect-[16/10] w-full rounded-2xl sm:rounded-none"
            />
          </div>
        )}

        <div className="p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-semibold tracking-wider text-[#8C857C] uppercase">
            <span>{categoryLabel}</span>
            {subcategoryLabel && (
              <>
                <span>•</span>
                <span className="text-[#CA2F2D]">{subcategoryLabel}</span>
              </>
            )}
          </div>

          <h2
            id="modal-product-title"
            className="mt-1.5 text-2xl leading-tight font-bold text-[#181716]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {title}
          </h2>

          {(item.calories || item.dietary?.length > 0) && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {item.calories && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[#F5F3EE] px-2.5 py-1 text-xs font-medium text-[#5E5850]">
                  <Sparkles size={12} className="text-[#9A938A]" />
                  {item.calories}
                </span>
              )}
              {item.dietary?.includes('Spicy') && (
                <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-semibold text-[#CA2F2D]">
                  <Flame size={12} />
                  {strings.spicy}
                </span>
              )}
              {item.dietary?.includes('Gluten-Free') && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800">
                  <WheatOff size={12} />
                  {strings.glutenFree}
                </span>
              )}
            </div>
          )}

          <p className="mt-4 text-[14px] leading-relaxed text-[#524E48]">
            {description || strings.defaultDishDesc}
          </p>

          <div className="mt-6 flex items-center justify-between border-t border-[#EEEAE3] pt-4">
            <span className="text-xs font-semibold tracking-wider text-[#8C857C] uppercase">
              {strings.price}
            </span>
            <span className="text-2xl font-bold tracking-tight text-[#CA2F2D]">
              {item.priceFormatted}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
});

export default ProductModal;
