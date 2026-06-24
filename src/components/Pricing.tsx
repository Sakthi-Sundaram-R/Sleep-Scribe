import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { plans } from "../data/content";
import Reveal from "./Reveal";
import SplitText from "./fx/SplitText";
import Magnetic from "./fx/Magnetic";

export default function Pricing() {
  return (
    <section id="pricing" className="relative py-24">
      <div className="pointer-events-none absolute left-1/2 top-1/3 h-[400px] w-[600px] -translate-x-1/2 rounded-full bg-aurora-purple/10 blur-[150px]" />
      <div className="section-pad relative">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="pill mb-4">Simple pricing</span>
          <SplitText
            text="Start free. Upgrade when you're hooked."
            gradient={["Upgrade", "when", "you're", "hooked"]}
            className="font-display text-4xl font-bold sm:text-5xl"
          />
        </Reveal>

        <div className="mt-14 grid items-stretch gap-6 lg:grid-cols-3">
          {plans.map((p, i) => (
            <motion.div
              key={p.name}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`relative flex flex-col rounded-3xl p-7 ${
                p.highlighted
                  ? "glass border-aurora-pink/40 shadow-2xl shadow-aurora-purple/30"
                  : "glass"
              }`}
            >
              {p.highlighted && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-aurora-gradient px-4 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-lg">
                  Most popular
                </span>
              )}
              <h3 className="font-display text-xl font-bold">{p.name}</h3>
              <p className="mt-1 text-sm text-white/55">{p.tagline}</p>
              <div className="mt-5 flex items-end gap-1">
                <span className="font-display text-5xl font-bold text-gradient">
                  {p.price}
                </span>
                <span className="mb-1.5 text-sm text-white/50">{p.period}</span>
              </div>

              <ul className="mt-6 flex-1 space-y-3">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm">
                    <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-aurora-teal/20">
                      <Check className="h-3 w-3 text-aurora-teal" />
                    </span>
                    <span className="text-white/75">{f}</span>
                  </li>
                ))}
              </ul>

              <Magnetic strength={0.2} className="mt-7">
                <Link
                  to="/app"
                  className={`${p.highlighted ? "btn-aurora" : "btn-ghost"} w-full`}
                >
                  {p.cta}
                </Link>
              </Magnetic>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
