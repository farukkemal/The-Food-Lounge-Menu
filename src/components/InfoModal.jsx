import { memo, useEffect } from 'react';
import { X, MapPin, Clock, Instagram, Facebook, CheckCircle2 } from 'lucide-react';
import logoImg from '../assets/logo.webp';

const InfoModal = memo(function InfoModal({ open, restaurant, onClose }) {
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

  const todayIndex = (new Date().getDay() + 6) % 7; // Monday = 0

  return (
    <div
      className="animate-fade-in fixed inset-0 z-50 flex items-end justify-center bg-black/55 backdrop-blur-xs sm:items-center sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="İşletme Bilgileri"
    >
      <div
        className="animate-sheet-up pb-safe relative max-h-[88vh] w-full max-w-lg overflow-y-auto overscroll-y-contain rounded-t-3xl bg-white p-5 shadow-2xl sm:rounded-3xl sm:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-[#EEEAE3]">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 overflow-hidden rounded-xl shadow-xs ring-1 ring-[#CA2F2D]/20">
              <img src={logoImg} alt={restaurant.name} className="h-full w-full object-cover" />
            </div>
            <div>
              <h2
                className="text-xl font-bold text-[#181716]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {restaurant.name}
              </h2>
              <p className="text-xs text-[#7A746C]">İşletme Bilgileri & Çalışma Saatleri</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F4F2ED] text-[#4A4641] hover:bg-[#E7E3DC]"
            aria-label="Kapat"
          >
            <X size={18} />
          </button>
        </div>

        {/* Features */}
        {restaurant.features?.length > 0 && (
          <div className="mt-5">
            <h3 className="text-xs font-bold tracking-wider text-[#8C857C] uppercase">
              İşletme Özellikleri
            </h3>
            <div className="mt-2.5 flex flex-wrap gap-2">
              {restaurant.features.map((feat) => (
                <span
                  key={feat}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-[#ECE8E1] bg-[#FAF9F6] px-3 py-1.5 text-xs font-medium text-[#2E2C29]"
                >
                  <CheckCircle2 size={13} className="text-[#CA2F2D]" />
                  {feat}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Working Hours */}
        {restaurant.workingHours?.length > 0 && (
          <div className="mt-5">
            <h3 className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-[#8C857C] uppercase">
              <Clock size={13} />
              Çalışma Saatleri
            </h3>
            <div className="mt-2.5 divide-y divide-[#F2EFE9] rounded-2xl border border-[#ECE8E1] bg-[#FAF9F6] px-3.5">
              {restaurant.workingHours.map((row, idx) => (
                <div
                  key={row.day}
                  className={`flex items-center justify-between py-2.5 text-xs ${
                    idx === todayIndex ? 'font-bold text-[#CA2F2D]' : 'text-[#3F3C38]'
                  }`}
                >
                  <span>{row.day}</span>
                  <span>{row.hours}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="mt-5 flex flex-wrap gap-2.5">
          {restaurant.directionsUrl && (
            <a
              href={restaurant.directionsUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#181716] px-4 py-3 text-xs font-semibold text-white transition-colors hover:bg-[#2E2C29]"
            >
              <MapPin size={15} />
              Yol Tarifi Al
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
