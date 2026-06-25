import app from "./app.js";

// Local development entry point. (On Vercel the app is served by api/index.js
// as a serverless function and this file is never run.)
const PORT = process.env.PORT || 4000;
app.listen(PORT, () =>
  console.log(`✓ Sleep-Scribe API on http://localhost:${PORT}`)
);
