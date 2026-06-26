import type { Entry } from "./useEntries";

// Shared, pure helpers for journal analytics: streaks, recurring symbols, and
// search/filtering. All derive from the entries already in the store.

const DAY = 86_400_000;

function localDayKey(d: Date): string {
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
}

/** True if the user has logged at least one entry today (local time). */
export function journaledToday(entries: Entry[]): boolean {
  const today = localDayKey(new Date());
  return entries.some((e) => localDayKey(new Date(e.createdAt)) === today);
}

/**
 * Consecutive-day journaling streak. Counts back from today (or yesterday, so
 * the streak doesn't "break" until a full day is actually missed).
 */
export function computeStreak(entries: Entry[]): number {
  if (!entries.length) return 0;
  const days = new Set(entries.map((e) => localDayKey(new Date(e.createdAt))));

  const cursor = new Date();
  if (!days.has(localDayKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1); // allow the streak to live through today
    if (!days.has(localDayKey(cursor))) return 0;
  }

  let streak = 0;
  while (days.has(localDayKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export type SymbolStat = { name: string; count: number };

/** Aggregate every analysed symbol, most frequent first. Optionally windowed. */
export function recurringSymbols(
  entries: Entry[],
  withinDays?: number
): SymbolStat[] {
  const cutoff = withinDays ? Date.now() - withinDays * DAY : 0;
  const map = new Map<string, number>();
  for (const e of entries) {
    if (withinDays && new Date(e.createdAt).getTime() < cutoff) continue;
    for (const s of e.analysis?.symbols ?? []) {
      const name = s.name?.trim();
      if (name) map.set(name, (map.get(name) ?? 0) + 1);
    }
  }
  return [...map.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

export type TimeRange = "all" | "today" | "week" | "month";

const RANGE_DAYS: Record<Exclude<TimeRange, "all">, number> = {
  today: 1,
  week: 7,
  month: 30,
};

/** Keyword + mood + time-range filter over entries (matches text, symbols, themes). */
export function filterEntries(
  entries: Entry[],
  opts: { query?: string; mood?: string; range?: TimeRange }
): Entry[] {
  const q = opts.query?.trim().toLowerCase();
  const mood = opts.mood && opts.mood !== "all" ? opts.mood : undefined;
  const range = opts.range && opts.range !== "all" ? opts.range : undefined;
  const cutoff = range ? Date.now() - RANGE_DAYS[range] * DAY : 0;

  return entries.filter((e) => {
    if (range && new Date(e.createdAt).getTime() < cutoff) return false;
    if (mood && e.analysis?.mood?.label !== mood) return false;
    if (q) {
      const haystack = [
        e.text,
        e.analysis?.summary,
        ...(e.analysis?.symbols ?? []).map((s) => `${s.name} ${s.meaning}`),
        ...(e.analysis?.themes ?? []),
      ]
        .join(" ")
        .toLowerCase();
      if (!haystack.includes(q)) return false;
    }
    return true;
  });
}

/** Distinct mood labels present in the entries (for the filter dropdown). */
export function moodOptions(entries: Entry[]): string[] {
  return [...new Set(entries.map((e) => e.analysis?.mood?.label).filter(Boolean))] as string[];
}
