import { useCallback, useEffect, useState } from 'react';

export const TIME_SLOT_IDS = {
  MORNING: 'morning',
  AFTERNOON: 'afternoon',
  EVENING: 'evening',
};

export const TIME_SLOT_META = {
  [TIME_SLOT_IDS.MORNING]: {
    id: TIME_SLOT_IDS.MORNING,
    shortLabel: 'Sabah',
    rangeLabel: '03:00 – 15:00',
    periodLabel: 'Sabah / Öğle Öncesi',
  },
  [TIME_SLOT_IDS.AFTERNOON]: {
    id: TIME_SLOT_IDS.AFTERNOON,
    shortLabel: 'Öğle',
    rangeLabel: '15:00 – 19:00',
    periodLabel: 'Öğle / Akşamüstü',
  },
  [TIME_SLOT_IDS.EVENING]: {
    id: TIME_SLOT_IDS.EVENING,
    shortLabel: 'Akşam',
    rangeLabel: '19:00 – 00:00',
    periodLabel: 'Akşam / Gece',
  },
};

export const TIME_SLOT_LIST = [
  TIME_SLOT_META[TIME_SLOT_IDS.MORNING],
  TIME_SLOT_META[TIME_SLOT_IDS.AFTERNOON],
  TIME_SLOT_META[TIME_SLOT_IDS.EVENING],
];

/**
 * Pure time-based rule resolver:
 * - 03:00 - 15:00 -> morning (Kahvaltı Keyfi)
 * - 15:00 - 19:00 -> afternoon (Dünya Mutfağı, Makarna, Atıştırmalık, Hafif Tabaklar)
 * - 19:00 - 00:00 (ve 00:00 - 03:00 geç saat devamı) -> evening (Steak & Kokteyl Komboları)
 */
export function getTimeSlotForHour(hour) {
  if (hour >= 3 && hour < 15) return TIME_SLOT_IDS.MORNING;
  if (hour >= 15 && hour < 19) return TIME_SLOT_IDS.AFTERNOON;
  return TIME_SLOT_IDS.EVENING;
}

function formatClock(date) {
  return date.toLocaleTimeString('tr-TR', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getInitialOverrideFromUrl() {
  if (typeof window === 'undefined') return null;
  const params = new URLSearchParams(window.location.search);
  const slotParam = params.get('slot');
  if (slotParam && Object.values(TIME_SLOT_IDS).includes(slotParam)) {
    return slotParam;
  }
  const hourParam = params.get('hour');
  if (hourParam !== null) {
    const parsed = Number.parseInt(hourParam, 10);
    if (!Number.isNaN(parsed) && parsed >= 0 && parsed <= 23) {
      return getTimeSlotForHour(parsed);
    }
  }
  return null;
}

export function useTimeSlot() {
  const [now, setNow] = useState(() => new Date());
  const [manualSlot, setManualSlotState] = useState(() => getInitialOverrideFromUrl());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const hour = now.getHours();
  const liveSlot = getTimeSlotForHour(hour);
  const activeSlot = manualSlot || liveSlot;
  const isManualOverride = Boolean(manualSlot && manualSlot !== liveSlot);

  const setManualSlot = useCallback(
    (slotId) => {
      if (slotId === liveSlot) {
        setManualSlotState(null);
      } else {
        setManualSlotState(slotId);
      }
    },
    [liveSlot]
  );

  const resetToLive = useCallback(() => {
    setManualSlotState(null);
  }, []);

  return {
    activeSlot,
    liveSlot,
    slotMeta: TIME_SLOT_META[activeSlot],
    isManualOverride,
    currentTimeLabel: formatClock(now),
    setManualSlot,
    resetToLive,
  };
}
