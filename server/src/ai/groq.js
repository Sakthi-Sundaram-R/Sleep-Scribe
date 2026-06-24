import Groq from "groq-sdk";
import { heuristicAnalyze } from "./heuristic.js";

// Day 3: the real LLM call.
// Key comes from process.env.GROQ_API_KEY — never hard-coded.
const apiKey = process.env.GROQ_API_KEY;
const MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

const groq = apiKey ? new Groq({ apiKey }) : null;

export const aiEnabled = Boolean(groq);

const SYSTEM_PROMPT = `You are Sleep-Scribe, a warm, insightful dream analyst.
Given a user's dream, respond with a thoughtful, grounded interpretation.
Be supportive and concrete — never clinical or superstitious.

Reply with ONLY a JSON object in EXACTLY this shape:
{
  "summary": "2-3 sentence interpretation of the dream",
  "mood": { "label": "<one word emotional tone>", "score": <0-100 positivity>, "color": "<hex>" },
  "symbols": [ { "name": "<symbol>", "meaning": "<what it may represent>" } ],
  "themes": ["<short theme>", "..."],
  "tip": "one actionable, kind sleep or wellbeing tip"
}

Rules:
- 2 to 4 symbols, 2 to 4 themes.
- mood.color must be a hex string chosen to match the tone:
  calm/positive -> "#2dd4bf", anxious -> "#fb6a4a", sad -> "#6366f1",
  tense/angry -> "#f59e0b", reflective/neutral -> "#7c5cff".
- Output valid JSON only. No markdown, no commentary.`;

function coerce(obj, fallback) {
  if (!obj || typeof obj !== "object") return fallback;
  return {
    summary: typeof obj.summary === "string" ? obj.summary : fallback.summary,
    mood: {
      label: obj.mood?.label || fallback.mood.label,
      score:
        typeof obj.mood?.score === "number"
          ? Math.max(0, Math.min(100, obj.mood.score))
          : fallback.mood.score,
      color: /^#[0-9a-fA-F]{6}$/.test(obj.mood?.color || "")
        ? obj.mood.color
        : fallback.mood.color,
    },
    symbols: Array.isArray(obj.symbols) && obj.symbols.length
      ? obj.symbols
          .slice(0, 4)
          .map((s) => ({ name: String(s.name || "Symbol"), meaning: String(s.meaning || "") }))
      : fallback.symbols,
    themes: Array.isArray(obj.themes) && obj.themes.length
      ? obj.themes.slice(0, 4).map(String)
      : fallback.themes,
    tip: typeof obj.tip === "string" ? obj.tip : fallback.tip,
  };
}

// Analyze a dream. Uses Groq if a key is configured; otherwise falls back to
// the offline heuristic so the app always works.
export async function analyzeDream(text) {
  const fallback = heuristicAnalyze(text);
  if (!groq) return { analysis: fallback, source: "heuristic" };

  try {
    const completion = await groq.chat.completions.create({
      model: MODEL,
      temperature: 0.7,
      max_tokens: 700,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: `Dream:\n"""${text}"""` },
      ],
    });
    const raw = completion.choices?.[0]?.message?.content || "{}";
    const parsed = JSON.parse(raw);
    return { analysis: coerce(parsed, fallback), source: "groq" };
  } catch (err) {
    console.error("Groq analysis failed, using fallback:", err.message);
    return { analysis: fallback, source: "heuristic-fallback" };
  }
}
