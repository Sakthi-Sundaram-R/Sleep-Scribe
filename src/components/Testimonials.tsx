import { motion } from "framer-motion";
import { Quote } from "lucide-react";
import { testimonials } from "../data/content";
import Reveal from "./Reveal";
import SplitText from "./fx/SplitText";
import TiltCard from "./fx/TiltCard";

export default function Testimonials() {
  return (
    <section className="relative py-24">
      <div className="section-pad">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="pill mb-4">Loved worldwide</span>
          <SplitText
            text="Better mornings, in their words"
            gradient={["in", "their", "words"]}
            className="font-display text-4xl font-bold sm:text-5xl"
          />
        </Reveal>

        <div
          className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4"
          style={{ perspective: 1200 }}
        >
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: (i % 4) * 0.1 }}
            >
              <TiltCard
                max={7}
                className="glass flex h-full flex-col rounded-3xl p-6 transition-colors duration-300 hover:border-aurora-pink/40"
              >
                <Quote className="h-7 w-7 text-aurora-pink/60" />
                <p className="mt-3 flex-1 text-sm leading-relaxed text-white/75">
                  "{t.quote}"
                </p>
                <div className="mt-5 flex items-center gap-3">
                  <div
                    className={`grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br ${t.accent} text-sm font-bold text-white`}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{t.name}</p>
                    <p className="text-xs text-white/50">{t.role}</p>
                  </div>
                </div>
              </TiltCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
