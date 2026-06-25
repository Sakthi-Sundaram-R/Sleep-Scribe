import { useMemo, useRef, type MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Line } from "@react-three/drei";
import { COLORS } from "../colors";
import { rangeT } from "../util";

// SCENE 3 (0.30–0.50) — camera inside the head, neural structure materialises.
export default function BrainScene({
  progress,
}: {
  progress: MutableRefObject<number>;
}) {
  const group = useRef<THREE.Group>(null);
  const shell = useRef<THREE.Mesh>(null);

  // synaptic sparks (emissive spheres that bloom — cheaper than 12 point lights)
  const sparks = useMemo(
    () =>
      Array.from({ length: 14 }).map(() => {
        const r = 1.4 * Math.cbrt(Math.random());
        const a = Math.random() * Math.PI * 2;
        const b = Math.acos(2 * Math.random() - 1);
        return {
          pos: [
            r * Math.sin(b) * Math.cos(a),
            r * Math.sin(b) * Math.sin(a),
            -2 + r * Math.cos(b),
          ] as [number, number, number],
          phase: Math.random() * Math.PI * 2,
          color: Math.random() > 0.5 ? COLORS.reverie : COLORS.aurora,
        };
      }),
    []
  );
  const sparkRefs = useRef<(THREE.MeshStandardMaterial | null)[]>([]);

  // neural pathway lines
  const lines = useMemo(
    () =>
      Array.from({ length: 8 }).map(() => {
        const pts: THREE.Vector3[] = [];
        for (let i = 0; i < 4; i++) {
          pts.push(
            new THREE.Vector3(
              (Math.random() - 0.5) * 3,
              (Math.random() - 0.5) * 3,
              -2 + (Math.random() - 0.5) * 3
            )
          );
        }
        return new THREE.CatmullRomCurve3(pts).getPoints(40);
      }),
    []
  );

  useFrame((state) => {
    const p = progress.current;
    const vis = rangeT(0.28, 0.34, p) * (1 - rangeT(0.52, 0.6, p));
    if (group.current) {
      group.current.visible = vis > 0.01;
      group.current.rotation.y += 0.0015;
    }
    if (shell.current) {
      const m = shell.current.material as THREE.MeshStandardMaterial;
      m.opacity = 0.12 * vis;
    }
    const t = state.clock.elapsedTime;
    sparkRefs.current.forEach((m, i) => {
      if (!m) return;
      const s = sparks[i];
      m.emissiveIntensity = (1.2 + Math.sin(t * 2 + s.phase) * 1.2) * vis;
    });
  });

  return (
    <group ref={group} visible={false}>
      {/* brain shell */}
      <mesh ref={shell} position={[0, 0, -2]}>
        <icosahedronGeometry args={[1.8, 4]} />
        <meshStandardMaterial
          color="#0F0820"
          emissive={COLORS.reverie}
          emissiveIntensity={0.2}
          wireframe
          transparent
          opacity={0.12}
        />
      </mesh>

      {/* synaptic sparks */}
      {sparks.map((s, i) => (
        <mesh key={i} position={s.pos}>
          <sphereGeometry args={[0.045, 12, 12]} />
          <meshStandardMaterial
            ref={(el) => {
              sparkRefs.current[i] = el;
            }}
            color={s.color}
            emissive={s.color}
            emissiveIntensity={1}
            toneMapped={false}
          />
        </mesh>
      ))}

      {/* neural pathways */}
      {lines.map((pts, i) => (
        <Line
          key={i}
          points={pts}
          color={COLORS.reverie}
          transparent
          opacity={0.3}
          lineWidth={1}
        />
      ))}
    </group>
  );
}
