/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        night: {
          950: "#0b0f1f",
          900: "#0f172a",
          800: "#131936",
          700: "#1e2350",
        },
        // "Night Indigo & Dream Violet" — the calming, sleep-appropriate palette
        // recommended by the ui-ux-pro-max skill (Sleep Tracker preset).
        // Token names kept for stability; values retuned. Orange (pink token)
        // is reserved as the single warm accent for the hero + primary CTA.
        aurora: {
          purple: "#6366f1", // indigo (secondary)
          violet: "#8b7dff", // soft indigo-violet accent (text)
          indigo: "#4338ca", // deep indigo (primary)
          pink: "#7c3aed", // dream violet (accent) — calming, replaces orange
          cyan: "#38bdf8", // azure accent
          teal: "#2dd4bf", // success/positive accent
        },
      },
      fontFamily: {
        display: ["'Space Grotesk'", "system-ui", "sans-serif"],
        sans: ["'Inter'", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "aurora-gradient":
          "linear-gradient(135deg, #4338ca 0%, #7c3aed 52%, #38bdf8 100%)",
        "night-radial":
          "radial-gradient(ellipse at top, #1e2350 0%, #0f172a 45%, #0b0f1f 100%)",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-18px)" },
        },
        "float-slow": {
          "0%, 100%": { transform: "translateY(0px) rotate(0deg)" },
          "50%": { transform: "translateY(-26px) rotate(6deg)" },
        },
        twinkle: {
          "0%, 100%": { opacity: "0.2" },
          "50%": { opacity: "1" },
        },
        "gradient-x": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        shimmer: {
          "100%": { transform: "translateX(100%)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 30px -5px rgba(67,56,202,0.5)" },
          "50%": { boxShadow: "0 0 55px 5px rgba(124,58,237,0.55)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        "spin-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        "aurora-shift": {
          "0%, 100%": { transform: "translate(0,0) scale(1)" },
          "33%": { transform: "translate(40px,-30px) scale(1.1)" },
          "66%": { transform: "translate(-30px,20px) scale(0.95)" },
        },
      },
      animation: {
        float: "float 6s ease-in-out infinite",
        "float-slow": "float-slow 9s ease-in-out infinite",
        twinkle: "twinkle 4s ease-in-out infinite",
        "gradient-x": "gradient-x 6s ease infinite",
        shimmer: "shimmer 2.5s infinite",
        "pulse-glow": "pulse-glow 4s ease-in-out infinite",
        marquee: "marquee 28s linear infinite",
        "spin-slow": "spin-slow 22s linear infinite",
        "aurora-shift": "aurora-shift 18s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
