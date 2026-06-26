import type { DreamAnalysis } from "../lib/dreamEngine";

// Renders a shareable, story-sized (1080×1350) PNG of a dream analysis on a
// canvas — a vibrant aurora-themed backdrop, the interpretation, mood, top
// symbols, and the dreamer's name. No external deps; uses the page's web fonts.

export type DreamCardInput = {
  text: string;
  date?: string;
  analysis: DreamAnalysis;
};

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

export async function renderDreamCard(
  entry: DreamCardInput,
  opts?: { userName?: string }
): Promise<Blob> {
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
  const accent = entry.analysis?.mood?.color || "#8b7dff";

  // ---- Vibrant aurora backdrop ----
  const bg = ctx.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#1b1550");
  bg.addColorStop(0.5, "#2a1a5e");
  bg.addColorStop(1, "#100c2e");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  const glow = (x: number, y: number, r: number, color: string) => {
    const rg = ctx.createRadialGradient(x, y, 0, x, y, r);
    rg.addColorStop(0, color);
    rg.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = rg;
    ctx.fillRect(0, 0, W, H);
  };
  glow(170, 200, 540, "rgba(99,102,241,0.55)"); // indigo  – top-left
  glow(940, 250, 480, "rgba(56,189,248,0.42)"); // cyan    – top-right
  glow(160, 1150, 540, "rgba(124,58,237,0.48)"); // violet  – bottom-left
  glow(960, 1180, 500, "rgba(236,72,153,0.32)"); // pink    – bottom-right
  glow(880, 380, 340, `${accent}66`); // mood accent

  // top accent strip (brand gradient)
  const strip = ctx.createLinearGradient(0, 0, W, 0);
  strip.addColorStop(0, "#6366f1");
  strip.addColorStop(0.5, "#a78bfa");
  strip.addColorStop(1, "#38bdf8");
  ctx.fillStyle = strip;
  ctx.fillRect(0, 0, W, 12);

  // stars
  for (let i = 0; i < 70; i++) {
    ctx.fillStyle = i % 3 === 0 ? "#a5b4fc" : "#ffffff";
    ctx.globalAlpha = Math.random() * 0.6 + 0.2;
    ctx.beginPath();
    ctx.arc(Math.random() * W, Math.random() * H, Math.random() * 1.8 + 0.4, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // ---- Brand (gradient text) ----
  const brand = ctx.createLinearGradient(PAD, 0, PAD + 380, 0);
  brand.addColorStop(0, "#a5b4fc");
  brand.addColorStop(1, "#67e8f9");
  ctx.fillStyle = brand;
  ctx.font = "700 40px Inter, system-ui, sans-serif";
  ctx.fillText("✦  SleepScribe", PAD, 145);

  // date (right)
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.font = "500 30px 'JetBrains Mono', monospace";
  ctx.textAlign = "right";
  ctx.fillText(entry.date || "", W - PAD, 145);
  ctx.textAlign = "left";

  // eyebrow — personalized with the dreamer's name
  const name = opts?.userName?.trim();
  ctx.fillStyle = "#c4b5fd";
  ctx.font = "800 28px Inter, system-ui, sans-serif";
  ctx.fillText(
    (name ? `${name}'s dream`.toUpperCase() : "DREAM INTERPRETATION"),
    PAD,
    300
  );

  // summary (large serif)
  ctx.fillStyle = "#f4f1ff";
  ctx.font = "500 64px 'Cormorant Garamond', Georgia, serif";
  const summary = entry.analysis?.summary || entry.text;
  const lines = wrap(ctx, summary, W - PAD * 2).slice(0, 7);
  let y = 380;
  for (const ln of lines) {
    ctx.fillText(ln, PAD, y);
    y += 78;
  }

  // mood row
  y += 34;
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.font = "700 26px Inter, system-ui, sans-serif";
  ctx.fillText("MOOD", PAD, y);
  ctx.fillStyle = accent;
  ctx.font = "800 30px Inter, system-ui, sans-serif";
  ctx.textAlign = "right";
  ctx.fillText((entry.analysis?.mood?.label || "—").toUpperCase(), W - PAD, y);
  ctx.textAlign = "left";
  // mood bar (gradient fill)
  y += 28;
  const barW = W - PAD * 2;
  ctx.fillStyle = "rgba(255,255,255,0.14)";
  roundRect(ctx, PAD, y, barW, 16, 8);
  ctx.fill();
  const score = Math.max(0, Math.min(100, entry.analysis?.mood?.score ?? 50));
  const moodGrad = ctx.createLinearGradient(PAD, 0, PAD + barW, 0);
  moodGrad.addColorStop(0, accent);
  moodGrad.addColorStop(1, "#a78bfa");
  ctx.fillStyle = moodGrad;
  roundRect(ctx, PAD, y, (barW * score) / 100, 16, 8);
  ctx.fill();

  // symbols
  y += 96;
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.font = "700 26px Inter, system-ui, sans-serif";
  ctx.fillText("KEY SYMBOLS", PAD, y);
  const symbols = (entry.analysis?.symbols ?? []).slice(0, 3);
  ctx.font = "600 32px Inter, system-ui, sans-serif";
  const dotColors = ["#38bdf8", "#a78bfa", "#f472b6"];
  symbols.forEach((s, i) => {
    y += 60;
    ctx.fillStyle = dotColors[i % dotColors.length];
    ctx.beginPath();
    ctx.arc(PAD + 8, y - 11, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#eceaff";
    ctx.fillText(s.name, PAD + 36, y);
  });

  // footer
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.font = "600 26px Inter, system-ui, sans-serif";
  ctx.fillText(
    name
      ? `${name} · decoded with SleepScribe`
      : "Decoded with SleepScribe — your AI dream journal",
    PAD,
    H - 112
  );
  ctx.fillStyle = "rgba(255,255,255,0.3)";
  ctx.font = "400 22px Inter, system-ui, sans-serif";
  ctx.fillText("For personal reflection — not medical advice.", PAD, H - 74);

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Could not render card"))),
      "image/png"
    );
  });
}
