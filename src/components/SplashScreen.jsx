import { memo, useEffect, useState } from 'react';
import logoImg from '../assets/logo.webp';
import { useLanguage } from '../context/LanguageContext';

const MIN_DISPLAY_MS = 1200;
const MAX_WAIT_MS = 2400;
const FADE_OUT_MS = 420;

const SplashScreen = memo(function SplashScreen({ isReady }) {
  const { strings } = useLanguage();
  const [minElapsed, setMinElapsed] = useState(false);
  const [forceRelease, setForceRelease] = useState(false);
  const [exiting, setExiting] = useState(false);
  const [unmounted, setUnmounted] = useState(false);

  // Enforce smooth minimum display time (~1.2s) & safety max ceiling
  useEffect(() => {
    const minTimer = window.setTimeout(() => setMinElapsed(true), MIN_DISPLAY_MS);
    const maxTimer = window.setTimeout(() => setForceRelease(true), MAX_WAIT_MS);
    return () => {
      window.clearTimeout(minTimer);
      window.clearTimeout(maxTimer);
    };
  }, []);

  // Begin smooth GPU fade-out once both data state is ready and min display time elapsed
  useEffect(() => {
    if (exiting || unmounted) return;
    if ((isReady && minElapsed) || forceRelease) {
      setExiting(true);
    }
  }, [isReady, minElapsed, forceRelease, exiting, unmounted]);

  // Unmount cleanly after fade-out completes (zero DOM overhead afterwards)
  useEffect(() => {
    if (!exiting) return;
    const hideTimer = window.setTimeout(() => setUnmounted(true), FADE_OUT_MS);
    return () => window.clearTimeout(hideTimer);
  }, [exiting]);

  // Lock background scroll only while splash is covering the screen
  useEffect(() => {
    if (unmounted || exiting) {
      document.body.style.overflow = '';
      return;
    }
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [exiting, unmounted]);

  if (unmounted) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="The Food Lounge dijital menü yükleniyor"
      style={{
        background:
          'radial-gradient(circle at 50% 44%, #D93836 0%, #CA2F2D 48%, #9B1C1A 100%)',
        willChange: 'opacity, transform',
      }}
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center px-6 text-white select-none transition-all duration-[420ms] ease-out ${
        exiting
          ? 'pointer-events-none scale-[1.03] opacity-0'
          : 'scale-100 opacity-100'
      }`}
    >
      {/* Subtle ambient glow behind the brand medallion */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute h-72 w-72 rounded-full bg-white/10 blur-3xl"
      />

      <div className="animate-splash-logo relative flex flex-col items-center">
        {/* Centered Brand Logo */}
        <div className="h-36 w-36 overflow-hidden rounded-full bg-[#CA2F2D] shadow-[0_20px_50px_rgba(0,0,0,0.3)] ring-2 ring-white/30 sm:h-44 sm:w-44">
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

        {/* Modern Smooth Circular Spinner Directly Below Logo */}
        <div className="mt-8 flex flex-col items-center gap-3">
          <div
            aria-hidden="true"
            className="h-9 w-9 animate-spin rounded-full border-[3px] border-white/25 border-t-white border-r-white/75"
          />
          <span className="text-[11px] font-semibold tracking-[0.22em] text-white/85 uppercase">
            {strings.preparingMenu}
          </span>
        </div>
      </div>
    </div>
  );
});

export default SplashScreen;
