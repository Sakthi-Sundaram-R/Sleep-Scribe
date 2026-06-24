import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import { analyzeDream, aiEnabled } from "../ai/groq.js";

const router = Router();

// GET /api/ai/status — is the LLM wired up?
router.get("/status", (_req, res) => {
  res.json({ aiEnabled, model: process.env.GROQ_MODEL || "llama-3.3-70b-versatile" });
});

// POST /api/ai/analyze — the real LLM call site.
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

export default router;
