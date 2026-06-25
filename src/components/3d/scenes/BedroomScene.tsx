import { useMemo, useRef, type MutableRefObject } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Tube } from "@react-three/drei";
import { makeParticleTexture } from "../../../lib/formations";
import { COLORS } from "../colors";
import { clamp01, rangeT } from "../util";

// SCENE 1 (0.00–0.15) bedroom + SCENE 2 (0.15–0.30) zoom to sleeping face.
export default function BedroomScene({
  progress,
}: {
  progress: MutableRefObject<number>;
}) {
  const group = useRef<THREE.Group>(null);
  const headMat = useRef<THREE.MeshStandardMaterial>(null);
  const reverieLight = useRef<THREE.PointLight>(null);

  const sprite = useMemo(() => makeParticleTexture(), []);

  // starfield seen through the window
  const stars = useMemo(() => {
    const n = 220;
    const arr = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      arr[i * 3] = (Math.random() - 0.5) * 10;
      arr[i * 3 + 1] = 1 + Math.random() * 5;
      arr[i * 3 + 2] = -8 - Math.random() * 3;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(arr, 3));
    return g;
  }, []);

  // closed-eye arcs
  const eyeCurves = useMemo(() => {
    const make = (cx: number) =>
      new THREE.CatmullRomCurve3([
        new THREE.Vector3(cx - 0.12, 1.45, 0.46),
        new THREE.Vector3(cx, 1.42, 0.5),
        new THREE.Vector3(cx + 0.12, 1.45, 0.46),
      ]);
    return [make(-0.16), make(0.16)];
  }, []);

  useFrame(() => {
    const p = progress.current;
    if (group.current) {
      // visible through the bedroom + zoom, fades as we enter the brain
      const vis = 1 - rangeT(0.3, 0.36, p);
      group.current.visible = vis > 0.01;
      group.current.scale.setScalar(1);
      group.current.traverse((o) => {
        const m = (o as THREE.Mesh).material as THREE.Material | undefined;
        if (m && "opacity" in m) {
          (m as THREE.Material & { opacity: number }).transparent = true;
          (m as THREE.Material & { opacity: number }).opacity =
            ((o as THREE.Mesh).userData.baseOpacity ?? 1) * vis;
        }
      });
    }
    // Reverie point light glows up during the zoom-to-face
    if (reverieLight.current) {
      reverieLight.current.intensity = rangeT(0.15, 0.3, p) * 1.5;
    }
    if (headMat.current) headMat.current.opacity = clamp01(1 - rangeT(0.3, 0.36, p));
  });

  return (
    <group ref={group}>
      {/* moonlight */}
      <directionalLight color="#B0C8FF" intensity={0.5} position={[-4, 6, 4]} />
      <pointLight ref={reverieLight} color={COLORS.reverie} position={[0, 1.8, 1]} intensity={0} distance={8} />

      {/* floor */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.2, 0]}>
        <planeGeometry args={[40, 40]} />
        <meshStandardMaterial color="#0A0C16" roughness={1} />
      </mesh>

      {/* bed frame */}
      <mesh position={[0, 0.1, 0]} userData={{ baseOpacity: 1 }}>
        <boxGeometry args={[4.2, 0.5, 2.2]} />
        <meshStandardMaterial color="#14111F" roughness={0.9} />
      </mesh>
      {/* blanket mound */}
      <mesh position={[0.2, 0.55, 0.1]} userData={{ baseOpacity: 1 }}>
        <boxGeometry args={[3.4, 0.5, 1.9]} />
        <meshStandardMaterial color="#1A1530" roughness={1} />
      </mesh>
      {/* pillow */}
      <mesh position={[-1.4, 0.6, 0]} scale={[1, 0.45, 0.7]} userData={{ baseOpacity: 1 }}>
        <sphereGeometry args={[0.55, 24, 24]} />
        <meshStandardMaterial color="#241C3D" roughness={1} />
      </mesh>

      {/* sleeping person — head + body */}
      <mesh position={[0, 1.4, 0]} userData={{ baseOpacity: 1 }}>
        <sphereGeometry args={[0.5, 64, 64]} />
        <meshStandardMaterial ref={headMat} color="#1A1530" emissive="#0A0818" roughness={0.9} transparent />
      </mesh>
      <mesh position={[0.7, 0.75, 0]} rotation={[0, 0, Math.PI / 2]} userData={{ baseOpacity: 1 }}>
        <capsuleGeometry args={[0.45, 1.4, 8, 16]} />
        <meshStandardMaterial color="#15101F" emissive="#0A0818" roughness={1} transparent />
      </mesh>

      {/* closed eyes */}
      {eyeCurves.map((c, i) => (
        <Tube key={i} args={[c, 24, 0.008, 6, false]}>
          <meshBasicMaterial color={COLORS.reverie} transparent opacity={0.75} />
        </Tube>
      ))}

      {/* window + starfield outside */}
      <mesh position={[0, 2.6, -6]} userData={{ baseOpacity: 1 }}>
        <planeGeometry args={[5, 3.4]} />
        <meshBasicMaterial color="#0C1024" />
      </mesh>
      <points geometry={stars}>
        <pointsMaterial
          map={sprite}
          size={0.12}
          color={COLORS.lunar}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </group>
  );
}
