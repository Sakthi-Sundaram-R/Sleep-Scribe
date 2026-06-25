import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Moon, Menu, X } from "lucide-react";

// ---------------------------------------------------------------------------
// SpotlightHero — a cursor-following spotlight that reveals a second image
// through a soft circular mask, re-skinned for SleepScribe's dream theme.
//   Base image  : a sleeper in a moonlit room  (waking reality)
//   Reveal image : a cosmic dreamscape          (the dream beneath sleep)
// Move the cursor to "peel back" sleep and glimpse the dream underneath.
// ---------------------------------------------------------------------------

const BASE_IMAGE = "/hero/sleep.webp"; // sleeping reality
const REVEAL_IMAGE = "/hero/dream.webp"; // the dream beneath
const SPOTLIGHT_R = 420;

const serif = "'Cormorant Garamond', Georgia, serif";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How it works", href: "#how" },
  { label: "Dream AI", href: "#dream-ai" },
  { label: "Pricing", href: "#pricing" },
];

// --- The reveal layer: a hidden canvas paints a soft radial mask that is
//     applied to the dream image, so it only shows inside the glowing circle.
function RevealLayer({
  image,
  cursorX,
  cursorY,
}: {
  image: string;
  cursorX: number;
  cursorY: number;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const revealRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ w: 0, h: 0 });

  // Size the canvas to the viewport.
  useEffect(() => {
    const resize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      setSize({ w, h });
      const c = canvasRef.current;
      if (c) {
        c.width = w;
        c.height = h;
      }
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, []);

  // Repaint the radial-gradient mask wherever the (smoothed) cursor is.
  useEffect(() => {
    const c = canvasRef.current;
    const div = revealRef.current;
    if (!c || !div) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, c.width, c.height);
    const g = ctx.createRadialGradient(
      cursorX,
      cursorY,
      0,
      cursorX,
      cursorY,
      SPOTLIGHT_R
    );
    g.addColorStop(0, "rgba(255,255,255,1)");
    g.addColorStop(0.4, "rgba(255,255,255,1)");
    g.addColorStop(0.6, "rgba(255,255,255,0.75)");
    g.addColorStop(0.75, "rgba(255,255,255,0.4)");
    g.addColorStop(0.88, "rgba(255,255,255,0.12)");
    g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(cursorX, cursorY, SPOTLIGHT_R, 0, Math.PI * 2);
    ctx.fill();

    const url = `url(${c.toDataURL()})`;
    div.style.setProperty("-webkit-mask-image", url);
    div.style.setProperty("mask-image", url);
  }, [cursorX, cursorY, size]);

  return (
    <>
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
        style={{ display: "none" }}
      />
      <div
        ref={revealRef}
        className="absolute inset-0 bg-center bg-cover bg-no-repeat z-30 pointer-events-none"
        style={{
          backgroundImage: `url(${image})`,
          maskSize: "100% 100%",
          WebkitMaskSize: "100% 100%",
        }}
      />
    </>
  );
}

