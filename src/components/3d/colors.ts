// Shared palette for the cinematic scroll sequence (from the master prompt).
export const COLORS = {
  void: "#060912",
  reverie: "#9B7FD4",
  aurora: "#3DD6C0",
  lunar: "#EDE8FF",
  ember: "#E8845A",
  anxiety: "#C4704F",
  fear: "#E05C5C",
  joy: "#B8E986",
  longing: "#7B9FD4",
} as const;

// A small constellation layout reused by the dream-assembly + dream-world scenes
// (stand-in for the project's ConstellationMap DEMO_SYMBOLS positions).
export const CONSTELLATION: { pos: [number, number, number]; color: string }[] = [
  { pos: [0, 0.2, -22], color: COLORS.reverie },
  { pos: [-2.4, 1.4, -23], color: COLORS.aurora },
  { pos: [2.6, 1.0, -21.5], color: COLORS.joy },
  { pos: [-3.1, -1.2, -22.5], color: COLORS.longing },
  { pos: [3.0, -1.5, -23], color: COLORS.fear },
  { pos: [-1.2, 2.6, -24], color: COLORS.lunar },
  { pos: [1.6, -2.6, -21], color: COLORS.anxiety },
  { pos: [-4.0, 0.2, -24.5], color: COLORS.aurora },
  { pos: [4.1, 0.4, -22], color: COLORS.reverie },
];
