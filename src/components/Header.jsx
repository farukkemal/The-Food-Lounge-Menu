import { memo } from 'react';
import { Info, Clock } from 'lucide-react';
import logoImg from '../assets/logo.webp';
import { useLanguage } from '../context/LanguageContext';

function TrFlag() {
  return (
    <svg
      width="15"
      height="11"
      viewBox="0 0 30 20"
      aria-hidden="true"
      className="shrink-0 rounded-[2px] ring-1 ring-black/10"
    >
      <rect width="30" height="20" fill="#E30A17" />
      <circle cx="11.5" cy="10" r="5" fill="#FFFFFF" />
      <circle cx="12.9" cy="10" r="4" fill="#E30A17" />
      <polygon
        fill="#FFFFFF"
        points="17.2,10 19.6,10.8 18.1,8.7 18.1,11.3 19.6,9.2"
      />
    </svg>
  );
}

function EnFlag() {
  return (
    <svg
      width="15"
      height="11"
      viewBox="0 0 60 40"
      aria-hidden="true"
      className="shrink-0 rounded-[2px] ring-1 ring-black/10"
    >
      <rect width="60" height="40" fill="#012169" />
      <path d="M0,0 L60,40 M60,0 L0,40" stroke="#FFFFFF" strokeWidth="7" />
      <path d="M0,0 L60,40 M60,0 L0,40" stroke="#C8102E" strokeWidth="3.2" />
      <path d="M30,0 V40 M0,20 H60" stroke="#FFFFFF" strokeWidth="11" />
      <path d="M30,0 V40 M0,20 H60" stroke="#C8102E" strokeWidth="6.5" />
    </svg>
  );
}

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
        <div className="flex items-center justify-between gap-2">
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
                  className="truncate text-[18px] leading-tight font-bold tracking-tight text-[#181716] sm:text-[21px]"
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

          {/* Right: TR / EN Switcher with Flags + Info (i) Button */}
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <div
              role="group"
              aria-label="Language selector"
              className="inline-flex h-10 items-center rounded-xl border border-[#E7E3DC] bg-[#F5F3EE] p-1"
            >
              <button
                type="button"
                onClick={() => setLang('tr')}
                aria-pressed={lang === 'tr'}
                className={`inline-flex h-full items-center gap-1 rounded-lg px-2 text-[11px] font-bold tracking-wide transition-colors active:scale-95 ${
                  lang === 'tr'
                    ? 'bg-[#CA2F2D] text-white shadow-2xs'
                    : 'text-[#6B665F] hover:text-[#181716]'
                }`}
              >
                <TrFlag />
                <span>TR</span>
              </button>
              <button
                type="button"
                onClick={() => setLang('en')}
                aria-pressed={lang === 'en'}
                className={`inline-flex h-full items-center gap-1 rounded-lg px-2 text-[11px] font-bold tracking-wide transition-colors active:scale-95 ${
                  lang === 'en'
                    ? 'bg-[#CA2F2D] text-white shadow-2xs'
                    : 'text-[#6B665F] hover:text-[#181716]'
                }`}
              >
                <EnFlag />
                <span>EN</span>
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
