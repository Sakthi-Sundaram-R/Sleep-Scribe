import { Router } from "express";
import { Entry } from "../models/Entry.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

// All entry routes require a logged-in user.
router.use(requireAuth);

// GET /api/entries — list the current user's entries, newest first.
router.get("/", async (req, res) => {
  const entries = await Entry.find({ userId: req.userId }).sort({ createdAt: -1 });
  res.json({ entries });
});

// POST /api/entries — create a new entry for the current user.
router.post("/", async (req, res) => {
  try {
    const { text, date, quality, hours, analysis } = req.body || {};
    if (!text || !text.trim()) {
      return res.status(400).json({ error: "Entry text is required" });
    }
    const entry = await Entry.create({
      userId: req.userId,
      text: text.trim(),
      date,
      quality,
      hours,
      analysis,
    });
    res.status(201).json({ entry });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not save entry" });
  }
});

// DELETE /api/entries/:id — delete one of the current user's entries.
router.delete("/:id", async (req, res) => {
  const deleted = await Entry.findOneAndDelete({
    _id: req.params.id,
    userId: req.userId,
  });
  if (!deleted) return res.status(404).json({ error: "Entry not found" });
  res.json({ ok: true });
});

export default router;
