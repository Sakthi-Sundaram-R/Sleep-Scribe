import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Repeat, Sparkles, Loader2 } from "lucide-react";
import { useEntries } from "./useEntries";
import { topRecurringPattern } from "./dreamStats";
import { api } from "../lib/api";

// Surfaces the strongest recurring pattern in the journal and, on demand, asks
// Luna (grounded in the user's own dreams) to reflect on what it might mean.
export default function RecurringDreamCard() {
  const { entries } = useEntries();
  const pattern = useMemo(() => topRecurringPattern(entries, 3), [entries]);

  const [reflection, setReflection] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  if (!pattern) return null;

  const reflect = async () => {
    setLoading(true);
    setErr("");
    try {
      const { reply } = await api.journalChat([
        {
          role: "user",
          content: `The ${pattern.kind} "${pattern.name}" has recurred across ${pattern.count} of my dreams. Reflect on what this recurring ${pattern.kind} might be pointing to for me, drawing on the specific dreams in my journal where it appears. Keep it to 3-4 sentences.`,
        },
      ]);
      setReflection(reply);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Couldn't reach Luna just now.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass overflow-hidden rounded-3xl p-6"
    >
      <div className="flex items-start gap-4">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-aurora-gradient shadow-lg shadow-aurora-purple/40">
          <Repeat className="h-5 w-5 text-white" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-aurora-violet">
            Recurring {pattern.kind}
          </p>
          <p className="mt-1 text-lg font-semibold text-white">
            “{pattern.name}” keeps returning
          </p>
          <p className="text-sm text-white/55">
            It's appeared in{" "}
            <span className="font-semibold text-white/80">{pattern.count} of your dreams</span>.
            Recurring {pattern.kind}s often track something alive in waking life.
          </p>

          {reflection ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm leading-relaxed text-white/85"
            >
              {reflection}
            </motion.p>
          ) : (
            <button
              onClick={reflect}
              disabled={loading}
              className="btn-ghost mt-4 text-sm disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Luna is reflecting…
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" /> Reflect with Luna
                </>
              )}
            </button>
          )}
          {err && <p className="mt-2 text-xs text-aurora-pink">{err}</p>}
        </div>
      </div>
    </motion.div>
  );
}
