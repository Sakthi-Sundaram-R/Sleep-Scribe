// Tiny typed client for the Sleep-Scribe API.
import type { DreamAnalysis } from "./dreamEngine";

const BASE =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") ||
  "http://localhost:4000/api";

const TOKEN_KEY = "ss-token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token: string | null) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export type ApiUser = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: string;
};

export type ApiEntry = {
  id: string;
  text: string;
  date: string;
  quality: number;
  hours: number;
  analysis: DreamAnalysis;
  createdAt: string;
};

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { error?: string }).error || `Request failed (${res.status})`);
  }
  return data as T;
}

export const api = {
  register: (body: { name: string; email: string; password: string }) =>
    request<{ token: string; user: ApiUser }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  login: (body: { email: string; password: string }) =>
    request<{ token: string; user: ApiUser }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  googleLogin: (credential: string) =>
    request<{ token: string; user: ApiUser }>("/auth/google", {
      method: "POST",
      body: JSON.stringify({ credential }),
    }),

  me: () => request<{ user: ApiUser }>("/auth/me"),

  forgotPassword: (email: string) =>
    request<{ ok: true; message: string }>("/auth/forgot", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  resetPassword: (body: { email: string; token: string; password: string }) =>
    request<{ token: string; user: ApiUser }>("/auth/reset", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  listEntries: () => request<{ entries: ApiEntry[] }>("/entries"),

  addEntry: (body: {
    text: string;
    date: string;
    quality: number;
    hours: number;
    analysis?: DreamAnalysis; // optional — server generates it with the LLM
  }) =>
    request<{ entry: ApiEntry }>("/entries", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  analyzeDream: (text: string) =>
    request<{ analysis: DreamAnalysis; source: string }>("/ai/analyze", {
      method: "POST",
      body: JSON.stringify({ text }),
    }),

  // Public, rate-limited demo analysis (no login) for the homepage widget.
  analyzeDemo: (text: string) =>
    request<{ analysis: DreamAnalysis; source: string }>("/ai/demo", {
      method: "POST",
      body: JSON.stringify({ text }),
    }),

  aiStatus: () => request<{ aiEnabled: boolean; model: string }>("/ai/status"),

  // Multi-turn follow-up chat about a specific dream.
  chatAboutDream: (body: {
    dreamText: string;
    summary: string;
    messages: { role: "user" | "assistant"; content: string }[];
  }) =>
    request<{ reply: string }>("/ai/chat", {
      method: "POST",
      body: JSON.stringify(body),
    }),

  // Weekly AI "sleep coach" digest over the last 7 days.
  weeklyDigest: () => request<{ digest: string; count: number }>("/ai/digest"),

  // Floating assistant chatbot (public, rate-limited).
  assistantChat: (messages: { role: "user" | "assistant"; content: string }[]) =>
    request<{ reply: string }>("/ai/assistant", {
      method: "POST",
      body: JSON.stringify({ messages }),
    }),

  deleteEntry: (id: string) =>
    request<{ ok: true }>(`/entries/${id}`, { method: "DELETE" }),
};
