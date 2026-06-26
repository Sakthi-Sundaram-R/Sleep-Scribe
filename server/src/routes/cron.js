import { Router } from "express";
import { Entry } from "../models/Entry.js";
import { User } from "../models/User.js";
import { weeklyDigest } from "../ai/groq.js";
import { sendEmail } from "../mail.js";

const router = Router();

// Vercel Cron calls these endpoints. When CRON_SECRET is set, Vercel sends it
// as a Bearer token in the Authorization header — we require it so the job
// can't be triggered by the public.
function authorized(req) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false; // fail closed: no secret configured → no access
  return req.headers.authorization === `Bearer ${secret}`;
}

function digestHtml(name, digest, count) {
  const safe = String(digest).replace(/\n/g, "<br/>");
  return `<div style="font-family:Inter,system-ui,sans-serif;max-width:560px;margin:0 auto;padding:28px;background:#100c2e;color:#eceaff;border-radius:18px">
    <p style="font-weight:800;font-size:18px;background:linear-gradient(90deg,#a5b4fc,#67e8f9);-webkit-background-clip:text;background-clip:text;color:transparent;margin:0 0 4px">✦ SleepScribe</p>
    <p style="color:#c4b5fd;font-weight:700;letter-spacing:.04em;font-size:12px;margin:0 0 16px">YOUR WEEK IN DREAMS</p>
    <p style="font-size:15px;line-height:1.7;color:#dcd8ff">Hi ${name || "Dreamer"}, here's what your ${count} dream${count === 1 ? "" : "s"} this week revealed:</p>
    <div style="font-size:15px;line-height:1.7;color:#dcd8ff;margin:14px 0">${safe}</div>
    <p style="font-size:12px;color:#8b86b8;margin-top:22px;border-top:1px solid rgba(255,255,255,.1);padding-top:14px">
      For personal reflection — not medical advice. You can turn these emails off in SleepScribe → Settings.
    </p>
  </div>`;
}

// GET /api/cron/weekly-digest — emails each active user their weekly sleep-coach
// report. "Active" = logged at least one dream in the last 7 days.
router.get("/weekly-digest", async (req, res) => {
  if (!authorized(req)) return res.status(401).json({ error: "Unauthorized" });

  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  try {
    const userIds = await Entry.distinct("userId", { createdAt: { $gte: since } });
    let sent = 0;
    let skipped = 0;

    for (const id of userIds) {
      const user = await User.findById(id);
      if (!user?.email || user.weeklyEmailOptOut) {
        skipped++;
        continue;
      }
      const entries = await Entry.find({
        userId: id,
        createdAt: { $gte: since },
      }).sort({ createdAt: -1 });

      const digest = await weeklyDigest(entries);
      await sendEmail({
        to: user.email,
        subject: "Your SleepScribe week in dreams 🌙",
        text: digest,
        html: digestHtml(user.name, digest, entries.length),
      });
      sent++;
    }

    res.json({ ok: true, sent, skipped });
  } catch (err) {
    console.error("Weekly digest cron failed:", err);
    res.status(500).json({ error: "Digest run failed" });
  }
});

export default router;
