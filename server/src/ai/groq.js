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

const CHAT_SYSTEM = `You are Sleep-Scribe, a warm, grounded dream companion.
The user has shared a dream and its interpretation, and now wants to talk about it.
Answer their follow-up questions thoughtfully and conversationally.
- Be supportive, concrete and human — never clinical, never superstitious.
- Keep replies short (2-4 sentences). Refer back to their dream's details.
- It's fine to say a dream's meaning is personal and open to interpretation.
- Never give medical, psychological or diagnostic advice.`;

// Multi-turn follow-up chat about a specific dream. `history` is an array of
// { role: "user" | "assistant", content } turns (oldest first). Returns plain text.
export async function chatAboutDream(dreamText, summary, history) {
  const turns = (Array.isArray(history) ? history : [])
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && m.content)
    .slice(-12)
    .map((m) => ({ role: m.role, content: String(m.content).slice(0, 2000) }));

  if (!groq) {
    return "I can't reach the dream model right now — but dreams are deeply personal, so trust what this one stirs in you. Try again in a moment.";
  }

  const context = `The dream:\n"""${dreamText}"""\n\nThe interpretation so far:\n${summary || "(none)"}`;
  try {
    const completion = await groq.chat.completions.create({
      model: MODEL,
      temperature: 0.7,
      max_tokens: 400,
      messages: [
        { role: "system", content: CHAT_SYSTEM },
        { role: "system", content: context },
        ...turns,
      ],
    });
    return completion.choices?.[0]?.message?.content?.trim() || "…";
  } catch (err) {
    console.error("Groq chat failed:", err.message);
    return "I'm having trouble reaching the dream model right now. While I reconnect — what stood out most to you about this dream? Sitting with that feeling is often where the meaning starts.";
  }
}

// Weekly "sleep coach" digest over a set of recent entries. Returns plain text.
export async function weeklyDigest(entries) {
  const list = (entries || []).slice(0, 30);
  if (list.length === 0) {
    return "No dreams logged this week yet. Capture even a fragment tomorrow morning — patterns build fast.";
  }

  const lines = list
    .map((e, i) => {
      const mood = e.analysis?.mood?.label || "—";
      const syms = (e.analysis?.symbols || []).map((s) => s.name).join(", ") || "—";
      return `${i + 1}. [${mood}] symbols: ${syms} — "${String(e.text).slice(0, 160)}"`;
    })
    .join("\n");

  if (!groq) {
    return `This week you logged ${list.length} dream${list.length === 1 ? "" : "s"}. Keep the streak going — consistency is what reveals the patterns.`;
  }

  try {
    const completion = await groq.chat.completions.create({
      model: MODEL,
      temperature: 0.6,
      max_tokens: 500,
      messages: [
        {
          role: "system",
          content:
            "You are Sleep-Scribe's weekly sleep coach. Given a week of dream entries, write a warm, concise report (about 120 words). Open with one encouraging sentence, then 2-3 short observations about recurring symbols, emotional tone and any shift across the week, then end with one gentle, actionable suggestion. Plain prose, no markdown headings, no medical advice.",
        },
        { role: "user", content: `This week's dreams:\n${lines}` },
      ],
    });
    return completion.choices?.[0]?.message?.content?.trim() || "";
  } catch (err) {
    console.error("Groq digest failed:", err.message);
    const moods = [...new Set(list.map((e) => e.analysis?.mood?.label).filter(Boolean))];
    return `You logged ${list.length} dream${list.length === 1 ? "" : "s"} this week${
      moods.length ? `, mostly feeling ${moods.slice(0, 2).join(" and ")}` : ""
    }. The AI summary is offline right now, but showing up this consistently is the hard part — keep the streak going and the patterns will surface.`;
  }
}

const ASSISTANT_SYSTEM = `You are Luna, SleepScribe's friendly in-app assistant.
SleepScribe is an AI sleep journal & dream-analysis app: users record dreams (by
text or voice), the AI decodes symbols/mood/themes, and they get insights,
recurring-symbol tracking, streaks and a weekly report.

Help users with:
- questions about sleep, dreams and dream meanings (gently, never superstitious),
- how to use SleepScribe's features,
- light, supportive sleep-hygiene tips.

Style: warm, encouraging, concise (2-4 sentences). Never give medical or
psychological diagnoses — for serious or persistent issues, kindly suggest
speaking to a doctor. Stay on topic (sleep, dreams, the app).`;

// General-purpose assistant chatbot. `history` is [{role,content}] turns.
export async function assistantChat(history) {
  const turns = (Array.isArray(history) ? history : [])
    .filter((m) => m && (m.role === "user" || m.role === "assistant") && m.content)
    .slice(-12)
    .map((m) => ({ role: m.role, content: String(m.content).slice(0, 1500) }));

  if (!groq) {
    return "I'm resting for a moment and can't reach my full brain — but I'm here. Try asking again shortly, or explore your journal in the meantime. 🌙";
  }
  try {
    const completion = await groq.chat.completions.create({
      model: MODEL,
      temperature: 0.7,
      max_tokens: 350,
      messages: [{ role: "system", content: ASSISTANT_SYSTEM }, ...turns],
    });
    return completion.choices?.[0]?.message?.content?.trim() || "…";
  } catch (err) {
    console.error("Assistant chat failed:", err.message);
    return "I'm having trouble thinking clearly right now — give me a moment and try again. 🌙";
  }
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
