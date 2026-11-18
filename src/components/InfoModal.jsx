import { memo, useEffect } from 'react';
import { X, MapPin, Clock, Instagram, Facebook } from 'lucide-react';
import logoImg from '../assets/logo.webp';
import GoogleReviewButton from './GoogleReviewButton';
import { useLanguage } from '../context/LanguageContext';

const InfoModal = memo(function InfoModal({ open, restaurant, onClose }) {
  const { strings } = useLanguage();

  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const todayIndex = (new Date().getDay() + 6) % 7;

  return (
    <div
      className="animate-fade-in fixed inset-0 z-50 flex items-end justify-center bg-black/55 backdrop-blur-xs sm:items-center sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={strings.infoAria}
    >
      <div
        className="animate-sheet-up pb-safe relative max-h-[88vh] w-full max-w-lg overflow-y-auto overscroll-y-contain rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-[#EEEAE3] pb-4">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 overflow-hidden rounded-xl shadow-xs ring-1 ring-[#CA2F2D]/20">
              <img
                src={logoImg}
                alt={restaurant.name}
                width={44}
                height={44}
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <h2
                className="text-xl font-bold text-[#181716]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {restaurant.name}
              </h2>
              <p className="text-xs text-[#7A746C]">{strings.infoSubtitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F4F2ED] text-[#4A4641] hover:bg-[#E7E3DC]"
            aria-label={strings.close}
          >
            <X size={18} />
          </button>
        </div>

        {restaurant.address && (
          <div className="mt-5">
            <h3 className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-[#8C857C] uppercase">
              <MapPin size={13} className="text-[#CA2F2D]" />
              {strings.officialAddress}
            </h3>
            <p className="mt-2 rounded-2xl border border-[#ECE8E1] bg-[#FAF9F6] px-3.5 py-3 text-xs leading-relaxed font-medium text-[#2E2C29]">
              {restaurant.address}
            </p>
          </div>
        )}

        {restaurant.workingHours?.length > 0 && (
          <div className="mt-5">
            <h3 className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-[#8C857C] uppercase">
              <Clock size={13} />
              {strings.workingHours}
            </h3>
            <div className="mt-2.5 divide-y divide-[#F2EFE9] rounded-2xl border border-[#ECE8E1] bg-[#FAF9F6] px-3.5">
              {restaurant.workingHours.map((row, idx) => (
                <div
                  key={row.day}
                  className={`flex items-center justify-between py-2.5 text-xs ${
                    idx === todayIndex ? 'font-bold text-[#CA2F2D]' : 'text-[#3F3C38]'
                  }`}
                >
                  <span>{strings.days[row.day] || row.day}</span>
                  <span>{row.hours}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-5">
          <GoogleReviewButton href={restaurant.googleReviewUrl} variant="button" />
        </div>

        <div className="mt-3 flex flex-wrap gap-2.5">
          {restaurant.directionsUrl && (
            <a
              href={restaurant.directionsUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#181716] px-4 py-3 text-xs font-semibold text-white transition-colors hover:bg-[#2E2C29]"
            >
              <MapPin size={15} />
              {strings.getDirections}
            </a>
          )}
          {restaurant.socials?.instagram && (
            <a
              href={restaurant.socials.instagram}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#E7E3DC] bg-[#FAF9F6] px-4 py-3 text-xs font-semibold text-[#181716] hover:bg-[#F1EFEA]"
              aria-label="Instagram"
            >
              <Instagram size={15} className="text-[#CA2F2D]" />
              Instagram
            </a>
          )}
          {restaurant.socials?.facebook && (
            <a
              href={restaurant.socials.facebook}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#E7E3DC] bg-[#FAF9F6] px-3.5 py-3 text-xs font-semibold text-[#181716] hover:bg-[#F1EFEA]"
              aria-label="Facebook"
            >
              <Facebook size={15} className="text-[#1877F2]" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
});

export default InfoModal;
