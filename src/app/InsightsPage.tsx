import { motion } from "framer-motion";
import { useMemo } from "react";
import { Brain, Moon, Sparkles, TrendingUp, FileDown } from "lucide-react";
import { useEntries } from "./useEntries";
import { recurringSymbols, consistencyScore } from "./dreamStats";
import { exportJournalPdf } from "./journalPdf";
import { useAuth } from "../auth/AuthContext";
import WeeklyDigest from "./WeeklyDigest";
import Correlations from "./Correlations";
import RecurringDreamCard from "./RecurringDreamCard";

export default function InsightsPage() {
  const { entries } = useEntries();
  const { user } = useAuth();

  const { moods, symbols, recentTop, avgHours, consistency } = useMemo(() => {
    const moodMap = new Map<string, { count: number; color: string }>();
    entries.forEach((e) => {
      const m = e.analysis.mood;
      const cur = moodMap.get(m.label) ?? { count: 0, color: m.color };
      moodMap.set(m.label, { count: cur.count + 1, color: m.color });
    });
    const total = entries.length || 1;
    const moods = [...moodMap.entries()]
      .map(([label, v]) => ({ label, pct: Math.round((v.count / total) * 100), color: v.color }))
      .sort((a, b) => b.pct - a.pct);

    const symbols = recurringSymbols(entries).slice(0, 6);
    // Top recurring symbol in the last 30 days (the "killer" headline).
    const recentTop = recurringSymbols(entries, 30).filter((s) => s.count >= 2)[0] ?? null;

    const avgHours =
      entries.length > 0
        ? (entries.reduce((s, e) => s + e.hours, 0) / entries.length).toFixed(1)
        : "0";
    // Real journaling consistency: % of the last 30 days with an entry.
    const consistency = consistencyScore(entries, 30);
    return { moods, symbols, recentTop, avgHours, consistency };
  }, [entries]);

  const hoursTrend = [...entries].slice(0, 10).reverse();
  const maxH = 10;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">Insights & analytics</h1>
          <p className="text-sm text-white/50">
            Patterns the AI found across {entries.length} entries.
          </p>
        </div>
        <button
          onClick={() => exportJournalPdf(entries, user?.name)}
          disabled={entries.length === 0}
          className="btn-ghost text-sm disabled:opacity-50"
        >
          <FileDown className="h-4 w-4" /> Export PDF
        </button>
      </div>

      <RecurringDreamCard />

      <WeeklyDigest />

      {/* Headline metrics */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          { icon: Moon, label: "Avg. hours slept", value: `${avgHours}h`, c: "text-aurora-cyan" },
          { icon: TrendingUp, label: "Consistency score", value: `${consistency}%`, c: "text-aurora-teal" },
          { icon: Brain, label: "Dreams analyzed", value: `${entries.length}`, c: "text-aurora-pink" },
        ].map((m, i) => {
          const Icon = m.icon;
          return (
            <motion.div
              key={m.label}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="glass rounded-3xl p-5"
            >
              <Icon className={`h-5 w-5 ${m.c}`} />
              <div className="mt-3 font-display text-3xl font-bold">{m.value}</div>
              <div className="text-sm text-white/50">{m.label}</div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Mood distribution */}
        <div className="glass rounded-3xl p-6">
          <h2 className="mb-5 font-display text-lg font-semibold">
            Emotional tone breakdown
          </h2>
          <div className="space-y-4">
            {moods.map((m, i) => (
              <div key={m.label}>
                <div className="mb-1.5 flex justify-between text-sm">
                  <span className="text-white/75">{m.label}</span>
                  <span className="font-semibold" style={{ color: m.color }}>
                    {m.pct}%
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${m.pct}%` }}
                    transition={{ duration: 0.8, delay: i * 0.1 }}
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, ${m.color}, #7c5cff)` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hours trend */}
        <div className="glass rounded-3xl p-6">
          <h2 className="mb-5 font-display text-lg font-semibold">Hours slept trend</h2>
          <div className="flex h-44 items-end justify-between gap-2">
            {hoursTrend.map((e, i) => (
              <div key={e.id} className="flex flex-1 flex-col items-center gap-2">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${(e.hours / maxH) * 100}%` }}
                  transition={{ duration: 0.7, delay: i * 0.06 }}
                  className="w-full rounded-t-md bg-gradient-to-t from-aurora-indigo to-aurora-cyan"
                  style={{ minHeight: 6 }}
                  title={`${e.hours}h`}
                />
              </div>
            ))}
          </div>
          <p className="mt-3 text-center text-xs text-white/40">
            Aim for the 7–9h band for best recovery.
          </p>
        </div>
      </div>

      {/* Sleep ↔ dream correlations */}
      <Correlations />

      {/* Common symbols */}
      <div className="glass rounded-3xl p-6">
        <div className="mb-5 flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-aurora-pink" />
          <h2 className="font-display text-lg font-semibold">
            Recurring dream symbols
          </h2>
        </div>

        {recentTop && (
          <div className="mb-5 rounded-2xl border border-aurora-purple/25 bg-aurora-purple/10 px-4 py-3 text-sm text-white/85">
            <span className="font-semibold text-aurora-violet">{recentTop.name}</span>{" "}
            keeps returning — it appeared in{" "}
            <span className="font-semibold">{recentTop.count} dreams</span> this month.
          </div>
        )}

        {symbols.length === 0 && (
          <p className="text-sm text-white/40">
            Symbols the AI spots in your dreams will collect here over time.
          </p>
        )}
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {symbols.map((s, i) => (
            <motion.div
              key={s.name}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4"
            >
              <span className="font-medium">{s.name}</span>
              <span className="rounded-full bg-aurora-purple/20 px-2.5 py-1 text-xs font-semibold text-aurora-violet">
                ×{s.count}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
