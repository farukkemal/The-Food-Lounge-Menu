import { memo } from 'react';
import { Flame, WheatOff } from 'lucide-react';
import LazyImage from './LazyImage';

const ProductCard = memo(function ProductCard({ item, onSelect, showCategoryBadge = false }) {
  const hasImage = Boolean(item.image);

  return (
    <article
      onClick={() => onSelect(item)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect(item);
        }
      }}
      className="cv-auto-card group flex cursor-pointer items-stretch gap-3.5 rounded-2xl border border-[#ECE8E1] bg-white p-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.03)] transition-all duration-150 hover:border-[#DCD6CC] hover:shadow-[0_6px_18px_rgba(24,23,22,0.06)] active:scale-[0.99]"
    >
      {/* Text Content */}
      <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
        <div>
          {(showCategoryBadge || item.dietary?.length > 0) && (
            <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
              {showCategoryBadge && (
                <span className="rounded-md bg-[#F4F2ED] px-2 py-0.5 text-[10px] font-semibold tracking-wide text-[#6E685F] uppercase">
                  {item.subcategory || item.category}
                </span>
              )}
              {item.dietary?.includes('Spicy') && (
                <span className="inline-flex items-center gap-0.5 rounded-md bg-red-50 px-1.5 py-0.5 text-[10px] font-semibold text-[#CA2F2D]">
                  <Flame size={10} />
                  Acılı
                </span>
              )}
              {item.dietary?.includes('Gluten-Free') && (
                <span className="inline-flex items-center gap-0.5 rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800">
                  <WheatOff size={10} />
                  Glutensiz
                </span>
              )}
            </div>
          )}

          <h3 className="text-[15px] leading-snug font-bold text-[#1C1B1A] transition-colors group-hover:text-[#CA2F2D]">
            {item.title}
          </h3>

          {item.description && (
            <p className="mt-1 line-clamp-2 text-[12.5px] leading-relaxed text-[#6E6962]">
              {item.description}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 pt-1">
          <span className="text-[15px] font-bold tracking-tight text-[#CA2F2D]">
            {item.priceFormatted}
          </span>
          {item.calories && (
            <span className="rounded-full bg-[#F6F4EF] px-2 py-0.5 text-[10.5px] font-medium text-[#7C766E]">
              {item.calories}
            </span>
          )}
        </div>
      </div>

      {/* Aspect-Ratio Locked Thumbnail */}
      {hasImage && (
        <LazyImage
          src={item.image}
          alt={item.title}
          containerClassName="aspect-square h-24 w-24 shrink-0 self-center rounded-xl ring-1 ring-black/5 sm:h-26 sm:w-26"
          className="transition-transform duration-300 group-hover:scale-105"
        />
      )}
    </article>
  );
});

export default ProductCard;
