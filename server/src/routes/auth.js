import { Router } from "express";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";
import { User } from "../models/User.js";
import { requireAuth, signToken } from "../middleware/auth.js";
import { sendEmail } from "../mail.js";

const router = Router();

const sha256 = (s) => crypto.createHash("sha256").update(s).digest("hex");

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const googleClient = GOOGLE_CLIENT_ID ? new OAuth2Client(GOOGLE_CLIENT_ID) : null;

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ error: "An account with this email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name?.trim() || "Dreamer",
      email,
      passwordHash,
    });

    const token = signToken(user._id);
    res.status(201).json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not create account" });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const token = signToken(user._id);
    res.json({ token, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not log in" });
  }
});

// POST /api/auth/google — verify a Google ID token, then log in / sign up.
router.post("/google", async (req, res) => {
  try {
    if (!googleClient) {
      return res
        .status(503)
        .json({ error: "Google sign-in is not configured on the server" });
    }
    const { credential } = req.body || {};
    if (!credential) {
      return res.status(400).json({ error: "Missing Google credential" });
    }

    // Verify the ID token came from Google and is for our app.
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    if (!payload?.email) {
      return res.status(401).json({ error: "Could not read Google profile" });
    }

    const email = payload.email.toLowerCase();
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name: payload.name || "Dreamer",
        email,
        googleId: payload.sub,
        avatar: payload.picture,
      });
    } else if (!user.googleId) {
      // Link Google to an existing email/password account.
      user.googleId = payload.sub;
      if (payload.picture && !user.avatar) user.avatar = payload.picture;
      await user.save();
    }

    const token = signToken(user._id);
    res.json({ token, user });
  } catch (err) {
    console.error("Google auth failed:", err.message);
    res.status(401).json({ error: "Google sign-in failed" });
  }
});

// POST /api/auth/forgot — start a password reset. Always returns 200 so the
// endpoint can't be used to discover which emails have accounts.
router.post("/forgot", async (req, res) => {
  try {
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ error: "Email is required" });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (user && user.passwordHash) {
      const token = crypto.randomBytes(32).toString("hex");
      user.resetTokenHash = sha256(token);
      user.resetTokenExp = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      await user.save();

      const origin = (process.env.CLIENT_ORIGIN || "http://localhost:5173").split(",")[0].trim();
      const link = `${origin}/reset?token=${token}&email=${encodeURIComponent(user.email)}`;
      await sendEmail({
        to: user.email,
        subject: "Reset your SleepScribe password",
        text: `Reset your password (link valid for 1 hour):\n${link}`,
        html: `<p>Tap to reset your SleepScribe password (valid for 1 hour):</p><p><a href="${link}">${link}</a></p><p>If you didn't request this, you can ignore this email.</p>`,
      });
    }

    res.json({ ok: true, message: "If that email has an account, a reset link is on its way." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not start password reset" });
  }
});

// POST /api/auth/reset — complete a password reset with a valid token.
router.post("/reset", async (req, res) => {
  try {
    const { email, token, password } = req.body || {};
    if (!email || !token || !password) {
      return res.status(400).json({ error: "Email, token and new password are required" });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters" });
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
      resetTokenHash: sha256(token),
      resetTokenExp: { $gt: new Date() },
    });
    if (!user) {
      return res.status(400).json({ error: "This reset link is invalid or has expired." });
    }

    user.passwordHash = await bcrypt.hash(password, 10);
    user.resetTokenHash = undefined;
    user.resetTokenExp = undefined;
    await user.save();

    const authToken = signToken(user._id);
    res.json({ token: authToken, user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Could not reset password" });
  }
});

// GET /api/auth/me
router.get("/me", requireAuth, async (req, res) => {
  const user = await User.findById(req.userId);
  if (!user) return res.status(404).json({ error: "User not found" });
  res.json({ user });
});

export default router;
