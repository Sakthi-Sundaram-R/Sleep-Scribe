import { useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

// A full-screen GLSL aurora/nebula shader that flows continuously behind the
// whole site. This is the signature visual — a living, breathing night sky.

const vertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const fragmentShader = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform vec2 uRes;
  uniform vec2 uMouse;

  vec2 hash(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(dot(hash(i + vec2(0.0, 0.0)), f - vec2(0.0, 0.0)),
          dot(hash(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x),
      mix(dot(hash(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)),
          dot(hash(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x),
      u.y);
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p *= 2.0;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = vUv;
    float aspect = uRes.x / max(uRes.y, 1.0);
    vec2 p = vec2(uv.x * aspect, uv.y);

    float t = uTime * 0.04;
    vec2 m = (uMouse - 0.5) * 0.25;

    float n  = fbm(p * 2.4 + vec2(t, t * 0.6) + m);
    float n2 = fbm(p * 1.6 - vec2(t * 0.8, t) - m);
    float n3 = fbm(p * 3.6 + vec2(-t * 0.5, t * 0.9));

    // Night Indigo & Dream Violet — calming, sleep-appropriate ambient palette
    vec3 night  = vec3(0.043, 0.055, 0.122);
    vec3 indigo = vec3(0.263, 0.220, 0.792);
    vec3 violet = vec3(0.486, 0.227, 0.929);
    vec3 azure  = vec3(0.220, 0.741, 0.973);

    vec3 col = night;
    col = mix(col, indigo, smoothstep(0.05, 0.75, n) * 0.45);
    col = mix(col, violet, smoothstep(0.35, 0.98, n2) * 0.35);
    col = mix(col, azure,  smoothstep(0.55, 1.05, n * n3) * 0.28);

    // soft top glow + bottom fade
    col += indigo * smoothstep(0.2, 1.0, uv.y) * 0.06;
    float d = distance(uv, vec2(0.5, 0.45));
    col *= 1.0 - d * 0.75;

    // subtle grain to kill banding
    float g = fract(sin(dot(uv, vec2(12.9898, 78.233)) + uTime) * 43758.5453);
    col += (g - 0.5) * 0.015;

    gl_FragColor = vec4(col, 1.0);
  }
`;

function AuroraPlane() {
  const mat = useRef<THREE.ShaderMaterial>(null);
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uRes: { value: new THREE.Vector2(1, 1) },
      uMouse: { value: new THREE.Vector2(0.5, 0.5) },
    }),
    []
  );

  useFrame((state) => {
    if (!mat.current) return;
    mat.current.uniforms.uTime.value = state.clock.elapsedTime;
    mat.current.uniforms.uRes.value.set(state.size.width, state.size.height);
    // pointer is -1..1; remap to 0..1
    mat.current.uniforms.uMouse.value.set(
      state.pointer.x * 0.5 + 0.5,
      state.pointer.y * 0.5 + 0.5
    );
  });

  return (
    <mesh>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={mat}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}

export default function AuroraBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 -z-10">
      <Canvas
        dpr={[1, 1.5]}
        gl={{ antialias: false, powerPreference: "high-performance" }}
        camera={{ position: [0, 0, 1] }}
      >
        <AuroraPlane />
      </Canvas>
    </div>
  );
}
