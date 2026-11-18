import { memo, useEffect, useRef, useState } from 'react';
import { Info, Clock, ChevronDown, Check } from 'lucide-react';
import logoImg from '../assets/logo.webp';
import { useLanguage } from '../context/LanguageContext';
import { LanguageFlag, SUPPORTED_LANGUAGES } from './LanguageFlags';

const Header = memo(function Header({
  restaurantName,
  hoursLabel = '08:00 – 24:00',
  tableNumber,
  onOpenInfo,
  onGoHome,
  totalItems,
}) {
  const { lang, setLang, strings } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  const hour = new Date().getHours();
  const isOpenNow = hour >= 8 && hour < 24;
  const activeLangMeta =
    SUPPORTED_LANGUAGES.find((l) => l.code === lang) || SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    if (!menuOpen) return;
    const handleOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    const handleEsc = (e) => {
      if (e.key === 'Escape') setMenuOpen(false);
    };
    document.addEventListener('pointerdown', handleOutside);
    window.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('pointerdown', handleOutside);
      window.removeEventListener('keydown', handleEsc);
    };
  }, [menuOpen]);

  return (
    <header className="border-b border-[#EBE8E2] bg-white">
      <div className="mx-auto max-w-2xl px-4 py-3">
        <div className="flex items-center justify-between gap-2">
          {/* Brand Logo + Name + Open Status */}
          <button
            type="button"
            onClick={onGoHome}
            className="flex min-w-0 items-center gap-2.5 text-start transition-transform focus:outline-none active:scale-[0.98] active:opacity-85 sm:gap-3"
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
                <span className="inline-flex items-center gap-1" dir="ltr">
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

          {/* Right: 5-Language Switcher Dropdown + Info (i) Button */}
          <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
            <div ref={dropdownRef} className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((o) => !o)}
                aria-haspopup="listbox"
                aria-expanded={menuOpen}
                aria-label="Language selector"
                className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-[#E7E3DC] bg-[#FAF9F6] px-2.5 text-xs font-bold text-[#181716] transition-colors hover:border-[#CA2F2D]/40 hover:bg-[#F1EFEA] active:scale-[0.97]"
              >
                <LanguageFlag code={activeLangMeta.code} width={16} height={12} />
                <span>{activeLangMeta.short}</span>
                <ChevronDown
                  size={13}
                  className={`text-[#8C857C] transition-transform duration-150 ${
                    menuOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {menuOpen && (
                <div
                  role="listbox"
                  aria-label="Languages"
                  dir="ltr"
                  className="animate-fade-in absolute end-0 top-12 z-50 w-44 overflow-hidden rounded-2xl border border-[#E7E3DC] bg-white p-1.5 shadow-[0_14px_34px_rgba(24,23,22,0.14)]"
                >
                  {SUPPORTED_LANGUAGES.map((item) => {
                    const isActive = item.code === lang;
                    return (
                      <button
                        key={item.code}
                        type="button"
                        role="option"
                        aria-selected={isActive}
                        onClick={() => {
                          setLang(item.code);
                          setMenuOpen(false);
                        }}
                        className={`flex w-full items-center justify-between gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition-colors ${
                          isActive
                            ? 'bg-[#CA2F2D] text-white'
                            : 'text-[#272626] hover:bg-[#F5F3EE]'
                        }`}
                      >
                        <span className="flex items-center gap-2.5">
                          <LanguageFlag code={item.code} width={17} height={12} />
                          <span>{item.nativeName}</span>
                        </span>
                        {isActive && <Check size={13} strokeWidth={2.6} />}
                      </button>
                    );
                  })}
                </div>
              )}
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
