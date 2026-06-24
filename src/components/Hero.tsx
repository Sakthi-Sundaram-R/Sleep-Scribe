import { Fragment, lazy, Suspense, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { Sparkles, Play, Star, ArrowUpRight } from "lucide-react";
import { stats } from "../data/content";
import Magnetic from "./fx/Magnetic";
import Counter from "./fx/Counter";

// 3D scene is heavy (Three.js) — load it lazily so the hero text paints instantly.
const DreamOrb = lazy(() => import("./DreamOrb"));

export default function Hero() {
  // Mouse parallax — the orb and floating cards drift opposite the cursor.
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 60, damping: 20 });
  const sy = useSpring(my, { stiffness: 60, damping: 20 });

  const orbX = useTransform(sx, [-0.5, 0.5], [28, -28]);
  const orbY = useTransform(sy, [-0.5, 0.5], [22, -22]);
  const cardX = useTransform(sx, [-0.5, 0.5], [-40, 40]);
  const cardY = useTransform(sy, [-0.5, 0.5], [-26, 26]);
  const copyX = useTransform(sx, [-0.5, 0.5], [10, -10]);
  const chipX = useTransform(cardX, (v) => -v);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mx.set(e.clientX / window.innerWidth - 0.5);
      my.set(e.clientY / window.innerHeight - 0.5);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [mx, my]);

  const headline = ["Decode", "your", "nights."];
  const headline2 = ["Master", "your", "sleep."];

  return (
    <section className="relative overflow-hidden pt-36 pb-24 sm:pt-44">
      <div className="pointer-events-none absolute -top-32 left-1/2 h-[480px] w-[480px] -translate-x-1/2 rounded-full bg-aurora-purple/25 blur-[140px]" />

      <div className="section-pad grid items-center gap-12 lg:grid-cols-2">
        {/* Left copy */}
        <motion.div
          style={{ x: copyX }}
          className="relative z-10 text-center lg:text-left"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-6 inline-flex"
          >
            <span className="pill animate-pulse-glow">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-aurora-cyan opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-aurora-cyan" />
              </span>
              AI-powered sleep journal
            </span>
          </motion.div>

          {/* Word-by-word headline reveal */}
          <h1 className="font-display text-5xl font-bold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">
            <span className="block overflow-hidden pb-[0.12em]">
              {headline.map((w, i) => (
                <Fragment key={w}>
                  <motion.span
                    className="inline-block"
                    initial={{ y: "110%" }}
                    animate={{ y: 0 }}
                    transition={{
                      duration: 0.8,
                      delay: 0.1 + i * 0.09,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    {w}
                  </motion.span>
                  {i < headline.length - 1 ? " " : null}
                </Fragment>
              ))}
            </span>
            <span className="block overflow-hidden pb-[0.12em]">
              {headline2.map((w, i) => (
                <Fragment key={w}>
                  <motion.span
                    className="inline-block text-gradient"
                    initial={{ y: "110%" }}
                    animate={{ y: 0 }}
                    transition={{
                      duration: 0.8,
                      delay: 0.38 + i * 0.09,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                  >
                    {w}
                  </motion.span>
                  {i < headline2.length - 1 ? " " : null}
                </Fragment>
              ))}
            </span>
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.7 }}
            className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-white/70 lg:mx-0"
          >
            Sleep-Scribe is your personal AI dream analyst. Journal by voice or
            text, decode what your dreams mean, and wake up to insights that
            actually improve how you rest.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.85 }}
            className="mt-9 flex flex-col items-center gap-4 sm:flex-row lg:justify-start"
          >
            <Magnetic className="w-full sm:w-auto">
              <Link to="/onboarding" className="btn-aurora w-full sm:w-auto">
                <Sparkles className="h-5 w-5" />
                Start journaling free
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Magnetic>
            <Magnetic strength={0.25} className="w-full sm:w-auto">
              <a href="#how" className="btn-ghost w-full sm:w-auto">
                <Play className="h-4 w-4" />
                See how it works
              </a>
            </Magnetic>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 1 }}
            className="mt-8 flex items-center justify-center gap-3 text-sm text-white/60 lg:justify-start"
          >
            <div className="flex">
              {[0, 1, 2, 3, 4].map((i) => (
                <Star
                  key={i}
                  className="h-4 w-4 fill-aurora-pink text-aurora-pink"
                />
              ))}
            </div>
            Loved by 1.2M+ dreamers worldwide
          </motion.div>
        </motion.div>

        {/* Right 3D scene with parallax */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2, ease: "easeOut" }}
          className="relative h-[360px] sm:h-[460px] lg:h-[560px]"
        >
          <motion.div style={{ x: orbX, y: orbY }} className="absolute inset-0">
            <Suspense
              fallback={
                <div className="flex h-full items-center justify-center">
                  <div className="h-40 w-40 animate-pulse-glow rounded-full bg-aurora-gradient opacity-60 blur-2xl" />
                </div>
              }
            >
              <DreamOrb />
            </Suspense>
          </motion.div>

          {/* Floating insight card */}
          <motion.div
            style={{ x: cardX, y: cardY }}
            className="glass absolute bottom-6 left-0 hidden max-w-[230px] rounded-2xl p-4 sm:block"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-aurora-cyan">
              Tonight's insight
            </p>
            <p className="mt-1 text-sm text-white/80">
              You sleep 41 min longer on days you journal. Keep the streak 🔥
            </p>
          </motion.div>

          {/* Floating mini-stat chip */}
          <motion.div
            style={{ x: chipX, y: cardY }}
            className="glass absolute right-0 top-8 hidden items-center gap-2 rounded-2xl px-4 py-3 lg:flex"
          >
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-aurora-gradient text-sm font-bold">
              89
            </span>
            <div>
              <p className="text-xs text-white/50">Sleep score</p>
              <p className="text-sm font-semibold text-aurora-teal">+12 ↑</p>
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Stats bar with count-up */}
      <div className="section-pad mt-16">
        <div className="glass grid grid-cols-2 gap-6 rounded-3xl p-8 sm:grid-cols-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="text-center"
            >
              <div className="font-display text-3xl font-bold text-gradient sm:text-4xl">
                <Counter value={s.value} />
              </div>
              <div className="mt-1 text-sm text-white/60">{s.label}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
