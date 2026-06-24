import { useEffect, useRef } from "react";
import { useInView, useMotionValue, animate } from "framer-motion";

// Counts a number up from 0 when it scrolls into view. Keeps any non-digit
// prefix/suffix (e.g. "1.2M+", "4.9★", "87%") intact.
export default function Counter({ value }: { value: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const mv = useMotionValue(0);

  const match = value.match(/[\d.]+/);
  const target = match ? parseFloat(match[0]) : 0;
  const decimals = match && match[0].includes(".") ? 1 : 0;
  const prefix = match ? value.slice(0, match.index) : "";
  const suffix = match ? value.slice(match.index! + match[0].length) : value;

  useEffect(() => {
    if (!inView) return;
    const controls = animate(mv, target, {
      duration: 1.6,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => {
        if (ref.current) {
          ref.current.textContent = `${prefix}${v.toFixed(decimals)}${suffix}`;
        }
      },
    });
    return controls.stop;
  }, [inView, target, decimals, prefix, suffix, mv]);

  return <span ref={ref}>{`${prefix}0${suffix}`}</span>;
}
