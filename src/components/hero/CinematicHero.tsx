import { useRef, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Canvas } from "@react-three/fiber";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
  type MotionValue,
} from "framer-motion";
import { Sparkles, Play, ChevronDown, ArrowUpRight } from "lucide-react";
import ParticleGalaxy from "./ParticleGalaxy";
import Magnetic from "../fx/Magnetic";

function Scene({
  sp,
  range,
  children,
  className,
}: {
  sp: MotionValue<number>;
  range: [number, number, number, number];
  children: ReactNode;
  className?: string;
}) {
  const opacity = useTransform(sp, range, [0, 1, 1, 0]);
  const y = useTransform(
    sp,
    [range[0], range[1], range[2], range[3]],
    [40, 0, 0, -40]
  );
  const scale = useTransform(
    sp,
    [range[0], range[1], range[2], range[3]],
    [0.96, 1, 1, 1.04]
  );
  return (
    <motion.div
      style={{ opacity, y, scale }}
      className={`absolute inset-0 flex flex-col items-center justify-center px-5 text-center ${className ?? ""}`}
    >
      {children}
    </motion.div>
  );
}

export default function CinematicHero() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const progress = useRef(0);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    progress.current = v;
  });

  const hintOpacity = useTransform(scrollYProgress, [0, 0.06], [1, 0]);

  return (
    <section ref={sectionRef} className="relative h-[440vh]">
      {/* Pinned viewport */}
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-[#030208]">
        {/* Particle canvas */}
        <div className="absolute inset-0">
          <Canvas
            camera={{ position: [0, 0, 14], fov: 60 }}
            dpr={[1, 1.8]}
            gl={{ antialias: false, powerPreference: "high-performance" }}
          >
            <ParticleGalaxy progress={progress} />
            <EffectComposer>
              <Bloom
                intensity={1.5}
                luminanceThreshold={0.0}
                luminanceSmoothing={0.3}
                mipmapBlur
                radius={0.78}
              />
              <Vignette eskil={false} offset={0.2} darkness={0.95} />
            </EffectComposer>
          </Canvas>
        </div>

        {/* Soft radial darkening so text stays readable over the swarm */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(3,2,8,0.55)_0%,rgba(3,2,8,0.15)_45%,transparent_70%)]" />

        {/* Text scenes */}
        <div className="relative h-full w-full">
          {/* Scene A — the single spark (point) */}
          <Scene sp={scrollYProgress} range={[0, 0.04, 0.15, 0.21]}>
            <span className="pill mb-6">
              <Sparkles className="h-3.5 w-3.5 text-aurora-cyan" />
              AI-powered sleep journal
            </span>
            <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              Every dream begins as
              <br />a <span className="text-gradient">single spark.</span>
            </h1>
            <p className="mt-5 max-w-md text-base text-white/60 sm:text-lg">
              Scroll to watch it unfold into your whole inner universe.
            </p>
          </Scene>

          {/* Scene B — the spiral galaxy */}
          <Scene sp={scrollYProgress} range={[0.28, 0.37, 0.45, 0.52]}>
            <span className="pill mb-6">A universe of nights</span>
            <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              Thousands of dreams,
              <br />
              <span className="text-gradient">one living galaxy.</span>
            </h1>
            <p className="mt-5 max-w-lg text-base text-white/60 sm:text-lg">
              Sleep-Scribe turns every entry into a point of light — together
              they reveal the patterns shaping your rest.
            </p>
          </Scene>

          {/* Scene C — the terrain wave */}
          <Scene sp={scrollYProgress} range={[0.55, 0.62, 0.67, 0.73]}>
            <span className="pill mb-6">Patterns take shape</span>
            <h1 className="font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
              Your nights become a
              <br />
              <span className="text-gradient">landscape you can read.</span>
            </h1>
            <p className="mt-5 max-w-lg text-base text-white/60 sm:text-lg">
              Sleep debt, mood and consistency rise and fall like terrain — so
              you can see exactly what to change.
            </p>
          </Scene>

          {/* Scene D — final, with CTAs (plasma ring) */}
          <Scene sp={scrollYProgress} range={[0.78, 0.87, 0.97, 1]}>
            <span className="pill mb-6 animate-pulse-glow">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-aurora-cyan opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-aurora-cyan" />
              </span>
              Welcome to Sleep-Scribe
            </span>
            <h1 className="font-display text-5xl font-bold leading-[1.02] tracking-tight sm:text-6xl lg:text-8xl">
              Decode your nights.
              <br />
              <span className="text-gradient">Master your sleep.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base text-white/65 sm:text-lg">
              Your personal AI dream analyst. Journal by voice or text, decode
              what your dreams mean, and wake up to insights that improve how you
              rest.
            </p>
            <div className="mt-9 flex flex-col items-center gap-4 sm:flex-row">
              <Magnetic>
                <Link to="/onboarding" className="btn-aurora">
                  <Sparkles className="h-5 w-5" />
                  Start journaling free
                  <ArrowUpRight className="h-4 w-4" />
                </Link>
              </Magnetic>
              <Magnetic strength={0.25}>
                <a href="#features" className="btn-ghost">
                  <Play className="h-4 w-4" />
                  See how it works
                </a>
              </Magnetic>
            </div>
          </Scene>
        </div>

        {/* Scroll hint */}
        <motion.div
          style={{ opacity: hintOpacity }}
          className="pointer-events-none absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-center text-white/50"
        >
          <p className="mb-2 text-xs uppercase tracking-[0.3em]">Scroll</p>
          <ChevronDown className="mx-auto h-5 w-5 animate-bounce" />
        </motion.div>
      </div>
    </section>
  );
}
