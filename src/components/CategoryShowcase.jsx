import { memo } from 'react';
import { ChevronRight } from 'lucide-react';
import LazyImage from './LazyImage';

const CategoryCard = memo(function CategoryCard({ category, index, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(category.id)}
      className="cv-auto-category group relative flex w-full flex-col overflow-hidden rounded-2xl bg-[#1E1D1B] text-left shadow-xs ring-1 ring-black/6 transition-transform duration-200 active:scale-[0.98]"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <LazyImage
          src={category.image}
          alt={category.name}
          priority={index < 4}
          containerClassName="h-full w-full"
          className="transition-transform duration-500 group-hover:scale-105"
          fallbackIconSize={28}
        />
        {/* Gradient Scrim */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/82 via-black/28 to-black/10" />

        {/* Item Count Pill */}
        <span className="absolute top-2.5 right-2.5 rounded-full bg-black/55 px-2.5 py-0.5 text-[11px] font-semibold text-white/95 backdrop-blur-sm">
          {category.itemCount}
        </span>

        {/* Category Title */}
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3">
          <h2 className="line-clamp-2 text-[13px] leading-snug font-bold tracking-wide text-white drop-shadow-xs">
            {category.name}
          </h2>
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/18 text-white backdrop-blur-xs transition-colors group-hover:bg-[#CA2F2D]">
            <ChevronRight size={14} />
          </span>
        </div>
      </div>
    </button>
  );
});

const CategoryShowcase = memo(function CategoryShowcase({
  categories,
  onSelectCategory,
}) {
  return (
    <section aria-label="Menü Kategorileri" className="px-4 pt-4 pb-8">
      <div className="mb-3.5 flex items-end justify-between">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.14em] text-[#CA2F2D] uppercase">
            Menüyü Keşfet
          </p>
          <h2
            className="text-2xl font-bold text-[#181716]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Kategoriler
          </h2>
        </div>
        <span className="text-xs font-medium text-[#7C766E]">
          {categories.length} Kategori
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {categories.map((cat, idx) => (
          <CategoryCard
            key={cat.id}
            category={cat}
            index={idx}
            onSelect={onSelectCategory}
          />
        ))}
      </div>
    </section>
  );
});

export default CategoryShowcase;
