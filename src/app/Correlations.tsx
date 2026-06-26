import { useMemo } from "react";
import { motion } from "framer-motion";
import { Activity, MoonStar } from "lucide-react";
import { useEntries } from "./useEntries";
import { sleepByMood, lowSleepSymbols, avgSleepHours } from "./dreamStats";

// "What connects your sleep and your dreams" — derived purely from the entries
// already in the store (mood, hours, symbols). No extra AI calls.
export default function Correlations() {
  const { entries } = useEntries();

  const { byMood, lowSymbols, avg, maxHours } = useMemo(() => {
    const byMood = sleepByMood(entries);
    return {
      byMood,
      lowSymbols: lowSleepSymbols(entries).slice(0, 8),
      avg: avgSleepHours(entries),
      maxHours: Math.max(9, ...byMood.map((m) => m.avgHours)),
    };
  }, [entries]);

  if (entries.length < 3) {
    return (
      <div className="glass rounded-3xl p-6">
        <div className="mb-2 flex items-center gap-2">
          <Activity className="h-5 w-5 text-aurora-cyan" />
          <h2 className="font-display text-lg font-semibold">Sleep ↔ dream correlations</h2>
        </div>
        <p className="text-sm text-white/40">
          Log a few more dreams (with nights of sleep) and the AI will start
          connecting how you sleep to how you dream.
        </p>
      </div>
    );
  }

  return (
    <div className="glass rounded-3xl p-6">
      <div className="mb-1 flex items-center gap-2">
        <Activity className="h-5 w-5 text-aurora-cyan" />
        <h2 className="font-display text-lg font-semibold">Sleep ↔ dream correlations</h2>
      </div>
      <p className="mb-5 text-sm text-white/45">
        How your hours of sleep line up with the emotional tone of your dreams.
      </p>

      {/* Average hours slept by mood */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/55">
            Avg. hours slept by dream mood
          </p>
          <div className="space-y-3">
            {byMood.map((m, i) => (
              <div key={m.label}>
                <div className="mb-1 flex justify-between text-sm">
                  <span className="text-white/75">{m.label}</span>
                  <span className="font-semibold" style={{ color: m.color }}>
                    {m.avgHours.toFixed(1)}h
                  </span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-white/10">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(m.avgHours / maxHours) * 100}%` }}
                    transition={{ duration: 0.8, delay: i * 0.08 }}
                    className="h-full rounded-full"
                    style={{ background: `linear-gradient(90deg, ${m.color}, #38bdf8)` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-white/40">
            Your nightly average is{" "}
            <span className="font-semibold text-white/70">{avg.toFixed(1)}h</span>.
          </p>
        </div>

        {/* Symbols that cluster on poor-sleep nights */}
        <div>
          <p className="mb-3 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-white/55">
            <MoonStar className="h-3.5 w-3.5 text-aurora-pink" />
            Symbols on your shorter nights
          </p>
          {lowSymbols.length === 0 ? (
            <p className="text-sm text-white/40">
              No symbol clusters tied to short sleep yet — a good sign, or just
              not enough data.
            </p>
          ) : (
            <>
              <div className="flex flex-wrap gap-2">
                {lowSymbols.map((s, i) => (
                  <motion.span
                    key={s.name}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="rounded-full border border-aurora-pink/25 bg-aurora-pink/10 px-3 py-1.5 text-sm text-white/85"
                  >
                    {s.name}
                    <span className="ml-1.5 text-xs text-aurora-pink">×{s.count}</span>
                  </motion.span>
                ))}
              </div>
              <p className="mt-3 text-xs text-white/40">
                These appear most when you sleep below your average — worth
                noticing.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
