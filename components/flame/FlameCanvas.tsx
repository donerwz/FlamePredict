"use client";

import { useMemo, useRef } from "react";
import "@/lib/threeConsole";
import * as THREE from "three";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { flameVertexShader, flameFragmentShader } from "./flameShader";
import { visualTargets, type SimParams } from "./simTypes";

interface FlameCanvasProps {
  params: SimParams;
  reduced: boolean;
  /** Written to directly (no re-renders); hosts the live FPS readout. */
  fpsRef: React.RefObject<HTMLSpanElement | null>;
}

function FlameMesh({ params, reduced }: { params: SimParams; reduced: boolean }) {
  const matRef = useRef<THREE.ShaderMaterial>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uG: { value: 0 },
      uFlow: { value: 0 },
      uAspect: { value: 1 },
      uSpread: { value: 1 },
      uSoot: { value: 0.3 },
      uBright: { value: 0.15 },
      uIntensity: { value: 1 },
    }),
    [],
  );

  useFrame((_, dt) => {
    const mat = matRef.current;
    const mesh = meshRef.current;
    if (!mat || !mesh) return;
    const t = visualTargets(params);
    // Ease uniforms toward their targets (~300–600 ms feel).
    const k = Math.min(dt * 4, 1);
    const u = mat.uniforms;
    u.uG.value += (t.uG - u.uG.value) * k;
    u.uFlow.value += (t.uFlow - u.uFlow.value) * k;
    u.uAspect.value += (t.uAspect - u.uAspect.value) * k;
    u.uSpread.value += (t.uSpread - u.uSpread.value) * k;
    u.uSoot.value += (t.uSoot - u.uSoot.value) * k;
    u.uBright.value += (t.uBright - u.uBright.value) * k;
    // Extinction fades slower, like a flame starving rather than switching off.
    u.uIntensity.value += (t.uIntensity - u.uIntensity.value) * Math.min(dt * 1.6, 1);
    const s = t.scale;
    mesh.scale.set(s, s, s);
    // Reduced motion: hold the flame still (uniforms settle, time stops).
    if (!reduced) u.uTime.value += dt;
  });

  return (
    <mesh ref={meshRef} position={[0, 0.35, 0]}>
      <sphereGeometry args={[0.85, 48, 48]} />
      <shaderMaterial
        ref={matRef}
        vertexShader={flameVertexShader}
        fragmentShader={flameFragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        side={THREE.DoubleSide}
      />
    </mesh>
  );
}

/** The dark fuel body under the flame, per geometry. */
function FuelBody({ fuel }: { fuel: SimParams["fuel"] }) {
  const mat = (
    <meshStandardMaterial color="#1a2233" roughness={0.8} metalness={0.1} />
  );
  switch (fuel) {
    case "droplet":
      return (
        <mesh position={[0, 0.35, 0]}>
          <sphereGeometry args={[0.1, 24, 24]} />
          {mat}
        </mesh>
      );
    case "porous":
      return (
        <mesh position={[0, 0.35, 0]}>
          <sphereGeometry args={[0.3, 32, 32]} />
          {mat}
        </mesh>
      );
    case "jet":
      return (
        <mesh position={[0, -0.45, 0]}>
          <cylinderGeometry args={[0.07, 0.1, 0.5, 20]} />
          {mat}
        </mesh>
      );
    case "sheet":
      return (
        <mesh position={[0, -0.32, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <boxGeometry args={[1.7, 1.1, 0.05]} />
          {mat}
        </mesh>
      );
  }
}

function FpsMeter({ fpsRef }: { fpsRef: FlameCanvasProps["fpsRef"] }) {
  const acc = useRef({ frames: 0, time: 0 });
  useFrame((_, dt) => {
    const a = acc.current;
    a.frames += 1;
    a.time += dt;
    if (a.time >= 0.5) {
      if (fpsRef.current) {
        fpsRef.current.textContent = `${Math.round(a.frames / a.time)} FPS`;
      }
      a.frames = 0;
      a.time = 0;
    }
  });
  return null;
}

export default function FlameCanvas({ params, reduced, fpsRef }: FlameCanvasProps) {
  return (
    <Canvas
      role="img"
      aria-label="Interpretive 3D illustration of the flame for the conditions set below. Its state is given in the text beside it."
      dpr={[1, 1.5]}
      camera={{ position: [0, 0.5, 3.2], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
      className="!bg-transparent"
    >
      <ambientLight intensity={0.35} />
      <directionalLight position={[2, 3, 2]} intensity={0.4} />
      <FlameMesh params={params} reduced={reduced} />
      <FuelBody fuel={params.fuel} />
      <FpsMeter fpsRef={fpsRef} />
      <OrbitControls
        enablePan={false}
        minDistance={2}
        maxDistance={5}
        target={[0, 0.3, 0]}
      />
    </Canvas>
  );
}
