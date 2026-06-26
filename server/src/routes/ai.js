import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { Entry } from "../models/Entry.js";
import { analyzeDream, chatAboutDream, weeklyDigest, aiEnabled } from "../ai/groq.js";

const router = Router();

// GET /api/ai/status — is the LLM wired up?
router.get("/status", (_req, res) => {
  res.json({ aiEnabled, model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile" });
});

// POST /api/ai/analyze — the real LLM call site (authenticated).
// Body: { text }. Returns { analysis, source }.
router.post("/analyze", requireAuth, async (req, res) => {
  const { text } = req.body || {};
  if (!text || !text.trim()) {
    return res.status(400).json({ error: "Dream text is required" });
  }
  try {
    const result = await analyzeDream(text);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Analysis failed" });
  }
});

// --- Public demo endpoint (no auth) for the homepage "Dream AI" widget. ---
// Best-effort, per-IP rate limiting + input cap so an open endpoint can't burn
// the Groq quota. (In serverless the limiter is per warm instance, so it's a
// guardrail, not a hard guarantee.)
const DEMO_MAX_CHARS = 1200;
const DEMO_WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const DEMO_MAX_HITS = 12;
const demoHits = (globalThis.__demoHits ||= new Map());

function demoRateLimited(ip) {
  const now = Date.now();
  const rec = demoHits.get(ip);
  if (!rec || now > rec.reset) {
    demoHits.set(ip, { count: 1, reset: now + DEMO_WINDOW_MS });
    return false;
  }
  rec.count += 1;
  return rec.count > DEMO_MAX_HITS;
}

// POST /api/ai/demo — same analysis, open to visitors, rate-limited.
router.post("/demo", async (req, res) => {
  const ip = (
    req.headers["x-forwarded-for"]?.toString().split(",")[0] ||
    req.ip ||
    "unknown"
  ).trim();
  if (demoRateLimited(ip)) {
    return res
      .status(429)
      .json({ error: "Too many tries — give it a few minutes and come back." });
  }

  let text = req.body?.text;
  if (!text || !String(text).trim()) {
    return res.status(400).json({ error: "Dream text is required" });
  }
  text = String(text).slice(0, DEMO_MAX_CHARS);

  try {
    const result = await analyzeDream(text);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Analysis failed" });
  }
});

// POST /api/ai/chat — multi-turn follow-up chat about a dream (authenticated).
// Body: { dreamText, summary, messages: [{role, content}] }. Returns { reply }.
router.post("/chat", requireAuth, async (req, res) => {
  const { dreamText, summary, messages } = req.body || {};
  if (!dreamText || !String(dreamText).trim()) {
    return res.status(400).json({ error: "Dream context is required" });
  }
  try {
    const reply = await chatAboutDream(
      String(dreamText).slice(0, 4000),
      String(summary || "").slice(0, 2000),
      messages
    );
    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Chat failed" });
  }
});

// GET /api/ai/digest — a weekly "sleep coach" report over the last 7 days.
router.get("/digest", requireAuth, async (req, res) => {
  try {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const entries = await Entry.find({
      userId: req.userId,
      createdAt: { $gte: since },
    }).sort({ createdAt: -1 });

    const digest = await weeklyDigest(entries);
    res.json({ digest, count: entries.length });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not build digest" });
  }
});

export default router;
