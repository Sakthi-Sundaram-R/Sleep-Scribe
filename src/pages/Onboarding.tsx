import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Moon,
  ArrowRight,
  ArrowLeft,
  Sunrise,
  Sunset,
  Clock,
  Sparkles,
  Check,
} from "lucide-react";

const steps = [
  {
    key: "goal",
    title: "What brings you to Sleep-Scribe?",
    subtitle: "We'll tailor your insights around this.",
    options: [
      "Understand my dreams",
      "Sleep more consistently",
      "Reduce anxiety at night",
      "Just curious ✨",
    ],
  },
  {
    key: "chronotype",
    title: "When do you feel most awake?",
    subtitle: "This sets your ideal wind-down window.",
    options: ["Early morning 🌅", "Midday ☀️", "Evening 🌆", "Late night 🌙"],
  },
  {
    key: "sleep",
    title: "How would you rate your sleep lately?",
    subtitle: "Be honest — there's no wrong answer.",
    options: ["Great", "Okay", "Restless", "Rough"],
  },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);

  const current = steps[step];
  const progress = ((step + (done ? 1 : 0)) / steps.length) * 100;

  const choose = (opt: string) => {
    setAnswers((a) => ({ ...a, [current.key]: opt }));
    setTimeout(() => {
      if (step < steps.length - 1) setStep((s) => s + 1);
      else setDone(true);
    }, 250);
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-5 py-12">
      <div className="w-full max-w-xl">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2.5">
          <span className="grid h-10 w-10 place-items-center rounded-xl bg-aurora-gradient">
            <Moon className="h-5 w-5 text-white" />
          </span>
          <span className="font-display text-xl font-bold">
            Sleep<span className="text-gradient">Scribe</span>
          </span>
        </Link>

        {/* Progress */}
        <div className="mb-8 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
          <motion.div
            animate={{ width: `${progress}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
            className="h-full rounded-full bg-aurora-gradient"
          />
        </div>

        <div className="glass rounded-3xl p-8">
          <AnimatePresence mode="wait">
            {!done ? (
              <motion.div
                key={current.key}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.3 }}
              >
                <p className="text-sm font-semibold text-aurora-cyan">
                  Step {step + 1} of {steps.length}
                </p>
                <h1 className="mt-2 font-display text-2xl font-bold sm:text-3xl">
                  {current.title}
                </h1>
                <p className="mt-1 text-white/55">{current.subtitle}</p>

                <div className="mt-6 grid gap-3">
                  {current.options.map((opt) => {
                    const selected = answers[current.key] === opt;
                    return (
                      <button
                        key={opt}
                        onClick={() => choose(opt)}
                        className={`flex items-center justify-between rounded-2xl border p-4 text-left text-sm font-medium transition ${
                          selected
                            ? "border-aurora-pink/50 bg-aurora-purple/15"
                            : "border-white/10 bg-white/5 hover:border-aurora-violet/40 hover:bg-white/10"
                        }`}
                      >
                        {opt}
                        <span
                          className={`grid h-6 w-6 place-items-center rounded-full border transition ${
                            selected
                              ? "border-transparent bg-aurora-gradient"
                              : "border-white/20"
                          }`}
                        >
                          {selected && <Check className="h-4 w-4" />}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {step > 0 && (
                  <button
                    onClick={() => setStep((s) => s - 1)}
                    className="mt-6 inline-flex items-center gap-1.5 text-sm text-white/50 hover:text-white"
                  >
                    <ArrowLeft className="h-4 w-4" /> Back
                  </button>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="done"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 14 }}
                  className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-aurora-gradient shadow-lg shadow-aurora-purple/40"
                >
                  <Sparkles className="h-9 w-9 text-white" />
                </motion.div>
                <h1 className="mt-6 font-display text-3xl font-bold">
                  You're all set! 🌙
                </h1>
                <p className="mt-2 text-white/60">
                  Your personalized sleep space is ready. Let's record your first
                  dream.
                </p>

                <div className="mt-6 grid grid-cols-3 gap-3 text-left">
                  {[
                    { icon: Sunset, label: "Wind-down", value: "10:30 PM" },
                    { icon: Clock, label: "Sleep goal", value: "8h" },
                    { icon: Sunrise, label: "Wake", value: "6:30 AM" },
                  ].map((c) => {
                    const Icon = c.icon;
                    return (
                      <div
                        key={c.label}
                        className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center"
                      >
                        <Icon className="mx-auto h-5 w-5 text-aurora-cyan" />
                        <p className="mt-2 text-sm font-semibold">{c.value}</p>
                        <p className="text-xs text-white/45">{c.label}</p>
                      </div>
                    );
                  })}
                </div>

                <button
                  onClick={() => navigate("/login")}
                  className="btn-aurora mt-7 w-full"
                >
                  Create my account <ArrowRight className="h-4 w-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
