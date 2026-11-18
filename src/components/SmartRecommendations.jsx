import { memo, useEffect, useMemo, useRef } from 'react';
import {
  Sun,
  Utensils,
  Wine,
  Sparkles,
  ChevronRight,
  Plus,
  Clock,
  Tag,
} from 'lucide-react';
import {
  TIME_SLOT_IDS,
  TIME_SLOT_LIST,
  useTimeSlot,
} from '../hooks/useTimeSlot';
import { getRecommendationsForSlot } from '../services/recommendationEngine';
import { useMenu } from '../context/MenuContext';
import LazyImage from './LazyImage';

const SLOT_ICONS = {
  [TIME_SLOT_IDS.MORNING]: Sun,
  [TIME_SLOT_IDS.AFTERNOON]: Utensils,
  [TIME_SLOT_IDS.EVENING]: Wine,
};

const SpotlightHeroCard = memo(function SpotlightHeroCard({
  spotlight,
  isMorning,
  onSelectItem,
}) {
  if (!spotlight?.item) return null;
  const { item, badge, highlightNote } = spotlight;

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => onSelectItem(item)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelectItem(item);
        }
      }}
      className="gpu-card group relative mt-3.5 cursor-pointer overflow-hidden rounded-3xl bg-[#181716] ring-1 ring-black/8 transition-transform duration-150 active:scale-[0.985]"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden sm:aspect-[16/9]">
        <LazyImage
          src={item.image}
          alt={item.title}
          width={640}
          height={400}
          sizes="(max-width: 672px) 94vw, 640px"
          priority
          containerClassName="h-full w-full"
          fallbackIconSize={34}
        />

        {/* Editorial Gradient Scrim */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/88 via-black/35 to-transparent" />

        {/* Top Badges (no backdrop-blur for 60 FPS scroll) */}
        <div className="absolute inset-x-3.5 top-3.5 flex items-center justify-between gap-2">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide text-white ${
              isMorning ? 'bg-amber-600' : 'bg-[#CA2F2D]'
            }`}
          >
            <Sparkles size={11} />
            {badge}
          </span>
          {item.calories && (
            <span className="rounded-full bg-black/72 px-2.5 py-1 text-[11px] font-medium text-white">
              {item.calories}
            </span>
          )}
        </div>

        {/* Bottom Content Overlay */}
        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
          {highlightNote && (
            <p className="text-[11px] font-medium tracking-wide text-white/80">
              {highlightNote}
            </p>
          )}
          <div className="mt-1 flex items-end justify-between gap-3">
            <div className="min-w-0">
              <h3
                className="truncate text-[23px] leading-tight font-bold text-white drop-shadow-xs sm:text-[26px]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {item.title}
              </h3>
              {item.description && (
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-white/82">
                  {item.description}
                </p>
              )}
            </div>
            <span className="shrink-0 rounded-2xl bg-white px-3.5 py-2 text-sm font-extrabold tracking-tight text-[#CA2F2D] shadow-md">
              {item.priceFormatted}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
});

const CuratedSlideCard = memo(function CuratedSlideCard({ item, index, onSelectItem }) {
  return (
    <article
      role="button"
      tabIndex={0}
      onClick={() => onSelectItem(item)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelectItem(item);
        }
      }}
      className="gpu-card snap-card group flex w-[68vw] max-w-[248px] shrink-0 cursor-pointer flex-col overflow-hidden rounded-2xl border border-[#EAE6DF] bg-white transition-transform duration-150 active:scale-[0.975]"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        <LazyImage
          src={item.image}
          alt={item.title}
          width={248}
          height={186}
          sizes="248px"
          priority={index < 2}
          containerClassName="h-full w-full"
        />
        <span className="absolute top-2.5 left-2.5 rounded-full bg-black/72 px-2.5 py-0.5 text-[10px] font-semibold tracking-wide text-white">
          {item.recommendationTag}
        </span>
      </div>

      <div className="flex flex-1 flex-col justify-between p-3">
        <div>
          <h4 className="line-clamp-1 text-[13.5px] font-bold text-[#1C1B1A] transition-colors group-hover:text-[#CA2F2D]">
            {item.title}
          </h4>
          {item.description && (
            <p className="mt-1 line-clamp-2 text-[11.5px] leading-snug text-[#736D65]">
              {item.description}
            </p>
          )}
        </div>

        <div className="mt-2.5 flex items-center justify-between border-t border-[#F3F0EA] pt-2">
          <span className="text-[14px] font-bold text-[#CA2F2D]">
            {item.priceFormatted}
          </span>
          {item.calories && (
            <span className="text-[10.5px] font-medium text-[#918A81]">
              {item.calories}
            </span>
          )}
        </div>
      </div>
    </article>
  );
});

const PairingSlideCard = memo(function PairingSlideCard({
  pairing,
  index,
  onSelectItem,
}) {
  const {
    food,
    cocktail,
    badge,
    accentLabel,
    headline,
    sommelierNote,
    regularTotalFormatted,
    comboPriceFormatted,
    savingsFormatted,
    discountPercent,
  } = pairing;

  const hasDiscount = discountPercent > 0 && Boolean(savingsFormatted);

  return (
    <article className="gpu-card snap-card flex w-[85vw] max-w-[360px] shrink-0 flex-col overflow-hidden rounded-3xl bg-[#1A1918] text-white ring-1 ring-white/10">
      {/* Top Steak Visual */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => onSelectItem(food)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelectItem(food);
          }
        }}
        className="group relative aspect-[16/10] w-full cursor-pointer overflow-hidden"
      >
        <LazyImage
          src={food.image}
          alt={headline}
          width={360}
          height={225}
          sizes="360px"
          priority={index < 2}
          containerClassName="h-full w-full"
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#1A1918] via-black/35 to-transparent" />

        <div className="absolute inset-x-3 top-3 flex items-center justify-between gap-2">
          <span className="inline-flex items-center gap-1 rounded-full bg-[#CA2F2D] px-2.5 py-1 text-[10.5px] font-bold tracking-wide text-white">
            {hasDiscount ? <Tag size={11} /> : <Wine size={11} />}
            {badge}
          </span>
          <span className="rounded-full bg-black/72 px-2.5 py-1 text-[10.5px] font-semibold text-amber-200">
            {accentLabel}
          </span>
        </div>

        <div className="absolute inset-x-0 bottom-0 px-4 pb-2.5">
          <h3
            className="text-[20px] leading-snug font-bold text-white"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {headline}
          </h3>
        </div>
      </div>

      {/* Pairing Body */}
      <div className="flex flex-1 flex-col justify-between p-4 pt-2">
        <p className="text-[12px] leading-relaxed text-[#C7C1B8]">
          {sommelierNote}
        </p>

        {/* Interactive Paired Items */}
        <div className="mt-3.5 space-y-2">
          <button
            type="button"
            onClick={() => onSelectItem(food)}
            className="flex w-full items-center justify-between gap-2 rounded-2xl border border-white/10 bg-white/6 px-3 py-2.5 text-left transition-all hover:bg-white/12 active:scale-[0.98]"
          >
            <div className="min-w-0">
              <span className="block text-[10px] font-semibold tracking-wider text-amber-300/90 uppercase">
                Özel Soslu Biftek / Steak
              </span>
              <span className="block truncate text-xs font-bold text-white">
                {food.title}
              </span>
            </div>
            <span className="shrink-0 text-xs font-bold text-white/95">
              {food.priceFormatted}
            </span>
          </button>

          <div className="flex items-center justify-center">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#CA2F2D]/25 text-[#F0716F]">
              <Plus size={12} strokeWidth={2.5} />
            </span>
          </div>

          <button
            type="button"
            onClick={() => onSelectItem(cocktail)}
            className="flex w-full items-center justify-between gap-2 rounded-2xl border border-white/10 bg-white/6 px-3 py-2.5 text-left transition-all hover:bg-white/12 active:scale-[0.98]"
          >
            <div className="min-w-0">
              <span className="block text-[10px] font-semibold tracking-wider text-[#F28482] uppercase">
                İmza Kokteyl
              </span>
              <span className="block truncate text-xs font-bold text-white">
                {cocktail.title}
              </span>
              {cocktail.description && (
                <span className="block truncate text-[10.5px] text-[#A9A299]">
                  {cocktail.description}
                </span>
              )}
            </div>
            <span className="shrink-0 text-xs font-bold text-white/95">
              {cocktail.priceFormatted}
            </span>
          </button>
        </div>

        {/* Dynamic Live Pricing Footer */}
        {comboPriceFormatted && (
          <div className="mt-3.5 flex items-end justify-between gap-2 border-t border-white/10 pt-3">
            <div>
              <span className="block text-[10.5px] font-medium text-[#A9A299]">
                {hasDiscount ? 'Kombo Özel Fiyatı' : 'Özel Tavsiye Toplam'}
              </span>
              {hasDiscount && (
                <span className="mt-0.5 inline-flex items-center rounded-md bg-emerald-500/18 px-1.5 py-0.5 text-[10px] font-bold text-emerald-300">
                  {savingsFormatted} Avantaj
                </span>
              )}
            </div>
            <div className="text-right">
              {hasDiscount && regularTotalFormatted && (
                <span className="block text-[11px] font-medium text-[#8F8980] line-through">
                  {regularTotalFormatted}
                </span>
              )}
              <span className="text-lg leading-none font-extrabold tracking-tight text-amber-300">
                {comboPriceFormatted}
              </span>
            </div>
          </div>
        )}
      </div>
    </article>
  );
});

const SmartRecommendations = memo(function SmartRecommendations({
  onSelectItem,
  onNavigateCategory,
}) {
  const { activeSlot, currentTimeLabel } = useTimeSlot();

  const { index: menuIndex } = useMenu();
  const carouselRef = useRef(null);

  const data = useMemo(
    () => getRecommendationsForSlot(activeSlot, menuIndex),
    [activeSlot, menuIndex]
  );

  // Instant scroll reset on automatic time-slot boundary change
  useEffect(() => {
    if (carouselRef.current) {
      carouselRef.current.scrollLeft = 0;
    }
  }, [activeSlot]);

  const isEvening = activeSlot === TIME_SLOT_IDS.EVENING;
  const isMorning = activeSlot === TIME_SLOT_IDS.MORNING;

  return (
    <section
      aria-label="Saat Bazlı Akıllı Öneriler"
      className="pt-4 pb-2"
    >
      {/* Header Container */}
      <div className="px-4">
        {/* Top Row: Live System Clock + Read-Only Automatic Time-Slot Indicator */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="inline-flex select-none items-center gap-1.5 rounded-full border border-[#E7E3DC] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#4F4A44] shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            <Clock size={11} className="text-[#8E877E]" />
            <span>{currentTimeLabel}</span>
          </div>

          {/* Non-Interactive Visual Status Indicator (Strict System Clock Mode) */}
          <div
            aria-label="Aktif zaman dilimi göstergesi"
            className="pointer-events-none inline-flex select-none items-center rounded-full border border-[#E5E1D9] bg-[#EFECE6]/90 p-0.5"
          >
            {TIME_SLOT_LIST.map((slot) => {
              const Icon = SLOT_ICONS[slot.id];
              const isCurrent = activeSlot === slot.id;
              return (
                <span
                  key={slot.id}
                  aria-current={isCurrent ? 'time' : undefined}
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all ${
                    isCurrent
                      ? 'bg-[#181716] text-white shadow-[0_2px_8px_rgba(24,23,22,0.22)] ring-1 ring-white/15'
                      : 'text-[#9A938A] opacity-65'
                  }`}
                >
                  <Icon size={11} />
                  <span>{slot.shortLabel}</span>
                  {isCurrent && (
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  )}
                </span>
              );
            })}
          </div>
        </div>

        {/* Animated Slot Body */}
        <div key={activeSlot} className="animate-fade-in">
          {/* Section Heading */}
          <div className="mt-3">
            <p className="text-[11px] font-bold tracking-[0.14em] text-[#CA2F2D] uppercase">
              {data.eyebrow}
            </p>
            <h2
              className="mt-0.5 text-[27px] leading-tight font-bold text-[#181716]"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {data.title}
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-[#6E6860]">
              {data.subtitle}
            </p>
          </div>

          {/* Hero Spotlight for Morning & Afternoon */}
          {data.mode === 'featured' && data.spotlight && (
            <SpotlightHeroCard
              spotlight={data.spotlight}
              isMorning={isMorning}
              onSelectItem={onSelectItem}
            />
          )}
        </div>
      </div>

      {/* Horizontal Momentum-Scroll Carousel */}
      {data.mode === 'featured' ? (
        <div key={`carousel-${activeSlot}`} className="animate-fade-in mt-3.5">
          <div className="mb-2 flex items-center justify-between px-4">
            <span className="text-[11px] font-bold tracking-wider text-[#8C857C] uppercase">
              {isMorning ? 'Kahvaltı Grubu Öne Çıkanlar' : 'Dünya Mutfağı Öne Çıkanlar'}
            </span>
            <span className="text-[11px] font-medium text-[#A19A91]">
              Kaydır →
            </span>
          </div>
          <div
            ref={carouselRef}
            className="gpu-list no-scrollbar touch-scroll-x flex gap-3 overflow-x-auto px-4 pb-2"
          >
            {data.items.map((item, idx) => (
              <CuratedSlideCard
                key={item.id}
                item={item}
                index={idx}
                onSelectItem={onSelectItem}
              />
            ))}
          </div>
        </div>
      ) : (
        <div key={`carousel-${activeSlot}`} className="animate-fade-in mt-3.5">
          <div className="mb-2 flex items-center justify-between px-4">
            <span className="text-[11px] font-bold tracking-wider text-[#8C857C] uppercase">
              Avantajlı Steak & Kokteyl Komboları ({data.pairings.length})
            </span>
            <span className="text-[11px] font-medium text-[#A19A91]">
              Kaydır →
            </span>
          </div>
          <div
            ref={carouselRef}
            className="gpu-list no-scrollbar touch-scroll-x flex gap-3.5 overflow-x-auto px-4 pb-2"
          >
            {data.pairings.map((pairing, idx) => (
              <PairingSlideCard
                key={pairing.id}
                pairing={pairing}
                index={idx}
                onSelectItem={onSelectItem}
              />
            ))}
          </div>
        </div>
      )}

      {/* Quick Category Jump Chips */}
      {data.quickLinks?.length > 0 && (
        <div className="no-scrollbar touch-scroll-free mt-2.5 flex items-center gap-2 overflow-x-auto px-4 pb-2">
          {data.quickLinks.map((link) => (
            <button
              key={`${link.categoryId}-${link.subcategory || 'all'}`}
              type="button"
              onClick={() =>
                onNavigateCategory(link.categoryId, link.subcategory || null)
              }
              className={`inline-flex shrink-0 items-center gap-1 rounded-xl px-3.5 py-2 text-xs font-semibold transition-all active:scale-[0.96] ${
                isEvening
                  ? 'bg-[#181716] text-white hover:bg-[#2E2C29]'
                  : 'border border-[#E5E1D9] bg-white text-[#272626] hover:border-[#CA2F2D]/40 hover:text-[#CA2F2D]'
              }`}
            >
              <span>{link.label}</span>
              <ChevronRight size={13} />
            </button>
          ))}
        </div>
      )}

      {/* Subtle Section Divider */}
      <div className="mx-4 mt-4 border-b border-[#EAE6DF]" />
    </section>
  );
});

export default SmartRecommendations;
