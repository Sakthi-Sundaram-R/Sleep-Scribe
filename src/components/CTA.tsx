import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";
import Reveal from "./Reveal";
import Magnetic from "./fx/Magnetic";

export default function CTA() {
  return (
    <section className="relative py-24">
      <div className="section-pad">
        <Reveal>
          <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-night-800 to-night-900 px-6 py-16 text-center sm:px-12">
            <div className="pointer-events-none absolute -left-20 -top-20 h-80 w-80 animate-aurora-shift rounded-full bg-aurora-purple/30 blur-[120px]" />
            <div className="pointer-events-none absolute -bottom-20 -right-20 h-80 w-80 animate-aurora-shift rounded-full bg-aurora-pink/30 blur-[120px]" style={{ animationDelay: "-8s" }} />
            <div className="pointer-events-none absolute inset-0 opacity-30 [background:conic-gradient(from_0deg_at_50%_50%,transparent,rgba(168,85,247,0.15),transparent,rgba(34,211,238,0.15),transparent)] animate-spin-slow" />
            <div className="relative">
              <h2 className="mx-auto max-w-2xl font-display text-4xl font-bold leading-tight sm:text-5xl">
                Your best night's sleep starts{" "}
                <span className="text-gradient">tonight.</span>
              </h2>
              <p className="mx-auto mt-4 max-w-xl text-lg text-white/65">
                Join over a million people decoding their dreams and rebuilding
                their rest — one journal entry at a time.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Magnetic>
                  <Link to="/app" className="btn-aurora">
                    <Sparkles className="h-5 w-5" />
                    Start free — no card needed
                  </Link>
                </Magnetic>
                <Magnetic strength={0.25}>
                  <a href="#features" className="btn-ghost">
                    Explore features
                  </a>
                </Magnetic>
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
