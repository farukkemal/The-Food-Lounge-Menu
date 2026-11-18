import { memo } from 'react';
import { Info, Clock } from 'lucide-react';
import logoImg from '../assets/logo.webp';
import { useLanguage } from '../context/LanguageContext';

const Header = memo(function Header({
  restaurantName,
  hoursLabel = '08:00 – 24:00',
  tableNumber,
  onOpenInfo,
  onGoHome,
  totalItems,
}) {
  const { lang, setLang, strings } = useLanguage();
  const hour = new Date().getHours();
  const isOpenNow = hour >= 8 && hour < 24;

  return (
    <header className="border-b border-[#EBE8E2] bg-white">
      <div className="mx-auto max-w-2xl px-4 py-3">
        <div className="flex items-center justify-between gap-2.5">
          {/* Left: Brand Logo + Name + Open Status */}
          <button
            type="button"
            onClick={onGoHome}
            className="flex min-w-0 items-center gap-2.5 text-left transition-transform focus:outline-none active:scale-[0.98] active:opacity-85 sm:gap-3"
            aria-label={strings.homeAria}
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
              <div className="flex items-center gap-1.5 sm:gap-2">
                <h1
                  className="truncate text-[19px] leading-tight font-bold tracking-tight text-[#181716] sm:text-[21px]"
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  {restaurantName}
                </h1>
                {tableNumber && (
                  <span className="shrink-0 rounded-full bg-[#CA2F2D] px-2 py-0.5 text-[10px] font-bold tracking-wide text-white shadow-2xs">
                    {strings.table} {tableNumber}
                  </span>
                )}
              </div>
              <div className="mt-0.5 flex items-center gap-1.5 text-[11px] font-medium text-[#6B665F] sm:gap-2">
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
                  {isOpenNow ? strings.open : strings.closed}
                </span>
                <span className="text-[#D4CFC7]">•</span>
                <span className="inline-flex items-center gap-1">
                  <Clock size={11} className="text-[#9A938A]" />
                  {hoursLabel}
                </span>
                <span className="hidden text-[#D4CFC7] sm:inline">•</span>
                <span className="hidden sm:inline">
                  {totalItems} {strings.itemsCount}
                </span>
              </div>
            </div>
          </button>

          {/* Right: TR / EN Switcher + Info (i) Button */}
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            {/* TR / EN Language Selector immediately to the left of Info button */}
            <div
              role="group"
              aria-label="Language selector"
              className="inline-flex h-10 items-center rounded-xl border border-[#E7E3DC] bg-[#F5F3EE] p-1"
            >
              <button
                type="button"
                onClick={() => setLang('tr')}
                aria-pressed={lang === 'tr'}
                className={`h-full rounded-lg px-2.5 text-[11px] font-bold tracking-wide transition-colors active:scale-95 ${
                  lang === 'tr'
                    ? 'bg-[#CA2F2D] text-white shadow-2xs'
                    : 'text-[#6B665F] hover:text-[#181716]'
                }`}
              >
                TR
              </button>
              <button
                type="button"
                onClick={() => setLang('en')}
                aria-pressed={lang === 'en'}
                className={`h-full rounded-lg px-2.5 text-[11px] font-bold tracking-wide transition-colors active:scale-95 ${
                  lang === 'en'
                    ? 'bg-[#CA2F2D] text-white shadow-2xs'
                    : 'text-[#6B665F] hover:text-[#181716]'
                }`}
              >
                EN
              </button>
            </div>

            <button
              type="button"
              onClick={onOpenInfo}
              className="inline-flex h-10 shrink-0 items-center gap-1.5 rounded-xl border border-[#E7E3DC] bg-[#FAF9F6] px-2.5 text-xs font-semibold text-[#272626] transition-colors hover:bg-[#F1EFEA] active:scale-[0.97] sm:px-3"
              aria-label={strings.infoAria}
            >
              <Info size={15} className="text-[#CA2F2D]" />
              <span className="hidden sm:inline">{strings.info}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
});

export default Header;
