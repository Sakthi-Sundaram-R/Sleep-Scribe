import { motion } from "framer-motion";
import { features } from "../data/content";
import Reveal from "./Reveal";
import SplitText from "./fx/SplitText";
import TiltCard from "./fx/TiltCard";

export default function Features() {
  return (
    <section id="features" className="relative overflow-hidden py-24">
      {/* Sunset rose & amber backdrop: warm base → soft rose/amber glow → faint
          masked grid → fine stars → warm vignette + hairline divider. */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[#140d10]" />
        {/* warm glow from above */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(58% 46% at 50% -6%, rgba(251,113,133,0.16), rgba(245,158,11,0.07) 45%, transparent 72%)",
          }}
        />
        {/* faint grid, faded toward the edges */}
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,225,210,0.7) 1px, transparent 1px), linear-gradient(90deg, rgba(255,225,210,0.7) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            WebkitMaskImage:
              "radial-gradient(75% 65% at 50% 0%, #000 25%, transparent 80%)",
            maskImage:
              "radial-gradient(75% 65% at 50% 0%, #000 25%, transparent 80%)",
          }}
        />
        {/* fine stars */}
        <div className="starfield absolute inset-0 opacity-[0.12]" />
        {/* warm vignette for depth */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(125% 85% at 50% 45%, transparent 52%, #0a0608 100%)",
          }}
        />
        {/* hairline divider from the section above */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#fb7185]/25 to-transparent" />
      </div>

      <div className="section-pad relative z-10">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="pill mb-4">Everything in one place</span>
          <SplitText
            text="A full sleep lab in your pocket"
            gradient={["your", "pocket"]}
            gradientClass="text-gradient-warm"
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
                <TiltCard className="glass-warm h-full rounded-3xl p-6 transition-colors duration-300 hover:border-[#fb7185]/45">
                  <div
                    className="mb-5 grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-[#f59e0b] to-[#fb7185] shadow-lg shadow-[#fb7185]/20 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6"
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
