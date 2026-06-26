import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./db.js";
import authRoutes from "./routes/auth.js";
import entryRoutes from "./routes/entries.js";
import aiRoutes from "./routes/ai.js";

// The Express app, with no server bound. Imported by:
//   - server/src/index.js  → local dev (app.listen on a port)
//   - api/index.js         → Vercel serverless function (exported as handler)
const app = express();

// CORS — allow the configured frontend origin(s). On Vercel the frontend and
// API share one origin, so this is mostly a safety net for cross-origin setups.
const origins = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((s) => s.trim());
app.use(cors({ origin: origins, credentials: true }));
app.use(express.json({ limit: "1mb" }));

// Health check — runs BEFORE the DB gate so it can report the real DB status
// (and the exact connection error) instead of a generic 500.
app.get("/api/health", async (_req, res) => {
  try {
    await connectDB();
    res.json({ ok: true, db: "connected", service: "sleep-scribe-api" });
  } catch (err) {
    res.status(500).json({
      ok: false,
      db: "error",
      message: err?.message || String(err),
      hasMongoUri: Boolean(process.env.MONGODB_URI),
    });
  }
});

// Ensure the DB is connected before any route runs. connectDB() is cached, so
// this is a no-op once a (warm) connection exists — the right pattern for
// serverless, where there's no long-lived boot step.
app.use(async (_req, _res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    next(err);
  }
});

app.use("/api/auth", authRoutes);
app.use("/api/entries", entryRoutes);
app.use("/api/ai", aiRoutes);

// 404 fallback
app.use((_req, res) => res.status(404).json({ error: "Not found" }));

// Error fallback — never crash the function; always return JSON.
// eslint-disable-next-line no-unused-vars
app.use((err, _req, res, _next) => {
  console.error("✖ API error:", err);
  res.status(500).json({ error: "Internal server error" });
});

export default app;
