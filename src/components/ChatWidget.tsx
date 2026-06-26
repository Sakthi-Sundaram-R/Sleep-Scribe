import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Loader2, Moon } from "lucide-react";
import { api } from "../lib/api";

type Msg = { role: "user" | "assistant"; content: string };

const GREETING: Msg = {
  role: "assistant",
  content:
    "Hi, I'm Luna 🌙 — your SleepScribe guide. Ask me about your dreams, better sleep, or how to use the app.",
};

const QUICK = [
  "What does dreaming of water mean?",
  "How do I journal a dream?",
  "Tips to fall asleep faster",
];

// Floating AI assistant — a small chat box pinned to the bottom-right corner.
export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([GREETING]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading, open]);

  const send = async (text: string) => {
    const q = text.trim();
    if (!q || loading) return;
    const next = [...messages, { role: "user" as const, content: q }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const { reply } = await api.assistantChat(
        next.filter((m) => m !== GREETING) // don't echo the canned greeting to the model
      );
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "I couldn't reach my brain just now — try again in a moment. 🌙" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-[120] flex flex-col items-end">
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.96 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="mb-3 flex h-[460px] w-[min(88vw,360px)] flex-col overflow-hidden rounded-3xl border border-white/15 bg-night-900/85 shadow-2xl shadow-black/50 backdrop-blur-xl"
          >
            {/* header */}
            <div className="flex items-center gap-3 border-b border-white/10 bg-white/5 px-4 py-3">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-aurora-gradient shadow-lg shadow-aurora-purple/40">
                <Moon className="h-4.5 w-4.5 text-white" />
              </span>
              <div className="flex-1">
                <p className="text-sm font-semibold leading-tight text-white">Luna</p>
                <p className="text-[11px] text-aurora-teal">● SleepScribe assistant</p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="rounded-lg p-1.5 text-white/50 transition hover:bg-white/10 hover:text-white"
                aria-label="Close chat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* messages */}
            <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.map((m, i) => (
                <div
                  key={i}
                  className={`max-w-[88%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    m.role === "user"
                      ? "ml-auto bg-aurora-purple/30 text-white"
                      : "bg-white/[0.07] text-white/90"
                  }`}
                >
                  {m.content}
                </div>
              ))}

              {messages.length === 1 && (
                <div className="space-y-1.5 pt-1">
                  {QUICK.map((q) => (
                    <button
                      key={q}
                      onClick={() => send(q)}
                      className="block w-full rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-left text-xs text-white/70 transition hover:border-aurora-violet/40 hover:text-white"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

              {loading && (
                <div className="flex items-center gap-2 px-1 text-xs text-white/40">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" /> Luna is thinking…
                </div>
              )}
            </div>

            {/* input */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send(input);
              }}
              className="flex items-center gap-2 border-t border-white/10 bg-night-950/50 px-3 py-2.5"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Luna anything…"
                className="w-full bg-transparent px-1 py-1.5 text-sm text-white outline-none placeholder:text-white/30"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-aurora-gradient text-white transition disabled:opacity-40"
                aria-label="Send"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* launcher button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="grid h-14 w-14 place-items-center rounded-full bg-aurora-gradient shadow-xl shadow-aurora-purple/40 transition-transform hover:scale-105 active:scale-95"
        aria-label={open ? "Close assistant" : "Open assistant"}
      >
        <AnimatePresence mode="wait" initial={false}>
          {open ? (
            <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
              <X className="h-6 w-6 text-white" />
            </motion.span>
          ) : (
            <motion.span key="c" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
              <MessageCircle className="h-6 w-6 text-white" />
            </motion.span>
          )}
        </AnimatePresence>
      </button>
    </div>
  );
}
