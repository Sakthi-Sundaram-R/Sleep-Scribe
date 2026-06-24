import { useCallback, useEffect, useState } from "react";
import { analyzeDream } from "../lib/dreamEngine";
import { api, type ApiEntry } from "../lib/api";

export type Entry = ApiEntry;

// Shared, app-wide entries store backed by the API (MongoDB).
// A lightweight pub/sub keeps Dashboard, Journal & Insights in sync.
let cache: Entry[] = [];
let loaded = false;
const listeners = new Set<() => void>();
function emit() {
  listeners.forEach((l) => l());
}

async function refresh() {
  const { entries } = await api.listEntries();
  cache = entries;
  loaded = true;
  emit();
}

export function useEntries() {
  const [entries, setEntries] = useState<Entry[]>(cache);
  const [loading, setLoading] = useState(!loaded);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const l = () => setEntries([...cache]);
    listeners.add(l);

    if (!loaded) {
      refresh()
        .catch((e) => setError(e instanceof Error ? e.message : "Failed to load"))
        .finally(() => setLoading(false));
    } else {
      setEntries([...cache]);
      setLoading(false);
    }

    return () => {
      listeners.delete(l);
    };
  }, []);

  const add = useCallback(async (text: string) => {
    const now = Date.now();
    const payload = {
      text: text.trim(),
      date: new Date(now).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      }),
      quality: 60 + Math.round(Math.random() * 35),
      hours: +(6 + Math.random() * 2.5).toFixed(1),
      analysis: analyzeDream(text),
    };
    const { entry } = await api.addEntry(payload);
    cache = [entry, ...cache];
    emit();
    return entry;
  }, []);

  const remove = useCallback(async (id: string) => {
    await api.deleteEntry(id);
    cache = cache.filter((e) => e.id !== id);
    emit();
  }, []);

  // Allow a manual reset (e.g. on logout) to clear the cache.
  return { entries, add, remove, loading, error };
}

// Clears the in-memory cache (call on logout so the next user starts fresh).
export function clearEntriesCache() {
  cache = [];
  loaded = false;
  emit();
}
