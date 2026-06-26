import { motion } from "framer-motion";
import { features } from "../data/content";
import Reveal from "./Reveal";
import SplitText from "./fx/SplitText";

export default function Features() {
  return (
    <section id="features" className="relative overflow-hidden py-28">
      {/* ---- Immersive dreamscape backdrop ---- */}
      <div className="pointer-events-none absolute inset-0">
        {/* deep night base */}
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(120% 95% at 50% 0%, #18224d 0%, #0c1234 42%, #080a1d 100%)",
          }}
        />
        {/* nebula / galaxy glows */}
        <div className="absolute -right-[6%] top-[4%] h-[540px] w-[540px] rounded-full bg-aurora-purple/25 blur-[150px]" />
        <div className="absolute -left-[6%] top-[22%] h-[440px] w-[440px] rounded-full bg-aurora-cyan/14 blur-[160px]" />
        <div className="absolute -bottom-[12%] left-1/3 h-[480px] w-[480px] rounded-full bg-aurora-pink/12 blur-[170px]" />
        {/* aurora ribbon sweeping across */}
        <div
          className="absolute left-0 top-[28%] h-44 w-full -rotate-[7deg] opacity-50 blur-2xl"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(56,189,248,0.55) 30%, rgba(167,139,250,0.6) 55%, rgba(240,171,252,0.5) 75%, transparent 100%)",
          }}
        />
        {/* layered starfields */}
        <div className="starfield absolute inset-0 opacity-70" />
        <div
          className="starfield absolute inset-0 opacity-40"
          style={{ backgroundSize: "340px 340px" }}
        />
        {/* glowing crescent moon */}
        <svg
          viewBox="0 0 32 32"
          className="absolute right-[7%] top-[8%] h-24 w-24 sm:h-28 sm:w-28"
          style={{ filter: "drop-shadow(0 0 42px rgba(165,180,252,0.65))" }}
        >
          <path
            d="M27 17.6A11 11 0 1 1 14.4 5 8.6 8.6 0 0 0 27 17.6Z"
            fill="#e7ecff"
          />
        </svg>
        {/* dune horizon glow */}
        <div
          className="absolute inset-x-0 bottom-0 h-56"
          style={{
            background:
              "radial-gradient(120% 100% at 50% 100%, rgba(76,48,122,0.55) 0%, transparent 62%)",
          }}
        />
        {/* readability veil */}
        <div className="absolute inset-0 bg-[#080a1d]/25" />
      </div>

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
