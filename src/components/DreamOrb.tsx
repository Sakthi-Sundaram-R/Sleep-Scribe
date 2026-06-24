import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  Float,
  Stars,
  Sphere,
  MeshDistortMaterial,
  OrbitControls,
  Sparkles,
} from "@react-three/drei";
import type { Mesh } from "three";

function Orb() {
  const mesh = useRef<Mesh>(null);

  useFrame((state) => {
    if (!mesh.current) return;
    const t = state.clock.getElapsedTime();
    mesh.current.rotation.y = t * 0.15;
    mesh.current.rotation.x = Math.sin(t * 0.2) * 0.15;
  });

  return (
    <Float speed={1.4} rotationIntensity={0.6} floatIntensity={1.2}>
      <Sphere ref={mesh} args={[1.45, 96, 96]}>
        <MeshDistortMaterial
          color="#7c5cff"
          attach="material"
          distort={0.42}
          speed={1.6}
          roughness={0.15}
          metalness={0.55}
          emissive="#4c1d95"
          emissiveIntensity={0.45}
        />
      </Sphere>
      {/* Glowing ring */}
      <mesh rotation={[Math.PI / 2.6, 0, 0]}>
        <torusGeometry args={[2.3, 0.022, 16, 120]} />
        <meshStandardMaterial
          color="#ff7a18"
          emissive="#ff7a18"
          emissiveIntensity={2}
          toneMapped={false}
        />
      </mesh>
      <mesh rotation={[Math.PI / 1.9, 0.6, 0]}>
        <torusGeometry args={[2.7, 0.012, 16, 120]} />
        <meshStandardMaterial
          color="#38bdf8"
          emissive="#38bdf8"
          emissiveIntensity={2}
          toneMapped={false}
        />
      </mesh>
    </Float>
  );
}

export default function DreamOrb() {
  return (
    <Canvas
      camera={{ position: [0, 0, 6], fov: 45 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true }}
    >
      <Suspense fallback={null}>
        <ambientLight intensity={0.6} />
        <pointLight position={[5, 5, 5]} intensity={2.4} color="#ff7a18" />
        <pointLight position={[-5, -3, 2]} intensity={2} color="#38bdf8" />
        <pointLight position={[0, 4, -4]} intensity={1.6} color="#7c5cff" />
        <Stars
          radius={50}
          depth={50}
          count={1800}
          factor={4}
          saturation={0}
          fade
          speed={1}
        />
        <Orb />
        <Sparkles
          count={60}
          scale={6}
          size={3}
          speed={0.4}
          color="#ffc78a"
          opacity={0.8}
        />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.6}
        />
      </Suspense>
    </Canvas>
  );
}
