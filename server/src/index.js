import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./db.js";
import authRoutes from "./routes/auth.js";
import entryRoutes from "./routes/entries.js";
import aiRoutes from "./routes/ai.js";

const app = express();

// CORS — allow the configured frontend origin(s).
const origins = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((s) => s.trim());
app.use(cors({ origin: origins, credentials: true }));
app.use(express.json({ limit: "1mb" }));

// Health check
app.get("/api/health", (_req, res) => res.json({ ok: true, service: "sleep-scribe-api" }));

app.use("/api/auth", authRoutes);
app.use("/api/entries", entryRoutes);
app.use("/api/ai", aiRoutes);

// 404 + error fallback
app.use((_req, res) => res.status(404).json({ error: "Not found" }));

const PORT = process.env.PORT || 4000;

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log(`✓ Sleep-Scribe API on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("✖ Failed to start server:", err);
    process.exit(1);
  });
