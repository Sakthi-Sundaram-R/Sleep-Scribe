import * as THREE from "three";

// Small scroll-math helpers shared across the cinematic scenes.
export const clamp01 = (x: number) => Math.min(1, Math.max(0, x));

// linear 0..1 ramp between a and b
export const rangeT = (a: number, b: number, x: number) =>
  clamp01((x - a) / (b - a));

// eased 0..1 ramp (smoothstep)
export const smooth = (a: number, b: number, x: number) => {
  const t = rangeT(a, b, x);
  return t * t * (3 - 2 * t);
};

export const lerp = THREE.MathUtils.lerp;

export const isMobile =
  typeof window !== "undefined" && window.innerWidth < 768;

export function prefersReducedMotion() {
  return (
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
  );
}
