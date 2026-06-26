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

/** Aggregate every analysed theme, most frequent first. Optionally windowed. */
export function recurringThemes(
  entries: Entry[],
  withinDays?: number
): SymbolStat[] {
  const cutoff = withinDays ? Date.now() - withinDays * DAY : 0;
  const map = new Map<string, number>();
  for (const e of entries) {
    if (withinDays && new Date(e.createdAt).getTime() < cutoff) continue;
    for (const t of e.analysis?.themes ?? []) {
      const name = String(t).trim();
      if (name) map.set(name, (map.get(name) ?? 0) + 1);
    }
  }
  return [...map.entries()]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);
}

export type RecurringPattern = {
  kind: "symbol" | "theme";
  name: string;
  count: number;
};

/**
 * The single strongest recurring pattern across the journal — the symbol or
 * theme that appears most often (min `threshold` times). Null if nothing
 * recurs yet. Used to surface a proactive "this keeps coming back" insight.
 */
export function topRecurringPattern(
  entries: Entry[],
  threshold = 3
): RecurringPattern | null {
  const sym = recurringSymbols(entries)[0];
  const thm = recurringThemes(entries)[0];
  const best =
    (sym?.count ?? 0) >= (thm?.count ?? 0)
      ? sym && { kind: "symbol" as const, ...sym }
      : thm && { kind: "theme" as const, ...thm };
  if (!best || best.count < threshold) return null;
  return best;
}

export type MoodSleep = { label: string; color: string; avgHours: number; count: number };

/** Average hours slept grouped by dream mood — for the sleep↔mood chart. */
export function sleepByMood(entries: Entry[]): MoodSleep[] {
  const map = new Map<string, { color: string; hours: number; count: number }>();
  for (const e of entries) {
    const label = e.analysis?.mood?.label;
    if (!label || !e.hours) continue;
    const cur = map.get(label) ?? { color: e.analysis?.mood?.color ?? "#7c5cff", hours: 0, count: 0 };
    cur.hours += e.hours;
    cur.count += 1;
    map.set(label, cur);
  }
  return [...map.entries()]
    .map(([label, v]) => ({ label, color: v.color, avgHours: v.hours / v.count, count: v.count }))
    .sort((a, b) => b.avgHours - a.avgHours);
}

/** Mean hours slept across all entries that recorded sleep hours. */
export function avgSleepHours(entries: Entry[]): number {
  const withHours = entries.filter((e) => e.hours);
  if (!withHours.length) return 0;
  return withHours.reduce((s, e) => s + e.hours, 0) / withHours.length;
}

/**
 * Symbols that show up disproportionately on poor-sleep nights (hours below the
 * user's own average). Returns the top offenders with how many low-sleep nights
 * they appeared on.
 */
export function lowSleepSymbols(entries: Entry[]): SymbolStat[] {
  const avg = avgSleepHours(entries);
  if (!avg) return [];
  const lowNights = entries.filter((e) => e.hours && e.hours < avg);
  return recurringSymbols(lowNights).filter((s) => s.count >= 2);
}

/** % of the last `days` days that have at least one entry — a real journaling-consistency score. */
export function consistencyScore(entries: Entry[], days = 30): number {
  if (!entries.length) return 0;
  const cutoff = Date.now() - days * DAY;
  const seen = new Set<string>();
  for (const e of entries) {
    const t = new Date(e.createdAt).getTime();
    if (t >= cutoff) seen.add(localDayKey(new Date(e.createdAt)));
  }
  return Math.round((seen.size / days) * 100);
}

// Split entries into the current `days`-window and the one immediately before it.
function splitWindows(entries: Entry[], days: number) {
  const now = Date.now();
  const cur: Entry[] = [];
  const prev: Entry[] = [];
  for (const e of entries) {
    const age = now - new Date(e.createdAt).getTime();
    if (age < days * DAY) cur.push(e);
    else if (age < 2 * days * DAY) prev.push(e);
  }
  return { cur, prev };
}

/** Change in avg sleep hours vs the previous 7-day window, in minutes. Null if no prior data. */
export function sleepHoursWeekDelta(entries: Entry[]): number | null {
  const { cur, prev } = splitWindows(entries.filter((e) => e.hours), 7);
  if (!cur.length || !prev.length) return null;
  const avg = (a: Entry[]) => a.reduce((s, e) => s + e.hours, 0) / a.length;
  return Math.round((avg(cur) - avg(prev)) * 60);
}

/** Change in avg sleep quality vs the previous 30-day window, in points. Null if no prior data. */
export function qualityMonthDelta(entries: Entry[]): number | null {
  const { cur, prev } = splitWindows(entries.filter((e) => e.quality), 30);
  if (!cur.length || !prev.length) return null;
  const avg = (a: Entry[]) => a.reduce((s, e) => s + e.quality, 0) / a.length;
  return Math.round(avg(cur) - avg(prev));
}

/** Formats a numeric delta as "+5" / "−3" / "—" (null) with an optional unit. */
export function formatDelta(delta: number | null, unit = "", whenNull = "—"): string {
  if (delta == null) return whenNull;
  const sign = delta > 0 ? "+" : delta < 0 ? "−" : "±";
  return `${sign}${Math.abs(delta)}${unit}`;
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
