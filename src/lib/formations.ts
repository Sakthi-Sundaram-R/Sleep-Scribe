import * as THREE from "three";

// Builds the target positions for every "scene" the particle swarm morphs
// through as you scroll. Every formation returns a Float32Array of length N*3.
// Each particle keeps a stable "identity" (its index + a per-particle radius)
// so its colour stays consistent while it travels between formations.

export type Formations = {
  positions: Float32Array[]; // one array per scene
  colors: Float32Array; // per-particle RGB (stable across scenes)
  sizes: Float32Array; // per-particle base size
  count: number;
};

const ORANGE = new THREE.Color("#ff7a18");
const AMBER = new THREE.Color("#ffb155");
const VIOLET = new THREE.Color("#7c5cff");
const BLUE = new THREE.Color("#3b82f6");
const CYAN = new THREE.Color("#38bdf8");

// deterministic-ish pseudo random so reloads look the same-ish (not required)
function rand(min: number, max: number) {
  return min + Math.random() * (max - min);
}

export function buildFormations(count: number): Formations {
  const colors = new Float32Array(count * 3);
  const sizes = new Float32Array(count);

  // identity radius t in [0,1] used for colour + which galaxy ring it lives on
  const ids = new Float32Array(count);
  for (let i = 0; i < count; i++) {
    const t = Math.pow(Math.random(), 0.6); // bias outward a touch
    ids[i] = t;

    // colour: warm core -> cool rim, like the reference ring (orange <-> blue)
    const c = new THREE.Color();
    if (t < 0.45) {
      c.copy(ORANGE).lerp(AMBER, t / 0.45);
    } else if (t < 0.7) {
      c.copy(AMBER).lerp(VIOLET, (t - 0.45) / 0.25);
    } else {
      c.copy(VIOLET).lerp(Math.random() > 0.5 ? BLUE : CYAN, (t - 0.7) / 0.3);
    }
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;

    sizes[i] = rand(0.6, 1.0) * (t < 0.4 ? 1.5 : 1.0);
  }

  // ---- Scene 0: a single point of light (tiny dense core) ----
  const point = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = Math.pow(Math.random(), 3) * 0.5;
    const a = Math.random() * Math.PI * 2;
    const b = Math.acos(2 * Math.random() - 1);
    point[i * 3] = r * Math.sin(b) * Math.cos(a);
    point[i * 3 + 1] = r * Math.sin(b) * Math.sin(a) * 0.6;
    point[i * 3 + 2] = r * Math.cos(b);
  }

  // ---- Scene 1: an expanding sphere shell / nebula burst ----
  const sphere = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = rand(3.2, 5.2);
    const a = Math.random() * Math.PI * 2;
    const b = Math.acos(2 * Math.random() - 1);
    sphere[i * 3] = r * Math.sin(b) * Math.cos(a);
    sphere[i * 3 + 1] = r * Math.sin(b) * Math.sin(a);
    sphere[i * 3 + 2] = r * Math.cos(b);
  }

  // ---- Scene 2: a vast spiral galaxy (the climax) ----
  const galaxy = new Float32Array(count * 3);
  const arms = 4;
  const spin = 3.4;
  const maxRadius = 9;
  for (let i = 0; i < count; i++) {
    const t = ids[i];
    const radius = t * maxRadius;
    const branch = ((i % arms) / arms) * Math.PI * 2;
    const spinAngle = radius * (spin / maxRadius);
    const spread = (0.25 + t * 0.55) * (1.1 - t * 0.3);
    const rx = Math.pow(Math.random(), 2.5) * (Math.random() < 0.5 ? 1 : -1) * spread;
    const ry =
      Math.pow(Math.random(), 2.5) *
      (Math.random() < 0.5 ? 1 : -1) *
      spread *
      (0.35 - t * 0.25); // thin disk, thinner at rim
    const rz = Math.pow(Math.random(), 2.5) * (Math.random() < 0.5 ? 1 : -1) * spread;
    const ang = branch + spinAngle;
    galaxy[i * 3] = Math.cos(ang) * radius + rx;
    galaxy[i * 3 + 1] = ry * maxRadius * 0.06;
    galaxy[i * 3 + 2] = Math.sin(ang) * radius + rz;
  }

  // ---- Scene 3: a glowing terrain wave — rolling luminous hills (ref frame ~30) ----
  const terrain = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const x = rand(-13, 13);
    const z = rand(-7, 3.5);
    // layered sine ridges -> a flowing mountain/aurora silhouette
    const ridge =
      Math.sin(x * 0.55) * 0.9 +
      Math.sin(x * 0.21 + 1.7) * 1.6 +
      Math.cos(z * 0.45 + x * 0.1) * 0.6 +
      Math.sin(x * 1.3) * 0.25;
    const depthFade = 1 - (z + 7) / 10.5; // crests rise toward the back
    const y = -3.6 + ridge * (0.5 + depthFade) + (Math.random() - 0.5) * 0.35;
    terrain[i * 3] = x;
    terrain[i * 3 + 1] = y;
    terrain[i * 3 + 2] = z;
  }

  // ---- Scene 4: a glowing plasma ring / torus (the reference hero shot) ----
  const ring = new Float32Array(count * 3);
  const R = 6.4;
  const tube = 0.9;
  for (let i = 0; i < count; i++) {
    const u = Math.random() * Math.PI * 2;
    const v = Math.random() * Math.PI * 2;
    const tr = tube * Math.pow(Math.random(), 0.5);
    ring[i * 3] = (R + tr * Math.cos(v)) * Math.cos(u);
    ring[i * 3 + 1] = (R + tr * Math.cos(v)) * Math.sin(u);
    ring[i * 3 + 2] = tr * Math.sin(v) * 1.6;
  }

  return {
    positions: [point, sphere, galaxy, terrain, ring],
    colors,
    sizes,
    count,
  };
}

// Soft round glowing sprite for each particle.
export function makeParticleTexture(): THREE.Texture {
  const size = 64;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext("2d")!;
  const g = ctx.createRadialGradient(
    size / 2,
    size / 2,
    0,
    size / 2,
    size / 2,
    size / 2
  );
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.2, "rgba(255,255,255,0.9)");
  g.addColorStop(0.45, "rgba(255,255,255,0.35)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.needsUpdate = true;
  return tex;
}
