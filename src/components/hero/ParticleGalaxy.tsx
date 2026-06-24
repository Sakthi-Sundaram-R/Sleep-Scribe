import { useMemo, useRef, type MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { buildFormations, makeParticleTexture } from "../../lib/formations";

// Smoothstep helper
function smooth(a: number, b: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

export default function ParticleGalaxy({
  progress,
  count = 9000,
}: {
  progress: MutableRefObject<number>;
  count?: number;
}) {
  const pointsRef = useRef<THREE.Points>(null);
  const groupRef = useRef<THREE.Group>(null);

  const { geometry, material, formations } = useMemo(() => {
    const formations = buildFormations(count);
    const geometry = new THREE.BufferGeometry();
    // start at the "point" formation
    const positions = formations.positions[0].slice();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("color", new THREE.BufferAttribute(formations.colors, 3));

    const material = new THREE.PointsMaterial({
      size: 0.08,
      map: makeParticleTexture(),
      vertexColors: true,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    });

    return { geometry, material, formations };
  }, [count]);

  // scratch vectors reused each frame
  const tmpTarget = useMemo(() => new Float32Array(count * 3), [count]);

  useFrame((state, delta) => {
    const p = progress.current; // 0..1 across the hero scroll
    const pos = geometry.getAttribute("position") as THREE.BufferAttribute;
    const arr = pos.array as Float32Array;
    const F = formations.positions;

    // Map global progress -> (formation index, local blend).
    // 5 formations: point -> sphere -> galaxy -> terrain -> ring (4 transitions).
    let from: Float32Array;
    let to: Float32Array;
    let t: number;
    if (p < 0.22) {
      from = F[0]; // point
      to = F[1]; // sphere burst
      t = smooth(0, 0.22, p);
    } else if (p < 0.46) {
      from = F[1];
      to = F[2]; // spiral galaxy
      t = smooth(0.24, 0.46, p);
    } else if (p < 0.7) {
      from = F[2];
      to = F[3]; // terrain wave
      t = smooth(0.5, 0.7, p);
    } else {
      from = F[3];
      to = F[4]; // plasma ring
      t = smooth(0.74, 1.0, p);
    }

    // Build blended target then damp current positions toward it for smoothness
    const damp = 1 - Math.pow(0.0015, delta); // frame-rate independent lerp
    for (let i = 0; i < arr.length; i++) {
      const target = from[i] + (to[i] - from[i]) * t;
      tmpTarget[i] = target;
      arr[i] += (target - arr[i]) * damp;
    }
    pos.needsUpdate = true;

    // Continuous slow rotation; tilt the disk like a galaxy seen at an angle.
    if (groupRef.current) {
      // Spin freely during the galaxy, then settle for terrain + ring.
      const spinDamp = 1 - smooth(0.46, 0.72, p) * 0.78;
      groupRef.current.rotation.y += delta * 0.05 * spinDamp;
      // Tilt in for the galaxy/terrain (look down the disk), ease back for the ring.
      const tilt =
        0.18 + smooth(0.24, 0.46, p) * 0.55 - smooth(0.74, 1.0, p) * 0.5;
      groupRef.current.rotation.x = tilt;
      // gentle mouse parallax
      groupRef.current.rotation.z = state.pointer.x * 0.05;
    }

    // Pulse particle size subtly + grow as it expands from the core
    const scale = 0.05 + smooth(0, 0.22, p) * 0.035;
    material.size = scale + Math.sin(state.clock.elapsedTime * 0.8) * 0.004;
  });

  return (
    <group ref={groupRef}>
      <points ref={pointsRef} geometry={geometry} material={material} />
    </group>
  );
}
