import { memo } from 'react';

export const SUPPORTED_LANGUAGES = [
  { code: 'tr', short: 'TR', nativeName: 'Türkçe', dir: 'ltr' },
  { code: 'en', short: 'EN', nativeName: 'English', dir: 'ltr' },
  { code: 'de', short: 'DE', nativeName: 'Deutsch', dir: 'ltr' },
  { code: 'es', short: 'ES', nativeName: 'Español', dir: 'ltr' },
  { code: 'ru', short: 'RU', nativeName: 'Русский', dir: 'ltr' },
  { code: 'ar', short: 'AR', nativeName: 'العربية', dir: 'rtl' },
  { code: 'zh', short: 'ZH', nativeName: '中文', dir: 'ltr' },
];

export const LanguageFlag = memo(function LanguageFlag({
  code,
  width = 18,
  height = 13,
  className = '',
}) {
  const baseClass = `shrink-0 rounded-[2px] ring-1 ring-black/15 ${className}`;

  if (code === 'tr') {
    return (
      <svg width={width} height={height} viewBox="0 0 30 20" aria-hidden="true" className={baseClass}>
        <rect width="30" height="20" fill="#E30A17" />
        <circle cx="11.5" cy="10" r="5" fill="#FFFFFF" />
        <circle cx="12.9" cy="10" r="4" fill="#E30A17" />
        <polygon fill="#FFFFFF" points="17.2,10 19.6,10.8 18.1,8.7 18.1,11.3 19.6,9.2" />
      </svg>
    );
  }

  if (code === 'en') {
    return (
      <svg width={width} height={height} viewBox="0 0 60 40" aria-hidden="true" className={baseClass}>
        <rect width="60" height="40" fill="#012169" />
        <path d="M0,0 L60,40 M60,0 L0,40" stroke="#FFFFFF" strokeWidth="7" />
        <path d="M0,0 L60,40 M60,0 L0,40" stroke="#C8102E" strokeWidth="3.2" />
        <path d="M30,0 V40 M0,20 H60" stroke="#FFFFFF" strokeWidth="11" />
        <path d="M30,0 V40 M0,20 H60" stroke="#C8102E" strokeWidth="6.5" />
      </svg>
    );
  }

  if (code === 'de') {
    return (
      <svg width={width} height={height} viewBox="0 0 30 20" aria-hidden="true" className={baseClass}>
        <rect width="30" height="6.67" y="0" fill="#000000" />
        <rect width="30" height="6.67" y="6.67" fill="#DD0000" />
        <rect width="30" height="6.67" y="13.33" fill="#FFCE00" />
      </svg>
    );
  }

  if (code === 'es') {
    return (
      <svg width={width} height={height} viewBox="0 0 30 20" aria-hidden="true" className={baseClass}>
        <rect width="30" height="5" y="0" fill="#AA151B" />
        <rect width="30" height="10" y="5" fill="#F1BF00" />
        <rect width="30" height="5" y="15" fill="#AA151B" />
        <rect x="7.5" y="7.5" width="3.5" height="5" rx="0.8" fill="#AA151B" />
        <circle cx="9.25" cy="9.5" r="0.9" fill="#F1BF00" />
      </svg>
    );
  }

  if (code === 'ar') {
    return (
      <svg width={width} height={height} viewBox="0 0 30 20" aria-hidden="true" className={baseClass}>
        <rect width="30" height="20" fill="#006C35" />
        <path d="M7.5 8.2h15M9 10.6h12" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M9 14h11.5" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M19.5 13l1.5 1-1.5 1" fill="none" stroke="#FFFFFF" strokeWidth="1" />
      </svg>
    );
  }

  if (code === 'zh') {
    return (
      <svg width={width} height={height} viewBox="0 0 30 20" aria-hidden="true" className={baseClass}>
        <rect width="30" height="20" fill="#DE2910" />
        <polygon
          fill="#FFDE00"
          points="5.5,3 6.3,5.5 8.9,5.5 6.8,7 7.6,9.5 5.5,8 3.4,9.5 4.2,7 2.1,5.5 4.7,5.5"
        />
        <circle cx="11" cy="3.2" r="0.9" fill="#FFDE00" />
        <circle cx="12.7" cy="5.2" r="0.9" fill="#FFDE00" />
        <circle cx="12.7" cy="7.8" r="0.9" fill="#FFDE00" />
        <circle cx="11" cy="9.8" r="0.9" fill="#FFDE00" />
      </svg>
    );
  }

  // ru
  return (
    <svg width={width} height={height} viewBox="0 0 30 20" aria-hidden="true" className={baseClass}>
      <rect width="30" height="6.67" y="0" fill="#FFFFFF" />
      <rect width="30" height="6.67" y="6.67" fill="#0039A6" />
      <rect width="30" height="6.67" y="13.33" fill="#D52B1E" />
    </svg>
  );
});
