// Email sender with three tiers, tried in order:
//   1. Gmail SMTP (nodemailer) — sends FROM a real Gmail address using an App
//      Password. Set GMAIL_USER + GMAIL_APP_PASSWORD.
//   2. Resend HTTP API — set RESEND_API_KEY + EMAIL_FROM (verified domain).
//   3. Console log — so password-reset works in local dev with nothing set up.
import nodemailer from "nodemailer";

const gmailUser = process.env.GMAIL_USER;
const gmailPass = process.env.GMAIL_APP_PASSWORD;

// Built once and reused. Gmail App Passwords are entered with spaces in the UI
// but must be sent without them, so we strip whitespace.
const gmailTransport =
  gmailUser && gmailPass
    ? nodemailer.createTransport({
        service: "gmail",
        auth: { user: gmailUser, pass: gmailPass.replace(/\s+/g, "") },
      })
    : null;

export async function sendEmail({ to, subject, html, text }) {
  // 1) Gmail SMTP — actually sends from the configured Gmail address.
  const replyTo = process.env.EMAIL_REPLY_TO;
  if (gmailTransport) {
    // Gmail requires the From address to be the authenticated account (or an
    // alias). EMAIL_FROM may add a display name, e.g. "SleepScribe <you@gmail.com>".
    const from = process.env.EMAIL_FROM || `SleepScribe <${gmailUser}>`;
    await gmailTransport.sendMail({ from, to, subject, html, text, replyTo });
    return { delivered: true, via: "gmail" };
  }

  // 2) Resend (HTTP). Note: the From address must be on a domain verified in
  // Resend — a @gmail.com From will be rejected here.
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (key && from) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to, subject, html, text, reply_to: replyTo }),
    });
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`Email send failed (${res.status}): ${body}`);
    }
    return { delivered: true, via: "resend" };
  }

  // 3) Nothing configured — log so dev flows still work.
  console.log(
    `\n📧 [email not configured — logging instead]\n  to:      ${to}\n  subject: ${subject}\n  ${text || ""}\n`
  );
  return { delivered: false, logged: true };
}
