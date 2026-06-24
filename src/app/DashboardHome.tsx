import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Clock,
  Flame,
  TrendingUp,
  NotebookPen,
  Moon,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { useEntries } from "./useEntries";

export default function DashboardHome() {
  const { entries } = useEntries();

  const avgHours =
    entries.length > 0
      ? (entries.reduce((s, e) => s + e.hours, 0) / entries.length).toFixed(1)
      : "0";
  const avgScore =
    entries.length > 0
      ? Math.round(entries.reduce((s, e) => s + e.quality, 0) / entries.length)
      : 0;

  const week = [...entries].slice(0, 7).reverse();
  const top = entries[0];

  const cards = [
    { icon: Clock, label: "Avg. sleep", value: `${avgHours}h`, sub: "+18m vs last week", color: "text-aurora-cyan" },
    { icon: Flame, label: "Journal streak", value: `${entries.length} days`, sub: "Keep it going 🔥", color: "text-aurora-pink" },
    { icon: TrendingUp, label: "Sleep score", value: `${avgScore}`, sub: "+12 this month", color: "text-aurora-teal" },
    { icon: NotebookPen, label: "Entries", value: `${entries.length}`, sub: "All time", color: "text-aurora-violet" },
  ];

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-white/50">Good morning ☀️</p>
          <h1 className="font-display text-3xl font-bold">Your sleep at a glance</h1>
        </div>
        <Link to="/app/journal" className="btn-aurora text-sm">
          <NotebookPen className="h-4 w-4" /> New entry
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <motion.div
              key={c.label}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="glass rounded-3xl p-5"
            >
              <Icon className={`h-5 w-5 ${c.color}`} />
              <div className="mt-3 font-display text-3xl font-bold">{c.value}</div>
              <div className="text-sm text-white/50">{c.label}</div>
              <div className="mt-1 text-xs text-white/35">{c.sub}</div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid gap-4 lg:grid-cols-5">
        {/* Weekly chart */}
        <div className="glass rounded-3xl p-6 lg:col-span-3">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Sleep quality</h2>
            <span className="text-xs text-white/40">Last {week.length} nights</span>
          </div>
          <div className="flex h-48 items-end justify-between gap-3">
            {week.map((e, i) => (
              <div key={e.id} className="flex flex-1 flex-col items-center gap-2">
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${e.quality}%` }}
                  transition={{ duration: 0.7, delay: i * 0.08 }}
                  className="w-full rounded-t-lg bg-gradient-to-t from-aurora-purple to-aurora-pink"
                  style={{ minHeight: 8 }}
                  title={`${e.quality}%`}
                />
                <span className="text-xs text-white/40">{e.date.split(" ")[1]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* AI insight of the day */}
        <div className="glass relative overflow-hidden rounded-3xl p-6 lg:col-span-2">
          <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-aurora-pink/20 blur-3xl" />
          <div className="relative">
            <div className="flex items-center gap-2 text-aurora-cyan">
              <Sparkles className="h-4 w-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">
                Insight of the day
              </span>
            </div>
            {top ? (
              <>
                <p className="mt-3 text-sm leading-relaxed text-white/85">
                  {top.analysis.summary}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {top.analysis.themes.map((t) => (
                    <span
                      key={t}
                      className="rounded-full bg-aurora-purple/20 px-3 py-1 text-xs font-medium text-aurora-violet"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </>
            ) : (
              <p className="mt-3 text-sm text-white/50">
                Write your first dream to get a personal insight.
              </p>
            )}
            <Link
              to="/app/insights"
              className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold text-aurora-pink hover:gap-2.5 transition-all"
            >
              See all insights <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent entries */}
      <div className="glass rounded-3xl p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold">Recent dreams</h2>
          <Link to="/app/journal" className="text-sm text-aurora-violet hover:text-white">
            View all
          </Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {entries.slice(0, 4).map((e) => (
            <div
              key={e.id}
              className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3"
            >
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-aurora-purple/20">
                <Moon className="h-5 w-5 text-aurora-violet" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{e.text}</p>
                <p className="text-xs text-white/40">
                  {e.date} ·{" "}
                  <span style={{ color: e.analysis.mood.color }}>
                    {e.analysis.mood.label}
                  </span>
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
