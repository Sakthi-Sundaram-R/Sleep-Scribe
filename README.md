<div align="center">

# 🌙 Sleep-Scribe

### Your AI-powered sleep journal & dream analyst.

*Record your nights, decode your dreams, and wake up to smarter sleep.*

![React](https://img.shields.io/badge/React-18-149eca?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646cff?logo=vite&logoColor=white)
![Three.js](https://img.shields.io/badge/Three.js-r170-000000?logo=three.js&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38bdf8?logo=tailwindcss&logoColor=white)

Built for the **Conesta Forge** · *"Build your own AI web app in 5 days"* internship.

</div>

---

## ✨ Overview

**Sleep-Scribe** turns the fleeting memory of a dream into lasting insight. You
journal your night by voice or text; an AI analyst decodes the symbols, emotions and
themes; and over time the app reveals the patterns that shape how you actually sleep
— so you can change them.

It pairs a **cinematic, scroll-driven landing experience** (a GPU particle galaxy
built in Three.js) with a **real, data-driven app** (dashboard, journal, insights,
settings) — all in one cohesive *Ember & Azure* night-sky theme.

---

## 🎯 Product spec

**Problem.** Dreams fade within minutes of waking, and most people have no idea what
drives a good or bad night. Generic trackers show charts but no *meaning*.

**Solution.** A journal-first sleep app where every entry is enriched by AI.

| # | Capability | What the user gets |
|---|------------|--------------------|
| 1 | **Voice & text journaling** | Capture a dream in seconds, cleaned into a readable entry |
| 2 | **AI dream analysis** | A plain-language interpretation: themes, symbols, emotional tone |
| 3 | **Sleep analytics** | Quality, hours-slept & consistency trends over time |
| 4 | **Mood correlation** | See how last night's sleep shapes today |
| 5 | **Smart recommendations** | Personalized, science-backed wind-down nudges |
| 6 | **Adaptive soundscapes** | Generative sleep sounds *(planned)* |
| 7 | **Streaks & habits** | Gentle motivation to keep journaling |
| 8 | **Private & exportable** | Your data is yours — export to JSON anytime |

**Primary user.** Anyone curious about their dreams or frustrated with their sleep.

---

## 🖥️ App surface (routes)

| Route | Screen | Description |
|-------|--------|-------------|
| `/` | **Landing** | Cinematic particle-galaxy hero + features, how-it-works, live AI demo, pricing |
| `/onboarding` | **Onboarding** | 3-step animated quiz → personalized sleep schedule |
| `/app` | **Dashboard** | Stats, weekly quality chart, insight of the day, recent dreams |
| `/app/journal` | **Journal** | Write a dream → instant AI analysis; manage entries |
| `/app/insights` | **Insights** | Mood breakdown, hours-slept trend, most-common symbols |
| `/app/settings` | **Settings** | Profile, preferences, data export & deletion |

---

## 🛠️ Tech stack

| Area | Choice |
|------|--------|
| Framework | **React 18** + **TypeScript** |
| Build tool | **Vite 5** |
| Styling | **Tailwind CSS 3** (custom *Ember & Azure* theme) |
| 3D / WebGL | **Three.js**, **@react-three/fiber**, **@react-three/drei** |
| Post-processing | **@react-three/postprocessing** (bloom + vignette) |
| Animation | **Framer Motion** |
| Smooth scroll | **Lenis** |
| Icons | **lucide-react** |
| Routing | **react-router-dom** |
| **Backend** | **Node + Express** API (`/server`) |
| **Database** | **MongoDB** via **Mongoose** (Atlas in prod; in-memory for local dev) |
| **Auth** | **JWT** + **bcrypt** (email/password) |
| AI engine | Local heuristic `dreamEngine` today → **LLM-powered (Claude) on Day 3** |

---

## 🚀 Getting started

**Prerequisites:** [Node.js](https://nodejs.org) **18+** (built on Node 22) and npm.

Sleep-Scribe is a two-part app: a **frontend** (this folder) and a **backend API**
(`/server`). Run both in separate terminals.

**1 — Backend (API + database)**

```bash
cd server
npm install
cp .env.example .env     # optional — works with zero config for local dev
npm run dev              # API on http://localhost:4000
```

> 💡 With no `MONGODB_URI` set, the server boots an **in-memory MongoDB** so you can
> develop instantly. For real, persistent, deployable data, create a free
> [MongoDB Atlas](https://www.mongodb.com/atlas) cluster and paste its connection
> string into `server/.env`.

**2 — Frontend**

```bash
# from the project root
npm install
npm run dev              # app on http://localhost:5173
```

```bash
npm run build            # production build
npm run preview          # preview the production build
```

> The frontend talks to the API at `VITE_API_URL` (defaults to
> `http://localhost:4000/api`). Dream analysis currently uses a local heuristic
> engine (`src/lib/dreamEngine.ts`); the Day-3 LLM swap is described below.

---

## 📜 Available scripts

| Script | Does |
|--------|------|
| `npm run dev` | Start Vite dev server with HMR |
| `npm run build` | Type-check (`tsc -b`) then build to `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Lint the codebase |

---

## 📁 Project structure

```
sleep-scribe/
├─ public/                 # static assets (favicon, etc.)
├─ src/
│  ├─ main.tsx             # app entry (Router + global providers)
│  ├─ App.tsx              # routes + global FX layers
│  ├─ index.css            # Tailwind layers + theme utilities
│  │
│  ├─ pages/
│  │  ├─ Landing.tsx       # marketing landing page
│  │  └─ Onboarding.tsx    # animated onboarding flow
│  │
│  ├─ app/                 # the product (authenticated surface)
│  │  ├─ AppLayout.tsx     # sidebar shell + page transitions
│  │  ├─ DashboardHome.tsx
│  │  ├─ JournalPage.tsx
│  │  ├─ InsightsPage.tsx
│  │  ├─ SettingsPage.tsx
│  │  └─ useEntries.ts     # shared journal store (localStorage)
│  │
│  ├─ components/
│  │  ├─ hero/
│  │  │  ├─ CinematicHero.tsx   # pinned, scroll-driven hero
│  │  │  └─ ParticleGalaxy.tsx  # the morphing particle system
│  │  ├─ fx/               # reusable motion: cursor glow, tilt, magnetic, …
│  │  └─ *.tsx             # landing sections (Features, Pricing, …)
│  │
│  ├─ lib/
│  │  ├─ formations.ts     # particle formation math (point→galaxy→ring)
│  │  └─ dreamEngine.ts    # dream analysis (heuristic → LLM on Day 3)
│  │
│  ├─ auth/                # AuthContext, RequireAuth guard
│  ├─ lib/api.ts           # typed client for the backend API
│  └─ data/content.tsx     # marketing copy & feature data
│
├─ server/                 # backend API (Node + Express + MongoDB)
│  └─ src/
│     ├─ index.js          # express app + bootstrap
│     ├─ db.js             # MongoDB connection (Atlas or in-memory)
│     ├─ models/           # User, Entry (Mongoose schemas)
│     ├─ middleware/auth.js# JWT verification
│     └─ routes/           # /auth (register/login/me), /entries (CRUD)
└─ ...config (vite, tailwind, tsconfig)
```

---

## 🎨 Design system — *Ember & Azure*

A cinematic night-sky theme: a **deep navy-black** base, **electric blue / indigo**
as the calming dominant, and a **warm orange** spark as the accent — like a single
ember of a dream glowing in the dark.

| Token | Hex | Use |
|-------|-----|-----|
| Background | `#04050d` | App base |
| Blue | `#3b82f6` | Calming primary |
| Indigo | `#7c5cff` | Bridge / accents |
| Azure | `#38bdf8` | Cool accent |
| Ember | `#ff7a18` | Warm spark / CTAs |

---

## 🤖 Wiring in real AI (Day 3)

Today `src/lib/dreamEngine.ts` ships a fully **offline** analysis engine so the demo
works with zero setup. To use a real LLM, replace `analyzeDream()` with an API call
— the UI already expects the same `DreamAnalysis` shape, so nothing else changes.

```ts
// src/lib/dreamEngine.ts (Day 3 version)
import Anthropic from "@anthropic-ai/sdk";

export async function analyzeDream(text: string): Promise<DreamAnalysis> {
  // ⚠️ In production, call this from a backend so your API key stays secret.
  const client = new Anthropic({ apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY });
  const msg = await client.messages.create({
    model: import.meta.env.VITE_AI_MODEL ?? "claude-opus-4-8",
    max_tokens: 800,
    messages: [
      {
        role: "user",
        content: `Analyze this dream and reply ONLY as JSON matching
          {summary, mood:{label,score,color}, symbols:[{name,meaning}], themes:[], tip}.
          Dream: """${text}"""`,
      },
    ],
  });
  return JSON.parse(msg.content[0].text);
}
```

Then add your key to `.env` (see [`.env.example`](.env.example)).

---

## 🗺️ Roadmap — 5-day *Learn · Build · Ship*

- [x] **Day 1 — Spec & foundation:** repo, README spec & a runnable app skeleton ✅
- [x] **Day 2 — Core app:** real email/password auth + per-user journal saved to MongoDB ✅
- [ ] **Day 3 — Wire in the AI:** first real LLM call (Claude) for dream analysis
- [ ] **Day 4 — Signature feature:** the app's flagship AI feature on real input
- [ ] **Day 5 — Polish & ship:** deployed app + guardrails + a share post

---

## 📄 License

[MIT](LICENSE) — built as a learning project. Dream freely. 🌙
