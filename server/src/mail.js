// Minimal email sender. Uses Resend (https://resend.com) over fetch if
// RESEND_API_KEY + EMAIL_FROM are set; otherwise logs the message to the server
// console so password-reset works in local dev without any email provider.

export async function sendEmail({ to, subject, html, text }) {
  const key = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!key || !from) {
    console.log(
      `\n📧 [email not configured — logging instead]\n  to:      ${to}\n  subject: ${subject}\n  ${text || ""}\n`
    );
    return { delivered: false, logged: true };
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, html, text }),
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`Email send failed (${res.status}): ${body}`);
  }
  return { delivered: true };
}
