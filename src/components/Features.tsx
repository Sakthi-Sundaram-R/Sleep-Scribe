import { motion } from "framer-motion";
import { features } from "../data/content";
import Reveal from "./Reveal";
import SplitText from "./fx/SplitText";
import TiltCard from "./fx/TiltCard";

export default function Features() {
  return (
    <section id="features" className="relative overflow-hidden py-24">
      {/* Warm cosmic backdrop — gold/amber + rose + ember over a warm dark base.
          No violet / blue / cyan. */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0e0a0b] via-[#1c1012] to-[#0e0a0b]" />
        {/* warm golden planet-glow */}
        <div className="absolute -top-20 left-1/3 h-[470px] w-[470px] -translate-x-1/2 rounded-full bg-[#e8902a]/22 blur-[150px]" />
        {/* rose / pink nebula */}
        <div className="absolute top-1/4 right-[12%] h-[420px] w-[420px] rounded-full bg-[#db2777]/18 blur-[160px]" />
        {/* ember */}
        <div className="absolute -bottom-24 left-[20%] h-[400px] w-[400px] rounded-full bg-[#ff6a1a]/14 blur-[170px]" />
      </div>

      <div className="section-pad relative z-10">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="pill mb-4">Everything in one place</span>
          <SplitText
            text="A full sleep lab in your pocket"
            gradient={["your", "pocket"]}
            className="font-display text-4xl font-bold sm:text-5xl"
          />
          <p className="mt-4 text-lg text-white/65">
            From dream decoding to deep analytics — every feature is designed to
            help you understand and improve your rest.
          </p>
        </Reveal>

        <div
          className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
          style={{ perspective: 1200 }}
        >
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 28 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: (i % 4) * 0.08 }}
              >
                <TiltCard className="glass h-full rounded-3xl p-6 transition-colors duration-300 hover:border-aurora-pink/40">
                  <div
                    className={`mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${f.accent} shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6`}
                  >
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-display text-lg font-semibold">
                    {f.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/60">
                    {f.desc}
                  </p>
                </TiltCard>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
