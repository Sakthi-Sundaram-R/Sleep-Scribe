// Custom SleepScribe wordmark + glyph.
// The mark is a crescent moon cradling a pen nib — "writing your dreams" —
// drawn as one vector so it reads as a real, crafted logo (not an icon in a box).

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="ss-grad" x1="4" y1="3" x2="28" y2="29" gradientUnits="userSpaceOnUse">
          <stop stopColor="#a5b4fc" />
          <stop offset="0.5" stopColor="#7c3aed" />
          <stop offset="1" stopColor="#38bdf8" />
        </linearGradient>
      </defs>

      {/* crescent moon */}
      <path
        d="M27 17.6A11 11 0 1 1 14.4 5 8.6 8.6 0 0 0 27 17.6Z"
        fill="url(#ss-grad)"
      />

      {/* pen nib nested in the moon's hollow — a downward ink point */}
      <path
        d="M19.7 11.6 23 14.9l-5.1 6.2a1 1 0 0 1-.8.4l-2.2-.1.0-2.2a1 1 0 0 1 .3-.7Z"
        fill="#0b0f1f"
        stroke="#e8ecff"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
      {/* nib slit + ink tip */}
      <path d="M17.4 14.2 20 16.8" stroke="#e8ecff" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="15.2" cy="21.6" r="1" fill="#e8ecff" />

      {/* twinkle */}
      <path
        d="M24.5 5.2 25.2 7l1.8.7-1.8.7-.7 1.8-.7-1.8L22 7.7l1.8-.7Z"
        fill="#a5b4fc"
      />
    </svg>
  );
}

export default function Logo({
  className,
  textClass = "text-xl",
}: {
  className?: string;
  textClass?: string;
}) {
  return (
    <span className={`flex items-center gap-2.5 ${className ?? ""}`}>
      <LogoMark className="h-8 w-8 drop-shadow-[0_2px_10px_rgba(124,58,237,0.45)]" />
      <span className={`font-display font-bold tracking-tight ${textClass}`}>
        Sleep<span className="text-gradient">Scribe</span>
      </span>
    </span>
  );
}
