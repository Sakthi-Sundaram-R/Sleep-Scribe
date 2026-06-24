import { useCallback, useEffect, useState } from "react";
import { analyzeDream, type DreamAnalysis } from "../lib/dreamEngine";

export type Entry = {
  id: string;
  createdAt: number;
  date: string;
  text: string;
  quality: number; // 0-100 sleep quality for charts
  hours: number; // hours slept
  analysis: DreamAnalysis;
};

const STORAGE_KEY = "sleep-scribe-entries";

// Seed a few entries on first run so the dashboard never looks empty.
function seed(): Entry[] {
  const samples = [
    "I was flying over a glowing ocean at night, calm and free.",
    "I kept running through my old house but every door led back to the same room.",
    "I was late for something important and couldn't find my friends in a huge crowd.",
    "A warm reunion with old friends in a sunlit garden.",
  ];
  const now = Date.now();
  return samples.map((text, i) => ({
    id: crypto.randomUUID(),
    createdAt: now - i * 86400000,
    date: new Date(now - i * 86400000).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    }),
    text,
    quality: [88, 62, 55, 91][i],
    hours: [7.5, 6.2, 5.8, 8.1][i],
    analysis: analyzeDream(text),
  }));
}

let memory: Entry[] | null = null;

function load(): Entry[] {
  if (memory) return memory;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    memory = JSON.parse(raw);
    return memory!;
  }
  memory = seed();
  localStorage.setItem(STORAGE_KEY, JSON.stringify(memory));
  return memory;
}

const listeners = new Set<() => void>();
function emit() {
  listeners.forEach((l) => l());
}

export function useEntries() {
  const [entries, setEntries] = useState<Entry[]>(() => load());

  useEffect(() => {
    const l = () => setEntries(memory ? [...memory] : []);
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);

  const persist = (next: Entry[]) => {
    memory = next;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    emit();
  };

  const add = useCallback((text: string) => {
    const now = Date.now();
    const entry: Entry = {
      id: crypto.randomUUID(),
      createdAt: now,
      date: new Date(now).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      }),
      text: text.trim(),
      quality: 60 + Math.round(Math.random() * 35),
      hours: +(6 + Math.random() * 2.5).toFixed(1),
      analysis: analyzeDream(text),
    };
    persist([entry, ...(memory ?? [])]);
    return entry;
  }, []);

  const remove = useCallback((id: string) => {
    persist((memory ?? []).filter((e) => e.id !== id));
  }, []);

  return { entries, add, remove };
}
