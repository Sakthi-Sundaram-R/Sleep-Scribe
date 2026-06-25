import { motion } from "framer-motion";
import { features } from "../data/content";
import Reveal from "./Reveal";

const mono = "'JetBrains Mono', monospace";

export default function Features() {
  return (
    <section id="features" className="relative border-t border-white/5 py-28">
      <div className="section-pad">
        {/* Editorial header — left-aligned, indexed eyebrow, asymmetric. */}
        <Reveal>
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <div
                className="mb-5 flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-aurora-violet"
                style={{ fontFamily: mono }}
              >
                <span>02</span>
                <span className="h-px w-10 bg-aurora-violet/40" />
                <span className="text-white/40">What's inside</span>
              </div>
              <h2 className="font-display text-4xl font-bold leading-[1.04] sm:text-5xl">
                A full sleep lab,
                <br />
                quietly in your pocket.
              </h2>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-white/50 md:text-right">
              From dream decoding to deep analytics — every feature exists to help
              you understand, and improve, your rest.
            </p>
          </div>
        </Reveal>

        {/* Feature grid — hairline cards, mono index, single-accent line icons. */}
        <div className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <motion.div
                key={f.title}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.45, delay: (i % 4) * 0.06 }}
                className="group relative bg-[#0a0e1c] p-7 transition-colors duration-300 hover:bg-[#0e1426]"
              >
                <div className="mb-8 flex items-start justify-between">
                  <Icon
                    className="h-6 w-6 text-aurora-violet transition-colors group-hover:text-white"
                    strokeWidth={1.5}
                  />
                  <span
                    className="text-xs text-white/25"
                    style={{ fontFamily: mono }}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
                <h3 className="text-base font-semibold tracking-tight text-white">
                  {f.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/50">
                  {f.desc}
                </p>
                {/* hairline accent that grows on hover */}
                <span className="absolute bottom-0 left-0 h-px w-0 bg-aurora-violet/70 transition-all duration-500 group-hover:w-full" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
