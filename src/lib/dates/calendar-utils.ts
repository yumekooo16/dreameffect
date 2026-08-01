export function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function toDateKey(date: Date) {
  const d = startOfDay(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function parseDateKey(key: string) {
  const [year, month, day] = key.split("-").map(Number);
  return startOfDay(new Date(year, month - 1, day));
}

export function formatDateLongFr(date: Date) {
  return date.toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function formatDateShortFr(date: Date) {
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function daysInRange(start: Date | string, end: Date | string) {
  const days: Date[] = [];
  const current = startOfDay(new Date(start));
  const last = startOfDay(new Date(end));

  while (current <= last) {
    days.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }

  return days;
}

export function isDateInRange(date: Date, start: Date | string, end: Date | string) {
  const d = startOfDay(date);
  const s = startOfDay(new Date(start));
  const e = startOfDay(new Date(end));
  return d >= s && d <= e;
}

export function rentalDurationDays(start: Date, end: Date) {
  const s = startOfDay(start);
  const e = startOfDay(end);
  const diff = Math.round((e.getTime() - s.getTime()) / 86_400_000);
  return Math.max(1, diff);
}

export function expandBlockedDateKeys(
  periods: { start: string; end: string }[],
  extraDays: string[] = []
) {
  const keys = new Set<string>();

  for (const period of periods) {
    for (const day of daysInRange(period.start, period.end)) {
      keys.add(toDateKey(day));
    }
  }

  for (const day of extraDays) {
    keys.add(toDateKey(new Date(day)));
  }

  return keys;
}

export function isRangeAvailable(
  from: Date,
  to: Date,
  blockedKeys: Set<string>
) {
  for (const day of daysInRange(from, to)) {
    if (blockedKeys.has(toDateKey(day))) {
      return false;
    }
  }
  return true;
}

export function hasFutureAvailability(
  blockedKeys: Set<string>,
  horizonDays = 120
) {
  const today = startOfDay(new Date());
  for (let i = 0; i < horizonDays; i += 1) {
    const day = new Date(today);
    day.setDate(day.getDate() + i);
    if (!blockedKeys.has(toDateKey(day))) {
      return true;
    }
  }
  return false;
}
