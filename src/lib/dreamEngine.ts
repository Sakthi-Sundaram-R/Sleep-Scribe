// Lightweight, offline "dream analysis" engine.
// This produces believable, structured insight from a dream description so the
// demo works with zero setup. On Day 3 you can swap `analyzeDream` for a real
// LLM call (see README → "Wiring in real AI") without touching the UI.

export type DreamAnalysis = {
  summary: string;
  mood: { label: string; score: number; color: string };
  symbols: { name: string; meaning: string }[];
  themes: string[];
  tip: string;
};

const SYMBOL_LIBRARY: Record<string, { meaning: string; keywords: string[] }> =
  {
    Water: {
      meaning: "your emotional state and things felt but not yet spoken",
      keywords: ["water", "ocean", "sea", "river", "rain", "flood", "swim"],
    },
    Flying: {
      meaning: "a desire for freedom or rising above a current pressure",
      keywords: ["fly", "flying", "floating", "soar", "wings"],
    },
    Falling: {
      meaning: "feeling a loss of control or insecurity in waking life",
      keywords: ["fall", "falling", "drop", "slip"],
    },
    Chase: {
      meaning: "an issue or emotion you may be avoiding rather than facing",
      keywords: ["chase", "chased", "running", "escape", "follow"],
    },
    Teeth: {
      meaning: "anxiety about appearance, confidence, or being judged",
      keywords: ["teeth", "tooth"],
    },
    Home: {
      meaning: "your sense of self, safety, and where you feel grounded",
      keywords: ["home", "house", "room", "door"],
    },
    People: {
      meaning: "relationships and how connected you feel to others right now",
      keywords: ["friend", "family", "mother", "father", "stranger", "crowd"],
    },
    Light: {
      meaning: "clarity, hope, or a new realization forming",
      keywords: ["light", "sun", "glow", "bright", "star"],
    },
    Darkness: {
      meaning: "the unknown, or feelings you haven't fully explored yet",
      keywords: ["dark", "darkness", "night", "shadow", "black"],
    },
  };

const MOODS = [
  { test: ["happy", "joy", "laugh", "calm", "peace", "love", "warm"], label: "Peaceful", color: "#2dd4bf" },
  { test: ["scared", "fear", "afraid", "panic", "anxious", "nightmare"], label: "Anxious", color: "#fb6a4a" },
  { test: ["sad", "cry", "alone", "lonely", "lost", "grief"], label: "Melancholic", color: "#6366f1" },
  { test: ["angry", "fight", "rage", "argue", "shout"], label: "Tense", color: "#f59e0b" },
];

const THEME_MAP: Record<string, string[]> = {
  "Letting go": ["leave", "goodbye", "end", "lost", "gone"],
  Transformation: ["change", "become", "new", "grow", "different"],
  "Seeking control": ["control", "drive", "steer", "fix", "try"],
  Connection: ["friend", "love", "family", "together", "talk"],
  "Facing fear": ["fear", "dark", "monster", "scared", "danger"],
};

function pick<T>(arr: T[], seed: number): T {
  return arr[seed % arr.length];
}

export function analyzeDream(text: string): DreamAnalysis {
  const lower = ` ${text.toLowerCase()} `;
  const seed = text.length;

  // Symbols
  const symbols = Object.entries(SYMBOL_LIBRARY)
    .filter(([, v]) => v.keywords.some((k) => lower.includes(k)))
    .slice(0, 4)
    .map(([name, v]) => ({ name, meaning: v.meaning }));

  if (symbols.length === 0) {
    symbols.push(
      { name: "Journey", meaning: "personal growth and the path you're on" },
      { name: "Self", meaning: "how you currently see your own identity" }
    );
  }

  // Mood
  const matchedMood =
    MOODS.find((m) => m.test.some((w) => lower.includes(w))) ?? {
      label: "Reflective",
      color: "#7c5cff",
    };
  const moodScore = 45 + (seed % 50);

  // Themes
  const themes = Object.entries(THEME_MAP)
    .filter(([, words]) => words.some((w) => lower.includes(w)))
    .map(([t]) => t);
  if (themes.length === 0) themes.push("Self-discovery", "Processing the day");

  const summaries = [
    `This dream seems to be your mind processing recent emotions through ${symbols[0].name.toLowerCase()} imagery. The ${matchedMood.label.toLowerCase()} tone suggests something on your mind is asking for attention.`,
    `Your subconscious is working through ${themes[0].toLowerCase()}. The presence of ${symbols[0].name.toLowerCase()} often reflects ${symbols[0].meaning}.`,
    `A ${matchedMood.label.toLowerCase()} dream centered on ${symbols[0].name.toLowerCase()} — typically a sign your mind is making sense of change and what matters to you right now.`,
  ];

  const tips = [
    "Try a 10-minute wind-down journal before bed to give these thoughts a place to land.",
    "Note how you felt on waking — patterns over a week reveal far more than any single dream.",
    "A consistent sleep and wake time can make dreams calmer and easier to recall.",
    "If a theme keeps returning, it's usually worth a moment of honest reflection while awake.",
  ];

  return {
    summary: pick(summaries, seed),
    mood: { label: matchedMood.label, score: moodScore, color: matchedMood.color },
    symbols,
    themes: themes.slice(0, 4),
    tip: pick(tips, seed),
  };
}

export const EXAMPLE_DREAMS = [
  "I was flying over a glowing ocean at night, then suddenly started falling toward dark water.",
  "I kept running through my old house but every door led back to the same room.",
  "I was late for something important and couldn't find my friends in a huge crowd.",
];
