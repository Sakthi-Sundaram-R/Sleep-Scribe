import { useState } from "react";
import { motion } from "framer-motion";
import { User, Bell, Moon, Shield, Trash2, Download } from "lucide-react";
import { useEntries } from "./useEntries";

function Toggle({
  on,
  onChange,
}: {
  on: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!on)}
      className={`relative h-7 w-12 rounded-full transition ${
        on ? "bg-aurora-gradient" : "bg-white/15"
      }`}
    >
      <motion.span
        layout
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className={`absolute top-1 h-5 w-5 rounded-full bg-white shadow ${
          on ? "left-6" : "left-1"
        }`}
      />
    </button>
  );
}

export default function SettingsPage() {
  const { entries } = useEntries();
  const [toggles, setToggles] = useState({
    reminders: true,
    soundscapes: true,
    weeklyReport: true,
    voiceJournaling: false,
  });

  const set = (k: keyof typeof toggles) => (v: boolean) =>
    setToggles((t) => ({ ...t, [k]: v }));

  const exportData = () => {
    const blob = new Blob([JSON.stringify(entries, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sleep-scribe-export.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    if (confirm("Delete all journal entries? This cannot be undone.")) {
      localStorage.removeItem("sleep-scribe-entries");
      location.reload();
    }
  };

  const prefs = [
    { key: "reminders" as const, icon: Bell, title: "Bedtime reminders", desc: "A gentle nudge to journal before sleep." },
    { key: "soundscapes" as const, icon: Moon, title: "Adaptive soundscapes", desc: "Play generative sleep sounds at night." },
    { key: "weeklyReport" as const, icon: User, title: "Weekly AI report", desc: "Get a summary of your sleep every Sunday." },
    { key: "voiceJournaling" as const, icon: Shield, title: "Voice journaling", desc: "Record dreams by voice with transcription." },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="font-display text-3xl font-bold">Settings</h1>
        <p className="text-sm text-white/50">Tune Sleep-Scribe to your routine.</p>
      </div>

      {/* Profile */}
      <div className="glass rounded-3xl p-6">
        <div className="flex items-center gap-4">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-aurora-gradient text-2xl font-bold">
            SS
          </div>
          <div>
            <h2 className="font-display text-lg font-semibold">Sleep Scriber</h2>
            <p className="text-sm text-white/50">dreamer@sleepscribe.app · Lucid plan</p>
          </div>
        </div>
      </div>

      {/* Preferences */}
      <div className="glass rounded-3xl p-6">
        <h2 className="mb-4 font-display text-lg font-semibold">Preferences</h2>
        <div className="divide-y divide-white/10">
          {prefs.map((p) => {
            const Icon = p.icon;
            return (
              <div key={p.key} className="flex items-center gap-4 py-4 first:pt-0 last:pb-0">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/5">
                  <Icon className="h-5 w-5 text-aurora-violet" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{p.title}</p>
                  <p className="text-xs text-white/45">{p.desc}</p>
                </div>
                <Toggle on={toggles[p.key]} onChange={set(p.key)} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Data */}
      <div className="glass rounded-3xl p-6">
        <h2 className="mb-4 font-display text-lg font-semibold">Your data</h2>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button onClick={exportData} className="btn-ghost flex-1 text-sm">
            <Download className="h-4 w-4" /> Export entries (JSON)
          </button>
          <button
            onClick={clearAll}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-full border border-aurora-pink/30 bg-aurora-pink/10 px-7 py-3.5 text-sm font-semibold text-aurora-pink transition hover:bg-aurora-pink/20"
          >
            <Trash2 className="h-4 w-4" /> Delete all data
          </button>
        </div>
      </div>
    </div>
  );
}
