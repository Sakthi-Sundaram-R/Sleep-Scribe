import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { NotebookPen, Wand2, Loader2, Trash2, Sparkles, Moon } from "lucide-react";
import { useEntries, type Entry } from "./useEntries";

export default function JournalPage() {
  const { entries, add, remove } = useEntries();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState<Entry | null>(null);

  useEffect(() => {
    if (!active && entries.length) setActive(entries[0]);
  }, [entries, active]);

  const [err, setErr] = useState("");

  const save = async () => {
    if (!text.trim()) return;
    setErr("");
    setLoading(true);
    try {
      const e = await add(text);
      setActive(e);
      setText("");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Could not save entry");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Dream journal</h1>
        <p className="text-sm text-white/50">
          Capture a dream and let the AI decode it.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_1.15fr]">
        {/* Composer + list */}
        <div className="space-y-6">
          <div className="glass rounded-3xl p-6">
            <h2 className="font-display text-lg font-semibold">
              <NotebookPen className="mr-1 inline h-5 w-5 text-aurora-pink" />
              New entry
            </h2>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              rows={5}
              placeholder="What did you dream last night?"
              className="mt-3 w-full resize-none rounded-2xl border border-white/10 bg-night-950/60 p-4 text-sm outline-none transition placeholder:text-white/30 focus:border-aurora-purple/60"
            />
            <button
              onClick={save}
              disabled={loading || !text.trim()}
              className="btn-aurora mt-4 w-full disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" /> Analyzing…
                </>
              ) : (
                <>
                  <Wand2 className="h-5 w-5" /> Save & analyze
                </>
              )}
            </button>
            {err && (
              <p className="mt-3 rounded-xl border border-aurora-pink/30 bg-aurora-pink/10 px-3 py-2 text-sm text-aurora-pink">
                {err}
              </p>
            )}
          </div>

          <div className="glass rounded-3xl p-6">
            <h2 className="mb-4 font-display text-lg font-semibold">
              Entries{" "}
              <span className="text-sm font-normal text-white/40">
                ({entries.length})
              </span>
            </h2>
            <div className="space-y-2">
              {entries.map((e) => (
                <button
                  key={e.id}
                  onClick={() => setActive(e)}
                  className={`group flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition ${
                    active?.id === e.id
                      ? "border-aurora-pink/40 bg-aurora-purple/10"
                      : "border-white/10 bg-white/5 hover:border-white/20"
                  }`}
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-aurora-purple/20">
                    <Moon className="h-4 w-4 text-aurora-violet" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{e.text}</p>
                    <p className="text-xs text-white/40">{e.date}</p>
                  </div>
                  <span
                    onClick={(ev) => {
                      ev.stopPropagation();
                      if (active?.id === e.id) setActive(null);
                      remove(e.id);
                    }}
                    className="shrink-0 rounded-lg p-1.5 text-white/30 opacity-0 transition hover:bg-white/10 hover:text-aurora-pink group-hover:opacity-100"
                  >
                    <Trash2 className="h-4 w-4" />
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Detail */}
        <div className="glass rounded-3xl p-6 lg:sticky lg:top-6 lg:h-fit">
          <AnimatePresence mode="wait">
            {active ? (
              <motion.div
                key={active.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-5"
              >
                <div>
                  <p className="text-xs text-white/40">{active.date}</p>
                  <p className="mt-1 text-sm italic text-white/70">
                    "{active.text}"
                  </p>
                </div>
                <hr className="border-white/10" />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-aurora-cyan">
                    Interpretation
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed text-white/85">
                    {active.analysis.summary}
                  </p>
                </div>
                <div>
                  <div className="mb-1.5 flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wider text-aurora-cyan">
                      Emotional tone
                    </p>
                    <span
                      className="text-sm font-semibold"
                      style={{ color: active.analysis.mood.color }}
                    >
                      {active.analysis.mood.label}
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${active.analysis.mood.score}%`,
                        background: `linear-gradient(90deg, ${active.analysis.mood.color}, #7c5cff)`,
                      }}
                    />
                  </div>
                </div>
                <div>
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-aurora-cyan">
                    Key symbols
                  </p>
                  <div className="space-y-2">
                    {active.analysis.symbols.map((s) => (
                      <div
                        key={s.name}
                        className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm"
                      >
                        <span className="font-semibold">{s.name}</span>
                        <span className="text-white/55"> — {s.meaning}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="rounded-2xl bg-gradient-to-br from-aurora-purple/20 to-aurora-pink/10 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-aurora-pink">
                    💡 Sleep tip
                  </p>
                  <p className="mt-1 text-sm text-white/80">
                    {active.analysis.tip}
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex h-full min-h-[380px] flex-col items-center justify-center text-center text-white/40"
              >
                <Sparkles className="mb-3 h-10 w-10 text-aurora-purple/60" />
                <p className="text-sm">Select or write an entry to see its analysis.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
