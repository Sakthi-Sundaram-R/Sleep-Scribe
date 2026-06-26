import { motion } from "framer-motion";
import { features } from "../data/content";
import Reveal from "./Reveal";
import SplitText from "./fx/SplitText";

export default function Features() {
  return (
    <section id="features" className="relative py-28">
      {/* Fully transparent — the global dreamscape video shows through, matching
          every other section (no extra scrim, so there's no visible seam). */}
      <div className="section-pad relative z-10">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="pill mb-4">Everything in one place</span>
          <SplitText
            text="A profound landscape in your dreamscape"
            gradient={["dreamscape"]}
            className="font-display text-4xl font-bold leading-[1.1] sm:text-5xl"
          />
          <p className="mt-4 text-lg text-white/70">
            From dream decoding to deep analytics — every feature is designed to
            help you understand and improve your rest.
          </p>
        </Reveal>

        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: (i % 4) * 0.07 }}
                className="group rounded-2xl border border-white/10 bg-[#0c1234]/55 p-6 shadow-[0_10px_40px_-20px_rgba(0,0,0,0.8)] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-aurora-violet/40 hover:bg-[#0c1234]/80"
              >
                <div className="mb-5 grid h-11 w-11 place-items-center rounded-xl border border-white/10 bg-white/[0.06]">
                  <Icon className="h-5 w-5 text-aurora-violet" strokeWidth={1.6} />
                </div>
                <h3 className="font-display text-base font-semibold text-white">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/55">
                  {f.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
