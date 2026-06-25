import { useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

// A large aurora spotlight that softly trails the cursor — adds depth & life.
export default function CursorGlow() {
  const x = useMotionValue(-400);
  const y = useMotionValue(-400);
  const sx = useSpring(x, { stiffness: 120, damping: 25, mass: 0.6 });
  const sy = useSpring(y, { stiffness: 120, damping: 25, mass: 0.6 });

  useEffect(() => {
    const move = (e: MouseEvent) => {
      x.set(e.clientX - 300);
      y.set(e.clientY - 300);
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, [x, y]);

  return (
    <motion.div
      aria-hidden
      style={{ x: sx, y: sy }}
      className="pointer-events-none fixed left-0 top-0 z-30 hidden h-[600px] w-[600px] rounded-full md:block"
    >
      <div
        className="h-full w-full rounded-full opacity-[0.18]"
        style={{
          background:
            "radial-gradient(circle, rgba(124,58,237,0.85) 0%, rgba(56,189,248,0.5) 38%, transparent 70%)",
          mixBlendMode: "screen",
          filter: "blur(20px)",
        }}
      />
    </motion.div>
  );
}
