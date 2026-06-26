import { useEffect } from "react";
import { journaledToday } from "./dreamStats";
import type { Entry } from "./useEntries";

// Lightweight nightly reminder. While the app is open in a tab, it fires a
// browser notification at the user's chosen time if they haven't journaled
// today. (True background/push reminders would need a service worker — this is
// the honest in-app version.)

const KEY = "ss-reminder";

export type ReminderPrefs = { enabled: boolean; time: string }; // time = "HH:MM"

export function getReminderPrefs(): ReminderPrefs {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return { time: "22:00", enabled: false, ...JSON.parse(raw) };
  } catch {
    /* ignore */
  }
  return { enabled: false, time: "22:00" };
}

export function saveReminderPrefs(p: ReminderPrefs) {
  localStorage.setItem(KEY, JSON.stringify(p));
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof Notification === "undefined") return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const res = await Notification.requestPermission();
  return res === "granted";
}

export function useNightlyReminder(entries: Entry[]) {
  useEffect(() => {
    let firedFor = "";
    const tick = () => {
      const prefs = getReminderPrefs();
      if (!prefs.enabled) return;
      if (typeof Notification === "undefined" || Notification.permission !== "granted")
        return;

      const now = new Date();
      const dayKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`;
      if (firedFor === dayKey) return;

      const [h, m] = prefs.time.split(":").map(Number);
      if (now.getHours() === h && now.getMinutes() === m) {
        firedFor = dayKey;
        if (!journaledToday(entries)) {
          new Notification("SleepScribe", {
            body: "Before you drift off — capture tonight's dream. 🌙",
            icon: "/moon.svg",
          });
        }
      }
    };
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, [entries]);
}
