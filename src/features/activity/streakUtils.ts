/**
 * streakUtils.ts - streak calculation from mission completion history.
 *
 * Given an array of Mission[] (potentially spanning multiple dates),
 * computes currentStreak and activeDaysInWindow for a rolling 7-day window.
 */

export interface StreakResult {
  currentStreak: number;
  activeDaysInWindow: number;
  windowDays: number;
}

/**
 * Given a flat array of missions (any dates), compute streak info.
 *
 * A day is 'active' if at least one mission was completed on that date.
 * The streak counts consecutive days ending with today or yesterday.
 */
export function computeStreak(missions: { date: string; completed: boolean }[], today: string): StreakResult {
  const windowDays = 7;

  // Build set of dates that have at least one completed mission
  const activeDates = new Set<string>();
  for (const m of missions) {
    if (m.completed) activeDates.add(m.date);
  }

  // Build last-7-day window
  const dates: string[] = [];
  const base = new Date(today + 'T00:00:00');
  for (let i = windowDays - 1; i >= 0; i--) {
    const d = new Date(base);
    d.setDate(base.getDate() - i);
    const str = d.toISOString().slice(0, 10);
    dates.push(str);
  }

  const activeDaysInWindow = dates.filter(d => activeDates.has(d)).length;

  // Streak: consecutive active days ending today (or yesterday if today not yet active)
  let currentStreak = 0;
  const todayBase = new Date(today + 'T00:00:00');
  for (let i = 0; i < 365; i++) {
    const d = new Date(todayBase);
    d.setDate(todayBase.getDate() - i);
    const str = d.toISOString().slice(0, 10);
    if (activeDates.has(str)) {
      currentStreak++;
    } else {
      break;
    }
  }

  return { currentStreak, activeDaysInWindow, windowDays };
}

/**
 * Return the 7 date strings for the current week (Mon–Sun or last 7 days).
 */
export function getLast7Days(today: string): string[] {
  const dates: string[] = [];
  const base = new Date(today + 'T00:00:00');
  for (let i = 6; i >= 0; i--) {
    const d = new Date(base);
    d.setDate(base.getDate() - i);
    dates.push(d.toISOString().slice(0, 10));
  }
  return dates;
}
