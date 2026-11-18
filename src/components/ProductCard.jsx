import { memo } from 'react';
import { Flame, WheatOff } from 'lucide-react';
import LazyImage from './LazyImage';
import {
  getLocalizedItemCategory,
  getLocalizedItemDesc,
  getLocalizedItemSubcategory,
  getLocalizedItemTitle,
  useLanguage,
} from '../context/LanguageContext';

const ProductCard = memo(function ProductCard({
  item,
  onSelect,
  showCategoryBadge = false,
  priority = false,
}) {
  const { lang, strings } = useLanguage();
  const hasImage = Boolean(item.image);
  const title = getLocalizedItemTitle(item, lang);
  const description = getLocalizedItemDesc(item, lang);
  const badgeText =
    getLocalizedItemSubcategory(item, lang) ||
    getLocalizedItemCategory(item, lang);

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
      className="gpu-card cv-auto-card group flex cursor-pointer items-stretch gap-3.5 rounded-2xl border border-[#ECE8E1] bg-white p-3.5 transition-transform duration-150 active:scale-[0.985]"
    >
      {/* Text Content */}
      <div className="flex min-w-0 flex-1 flex-col justify-between gap-2">
        <div>
          {(showCategoryBadge || item.dietary?.length > 0) && (
            <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
              {showCategoryBadge && (
                <span className="rounded-md bg-[#F4F2ED] px-2 py-0.5 text-[10px] font-semibold tracking-wide text-[#6E685F] uppercase">
                  {badgeText}
                </span>
              )}
              {item.dietary?.includes('Spicy') && (
                <span className="inline-flex items-center gap-0.5 rounded-md bg-red-50 px-1.5 py-0.5 text-[10px] font-semibold text-[#CA2F2D]">
                  <Flame size={10} />
                  {strings.spicy}
                </span>
              )}
              {item.dietary?.includes('Gluten-Free') && (
                <span className="inline-flex items-center gap-0.5 rounded-md bg-amber-50 px-1.5 py-0.5 text-[10px] font-semibold text-amber-800">
                  <WheatOff size={10} />
                  {strings.glutenFree}
                </span>
              )}
            </div>
          )}

          <h3 className="text-[15px] leading-snug font-bold text-[#1C1B1A]">
            {title}
          </h3>

          {description && (
            <p className="mt-1 line-clamp-2 text-[12.5px] leading-relaxed text-[#6E6962]">
              {description}
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

      {/* Aspect-Ratio Locked Thumbnail with Explicit Dimensions */}
      {hasImage && (
        <LazyImage
          src={item.image}
          alt={title}
          width={104}
          height={104}
          sizes="104px"
          priority={priority}
          containerClassName="aspect-square h-24 w-24 shrink-0 self-center rounded-xl ring-1 ring-black/5 sm:h-26 sm:w-26"
        />
      )}
    </article>
  );
});

export default ProductCard;
