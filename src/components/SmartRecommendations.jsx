import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Wine,
  Sparkles,
  ChevronRight,
  Clock,
  Martini,
} from 'lucide-react';
import {
  TIME_SLOT_IDS,
  useTimeSlot,
} from '../hooks/useTimeSlot';
import { getRecommendationsForSlot } from '../services/recommendationEngine';
import { useMenu } from '../context/MenuContext';
import {
  getLocalizedItemDesc,
  getLocalizedItemTitle,
  useLanguage,
} from '../context/LanguageContext';
import LazyImage from './LazyImage';

const SpotlightHeroSlide = memo(function SpotlightHeroSlide({
  item,
  index,
  isMorning,
  lang,
  localeData,
  onSelectItem,
}) {
  const title = getLocalizedItemTitle(item, lang, localeData);
  const description = getLocalizedItemDesc(item, lang, localeData);

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
      className="gpu-card snap-card group relative w-[88vw] max-w-[560px] shrink-0 cursor-pointer overflow-hidden rounded-3xl bg-[#181716] ring-1 ring-black/8 transition-transform duration-150 active:scale-[0.985]"
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden sm:aspect-[16/9]">
        {item.image ? (
          <LazyImage
            src={item.image}
            alt={title}
            width={640}
            height={400}
            sizes="(max-width: 672px) 88vw, 560px"
            priority={index < 2}
            containerClassName="h-full w-full"
            fallbackIconSize={34}
          />
        ) : item.visualTheme === 'wine' ? (
          <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#5B0F20] via-[#7E182E] to-[#23060C] pb-14 text-white">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/12 ring-1 ring-white/25">
              <Wine size={32} strokeWidth={1.6} className="text-amber-200" />
            </div>
            <span className="mt-2.5 text-[10.5px] font-bold tracking-[0.22em] text-amber-200/90 uppercase">
              Sommelier Selection
            </span>
          </div>
        ) : item.visualTheme === 'cocktail' ? (
          <div className="flex h-full w-full flex-col items-center justify-center bg-gradient-to-br from-[#181716] via-[#4A1718] to-[#B02422] pb-14 text-white">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/12 ring-1 ring-white/25">
              <Martini size={32} strokeWidth={1.6} className="text-amber-300" />
            </div>
            <span className="mt-2.5 text-[10.5px] font-bold tracking-[0.22em] text-amber-200/90 uppercase">
              Signature Bar
            </span>
          </div>
        ) : (
          <LazyImage
            src={item.image}
            alt={title}
            width={640}
            height={400}
            sizes="(max-width: 672px) 88vw, 560px"
            priority={index < 2}
            containerClassName="h-full w-full"
            fallbackIconSize={34}
          />
        )}

        {/* Editorial Gradient Scrim */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/88 via-black/32 to-transparent" />

        {/* Top Badges */}
        <div className="absolute inset-x-3.5 top-3.5 flex items-center justify-between gap-2">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide text-white ${
              item.visualTheme === 'wine'
                ? 'bg-[#8E1B33]'
                : isMorning
                  ? 'bg-amber-600'
                  : 'bg-[#CA2F2D]'
            }`}
          >
            {item.visualTheme === 'wine' ? (
              <Wine size={11} />
            ) : item.visualTheme === 'cocktail' ? (
              <Martini size={11} />
            ) : (
              <Sparkles size={11} />
            )}
            {item.recommendationTag}
          </span>
          {item.calories && (
            <span className="rounded-full bg-black/72 px-2.5 py-1 text-[11px] font-medium text-white">
              {item.calories}
            </span>
          )}
        </div>

        {/* Bottom Content Overlay */}
        <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
          {item.highlightNote && (
            <p className="text-[11px] font-medium tracking-wide text-white/80">
              {item.highlightNote}
            </p>
          )}
          <div className="mt-1 flex items-end justify-between gap-3">
            <div className="min-w-0">
              <h3
                className="truncate text-[22px] leading-tight font-bold text-white drop-shadow-xs sm:text-[26px]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {title}
              </h3>
              {description && (
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-white/82">
                  {description}
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

const CuratedSlideCard = memo(function CuratedSlideCard({
  item,
  index,
  lang,
  localeData,
  onSelectItem,
}) {
  const title = getLocalizedItemTitle(item, lang, localeData);
  const description = getLocalizedItemDesc(item, lang, localeData);

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
          alt={title}
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
          <h4 className="line-clamp-1 text-[13.5px] font-bold text-[#1C1B1A]">
            {title}
          </h4>
          {description && (
            <p className="mt-1 line-clamp-2 text-[11.5px] leading-snug text-[#736D65]">
              {description}
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

const SmartRecommendations = memo(function SmartRecommendations({
  onSelectItem,
  onNavigateCategory,
}) {
  const { activeSlot, currentTimeLabel } = useTimeSlot();
  const { index: menuIndex } = useMenu();
  const { lang, localeData, strings } = useLanguage();
  const heroCarouselRef = useRef(null);
  const carouselRef = useRef(null);
  const [activeHeroIdx, setActiveHeroIdx] = useState(0);

  const data = useMemo(
    () => getRecommendationsForSlot(activeSlot, menuIndex, lang, localeData),
    [activeSlot, menuIndex, lang, localeData]
  );

  const spotlights = data.spotlights || [];

  useEffect(() => {
    setActiveHeroIdx(0);
    if (heroCarouselRef.current) heroCarouselRef.current.scrollLeft = 0;
    if (carouselRef.current) carouselRef.current.scrollLeft = 0;
  }, [activeSlot]);

  const handleHeroScroll = useCallback(() => {
    const el = heroCarouselRef.current;
    if (!el || spotlights.length <= 1) return;
    const firstCard = el.firstElementChild;
    const step = (firstCard?.clientWidth || el.clientWidth * 0.88) + 12;
    const idx = Math.round(Math.abs(el.scrollLeft) / step);
    const clamped = Math.max(0, Math.min(spotlights.length - 1, idx));
    setActiveHeroIdx(clamped);
  }, [spotlights.length]);

  const scrollToHeroSlide = useCallback((idx) => {
    const el = heroCarouselRef.current;
    if (!el) return;
    const card = el.children[idx];
    if (card) {
      el.scrollTo({
        left: card.offsetLeft - 16,
        behavior: 'smooth',
      });
    }
  }, []);

  const isNight = activeSlot === TIME_SLOT_IDS.NIGHT;
  const isMorning = activeSlot === TIME_SLOT_IDS.MORNING;
  const isDinner = activeSlot === TIME_SLOT_IDS.DINNER;

  return (
    <section aria-label={data.title} className="pt-4 pb-2">
      {/* Header Container */}
      <div className="px-4">
        <div className="flex items-center justify-between gap-2">
          <div className="inline-flex select-none items-center gap-1.5 rounded-full border border-[#E7E3DC] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#4F4A44] shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
            <Clock size={11} className="text-[#8E877E]" />
            <span>{currentTimeLabel}</span>
          </div>
          {spotlights.length > 1 && (
            <span className="text-[11px] font-medium text-[#A19A91]">
              {strings.swipe}
            </span>
          )}
        </div>

        <div key={`${activeSlot}-${lang}`} className="animate-fade-in mt-3">
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
      </div>

      {/* Big 4-Slide Swipeable Hero Spotlight Carousel */}
      {spotlights.length > 0 && (
        <div key={`hero-${activeSlot}-${lang}`} className="animate-fade-in mt-3.5">
          <div
            ref={heroCarouselRef}
            onScroll={handleHeroScroll}
            className="gpu-list no-scrollbar touch-scroll-x flex gap-3 overflow-x-auto px-4 pb-1"
          >
            {spotlights.map((item, idx) => (
              <SpotlightHeroSlide
                key={item.id}
                item={item}
                index={idx}
                isMorning={isMorning}
                lang={lang}
                localeData={localeData}
                onSelectItem={onSelectItem}
              />
            ))}
          </div>

          {/* Crisp Slide Dots Indicator */}
          {spotlights.length > 1 && (
            <div className="mt-2.5 flex items-center justify-center gap-1.5">
              {spotlights.map((item, idx) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => scrollToHeroSlide(idx)}
                  aria-label={`Slide ${idx + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-200 ${
                    idx === activeHeroIdx
                      ? 'w-5 bg-[#CA2F2D]'
                      : 'w-1.5 bg-[#D6D1C8]'
                  }`}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Lower 4-Slide Curated Highlights Carousel */}
      {data.items.length > 0 && (
        <div
          key={`carousel-${activeSlot}-${data.isAdminCurated ? 'admin' : 'auto'}`}
          className="animate-fade-in mt-4"
        >
          <div className="mb-2 flex items-center justify-between px-4">
            <span className="text-[11px] font-bold tracking-wider text-[#8C857C] uppercase">
              {data.isAdminCurated
                ? `${strings.featuredOther} (${data.items.length})`
                : isMorning
                  ? strings.breakfastHighlights
                  : isDinner
                    ? strings.dinnerHighlights
                    : isNight
                      ? strings.eveningCombosHeading
                      : strings.worldCuisineHighlights}
            </span>
            <span className="text-[11px] font-medium text-[#A19A91]">
              {strings.swipe}
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
                lang={lang}
                localeData={localeData}
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
              className={`inline-flex shrink-0 items-center gap-1 rounded-xl px-3.5 py-2 text-xs font-semibold transition-transform active:scale-[0.96] ${
                isNight && !data.isAdminCurated
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

      <div className="mx-4 mt-4 border-b border-[#EAE6DF]" />
    </section>
  );
});

export default SmartRecommendations;
