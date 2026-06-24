import { Moon, Star, Sparkles, BrainCircuit, HeartPulse, Music4 } from "lucide-react";

const items = [
  { icon: Moon, label: "Dream journaling" },
  { icon: BrainCircuit, label: "AI analysis" },
  { icon: HeartPulse, label: "Mood tracking" },
  { icon: Sparkles, label: "Smart insights" },
  { icon: Music4, label: "Sleep sounds" },
  { icon: Star, label: "4.9 rating" },
];

// Infinite scrolling word strip — set in CSS so it's silky and GPU-friendly.
export default function Marquee() {
  const row = [...items, ...items];
  return (
    <div className="relative overflow-hidden border-y border-white/10 bg-white/[0.02] py-5">
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-night-950 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-night-950 to-transparent" />
      <div className="flex w-max animate-marquee items-center gap-12">
        {row.map((it, i) => {
          const Icon = it.icon;
          return (
            <div
              key={i}
              className="flex items-center gap-2.5 text-white/45"
            >
              <Icon className="h-5 w-5 text-aurora-violet" />
              <span className="font-display text-lg font-medium whitespace-nowrap">
                {it.label}
              </span>
              <span className="ml-12 h-1.5 w-1.5 rounded-full bg-aurora-pink/50" />
            </div>
          );
        })}
      </div>
    </div>
  );
}
