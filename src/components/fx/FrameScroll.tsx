import { useEffect, useRef, useState } from "react";
import { useScroll, useMotionValueEvent, useTransform, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import ScrollTextOverlay from "../3d/ScrollTextOverlay";
import { prefersReducedMotion } from "../3d/util";

// ---------------------------------------------------------------------------
// Frame-sequence scroll. 261 WebP frames (public/frames) are scrubbed by scroll
// position on a single <canvas>. Frames are decoded once up-front, the active
// frame index is eased toward the scroll target every rAF tick (no jump), and
// the canvas is drawn with a "cover" fit at device-pixel resolution for a crisp,
// buttery-smooth cinematic intro.
// ---------------------------------------------------------------------------

const FRAME_COUNT = 131;
const framePath = (i: number) =>
  `/frames/frame-${String(i + 1).padStart(3, "0")}.webp`;

// How aggressively the drawn frame chases the scroll target (0..1 per tick).
// Lower = smoother / more "weight", higher = snappier.
const EASE = 0.12;

export default function FrameScroll() {
  const reduced = prefersReducedMotion();
  const sectionRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const imagesRef = useRef<HTMLImageElement[]>([]);
  const targetProgress = useRef(reduced ? 1 : 0);
  const currentFrame = useRef(reduced ? FRAME_COUNT - 1 : 0);
  const drawnFrame = useRef(-1);
  const rafRef = useRef<number>(0);
  const running = useRef(false);
  const kickRef = useRef<() => void>(() => {});

  const [loaded, setLoaded] = useState(0);
  const [ready, setReady] = useState(false);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (reduced) return;
    targetProgress.current = v;
    kickRef.current(); // wake the render loop only while actually scrolling
  });

  const hintOpacity = useTransform(scrollYProgress, [0, 0.05], [1, 0]);

  // ---- Draw a single frame, "cover"-fit, at DPR resolution. ----
  const draw = (index: number) => {
    const canvas = canvasRef.current;
    const img = imagesRef.current[index];
    if (!canvas || !img || !img.complete || img.naturalWidth === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    const cw = canvas.width;
    const ch = canvas.height;
    const iw = img.naturalWidth;
    const ih = img.naturalHeight;
    const scale = Math.max(cw / iw, ch / ih);
    const dw = iw * scale;
    const dh = ih * scale;
    const dx = (cw - dw) / 2;
    const dy = (ch - dh) / 2;
    ctx.drawImage(img, dx, dy, dw, dh);
  };

  // ---- Size the canvas to its box, accounting for device pixel ratio. ----
  const resize = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    // Cap DPR at 1.5 — a smaller canvas buffer means cheaper per-frame draws
    // (less jank on hi-dpi screens) with no visible loss at this scale.
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    drawnFrame.current = -1; // force a redraw at the new size
    draw(Math.round(currentFrame.current));
  };

  // ---- Preload AND fully decode every frame. ----
  // Decoding up front (img.decode()) is the key to smooth scrubbing: it means
  // the first time we drawImage() a frame during a scroll, the bitmap is already
  // GPU-ready — no synchronous decode stutter mid-scroll.
  useEffect(() => {
    let cancelled = false;
    let count = 0;
    const imgs: HTMLImageElement[] = new Array(FRAME_COUNT);

    const markLoaded = (i: number) => {
      if (cancelled) return;
      count++;
      setLoaded(count);
      if (i === 0) {
        requestAnimationFrame(() => {
          resize();
          draw(0);
        });
      }
      if (count === FRAME_COUNT) setReady(true);
    };

    for (let i = 0; i < FRAME_COUNT; i++) {
      const img = new Image();
      img.decoding = "async";
      img.src = framePath(i);
      // Prefer decode() (resolves once pixels are decoded); fall back to onload.
      img
        .decode()
        .then(() => markLoaded(i))
        .catch(() => {
          img.onload = img.onerror = () => markLoaded(i);
        });
      imgs[i] = img;
    }
    imagesRef.current = imgs;

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- Resize handling. ----
  useEffect(() => {
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- Animation loop: ease the current frame toward the scroll target. ----
  useEffect(() => {
    if (reduced) {
      // Static: paint the final frame once images are around.
      const id = setInterval(() => {
        if (imagesRef.current[FRAME_COUNT - 1]?.complete) {
          resize();
          draw(FRAME_COUNT - 1);
          clearInterval(id);
        }
      }, 60);
      return () => clearInterval(id);
    }

    const tick = () => {
      const target = targetProgress.current * (FRAME_COUNT - 1);
      const cur = currentFrame.current;
      const dist = Math.abs(target - cur);
      // Snap when very close so the loop can settle and let the page go idle.
      const settled = dist < 0.01;
      const next = settled ? target : cur + (target - cur) * EASE;
      currentFrame.current = next;

      const index = Math.min(FRAME_COUNT - 1, Math.max(0, Math.round(next)));
      if (index !== drawnFrame.current) {
        draw(index);
        drawnFrame.current = index;
      }

      if (settled) {
        running.current = false; // stop until the next scroll wakes us
        return;
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    // Start the loop on demand; no-op if it's already running.
    const kick = () => {
      if (running.current) return;
      running.current = true;
      rafRef.current = requestAnimationFrame(tick);
    };
    kickRef.current = kick;
    kick(); // initial paint pass

    return () => {
      running.current = false;
      cancelAnimationFrame(rafRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);

  const pct = Math.round((loaded / FRAME_COUNT) * 100);

  return (
    <section
      ref={sectionRef}
      className="relative"
      style={{ height: reduced ? "100vh" : "600vh" }}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-[#060912]">
        <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />

        {/* Soft cinematic grade so text reads cleanly over the footage. */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#060912]/40 via-transparent to-[#060912]/80" />

        <ScrollTextOverlay scrollYProgress={scrollYProgress} reduced={reduced} />

        {!reduced && (
          <motion.div
            style={{ opacity: hintOpacity }}
            className="pointer-events-none absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-center text-white/40"
          >
            <p className="mb-2 text-xs uppercase tracking-[0.3em]">Scroll</p>
            <ChevronDown className="mx-auto h-5 w-5 animate-bounce" />
          </motion.div>
        )}

        {/* Loading veil — fades the moment all frames are decoded. */}
        <div
          className={`pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-[#060912] transition-opacity duration-700 ${
            ready ? "opacity-0" : "opacity-100"
          }`}
        >
          <div className="flex flex-col items-center gap-3">
            <div className="h-px w-40 overflow-hidden bg-white/10">
              <div
                className="h-full bg-white/70 transition-[width] duration-200"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-white/40">
              {pct}%
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
