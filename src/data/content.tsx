import {
  BrainCircuit,
  Mic,
  LineChart,
  Moon,
  Sparkles,
  HeartPulse,
  CalendarClock,
  ShieldCheck,
  Music4,
  type LucideIcon,
} from "lucide-react";

export type Feature = {
  icon: LucideIcon;
  title: string;
  desc: string;
  accent: string;
};

export const features: Feature[] = [
  {
    icon: Mic,
    title: "Voice & Text Journaling",
    desc: "Mumble your dream at 3am or type it later — Sleep-Scribe captures it all and cleans it up into a readable entry.",
    accent: "from-aurora-purple to-aurora-indigo",
  },
  {
    icon: BrainCircuit,
    title: "AI Dream Analysis",
    desc: "Our model decodes recurring symbols, emotions and themes, turning fuzzy dreams into clear, personal insight.",
    accent: "from-aurora-pink to-aurora-purple",
  },
  {
    icon: LineChart,
    title: "Sleep Pattern Analytics",
    desc: "Beautiful charts reveal your sleep debt, consistency, and the habits that quietly wreck (or boost) your rest.",
    accent: "from-aurora-cyan to-aurora-teal",
  },
  {
    icon: HeartPulse,
    title: "Mood Correlation",
    desc: "See how last night's sleep shapes today's mood, focus and energy — backed by your own tracked data.",
    accent: "from-aurora-pink to-aurora-cyan",
  },
  {
    icon: Sparkles,
    title: "Smart Recommendations",
    desc: "Personalized, science-backed nudges: wind-down times, caffeine cutoffs and routines tuned to your chronotype.",
    accent: "from-aurora-violet to-aurora-pink",
  },
  {
    icon: Music4,
    title: "Adaptive Soundscapes",
    desc: "Generative rain, ocean and binaural tracks that adapt to your sleep stage to help you drift off faster.",
    accent: "from-aurora-indigo to-aurora-teal",
  },
  {
    icon: CalendarClock,
    title: "Streaks & Habits",
    desc: "Gentle streaks and milestones keep your journaling habit alive without the guilt-trip notifications.",
    accent: "from-aurora-teal to-aurora-cyan",
  },
  {
    icon: ShieldCheck,
    title: "Private by Design",
    desc: "Your dreams are deeply personal. Everything is encrypted and never sold — you own and can export it all.",
    accent: "from-aurora-purple to-aurora-pink",
  },
];

export type Step = {
  no: string;
  title: string;
  desc: string;
  icon: LucideIcon;
};

export const steps: Step[] = [
  {
    no: "01",
    title: "Capture your night",
    desc: "Open the app when you wake and speak or type whatever you remember — even a single fragment counts.",
    icon: Moon,
  },
  {
    no: "02",
    title: "Let the AI scribe it",
    desc: "Sleep-Scribe transcribes, tidies and tags your entry, then surfaces symbols, emotions and patterns.",
    icon: BrainCircuit,
  },
  {
    no: "03",
    title: "Wake up smarter",
    desc: "Get a personalized insight card every morning plus weekly trends that actually improve how you sleep.",
    icon: Sparkles,
  },
];

export type Plan = {
  name: string;
  price: string;
  period: string;
  tagline: string;
  features: string[];
  highlighted?: boolean;
  cta: string;
};

export const plans: Plan[] = [
  {
    name: "Dreamer",
    price: "$0",
    period: "/forever",
    tagline: "Everything you need to start journaling tonight.",
    features: [
      "Unlimited text journaling",
      "3 AI dream analyses / week",
      "Basic sleep stats",
      "7-day history",
    ],
    cta: "Start free",
  },
  {
    name: "Lucid",
    price: "$8",
    period: "/month",
    tagline: "For people serious about understanding their sleep.",
    features: [
      "Everything in Dreamer",
      "Unlimited AI dream analysis",
      "Voice journaling + transcription",
      "Full analytics & mood correlation",
      "Adaptive soundscapes",
      "Unlimited history & export",
    ],
    highlighted: true,
    cta: "Go Lucid",
  },
  {
    name: "Oracle",
    price: "$16",
    period: "/month",
    tagline: "Deep insight, coaching and priority intelligence.",
    features: [
      "Everything in Lucid",
      "Weekly AI sleep coach report",
      "Long-term trend forecasting",
      "Wearable & calendar sync",
      "Priority model access",
    ],
    cta: "Get Oracle",
  },
];

export type Testimonial = {
  name: string;
  role: string;
  quote: string;
  initials: string;
  accent: string;
};

export const testimonials: Testimonial[] = [
  {
    name: "Aarav Mehta",
    role: "Software Engineer",
    quote:
      "I finally understand my 4am wake-ups. The AI spotted a caffeine pattern I'd never have caught myself.",
    initials: "AM",
    accent: "from-aurora-purple to-aurora-pink",
  },
  {
    name: "Lena Fischer",
    role: "Med Student",
    quote:
      "The dream analysis is uncannily good. It reads like a thoughtful friend, not a horoscope generator.",
    initials: "LF",
    accent: "from-aurora-cyan to-aurora-teal",
  },
  {
    name: "Diego Santos",
    role: "Designer",
    quote:
      "Gorgeous app, genuinely calming to use at night. My sleep consistency score went from 58 to 89.",
    initials: "DS",
    accent: "from-aurora-pink to-aurora-violet",
  },
  {
    name: "Priya Nair",
    role: "Founder",
    quote:
      "The morning insight card is the first thing I read now. Small nudges, real difference in my energy.",
    initials: "PN",
    accent: "from-aurora-indigo to-aurora-cyan",
  },
];

export const stats = [
  { value: "1.2M+", label: "Dreams journaled" },
  { value: "87%", label: "Sleep better in 3 weeks" },
  { value: "4.9★", label: "Average app rating" },
  { value: "120+", label: "Countries dreaming" },
];
