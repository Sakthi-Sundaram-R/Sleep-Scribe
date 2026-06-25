import { Link } from "react-router-dom";
import { motion, useTransform, type MotionValue } from "framer-motion";
import { ArrowUpRight, Sparkles } from "lucide-react";
import { COLORS } from "./colors";

const cormorant = "'Cormorant Garamond', Georgia, serif";
const mono = "'JetBrains Mono', monospace";

function Overlay({
  sp,
  range,
  children,
  className,
}: {
  sp: MotionValue<number>;
  range: [number, number, number, number];
  children: React.ReactNode;
  className?: string;
}) {
  const opacity = useTransform(sp, range, [0, 1, 1, 0]);
  const y = useTransform(sp, range, [24, 0, 0, -24]);
  return (
    <motion.div
      style={{ opacity, y }}
      className={`pointer-events-none absolute inset-0 flex flex-col items-center justify-center px-6 text-center ${className ?? ""}`}
    >
      {children}
    </motion.div>
  );
}

// Fixed HTML text overlays driven by the shared scroll progress (Framer Motion).
export default function ScrollTextOverlay({
  scrollYProgress,
  reduced,
}: {
  scrollYProgress: MotionValue<number>;
  reduced?: boolean;
}) {
  if (reduced) {
    return (
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
        <FinalBlock />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 z-10">
      {/* SCENE 1 */}
      <Overlay sp={scrollYProgress} range={[0.02, 0.06, 0.12, 0.15]}>
        <p
          style={{ fontFamily: cormorant, color: COLORS.lunar }}
          className="max-w-2xl text-3xl italic leading-snug sm:text-4xl"
        >
          Every night, your mind goes somewhere you can't follow.
        </p>
      </Overlay>

      {/* SCENE 3 — Entering REM */}
      <Overlay sp={scrollYProgress} range={[0.4, 0.43, 0.47, 0.5]}>
        <p
          style={{ fontFamily: mono, color: COLORS.aurora, letterSpacing: "0.2em" }}
          className="text-xs uppercase sm:text-sm"
        >
          Entering REM
          <span className="ml-1 animate-pulse">_</span>
        </p>
      </Overlay>

      {/* SCENE 5 */}
      <Overlay sp={scrollYProgress} range={[0.7, 0.74, 0.78, 0.82]}>
        <p
          style={{ fontFamily: cormorant, color: COLORS.lunar }}
          className="max-w-xl text-3xl italic leading-snug sm:text-4xl"
        >
          Your inner world is taking shape.
        </p>
        <p
          style={{ fontFamily: mono, color: COLORS.aurora }}
          className="mt-4 text-xs sm:text-sm"
        >
          Seven entries. Forty-three symbols. One constellation.
        </p>
      </Overlay>

      {/* SCENE 6 — final hero CTA */}
      <Overlay sp={scrollYProgress} range={[0.88, 0.93, 1.01, 1.02]}>
        <FinalBlock />
      </Overlay>
    </div>
  );
}

function FinalBlock() {
  return (
    <div className="pointer-events-auto flex flex-col items-center">
      <h1
        style={{ fontFamily: cormorant, color: COLORS.lunar }}
        className="max-w-3xl text-4xl italic leading-tight sm:text-6xl"
      >
        Your dreams are trying to tell you something.
      </h1>
      <div className="mt-9 flex flex-col items-center gap-4 sm:flex-row">
        <Link
          to="/onboarding"
          className="inline-flex items-center gap-2 rounded-full px-7 py-3.5 font-semibold text-white shadow-lg"
          style={{ background: COLORS.reverie, borderRadius: 100 }}
        >
          <Sparkles className="h-5 w-5" /> Begin Your Dream Journal
          <ArrowUpRight className="h-4 w-4" />
        </Link>
        <Link
          to="/app"
          className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/5 px-7 py-3.5 font-semibold text-white/90 backdrop-blur transition hover:bg-white/10"
          style={{ borderRadius: 100 }}
        >
          Explore the map
        </Link>
      </div>
    </div>
  );
}
