import type { DreamAnalysis } from "../lib/dreamEngine";

// Renders a 1080×1080 PNG of abstract "dream art" — a generative aurora
// composition whose colours, flow and forms are seeded by the dream's text and
// its AI emotional fingerprint (mood, score, symbols). Deterministic: the same
// dream always paints the same artwork. No external image API — pure canvas.

export type DreamArtInput = {
  text: string;
  date?: string;
  analysis: DreamAnalysis;
};

// Tiny seeded PRNG (mulberry32) so each dream maps to a stable composition.
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function hexToRgb(hex: string): [number, number, number] {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex);
  if (!m) return [124, 92, 255];
  const n = parseInt(m[1], 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

// A calm aurora palette, biased toward the dream's mood colour.
function buildPalette(accent: string, rnd: () => number): string[] {
  const base = ["#6366f1", "#7c3aed", "#a78bfa", "#38bdf8", "#22d3ee", "#ec4899"];
  // shuffle deterministically, then make the mood accent dominant
  for (let i = base.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [base[i], base[j]] = [base[j], base[i]];
  }
  return [accent, accent, ...base];
}

export async function renderDreamArt(entry: DreamArtInput): Promise<Blob> {
  try {
    await (document as Document & { fonts?: FontFaceSet }).fonts?.ready;
  } catch {
    /* fonts API unsupported — fine */
  }

  const S = 1080;
  const canvas = document.createElement("canvas");
  canvas.width = S;
  canvas.height = S;
  const ctx = canvas.getContext("2d")!;

  const a = entry.analysis || ({} as DreamAnalysis);
  const accent = a.mood?.color || "#7c5cff";
  const score = Math.max(0, Math.min(100, a.mood?.score ?? 50));
  const symbolCount = (a.symbols?.length ?? 0) || 3;

  const seed = hashString(`${entry.text}|${a.summary ?? ""}|${a.mood?.label ?? ""}`);
  const rnd = mulberry32(seed);
  const palette = buildPalette(accent, rnd);

  // ---- Deep night base, tinted toward the mood ----
  const [ar, ag, ab] = hexToRgb(accent);
  const bg = ctx.createLinearGradient(0, 0, S, S);
  bg.addColorStop(0, `rgb(${10 + ar * 0.06}, ${9 + ag * 0.05}, ${28 + ab * 0.08})`);
  bg.addColorStop(1, "#080617");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, S, S);

  // ---- Soft aurora blobs (more positive mood → warmer, brighter) ----
  ctx.globalCompositeOperation = "lighter";
  const blobs = 5 + Math.floor(rnd() * 4);
  for (let i = 0; i < blobs; i++) {
    const x = rnd() * S;
    const y = rnd() * S;
    const r = S * (0.22 + rnd() * 0.4);
    const color = palette[Math.floor(rnd() * palette.length)];
    const [cr, cg, cb] = hexToRgb(color);
    const alpha = 0.18 + (score / 100) * 0.22 + rnd() * 0.1;
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, `rgba(${cr},${cg},${cb},${alpha.toFixed(3)})`);
    g.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, S, S);
  }

  // ---- Flow-field ribbons — one family of strokes per symbol ----
  const cx = S / 2;
  const cy = S / 2;
  for (let s = 0; s < Math.min(symbolCount, 4); s++) {
    const color = palette[(s + 1) % palette.length];
    const [cr, cg, cb] = hexToRgb(color);
    const ribbons = 14 + Math.floor(rnd() * 12);
    for (let i = 0; i < ribbons; i++) {
      ctx.beginPath();
      const angle = rnd() * Math.PI * 2;
      let px = cx + Math.cos(angle) * (40 + rnd() * 120);
      let py = cy + Math.sin(angle) * (40 + rnd() * 120);
      ctx.moveTo(px, py);
      const steps = 60 + Math.floor(rnd() * 60);
      let dir = angle;
      for (let step = 0; step < steps; step++) {
        dir += (rnd() - 0.5) * 0.6 + Math.sin(step * 0.08 + s) * 0.08;
        const len = 6 + rnd() * 8;
        px += Math.cos(dir) * len;
        py += Math.sin(dir) * len;
        ctx.lineTo(px, py);
      }
      ctx.strokeStyle = `rgba(${cr},${cg},${cb},${(0.04 + rnd() * 0.07).toFixed(3)})`;
      ctx.lineWidth = 1 + rnd() * 2.5;
      ctx.stroke();
    }
  }

  // ---- Central dream orb (brightness tracks mood score) ----
  const orbR = S * (0.14 + (score / 100) * 0.05);
  const orb = ctx.createRadialGradient(cx, cy, 0, cx, cy, orbR * 2.4);
  orb.addColorStop(0, `rgba(255,255,255,${(0.5 + (score / 100) * 0.35).toFixed(2)})`);
  orb.addColorStop(0.28, `rgba(${ar},${ag},${ab},0.6)`);
  orb.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = orb;
  ctx.beginPath();
  ctx.arc(cx, cy, orbR * 2.4, 0, Math.PI * 2);
  ctx.fill();

  // ---- Star dust ----
  ctx.globalCompositeOperation = "source-over";
  for (let i = 0; i < 220; i++) {
    ctx.fillStyle = rnd() > 0.7 ? "#a5b4fc" : "#ffffff";
    ctx.globalAlpha = rnd() * 0.7 + 0.1;
    ctx.beginPath();
    ctx.arc(rnd() * S, rnd() * S, rnd() * 1.6 + 0.3, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // ---- Caption ----
  ctx.fillStyle = "rgba(255,255,255,0.92)";
  ctx.font = "600 34px 'Cormorant Garamond', Georgia, serif";
  ctx.textAlign = "center";
  const mood = (a.mood?.label || "Dream").toString();
  ctx.fillText(mood.toLowerCase(), cx, S - 92);

  ctx.fillStyle = "rgba(255,255,255,0.45)";
  ctx.font = "600 20px Inter, system-ui, sans-serif";
  ctx.fillText(
    `✦ SleepScribe${entry.date ? ` · ${entry.date}` : ""}`,
    cx,
    S - 56
  );
  ctx.textAlign = "left";

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Could not render art"))),
      "image/png"
    );
  });
}
