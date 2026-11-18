import { memo, useEffect, useState } from 'react';
import logoImg from '../assets/logo.webp';
import { useLanguage } from '../context/LanguageContext';
import { LanguageFlag, SUPPORTED_LANGUAGES } from './LanguageFlags';

const MIN_LOADING_MS = 1100;
const MAX_LOADING_MS = 2600;
const FADE_OUT_MS = 400;

/**
 * 2-Stage Branded Crimson Opening Flow:
 * 1) 'select'  -> User selects preferred language (TR, EN, AR, ZH, RU) on crimson screen
 * 2) 'loading' -> Branded crimson loading screen with logo + spinner while locale & data settle
 * 3) 'exiting' -> Smooth GPU fade-out revealing the menu in the selected language
 */
const SplashScreen = memo(function SplashScreen({ isReady }) {
  const { lang, setLang, localeReady, strings } = useLanguage();
  const [phase, setPhase] = useState('select'); // 'select' | 'loading' | 'exiting' | 'done'
  const [minElapsed, setMinElapsed] = useState(false);
  const [forceRelease, setForceRelease] = useState(false);

  const handleSelectLanguage = (code) => {
    setLang(code);
    setMinElapsed(false);
    setForceRelease(false);
    setPhase('loading');
  };

  // Start minimum & maximum loading timers once language is selected
  useEffect(() => {
    if (phase !== 'loading') return;
    const minTimer = window.setTimeout(() => setMinElapsed(true), MIN_LOADING_MS);
    const maxTimer = window.setTimeout(() => setForceRelease(true), MAX_LOADING_MS);
    return () => {
      window.clearTimeout(minTimer);
      window.clearTimeout(maxTimer);
    };
  }, [phase]);

  // Begin smooth fade-out once menu data + selected language bundle + min duration are all ready
  useEffect(() => {
    if (phase !== 'loading') return;
    if ((isReady && localeReady && minElapsed) || forceRelease) {
      setPhase('exiting');
    }
  }, [phase, isReady, localeReady, minElapsed, forceRelease]);

  // Unmount cleanly after fade-out
  useEffect(() => {
    if (phase !== 'exiting') return;
    const hideTimer = window.setTimeout(() => setPhase('done'), FADE_OUT_MS);
    return () => window.clearTimeout(hideTimer);
  }, [phase]);

  // Lock page scroll while splash covers the screen
  useEffect(() => {
    if (phase === 'exiting' || phase === 'done') {
      document.body.style.overflow = '';
      return;
    }
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [phase]);

  if (phase === 'done') return null;

  return (
    <div
      dir="ltr"
      role={phase === 'loading' ? 'status' : 'dialog'}
      aria-modal={phase === 'select' ? 'true' : undefined}
      aria-label="The Food Lounge"
      style={{
        background:
          'radial-gradient(circle at 50% 38%, #D93836 0%, #CA2F2D 48%, #9B1C1A 100%)',
        willChange: 'opacity, transform',
      }}
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-y-auto px-5 py-8 text-white select-none transition-all duration-[400ms] ease-out ${
        phase === 'exiting'
          ? 'pointer-events-none scale-[1.03] opacity-0'
          : 'scale-100 opacity-100'
      }`}
    >
      {/* Subtle ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute h-72 w-72 rounded-full bg-white/10 blur-3xl"
      />

      <div className="animate-splash-logo relative flex w-full max-w-sm flex-col items-center">
        {/* Centered Brand Logo */}
        <div
          className={`overflow-hidden rounded-full bg-[#CA2F2D] shadow-[0_20px_50px_rgba(0,0,0,0.3)] ring-2 ring-white/30 transition-all duration-300 ${
            phase === 'select' ? 'h-30 w-30 sm:h-36 sm:w-36' : 'h-36 w-36 sm:h-44 sm:w-44'
          }`}
        >
          <img
            src={logoImg}
            alt="The Food Lounge"
            width={176}
            height={176}
            loading="eager"
            decoding="sync"
            fetchPriority="high"
            className="h-full w-full scale-[1.04] object-cover"
          />
        </div>

        {/* Stage 1: Language Picker */}
        {phase === 'select' ? (
          <div className="animate-fade-in mt-6 w-full text-center">
            <h1
              className="text-2xl font-bold tracking-wide text-white sm:text-[26px]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              The Food Lounge
            </h1>
            <p className="mt-1 text-[11px] font-semibold tracking-[0.18em] text-white/80 uppercase">
              Dil Seçiniz • Select Language
            </p>

            <div className="mt-5 grid grid-cols-2 gap-2.5">
              {SUPPORTED_LANGUAGES.map((item, idx) => {
                const isLastSelected = lang === item.code;
                const isFirst = idx === 0;
                return (
                  <button
                    key={item.code}
                    type="button"
                    onClick={() => handleSelectLanguage(item.code)}
                    className={`flex items-center justify-between rounded-2xl border px-3.5 py-2.5 text-left transition-transform duration-150 active:scale-[0.97] ${
                      isFirst ? 'col-span-2 py-3 px-4' : ''
                    } ${
                      isLastSelected
                        ? 'border-white bg-white text-[#181716] shadow-[0_8px_24px_rgba(0,0,0,0.2)]'
                        : 'border-white/28 bg-white/12 text-white hover:bg-white/20'
                    }`}
                  >
                    <span className="flex min-w-0 items-center gap-2.5">
                      <LanguageFlag code={item.code} width={20} height={14} />
                      <span className="truncate text-[14px] font-bold tracking-wide">
                        {item.nativeName}
                      </span>
                    </span>
                    <span
                      className={`shrink-0 rounded-lg px-1.5 py-0.5 text-[10.5px] font-bold tracking-wider ${
                        isLastSelected
                          ? 'bg-[#CA2F2D]/12 text-[#CA2F2D]'
                          : 'bg-black/20 text-white/90'
                      }`}
                    >
                      {item.short}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* Stage 2: Crimson Loading Spinner */
          <div className="animate-fade-in mt-8 flex flex-col items-center gap-3.5">
            <div
              aria-hidden="true"
              className="h-9 w-9 animate-spin rounded-full border-[3px] border-white/25 border-t-white border-r-white/75"
            />
            <span className="text-xs font-semibold tracking-[0.18em] text-white/90 uppercase">
              {strings.preparingMenu}
            </span>
          </div>
        )}
      </div>
    </div>
  );
});

export default SplashScreen;
