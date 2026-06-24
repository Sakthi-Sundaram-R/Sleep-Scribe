// Offline fallback analysis — used when no GROQ_API_KEY is set or the LLM call
// fails, so the app always returns something useful. Mirrors the shape the
// frontend expects: { summary, mood, symbols, themes, tip }.

const SYMBOL_LIBRARY = {
  Water: { meaning: "your emotional state and things felt but not yet spoken", keywords: ["water", "ocean", "sea", "river", "rain", "flood", "swim"] },
  Flying: { meaning: "a desire for freedom or rising above a current pressure", keywords: ["fly", "flying", "floating", "soar", "wings"] },
  Falling: { meaning: "feeling a loss of control or insecurity in waking life", keywords: ["fall", "falling", "drop", "slip"] },
  Chase: { meaning: "an issue or emotion you may be avoiding rather than facing", keywords: ["chase", "chased", "running", "escape", "follow"] },
  Home: { meaning: "your sense of self, safety, and where you feel grounded", keywords: ["home", "house", "room", "door"] },
  People: { meaning: "relationships and how connected you feel to others right now", keywords: ["friend", "family", "mother", "father", "stranger", "crowd"] },
  Light: { meaning: "clarity, hope, or a new realization forming", keywords: ["light", "sun", "glow", "bright", "star"] },
  Darkness: { meaning: "the unknown, or feelings you haven't fully explored yet", keywords: ["dark", "darkness", "night", "shadow", "black"] },
};

const MOODS = [
  { test: ["happy", "joy", "laugh", "calm", "peace", "love", "warm"], label: "Peaceful", color: "#2dd4bf" },
  { test: ["scared", "fear", "afraid", "panic", "anxious", "nightmare"], label: "Anxious", color: "#fb6a4a" },
  { test: ["sad", "cry", "alone", "lonely", "lost", "grief"], label: "Melancholic", color: "#6366f1" },
  { test: ["angry", "fight", "rage", "argue", "shout"], label: "Tense", color: "#f59e0b" },
];

const THEME_MAP = {
  "Letting go": ["leave", "goodbye", "end", "lost", "gone"],
  Transformation: ["change", "become", "new", "grow", "different"],
  "Seeking control": ["control", "drive", "steer", "fix", "try"],
  Connection: ["friend", "love", "family", "together", "talk"],
  "Facing fear": ["fear", "dark", "monster", "scared", "danger"],
};

const TIPS = [
  "Try a 10-minute wind-down journal before bed to give these thoughts a place to land.",
  "Note how you felt on waking — patterns over a week reveal far more than any single dream.",
  "A consistent sleep and wake time can make dreams calmer and easier to recall.",
];

export function heuristicAnalyze(text) {
  const lower = ` ${(text || "").toLowerCase()} `;
  const seed = (text || "").length;

  let symbols = Object.entries(SYMBOL_LIBRARY)
    .filter(([, v]) => v.keywords.some((k) => lower.includes(k)))
    .slice(0, 4)
    .map(([name, v]) => ({ name, meaning: v.meaning }));
  if (symbols.length === 0) {
    symbols = [
      { name: "Journey", meaning: "personal growth and the path you're on" },
      { name: "Self", meaning: "how you currently see your own identity" },
    ];
  }

  const mood =
    MOODS.find((m) => m.test.some((w) => lower.includes(w))) ?? {
      label: "Reflective",
      color: "#7c5cff",
    };

  let themes = Object.entries(THEME_MAP)
    .filter(([, words]) => words.some((w) => lower.includes(w)))
    .map(([t]) => t);
  if (themes.length === 0) themes = ["Self-discovery", "Processing the day"];

  return {
    summary: `A ${mood.label.toLowerCase()} dream centered on ${symbols[0].name.toLowerCase()} — your mind making sense of what matters to you right now.`,
    mood: { label: mood.label, score: 45 + (seed % 50), color: mood.color },
    symbols,
    themes: themes.slice(0, 4),
    tip: TIPS[seed % TIPS.length],
  };
}
