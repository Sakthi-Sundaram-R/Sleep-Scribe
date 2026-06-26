import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BrainCircuit, Sparkles, Loader2, Wand2 } from "lucide-react";
import {
  analyzeDream,
  EXAMPLE_DREAMS,
  type DreamAnalysis,
} from "../lib/dreamEngine";
import { api } from "../lib/api";
import Reveal from "./Reveal";
import SplitText from "./fx/SplitText";
import ShareDreamButton from "../app/ShareDreamButton";

export default function DreamAnalyzer() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DreamAnalysis | null>(null);

  const run = async () => {
    if (!text.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      // Real AI: hit the public, rate-limited Groq demo endpoint.
      const { analysis } = await api.analyzeDemo(text);
      setResult(analysis);
    } catch {
      // Network error / rate-limited / no key configured → fall back to the
      // offline engine so the demo always returns something.
      setResult(analyzeDream(text));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="dream-ai" className="relative py-24">
      <div className="pointer-events-none absolute right-1/4 top-20 h-[340px] w-[340px] rounded-full bg-aurora-pink/15 blur-[140px]" />
      <div className="section-pad relative">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="pill mb-4">
            <BrainCircuit className="h-3.5 w-3.5 text-aurora-pink" />
            Try the dream AI
          </span>
          <SplitText
            text="Tell me your dream. I'll decode it."
            gradient={["I'll", "decode", "it"]}
            className="font-display text-4xl font-bold sm:text-5xl"
          />
          <p className="mt-4 text-lg text-white/65">
            Type a dream below and watch Sleep-Scribe surface its symbols, mood
            and meaning — live, right here.
          </p>
        </Reveal>

        <div className="mx-auto mt-12 grid max-w-5xl gap-6 lg:grid-cols-2">
          {/* Input */}
          <Reveal>
            <div className="glass rounded-3xl p-6">
              <label className="text-sm font-semibold text-white/80">
                Describe your dream
              </label>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Last night I dreamt that..."
                rows={6}
                className="mt-3 w-full resize-none rounded-2xl border border-white/10 bg-night-950/60 p-4 text-sm text-white/90 outline-none transition placeholder:text-white/30 focus:border-aurora-purple/60"
              />

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="self-center text-xs text-white/40">Try:</span>
                {EXAMPLE_DREAMS.map((d, i) => (
                  <button
                    key={i}
                    onClick={() => setText(d)}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/60 transition hover:border-aurora-pink/40 hover:text-white"
                  >
                    Example {i + 1}
                  </button>
                ))}
              </div>

              <button
                onClick={run}
                disabled={loading || !text.trim()}
                className="btn-aurora mt-5 w-full disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Analyzing your dream…
                  </>
                ) : (
                  <>
                    <Wand2 className="h-5 w-5" />
                    Analyze my dream
                  </>
                )}
              </button>
            </div>
          </Reveal>

          {/* Output */}
          <Reveal delay={0.1}>
            <div className="glass min-h-[340px] rounded-3xl p-6">
              <AnimatePresence mode="wait">
                {!result && !loading && (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex h-full min-h-[300px] flex-col items-center justify-center text-center text-white/40"
                  >
                    <Sparkles className="mb-3 h-10 w-10 text-aurora-purple/60" />
                    <p className="text-sm">
                      Your dream analysis will appear here.
                    </p>
                  </motion.div>
                )}

                {loading && (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex h-full min-h-[300px] flex-col items-center justify-center gap-3 text-center"
                  >
                    <div className="relative">
                      <div className="h-16 w-16 animate-spin rounded-full border-2 border-aurora-purple/30 border-t-aurora-pink" />
                      <BrainCircuit className="absolute inset-0 m-auto h-7 w-7 text-aurora-pink" />
                    </div>
                    <p className="text-sm text-white/60">
                      Reading the symbols of your night…
                    </p>
                  </motion.div>
                )}

                {result && (
                  <motion.div
                    key="result"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-5"
                  >
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-aurora-cyan">
                        Interpretation
                      </p>
                      <p className="mt-1.5 text-sm leading-relaxed text-white/85">
                        {result.summary}
                      </p>
                    </div>

                    <div>
                      <div className="mb-1.5 flex items-center justify-between">
                        <p className="text-xs font-semibold uppercase tracking-wider text-aurora-cyan">
                          Emotional tone
                        </p>
                        <span
                          className="text-sm font-semibold"
                          style={{ color: result.mood.color }}
                        >
                          {result.mood.label}
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${result.mood.score}%` }}
                          transition={{ duration: 0.8 }}
                          className="h-full rounded-full"
                          style={{
                            background: `linear-gradient(90deg, ${result.mood.color}, #7c5cff)`,
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-aurora-cyan">
                        Key symbols
                      </p>
                      <div className="space-y-2">
                        {result.symbols.map((s) => (
                          <div
                            key={s.name}
                            className="rounded-xl border border-white/10 bg-white/5 p-3"
                          >
                            <span className="text-sm font-semibold text-white">
                              {s.name}
                            </span>
                            <span className="text-sm text-white/55">
                              {" "}
                              — {s.meaning}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {result.themes.map((t) => (
                        <span
                          key={t}
                          className="rounded-full bg-aurora-purple/20 px-3 py-1 text-xs font-medium text-aurora-violet"
                        >
                          {t}
                        </span>
                      ))}
                    </div>

                    <div className="rounded-2xl bg-gradient-to-br from-aurora-purple/20 to-aurora-pink/10 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wider text-aurora-pink">
                        💡 Sleep tip
                      </p>
                      <p className="mt-1 text-sm text-white/80">{result.tip}</p>
                    </div>

                    <ShareDreamButton
                      entry={{
                        text,
                        date: new Date().toLocaleDateString(undefined, {
                          month: "short",
                          day: "numeric",
                        }),
                        analysis: result,
                      }}
                      label="Share my dream card"
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Reveal>
        </div>

        <p className="mx-auto mt-10 max-w-xl text-center text-xs leading-relaxed text-white/35">
          Dream analysis is offered for personal reflection and journaling — it
          is not medical, psychological, or diagnostic advice.
        </p>
      </div>
    </section>
  );
}
