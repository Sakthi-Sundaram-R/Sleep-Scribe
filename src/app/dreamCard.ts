import type { Entry } from "./useEntries";

// Renders a shareable, story-sized (1080×1350) PNG of a dream analysis on a
// canvas — gradient backdrop, interpretation, mood and top symbols, branded.
// No external deps; uses the web fonts already loaded by the page.

function wrap(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function roundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export async function renderDreamCard(entry: Entry): Promise<Blob> {
  // Make sure the brand fonts are ready so the canvas doesn't fall back to serif.
  try {
    await (document as Document & { fonts?: FontFaceSet }).fonts?.ready;
  } catch {
    /* fonts API unsupported — system fonts are fine */
  }

  const W = 1080;
  const H = 1350;
  const PAD = 90;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d")!;

  // backdrop
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#0b0f1f");
  bg.addColorStop(0.5, "#160f2e");
  bg.addColorStop(1, "#0a0712");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  const glow = (x: number, y: number, r: number, color: string) => {
    const rg = ctx.createRadialGradient(x, y, 0, x, y, r);
    rg.addColorStop(0, color);
    rg.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = rg;
    ctx.fillRect(0, 0, W, H);
  };
  glow(250, 240, 460, "rgba(124,58,237,0.40)");
  glow(900, 1180, 520, "rgba(56,189,248,0.16)");
  const accent = entry.analysis?.mood?.color || "#7c5cff";
  glow(880, 360, 360, `${accent}55`);

  // stars
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  for (let i = 0; i < 60; i++) {
    const x = Math.random() * W;
    const y = Math.random() * H;
    const s = Math.random() * 1.8 + 0.4;
    ctx.globalAlpha = Math.random() * 0.6 + 0.2;
    ctx.beginPath();
    ctx.arc(x, y, s, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // brand
  ctx.fillStyle = "#c7b9ff";
  ctx.font = "600 36px Inter, system-ui, sans-serif";
  ctx.fillText("✦  SleepScribe", PAD, 130);

  // date (right)
  ctx.fillStyle = "rgba(255,255,255,0.45)";
  ctx.font = "500 30px 'JetBrains Mono', monospace";
  ctx.textAlign = "right";
  ctx.fillText(entry.date || "", W - PAD, 130);
  ctx.textAlign = "left";

  // eyebrow
  ctx.fillStyle = accent;
  ctx.font = "700 26px Inter, system-ui, sans-serif";
  ctx.fillText("DREAM INTERPRETATION", PAD, 290);

  // summary (large serif)
  ctx.fillStyle = "#f3f1ff";
  ctx.font = "500 62px 'Cormorant Garamond', Georgia, serif";
  const summary = entry.analysis?.summary || entry.text;
  const lines = wrap(ctx, summary, W - PAD * 2).slice(0, 7);
  let y = 360;
  for (const ln of lines) {
    ctx.fillText(ln, PAD, y);
    y += 76;
  }

  // mood row
  y += 30;
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.font = "600 26px Inter, system-ui, sans-serif";
  ctx.fillText("MOOD", PAD, y);
  ctx.fillStyle = accent;
  ctx.font = "700 30px Inter, system-ui, sans-serif";
  ctx.textAlign = "right";
  ctx.fillText((entry.analysis?.mood?.label || "—").toUpperCase(), W - PAD, y);
  ctx.textAlign = "left";
  // mood bar
  y += 26;
  const barW = W - PAD * 2;
  ctx.fillStyle = "rgba(255,255,255,0.12)";
  roundRect(ctx, PAD, y, barW, 14, 7);
  ctx.fill();
  const score = Math.max(0, Math.min(100, entry.analysis?.mood?.score ?? 50));
  ctx.fillStyle = accent;
  roundRect(ctx, PAD, y, (barW * score) / 100, 14, 7);
  ctx.fill();

  // symbols
  y += 90;
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.font = "600 26px Inter, system-ui, sans-serif";
  ctx.fillText("KEY SYMBOLS", PAD, y);
  y += 24;
  const symbols = (entry.analysis?.symbols ?? []).slice(0, 3);
  ctx.font = "600 30px Inter, system-ui, sans-serif";
  for (const s of symbols) {
    y += 56;
    ctx.fillStyle = "#ffffff";
    const dot = PAD + 8;
    ctx.beginPath();
    ctx.arc(dot, y - 10, 6, 0, Math.PI * 2);
    ctx.fillStyle = accent;
    ctx.fill();
    ctx.fillStyle = "#e7e4ff";
    ctx.fillText(s.name, PAD + 34, y);
  }

  // footer
  ctx.fillStyle = "rgba(255,255,255,0.4)";
  ctx.font = "500 26px Inter, system-ui, sans-serif";
  ctx.fillText("Decoded with SleepScribe — your AI dream journal", PAD, H - 110);
  ctx.fillStyle = "rgba(255,255,255,0.25)";
  ctx.font = "400 22px Inter, system-ui, sans-serif";
  ctx.fillText("For personal reflection — not medical advice.", PAD, H - 72);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Could not render card"))),
      "image/png"
    );
  });
}
