import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { MessageCircle, Send, Loader2 } from "lucide-react";
import { api } from "../lib/api";
import type { Entry } from "./useEntries";

type Msg = { role: "user" | "assistant"; content: string };

const SUGGESTIONS = [
  "Why might this dream feel this way?",
  "What should I reflect on?",
  "Is this a recurring theme?",
];

// A follow-up conversation about one dream. Resets when the active entry changes.
export default function DreamChat({ entry }: { entry: Entry }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // New dream → fresh conversation.
  useEffect(() => {
    setMessages([]);
    setInput("");
    setErr("");
  }, [entry.id]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, loading]);

  const send = async (text: string) => {
    const q = text.trim();
    if (!q || loading) return;
    setErr("");
    const next = [...messages, { role: "user" as const, content: q }];
    setMessages(next);
    setInput("");
    setLoading(true);
    try {
      const { reply } = await api.chatAboutDream({
        dreamText: entry.text,
        summary: entry.analysis?.summary || "",
        messages: next,
      });
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Couldn't reach the dream model.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
      <div className="mb-3 flex items-center gap-2 text-aurora-violet">
        <MessageCircle className="h-4 w-4" />
        <span className="text-xs font-semibold uppercase tracking-wider">
          Ask about this dream
        </span>
      </div>

      {messages.length > 0 && (
        <div ref={scrollRef} className="mb-3 max-h-64 space-y-2.5 overflow-y-auto pr-1">
          {messages.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm leading-relaxed ${
                m.role === "user"
                  ? "ml-auto bg-aurora-purple/25 text-white"
                  : "bg-white/5 text-white/85"
              }`}
            >
              {m.content}
            </motion.div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 px-1 text-xs text-white/40">
              <Loader2 className="h-3.5 w-3.5 animate-spin" /> thinking…
            </div>
          )}
        </div>
      )}

      {messages.length === 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              disabled={loading}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/60 transition hover:border-aurora-violet/40 hover:text-white disabled:opacity-50"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {err && <p className="mb-2 text-xs text-aurora-pink">{err}</p>}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex items-center gap-2 rounded-xl border border-white/10 bg-night-950/60 px-3 focus-within:border-aurora-purple/60"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a follow-up…"
          className="w-full bg-transparent py-2.5 text-sm outline-none placeholder:text-white/30"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="shrink-0 rounded-lg p-1.5 text-aurora-violet transition hover:bg-white/10 disabled:opacity-40"
          aria-label="Send"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
    </div>
  );
}