// --- Fixed glass navigation over the hero (SleepScribe brand). ---
function HeroNav() {
  const [open, setOpen] = useState(false);
  return (
    <nav className="fixed top-0 left-0 right-0 z-[100] flex items-center justify-between p-4 sm:p-5">
      {/* Brand */}
      <Link to="/" className="flex items-center gap-2.5">
        <span className="relative grid h-9 w-9 place-items-center rounded-xl bg-aurora-gradient shadow-lg shadow-aurora-purple/40">
          <Moon className="h-5 w-5 text-white" />
        </span>
        <span className="font-display text-2xl font-bold tracking-tight text-white">
          Sleep<span className="text-gradient">Scribe</span>
        </span>
      </Link>

      {/* Center pill */}
      <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 bg-white/10 backdrop-blur-md border border-white/20 rounded-full px-2 py-2 items-center gap-1">
        {NAV_LINKS.map((l, i) => (
          <a
            key={l.href}
            href={l.href}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              i === 0
                ? "text-white bg-white/15"
                : "text-white/75 hover:bg-white/15 hover:text-white"
            }`}
          >
            {l.label}
          </a>
        ))}
      </div>

      {/* Right CTA (desktop) */}
      <Link
        to="/onboarding"
        className="hidden md:block bg-white text-gray-900 text-sm font-semibold px-6 py-2.5 rounded-full hover:bg-gray-100 transition-colors"
      >
        Start free
      </Link>

      {/* Mobile hamburger */}
      <button
        className="md:hidden grid h-10 w-10 place-items-center rounded-xl border border-white/20 bg-white/10 text-white backdrop-blur-md"
        onClick={() => setOpen((o) => !o)}
        aria-label="Toggle menu"
      >
        {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden absolute top-full left-4 right-4 mt-2 flex flex-col gap-1 rounded-2xl bg-night-900/90 backdrop-blur-md border border-white/10 p-3">
          {NAV_LINKS.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={() => setOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-white/85 hover:bg-white/10"
            >
              {l.label}
            </a>
          ))}
          <Link
            to="/onboarding"
            className="mt-1 rounded-full bg-white px-4 py-2.5 text-center text-sm font-semibold text-gray-900"
          >
            Start free
          </Link>
        </div>
      )}
    </nav>
  );
}

export default function SpotlightHero() {
  const mouse = useRef({ x: -999, y: -999 });
  const smooth = useRef({ x: -999, y: -999 });
  const rafRef = useRef(0);
  const [cursorPos, setCursorPos] = useState({ x: -999, y: -999 });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
    };
    window.addEventListener("mousemove", onMove);

    const loop = () => {
      const dx = mouse.current.x - smooth.current.x;
      const dy = mouse.current.y - smooth.current.y;
      // Only push a new position (and repaint the mask) while actually moving —
      // keeps the page idle-quiet when the cursor is still.
      if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
        smooth.current.x += dx * 0.1;
        smooth.current.y += dy * 0.1;
        setCursorPos({ x: smooth.current.x, y: smooth.current.y });
      }
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <div className="bg-black tracking-[-0.02em]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <HeroNav />

      <section
        className="relative w-full overflow-hidden h-screen bg-black"
        style={{ height: "100dvh" }}
      >
        {/* 1 — base image (waking reality) */}
        <div
          className="absolute inset-0 bg-center bg-cover bg-no-repeat z-10 hero-zoom"
          style={{ backgroundImage: `url(${BASE_IMAGE})` }}
        />

        {/* 2 — the dream, revealed through the cursor spotlight */}
        <RevealLayer image={REVEAL_IMAGE} cursorX={cursorPos.x} cursorY={cursorPos.y} />

        {/* 3 — heading */}
        <div className="absolute top-[14%] left-0 right-0 z-50 flex flex-col items-center text-center px-5 pointer-events-none">
          <h1 className="text-white leading-[0.95]">
            <span
              className="hero-anim hero-reveal block italic font-normal text-5xl sm:text-7xl md:text-8xl"
              style={{ fontFamily: serif, letterSpacing: "-0.04em", animationDelay: "0.25s" }}
            >
              Beneath sleep
            </span>
            <span
              className="hero-anim hero-reveal block font-display font-semibold text-5xl sm:text-7xl md:text-8xl -mt-1"
              style={{ letterSpacing: "-0.06em", animationDelay: "0.42s" }}
            >
              lies a dream world
            </span>
          </h1>
        </div>

        {/* 4 — bottom-left paragraph */}
        <div
          className="hero-anim hero-fade hidden sm:block absolute bottom-14 left-10 md:left-14 z-50 max-w-[260px]"
          style={{ animationDelay: "0.7s" }}
        >
          <p className="text-sm text-white/80 leading-relaxed">
            Every night your mind drifts somewhere you can't follow — building
            worlds from memory, emotion, and the things left unsaid by day.
          </p>
        </div>

        {/* 5 — bottom-right block */}
        <div
          className="hero-anim hero-fade absolute bottom-10 sm:bottom-24 left-5 right-5 sm:left-auto sm:right-10 md:right-14 z-50 max-w-full sm:max-w-[280px] flex flex-col items-start gap-4 sm:gap-5"
          style={{ animationDelay: "0.85s" }}
        >
          <p className="text-xs sm:text-sm text-white/80 leading-relaxed">
            Move your cursor to peer past the surface of sleep and glimpse the
            dream beneath. SleepScribe helps you capture and decode it each
            morning.
          </p>
          <Link
            to="/onboarding"
            className="bg-aurora-gradient text-white text-sm font-medium px-7 py-3 rounded-full transition-all hover:scale-[1.03] active:scale-95 hover:shadow-lg hover:shadow-aurora-purple/40"
          >
            Start dreaming
          </Link>
        </div>
      </section>
    </div>
  );
}
