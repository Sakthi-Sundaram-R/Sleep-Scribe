import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Moon, TrendingUp, Flame, Clock } from "lucide-react";
import Reveal from "./Reveal";
import SplitText from "./fx/SplitText";

const bars = [62, 78, 55, 88, 72, 95, 84];
const days = ["M", "T", "W", "T", "F", "S", "S"];

export default function DashboardPreview() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  });
  // Scroll-linked "device reveal": tilts flat, scales up and brightens as it enters.
  const rotateX = useTransform(scrollYProgress, [0, 1], [26, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.86, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.4], [0.3, 1]);

  return (
    <section className="relative py-24">
      <div className="section-pad">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="pill mb-4">Your sleep, visualized</span>
          <SplitText
            text="A dashboard you'll actually open"
            gradient={["actually", "open"]}
            className="font-display text-4xl font-bold sm:text-5xl"
          />
        </Reveal>

        <div ref={ref} style={{ perspective: 1400 }} className="mt-12">
          <motion.div
            style={{ rotateX, scale, opacity, transformOrigin: "center top" }}
            className="glass mx-auto max-w-5xl rounded-[2rem] p-6 shadow-2xl shadow-aurora-purple/20 sm:p-8">
            {/* Top stat cards */}
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { icon: Clock, label: "Avg. sleep", value: "7h 24m", up: "+18m" },
                { icon: Flame, label: "Journal streak", value: "23 days", up: "🔥" },
                { icon: TrendingUp, label: "Sleep score", value: "89/100", up: "+12" },
              ].map((c, i) => {
                const Icon = c.icon;
                return (
                  <motion.div
                    key={c.label}
                    initial={{ opacity: 0, y: 16 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="rounded-2xl border border-white/10 bg-night-800/50 p-5"
                  >
                    <div className="flex items-center justify-between">
                      <Icon className="h-5 w-5 text-aurora-cyan" />
                      <span className="text-xs font-semibold text-aurora-teal">
                        {c.up}
                      </span>
                    </div>
                    <div className="mt-3 font-display text-2xl font-bold">
                      {c.value}
                    </div>
                    <div className="text-xs text-white/50">{c.label}</div>
                  </motion.div>
                );
              })}
            </div>

            {/* Chart + entries */}
            <div className="mt-4 grid gap-4 lg:grid-cols-5">
              <div className="rounded-2xl border border-white/10 bg-night-800/50 p-6 lg:col-span-3">
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-display font-semibold">This week</h3>
                  <span className="text-xs text-white/40">Sleep quality %</span>
                </div>
                <div className="flex h-44 items-end justify-between gap-3">
                  {bars.map((h, i) => (
                    <div
                      key={i}
                      className="flex flex-1 flex-col items-center gap-2"
                    >
                      <motion.div
                        initial={{ height: 0 }}
                        whileInView={{ height: `${h}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7, delay: i * 0.08 }}
                        className="w-full rounded-t-lg bg-gradient-to-t from-aurora-purple to-aurora-pink"
                        style={{ minHeight: 8 }}
                      />
                      <span className="text-xs text-white/40">{days[i]}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-night-800/50 p-6 lg:col-span-2">
                <h3 className="mb-4 font-display font-semibold">
                  Recent entries
                </h3>
                <div className="space-y-3">
                  {[
                    { t: "Flying over the city", m: "Peaceful", c: "#2dd4bf" },
                    { t: "The endless hallway", m: "Anxious", c: "#fb6a4a" },
                    { t: "Old friends reunion", m: "Joyful", c: "#7c5cff" },
                  ].map((e) => (
                    <div
                      key={e.t}
                      className="flex items-center gap-3 rounded-xl bg-white/5 p-3"
                    >
                      <span className="grid h-9 w-9 place-items-center rounded-lg bg-aurora-purple/20">
                        <Moon className="h-4 w-4 text-aurora-violet" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{e.t}</p>
                        <p className="text-xs" style={{ color: e.c }}>
                          {e.m}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
