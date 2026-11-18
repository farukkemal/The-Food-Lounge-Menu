import { useEffect, useState } from 'react';

export const TIME_SLOT_IDS = {
  MORNING: 'morning',
  LUNCH: 'lunch',
  DINNER: 'dinner',
  NIGHT: 'night',
};

export const TIME_SLOT_META = {
  [TIME_SLOT_IDS.MORNING]: {
    id: TIME_SLOT_IDS.MORNING,
    shortLabel: 'Sabah Servisi',
    rangeLabel: '09:00 – 13:00',
  },
  [TIME_SLOT_IDS.LUNCH]: {
    id: TIME_SLOT_IDS.LUNCH,
    shortLabel: 'Öğle Servisi',
    rangeLabel: '13:00 – 17:00',
  },
  [TIME_SLOT_IDS.DINNER]: {
    id: TIME_SLOT_IDS.DINNER,
    shortLabel: 'Akşam Servisi',
    rangeLabel: '17:00 – 20:30',
  },
  [TIME_SLOT_IDS.NIGHT]: {
    id: TIME_SLOT_IDS.NIGHT,
    shortLabel: 'Gece Servisi',
    rangeLabel: '20:30 – 24:00',
  },
};

export const TIME_SLOT_LIST = [
  TIME_SLOT_META[TIME_SLOT_IDS.MORNING],
  TIME_SLOT_META[TIME_SLOT_IDS.LUNCH],
  TIME_SLOT_META[TIME_SLOT_IDS.DINNER],
  TIME_SLOT_META[TIME_SLOT_IDS.NIGHT],
];

/**
 * Strict automatic service-window resolver (minute-precision):
 * - 09:00 - 13:00 (ve 03:00 - 09:00 erken açılış) -> morning (Sabah Servisi)
 * - 13:00 - 17:00 -> lunch  (Öğle Servisi)
 * - 17:00 - 20:30 -> dinner (Akşam Servisi)
 * - 20:30 - 24:00 (ve 00:00 - 03:00 geç devam) -> night (Gece Servisi)
 */
export function getTimeSlotForTime(hour, minute = 0) {
  const totalMinutes = hour * 60 + minute;
  if (totalMinutes >= 3 * 60 && totalMinutes < 13 * 60) {
    return TIME_SLOT_IDS.MORNING;
  }
  if (totalMinutes >= 13 * 60 && totalMinutes < 17 * 60) {
    return TIME_SLOT_IDS.LUNCH;
  }
  if (totalMinutes >= 17 * 60 && totalMinutes < 20 * 60 + 30) {
    return TIME_SLOT_IDS.DINNER;
  }
  return TIME_SLOT_IDS.NIGHT;
}

export function getTimeSlotForHour(hour) {
  return getTimeSlotForTime(hour, 0);
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

  const activeSlot = getTimeSlotForTime(now.getHours(), now.getMinutes());

  return {
    activeSlot,
    slotMeta: TIME_SLOT_META[activeSlot],
    currentTimeLabel: formatClock(now),
  };
}
