import { useEffect, useState } from 'react';

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
 * Strict automatic time-based rule resolver (based strictly on system clock):
 * - 03:00 - 15:00 -> morning (Kahvaltı Keyfi)
 * - 15:00 - 19:00 -> afternoon (Dünya Mutfağı)
 * - 19:00 - 00:00 (ve 00:00 - 03:00 gece devamı) -> evening (Kokteyl + Biftek Komboları)
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

export function useTimeSlot() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(new Date());
    }, 30_000);
    return () => window.clearInterval(timer);
  }, []);

  const activeSlot = getTimeSlotForHour(now.getHours());

  return {
    activeSlot,
    slotMeta: TIME_SLOT_META[activeSlot],
    currentTimeLabel: formatClock(now),
  };
}
