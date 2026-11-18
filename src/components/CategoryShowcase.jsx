import { memo } from 'react';
import { ChevronRight } from 'lucide-react';
import LazyImage from './LazyImage';
import {
  getLocalizedCategoryName,
  useLanguage,
} from '../context/LanguageContext';

const CategoryCard = memo(function CategoryCard({ category, index, lang, onSelect }) {
  const displayName = getLocalizedCategoryName(category, lang);

  return (
    <button
      type="button"
      onClick={() => onSelect(category.id)}
      className="gpu-card cv-auto-category group relative flex w-full flex-col overflow-hidden rounded-2xl bg-[#1E1D1B] text-left ring-1 ring-black/8 transition-transform duration-150 active:scale-[0.975]"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <LazyImage
          src={category.image}
          alt={displayName}
          width={480}
          height={360}
          sizes="(max-width: 640px) 46vw, 220px"
          priority={index < 4}
          containerClassName="h-full w-full"
          fallbackIconSize={28}
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/82 via-black/25 to-transparent" />

        <span className="absolute top-2.5 right-2.5 rounded-full bg-black/70 px-2.5 py-0.5 text-[11px] font-semibold text-white">
          {category.itemCount}
        </span>

        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3">
          <h2 className="line-clamp-2 text-[13px] leading-snug font-bold tracking-wide text-white">
            {displayName}
          </h2>
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/20 text-white">
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
  const { lang, strings } = useLanguage();

  return (
    <section aria-label={strings.categories} className="px-4 pt-4 pb-8">
      <div className="mb-3.5 flex items-end justify-between">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.14em] text-[#CA2F2D] uppercase">
            {strings.exploreMenu}
          </p>
          <h2
            className="text-2xl font-bold text-[#181716]"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {strings.categories}
          </h2>
        </div>
        <span className="text-xs font-medium text-[#7C766E]">
          {categories.length} {strings.categoryUnit}
        </span>
      </div>

      <div className="gpu-list grid grid-cols-2 gap-3 sm:grid-cols-3">
        {categories.map((cat, idx) => (
          <CategoryCard
            key={cat.id}
            category={cat}
            index={idx}
            lang={lang}
            onSelect={onSelectCategory}
          />
        ))}
      </div>
    </section>
  );
});

export default CategoryShowcase;
