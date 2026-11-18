import { memo, useEffect, useRef } from 'react';
import { LayoutGrid } from 'lucide-react';

const CategoryNav = memo(function CategoryNav({
  categories,
  activeCategoryId,
  onSelectCategory,
}) {
  const scrollRef = useRef(null);
  const activeBtnRef = useRef(null);

  useEffect(() => {
    const container = scrollRef.current;
    const btn = activeBtnRef.current;
    if (!container || !btn) return;

    const targetLeft =
      btn.offsetLeft - container.clientWidth / 2 + btn.clientWidth / 2;
    container.scrollTo({
      left: Math.max(0, targetLeft),
      behavior: 'smooth',
    });
  }, [activeCategoryId]);

  return (
    <div className="border-b border-[#EBE8E2] bg-[#F8F7F4]">
      <nav
        ref={scrollRef}
        aria-label="Menü Kategorileri"
        className="no-scrollbar touch-scroll-free mx-auto flex max-w-2xl items-center gap-2 overflow-x-auto px-4 py-2.5"
      >
        <button
          ref={activeCategoryId === 'all' ? activeBtnRef : null}
          type="button"
          onClick={() => onSelectCategory('all')}
          className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-2 text-xs font-semibold tracking-wide transition-all active:scale-[0.97] ${
            activeCategoryId === 'all'
              ? 'bg-[#181716] text-white shadow-xs'
              : 'border border-[#E5E1D9] bg-white text-[#4A4641] hover:border-[#CBC5BC]'
          }`}
        >
          <LayoutGrid size={13} />
          <span>Kategoriler</span>
        </button>

        {categories.map((cat) => {
          const isActive = activeCategoryId === cat.id;
          return (
            <button
              key={cat.id}
              ref={isActive ? activeBtnRef : null}
              type="button"
              onClick={() => onSelectCategory(cat.id)}
              className={`shrink-0 rounded-full px-3.5 py-2 text-xs font-semibold tracking-wide transition-all active:scale-[0.97] ${
                isActive
                  ? 'bg-[#CA2F2D] text-white shadow-xs'
                  : 'border border-[#E5E1D9] bg-white text-[#4A4641] hover:border-[#CBC5BC]'
              }`}
            >
              {cat.name}
            </button>
          );
        })}
      </nav>
    </div>
  );
});

export default CategoryNav;
