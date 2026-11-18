import { memo } from 'react';
import { Info, Search, X, Clock } from 'lucide-react';
import logoImg from '../assets/logo.webp';

const Header = memo(function Header({
  restaurantName,
  tableNumber,
  searchQuery,
  onSearchChange,
  onClearSearch,
  onOpenInfo,
  onGoHome,
  totalItems,
}) {
  const hour = new Date().getHours();
  const isOpenNow = hour >= 8 || hour < 1;

  return (
    <header className="border-b border-[#EBE8E2] bg-white">
      <div className="mx-auto max-w-2xl px-4 pt-3 pb-2.5">
        {/* Top Row: Logo + Brand + Table Badge / Info Action */}
        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onGoHome}
            className="flex min-w-0 items-center gap-3 text-left focus:outline-none active:scale-[0.98] active:opacity-85 transition-transform"
            aria-label="Anasayfaya dön"
          >
            <div className="h-11 w-11 shrink-0 overflow-hidden rounded-xl shadow-xs ring-1 ring-[#CA2F2D]/20">
              <img
                src={logoImg}
                alt={restaurantName}
                width={44}
                height={44}
                className="h-full w-full object-cover"
                loading="eager"
                decoding="async"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1
                  className="truncate text-[21px] leading-tight font-bold tracking-tight text-[#181716]"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {restaurantName}
                </h1>
                {tableNumber && (
                  <span className="shrink-0 rounded-full bg-[#CA2F2D] px-2 py-0.5 text-[10px] font-bold tracking-wide text-white shadow-2xs">
                    Masa {tableNumber}
                  </span>
                )}
              </div>
              <div className="mt-0.5 flex items-center gap-2 text-[11px] font-medium text-[#6B665F]">
                <span
                  className={`inline-flex items-center gap-1 ${
                    isOpenNow ? 'text-emerald-700' : 'text-amber-700'
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      isOpenNow ? 'bg-emerald-500' : 'bg-amber-500'
                    }`}
                  />
                  {isOpenNow ? 'Açık' : 'Kapalı'}
                </span>
                <span className="text-[#D4CFC7]">•</span>
                <span className="inline-flex items-center gap-1">
                  <Clock size={11} className="text-[#9A938A]" />
                  08:00 – 01:00
                </span>
                <span className="hidden text-[#D4CFC7] sm:inline">•</span>
                <span className="hidden sm:inline">{totalItems} Ürün</span>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={onOpenInfo}
            className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl border border-[#E7E3DC] bg-[#FAF9F6] px-3 text-xs font-semibold text-[#272626] transition-colors hover:bg-[#F1EFEA] active:scale-[0.97]"
            aria-label="İşletme Bilgileri"
          >
            <Info size={15} className="text-[#CA2F2D]" />
            <span className="hidden xs:inline sm:inline">Bilgi</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative mt-3">
          <Search
            size={16}
            className="pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-[#9A938A]"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Menüde ara... (örn. Serpme, Burger, Kokteyl)"
            className="h-10 w-full rounded-xl border border-[#E7E3DC] bg-[#F7F6F2] pr-9 pl-10 text-sm text-[#181716] placeholder:text-[#9A938A] transition-all focus:border-[#CA2F2D]/50 focus:bg-white focus:ring-2 focus:ring-[#CA2F2D]/15 focus:outline-none"
            autoComplete="off"
            enterKeyHint="search"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={onClearSearch}
              className="absolute top-1/2 right-2.5 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-[#E5E1D9] text-[#4E4A45] transition-colors hover:bg-[#D8D3C9]"
              aria-label="Aramayı temizle"
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>
    </header>
  );
});

export default Header;
