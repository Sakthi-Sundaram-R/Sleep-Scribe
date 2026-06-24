import { motion } from "framer-motion";
import { steps } from "../data/content";
import Reveal from "./Reveal";
import SplitText from "./fx/SplitText";

export default function HowItWorks() {
  return (
    <section id="how" className="relative py-24">
      <div className="pointer-events-none absolute left-1/2 top-1/2 h-[400px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-aurora-indigo/10 blur-[160px]" />
      <div className="section-pad relative">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="pill mb-4">Three simple steps</span>
          <SplitText
            text="Journaling that takes 60 seconds"
            gradient={["60", "seconds"]}
            className="font-display text-4xl font-bold sm:text-5xl"
          />
        </Reveal>

        <div className="relative mt-16 grid gap-8 md:grid-cols-3">
          {/* connecting line */}
          <div className="absolute left-0 right-0 top-12 hidden h-px bg-gradient-to-r from-transparent via-aurora-purple/40 to-transparent md:block" />

          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.no}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.15 }}
                className="relative text-center"
              >
                <div className="relative mx-auto mb-6 grid h-24 w-24 place-items-center">
                  <div className="absolute inset-0 rounded-full bg-aurora-gradient opacity-20 blur-xl" />
                  <div className="glass grid h-24 w-24 place-items-center rounded-full">
                    <Icon className="h-9 w-9 text-aurora-pink" />
                  </div>
                  <span className="absolute -right-1 -top-1 grid h-8 w-8 place-items-center rounded-full bg-aurora-gradient font-display text-sm font-bold text-white shadow-lg">
                    {s.no}
                  </span>
                </div>
                <h3 className="font-display text-xl font-semibold">{s.title}</h3>
                <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-white/60">
                  {s.desc}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
