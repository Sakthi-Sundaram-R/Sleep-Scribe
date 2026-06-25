import { useMemo, useRef, type MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { makeParticleTexture } from "../../../lib/formations";
import { COLORS } from "../colors";
import { rangeT, isMobile } from "../util";

// SCENE 4 (0.50–0.65) — neural tunnel warp; camera flies down a glowing tube.
export default function TunnelScene({
  progress,
}: {
  progress: MutableRefObject<number>;
}) {
  const group = useRef<THREE.Group>(null);
  const rings = useRef<THREE.Mesh[]>([]);
  const points = useRef<THREE.Points>(null);

  const sprite = useMemo(() => makeParticleTexture(), []);
  const COUNT = isMobile ? 1400 : 3000;

  const { geometry, velocities } = useMemo(() => {
    const arr = new Float32Array(COUNT * 3);
    const col = new Float32Array(COUNT * 3);
    const vel = new Float32Array(COUNT);
    const white = new THREE.Color("#ffffff");
    const reverie = new THREE.Color(COLORS.reverie);
    const aurora = new THREE.Color(COLORS.aurora);
    for (let i = 0; i < COUNT; i++) {
      const a = Math.random() * Math.PI * 2;
      const r = 0.3 + Math.random() * 2.6;
      arr[i * 3] = Math.cos(a) * r;
      arr[i * 3 + 1] = Math.sin(a) * r;
      arr[i * 3 + 2] = -40 + Math.random() * 60;
      vel[i] = 8 + Math.random() * 14;
      const roll = Math.random();
      const c = roll > 0.3 ? white : roll > 0.1 ? reverie : aurora;
      col[i * 3] = c.r;
      col[i * 3 + 1] = c.g;
      col[i * 3 + 2] = c.b;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(arr, 3));
    g.setAttribute("color", new THREE.BufferAttribute(col, 3));
    return { geometry: g, velocities: vel };
  }, [COUNT]);

  useFrame((_, delta) => {
    const p = progress.current;
    const vis = rangeT(0.47, 0.53, p) * (1 - rangeT(0.66, 0.72, p));
    if (group.current) group.current.visible = vis > 0.01;

    rings.current.forEach((m, i) => {
      if (m) m.rotation.z += delta * [0.2, 0.5, 0.9][i];
    });

    if (points.current) {
      const pos = points.current.geometry.getAttribute("position") as THREE.BufferAttribute;
      const a = pos.array as Float32Array;
      const speed = 1 + rangeT(0.5, 0.65, p) * 3;
      for (let i = 0; i < COUNT; i++) {
        a[i * 3 + 2] += velocities[i] * speed * delta;
        if (a[i * 3 + 2] > 4) a[i * 3 + 2] = -40;
      }
      pos.needsUpdate = true;
      (points.current.material as THREE.PointsMaterial).opacity = vis;
    }
  });

  const ringColors = [COLORS.reverie, COLORS.aurora, COLORS.lunar];

  return (
    <group ref={group} visible={false}>
      {/* tunnel shell */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -19]}>
        <cylinderGeometry args={[3, 3, 60, 32, 1, true]} />
        <meshBasicMaterial
          color={COLORS.reverie}
          wireframe
          transparent
          opacity={0.08}
          side={THREE.BackSide}
        />
      </mesh>

      {/* concentric rings */}
      {[-6, -14, -24].map((z, i) => (
        <mesh
          key={i}
          ref={(el) => {
            if (el) rings.current[i] = el;
          }}
          position={[0, 0, z]}
        >
          <torusGeometry args={[2.6 - i * 0.2, 0.02, 8, 64]} />
          <meshBasicMaterial color={ringColors[i]} transparent opacity={0.6} toneMapped={false} />
        </mesh>
      ))}

      {/* rushing particle stream */}
      <points ref={points} geometry={geometry}>
        <pointsMaterial
          map={sprite}
          size={0.09}
          vertexColors
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}
