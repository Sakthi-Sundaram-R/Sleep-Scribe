import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Bell, Moon, Shield, Trash2, Download, LogOut, Mail } from "lucide-react";
import { useEntries, clearEntriesCache } from "./useEntries";
import { useAuth } from "../auth/AuthContext";
import { api } from "../lib/api";
import {
  getReminderPrefs,
  saveReminderPrefs,
  requestNotificationPermission,
} from "./useNightlyReminder";

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
  const { entries, remove } = useEntries();
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const [toggles, setToggles] = useState({
    soundscapes: true,
    voiceJournaling: false,
  });

  const set = (k: keyof typeof toggles) => (v: boolean) =>
    setToggles((t) => ({ ...t, [k]: v }));

  // Weekly AI report email — a real, persisted preference (server-backed).
  const weeklyEmailOn = !user?.weeklyEmailOptOut;
  const [emailMsg, setEmailMsg] = useState("");
  const toggleWeeklyEmail = async (on: boolean) => {
    setEmailMsg("");
    updateUser({ weeklyEmailOptOut: !on }); // optimistic
    try {
      await api.updatePreferences({ weeklyEmailOptOut: !on });
    } catch {
      updateUser({ weeklyEmailOptOut: on }); // revert on failure
      setEmailMsg("Couldn't save that — please try again.");
    }
  };

  // Real nightly reminder (browser notifications + chosen time).
  const [reminder, setReminder] = useState(getReminderPrefs());
  const [reminderMsg, setReminderMsg] = useState("");

  const toggleReminder = async (on: boolean) => {
    setReminderMsg("");
    if (on) {
      const ok = await requestNotificationPermission();
      if (!ok) {
        setReminderMsg(
          "Allow notifications in your browser to turn on reminders."
        );
        return;
      }
    }
    const next = { ...reminder, enabled: on };
    setReminder(next);
    saveReminderPrefs(next);
  };

  const setReminderTime = (time: string) => {
    const next = { ...reminder, time };
    setReminder(next);
    saveReminderPrefs(next);
  };

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

  const clearAll = async () => {
    if (confirm("Delete all journal entries? This cannot be undone.")) {
      await Promise.all(entries.map((e) => remove(e.id)));
    }
  };

  const handleLogout = () => {
    logout();
    clearEntriesCache();
    navigate("/login", { replace: true });
  };

  const prefs = [
    { key: "soundscapes" as const, icon: Moon, title: "Adaptive soundscapes", desc: "Play generative sleep sounds at night." },
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
        <div className="flex flex-wrap items-center gap-4">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-aurora-gradient text-2xl font-bold">
            {(user?.name || "U").slice(0, 2).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-display text-lg font-semibold">{user?.name}</h2>
            <p className="truncate text-sm text-white/50">{user?.email} · Lucid plan</p>
          </div>
          <button onClick={handleLogout} className="btn-ghost text-sm">
            <LogOut className="h-4 w-4" /> Log out
          </button>
        </div>
      </div>

      {/* Preferences */}
      <div className="glass rounded-3xl p-6">
        <h2 className="mb-4 font-display text-lg font-semibold">Preferences</h2>
        <div className="divide-y divide-white/10">
          {/* Nightly reminder — real browser notification */}
          <div className="py-4 first:pt-0">
            <div className="flex items-center gap-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/5">
                <Bell className="h-5 w-5 text-aurora-violet" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">Nightly reminder</p>
                <p className="text-xs text-white/45">
                  A browser nudge to journal if you haven't logged a dream that day.
                </p>
              </div>
              <Toggle on={reminder.enabled} onChange={toggleReminder} />
            </div>
            {reminder.enabled && (
              <div className="mt-3 flex items-center gap-3 pl-14">
                <span className="text-xs text-white/50">Remind me at</span>
                <input
                  type="time"
                  value={reminder.time}
                  onChange={(e) => setReminderTime(e.target.value)}
                  className="rounded-lg border border-white/10 bg-night-950/60 px-3 py-1.5 text-sm text-white/80 outline-none focus:border-aurora-purple/60"
                />
              </div>
            )}
            {reminderMsg && (
              <p className="mt-2 pl-14 text-xs text-aurora-pink">{reminderMsg}</p>
            )}
            <p className="mt-2 pl-14 text-[11px] text-white/30">
              Works while SleepScribe is open in a tab.
            </p>
          </div>

          {/* Weekly AI report email — real, server-persisted preference */}
          <div className="py-4">
            <div className="flex items-center gap-4">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-white/5">
                <Mail className="h-5 w-5 text-aurora-violet" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">Weekly AI report email</p>
                <p className="text-xs text-white/45">
                  A summary of your week in dreams, emailed every Sunday.
                </p>
              </div>
              <Toggle on={weeklyEmailOn} onChange={toggleWeeklyEmail} />
            </div>
            {emailMsg && (
              <p className="mt-2 pl-14 text-xs text-aurora-pink">{emailMsg}</p>
            )}
          </div>

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
