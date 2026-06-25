// Vercel serverless function. Every request rewritten to "/api" (see
// vercel.json) is handled here. The Express app does its own internal routing
// off the original /api/* path, so a single function covers the whole API.
import app from "../server/src/app.js";

export default app;
