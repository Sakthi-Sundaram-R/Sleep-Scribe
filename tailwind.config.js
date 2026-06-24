/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        night: {
          950: "#04050d",
          900: "#080a16",
          800: "#0f1226",
          700: "#171a3a",
        },
        // "Ember & Azure" — warm orange <-> electric blue, indigo bridge.
        // (Token names kept for stability; values retuned to the new theme.)
        aurora: {
          purple: "#7c5cff", // indigo-violet bridge
          violet: "#9d7bff", // soft indigo accent (text)
          indigo: "#3b82f6", // blue
          pink: "#ff7a18", // PRIMARY WARM (orange) — replaces pink
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
          "linear-gradient(135deg, #ff7a18 0%, #7c5cff 52%, #38bdf8 100%)",
        "night-radial":
          "radial-gradient(ellipse at top, #171a3a 0%, #080a16 45%, #04050d 100%)",
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
          "0%, 100%": { boxShadow: "0 0 30px -5px rgba(59,130,246,0.5)" },
          "50%": { boxShadow: "0 0 55px 5px rgba(255,122,24,0.55)" },
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
