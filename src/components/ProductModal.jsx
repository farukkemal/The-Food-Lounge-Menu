import { memo, useEffect } from 'react';
import { X, Flame, WheatOff, Sparkles } from 'lucide-react';
import LazyImage from './LazyImage';

const ProductModal = memo(function ProductModal({ item, onClose }) {
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
        {/* Drag Handle (Mobile) */}
        <div className="sticky top-0 z-10 flex items-center justify-center pt-2.5 pb-1 sm:hidden">
          <div className="h-1 w-10 rounded-full bg-[#D8D3CA]" />
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3.5 right-3.5 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm transition-colors hover:bg-black/75 active:scale-95"
          aria-label="Kapat"
        >
          <X size={18} />
        </button>

        {/* Product Image */}
        {item.image && (
          <div className="w-full px-4 pt-2 sm:p-0">
            <LazyImage
              src={item.image}
              alt={item.title}
              priority
              containerClassName="aspect-[16/10] w-full rounded-2xl sm:rounded-none"
            />
          </div>
        )}

        {/* Details */}
        <div className="p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-semibold tracking-wider text-[#8C857C] uppercase">
            <span>{item.category}</span>
            {item.subcategory && (
              <>
                <span>•</span>
                <span className="text-[#CA2F2D]">{item.subcategory}</span>
              </>
            )}
          </div>

          <h2
            id="modal-product-title"
            className="mt-1.5 text-2xl leading-tight font-bold text-[#181716]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {item.title}
          </h2>

          {/* Tags Row */}
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
                  Acılı
                </span>
              )}
              {item.dietary?.includes('Gluten-Free') && (
                <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800">
                  <WheatOff size={12} />
                  Glutensiz
                </span>
              )}
            </div>
          )}

          {item.description ? (
            <p className="mt-4 text-[14px] leading-relaxed text-[#524E48]">
              {item.description}
            </p>
          ) : (
            <p className="mt-4 text-[13px] text-[#8E8880]">
              Özenle hazırlanan The Food Lounge lezzeti.
            </p>
          )}

          {/* Price Footer */}
          <div className="mt-6 flex items-center justify-between border-t border-[#EEEAE3] pt-4">
            <span className="text-xs font-semibold tracking-wider text-[#8C857C] uppercase">
              Fiyat
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
