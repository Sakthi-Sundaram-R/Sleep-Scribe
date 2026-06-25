import { useMemo, useRef, type MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Line } from "@react-three/drei";
import { makeParticleTexture } from "../../../lib/formations";
import { COLORS, CONSTELLATION } from "../colors";
import { rangeT, smooth, lerp, isMobile } from "../util";

const CENTER = new THREE.Vector3(0, 0, -22);
const FRAG_COLORS = [
  COLORS.anxiety, COLORS.aurora, COLORS.reverie,
  COLORS.joy, COLORS.fear, COLORS.longing,
];

// SCENE 5 (0.65–0.80) dream fragments assemble + SCENE 6 (0.80–1.00) full dream
// world: glass orb + constellation.
export default function DreamAssemblyScene({
  progress,
}: {
  progress: MutableRefObject<number>;
}) {
  const group = useRef<THREE.Group>(null);
  const fragRefs = useRef<THREE.Mesh[]>([]);
  const orb = useRef<THREE.Mesh>(null);
  const core = useRef<THREE.Mesh>(null);
  const glow = useRef<THREE.PointLight>(null);
  const sprite = useMemo(() => makeParticleTexture(), []);

  const frags = useMemo(
    () =>
      Array.from({ length: 20 }).map((_, i) => {
        const r = 4 + Math.random() * 4;
        const a = Math.random() * Math.PI * 2;
        const b = Math.acos(2 * Math.random() - 1);
        const scatter = new THREE.Vector3(
          CENTER.x + r * Math.sin(b) * Math.cos(a),
          CENTER.y + r * Math.sin(b) * Math.sin(a),
          CENTER.z + r * Math.cos(b)
        );
        const target = new THREE.Vector3(...CONSTELLATION[i % CONSTELLATION.length].pos);
        return {
          scatter,
          target,
          base: 0.1 + Math.random() * 0.3,
          stagger: (i / 20) * 0.1,
          shape: i % 3,
          color: FRAG_COLORS[i % FRAG_COLORS.length],
        };
      }),
    []
  );

  // starfield backdrop
  const stars = useMemo(() => {
    const n = isMobile ? 1000 : 2000;
    const arr = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 60;
      arr[i * 3 + 1] = (Math.random() - 0.5) * 60;
      arr[i * 3 + 2] = -30 - Math.random() * 30;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(arr, 3));
    return g;
  }, []);

  useFrame(() => {
    const p = progress.current;
    const vis = rangeT(0.63, 0.68, p);
    if (group.current) {
      group.current.visible = vis > 0.01;
      group.current.rotation.y += 0.0015 * rangeT(0.8, 1, p);
    }

    const move = rangeT(0.8, 0.96, p); // scatter -> constellation
    frags.forEach((f, i) => {
      const m = fragRefs.current[i];
      if (!m) return;
      const s = smooth(0.65 + f.stagger, 0.78 + f.stagger, p);
      m.scale.setScalar(Math.max(0.001, s * f.base));
      m.position.lerpVectors(f.scatter, f.target, move);
      m.rotation.x += 0.01;
      m.rotation.y += 0.008;
    });

    const orbT = rangeT(0.8, 0.92, p);
    if (orb.current) {
      orb.current.scale.setScalar(Math.max(0.001, orbT));
      orb.current.rotation.y += 0.003;
    }
    if (core.current) core.current.scale.setScalar(Math.max(0.001, orbT));
    if (glow.current) glow.current.intensity = rangeT(0.65, 1, p) * 4;
  });

  return (
    <group ref={group} visible={false}>
      <points geometry={stars}>
        <pointsMaterial
          map={sprite}
          size={0.12}
          color="#ffffff"
          transparent
          opacity={0.5}
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>

      <pointLight ref={glow} position={CENTER.toArray()} color={COLORS.reverie} intensity={0} distance={30} />

      {/* dream fragments */}
      {frags.map((f, i) => (
        <mesh
          key={i}
          ref={(el) => {
            if (el) fragRefs.current[i] = el;
          }}
          position={f.scatter}
        >
          {f.shape === 0 ? (
            <octahedronGeometry args={[1, 0]} />
          ) : f.shape === 1 ? (
            <icosahedronGeometry args={[1, 0]} />
          ) : (
            <tetrahedronGeometry args={[1, 0]} />
          )}
          <meshStandardMaterial
            color={f.color}
            emissive={f.color}
            emissiveIntensity={1.4}
            toneMapped={false}
          />
        </mesh>
      ))}

      {/* constellation connection lines */}
      {CONSTELLATION.slice(1).map((c, i) => (
        <Line
          key={i}
          points={[CONSTELLATION[0].pos, c.pos]}
          color={COLORS.reverie}
          transparent
          opacity={0.06}
          lineWidth={1}
        />
      ))}

      {/* central glass orb */}
      <mesh ref={orb} position={CENTER.toArray()} scale={0.001}>
        <sphereGeometry args={[1.6, 64, 64]} />
        <meshPhysicalMaterial
          transmission={0.95}
          thickness={2}
          roughness={0.02}
          ior={1.5}
          clearcoat={1}
          color={COLORS.lunar}
          transparent
        />
      </mesh>
      <mesh ref={core} position={CENTER.toArray()} scale={0.001}>
        <sphereGeometry args={[0.3, 32, 32]} />
        <meshStandardMaterial
          color={COLORS.reverie}
          emissive={COLORS.reverie}
          emissiveIntensity={2.5}
          toneMapped={false}
        />
      </mesh>
    </group>
  );
}
