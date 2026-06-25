import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import {
  EffectComposer,
  Bloom,
  DepthOfField,
  Vignette,
} from "@react-three/postprocessing";
import {
  useScroll,
  useMotionValueEvent,
  motion,
  useTransform,
} from "framer-motion";
import { ChevronDown } from "lucide-react";
import BedroomScene from "./scenes/BedroomScene";
import BrainScene from "./scenes/BrainScene";
import TunnelScene from "./scenes/TunnelScene";
import DreamAssemblyScene from "./scenes/DreamAssemblyScene";
import ScrollTextOverlay from "./ScrollTextOverlay";
import { lerp, rangeT, smooth, isMobile, prefersReducedMotion } from "./util";
import { COLORS } from "./colors";

type Ref = React.MutableRefObject<number>;

// Camera waypoints (offset → position + lookAt) from the master prompt.
const KEYS = [
  { o: 0.0, p: [0, 2, 18], l: [0, 0, 0] },
  { o: 0.15, p: [0, 2, 18], l: [0, 0, 0] },
  { o: 0.3, p: [0, 1.2, 2.5], l: [0, 1.4, 0] },
  { o: 0.5, p: [0, 0, 0.2], l: [0, 0, -10] },
  { o: 0.65, p: [0, 0, -8], l: [0, 0, -30] },
  { o: 0.8, p: [0, 0, -18], l: [0, 0, -25] },
  { o: 1.0, p: [0, 0, -22], l: [0, 0, -22] },
];

function Rig({ progress }: { progress: Ref }) {
  const { camera } = useThree();
  const look = useRef(new THREE.Vector3(0, 0, 0));
  useFrame(() => {
    const p = progress.current;
    let i = 0;
    while (i < KEYS.length - 2 && p > KEYS[i + 1].o) i++;
    const a = KEYS[i];
    const b = KEYS[i + 1];
    const t = smooth(a.o, b.o, p);
    camera.position.set(
      lerp(a.p[0], b.p[0], t),
      lerp(a.p[1], b.p[1], t),
      lerp(a.p[2], b.p[2], t)
    );
    look.current.set(
      lerp(a.l[0], b.l[0], t),
      lerp(a.l[1], b.l[1], t),
      lerp(a.l[2], b.l[2], t)
    );
    camera.lookAt(look.current);
  });
  return null;
}

function FogController({ progress }: { progress: Ref }) {
  const { scene } = useThree();
  const fog = useMemo(() => new THREE.FogExp2(COLORS.void, 0.04), []);
  useEffect(() => {
    scene.fog = fog;
    return () => {
      scene.fog = null;
    };
  }, [scene, fog]);
  useFrame(() => {
    const p = progress.current;
    let d = 0.04;
    if (p >= 0.3 && p < 0.5) d = lerp(0.04, 0.12, rangeT(0.3, 0.5, p));
    else if (p >= 0.5 && p < 0.65) d = lerp(0.12, 0.02, rangeT(0.5, 0.65, p));
    else if (p >= 0.65) d = 0.02;
    fog.density = d;
  });
  return null;
}

function Effects({ progress }: { progress: Ref }) {
  const bloom = useRef<{ intensity: number } | null>(null);
  useFrame(() => {
    const p = progress.current;
    let b: number;
    if (p < 0.3) b = lerp(0.3, 0.5, rangeT(0, 0.3, p));
    else if (p < 0.5) b = lerp(0.5, 2.0, rangeT(0.3, 0.5, p));
    else if (p < 0.65) b = lerp(2.0, 1.2, rangeT(0.5, 0.65, p));
    else b = lerp(1.2, 0.8, rangeT(0.65, 1, p));
    if (isMobile) b *= 0.6;
    if (bloom.current) bloom.current.intensity = b;
  });

  const bloomEl = (
    <Bloom
      ref={bloom as never}
      luminanceThreshold={0.5}
      luminanceSmoothing={0.4}
      intensity={0.3}
      radius={0.7}
      mipmapBlur
    />
  );

  if (isMobile) {
    return (
      <EffectComposer>
        {bloomEl}
        <Vignette offset={0.3} darkness={0.7} />
      </EffectComposer>
    );
  }
  return (
    <EffectComposer>
      <DepthOfField focusDistance={0} focalLength={0.02} bokehScale={2} />
      {bloomEl}
      <Vignette offset={0.3} darkness={0.7} />
    </EffectComposer>
  );
}

function SceneContents({ progress }: { progress: Ref }) {
  return (
    <>
      <ambientLight intensity={0.15} />
      <Rig progress={progress} />
      <FogController progress={progress} />
      <BedroomScene progress={progress} />
      <BrainScene progress={progress} />
      <TunnelScene progress={progress} />
      <DreamAssemblyScene progress={progress} />
      <Effects progress={progress} />
    </>
  );
}

export default function CinematicScroll() {
  const reduced = prefersReducedMotion();
  const sectionRef = useRef<HTMLDivElement>(null);
  const progress = useRef(reduced ? 1 : 0);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end end"],
  });
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    if (!reduced) progress.current = v;
  });

  const hintOpacity = useTransform(scrollYProgress, [0, 0.05], [1, 0]);

  return (
    <section
      ref={sectionRef}
      className="relative"
      style={{ height: reduced ? "100vh" : "600vh" }}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-[#060912]">
        <Canvas
          camera={{ position: [0, 2, 18], fov: 55 }}
          dpr={[1, isMobile ? 1.5 : 2]}
          gl={{ antialias: false, powerPreference: "high-performance" }}
        >
          <color attach="background" args={[COLORS.void]} />
          <SceneContents progress={progress} />
        </Canvas>

        <ScrollTextOverlay scrollYProgress={scrollYProgress} reduced={reduced} />

        {!reduced && (
          <motion.div
            style={{ opacity: hintOpacity }}
            className="pointer-events-none absolute bottom-8 left-1/2 z-10 -translate-x-1/2 text-center text-white/40"
          >
            <p className="mb-2 text-xs uppercase tracking-[0.3em]">Scroll</p>
            <ChevronDown className="mx-auto h-5 w-5 animate-bounce" />
          </motion.div>
        )}
      </div>
    </section>
  );
}
