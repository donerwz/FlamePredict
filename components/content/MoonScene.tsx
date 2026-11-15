"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { useTexture } from "@react-three/drei";

const RADIUS = 6;
/** Resting centre: the limb sits ~30% up from the bottom of the frame. */
const REST = new THREE.Vector3(0, -6.9, 0);
/** Start: below the frame and farther away, so the approach reads as descent. */
const START = new THREE.Vector3(0, -12.5, -9);
const APPROACH_S = 2.4;
/** Radians per second — one turn takes about nine minutes. */
const SPIN = 0.012;
/** Fraction of the approach after which the page content may enter. */
const ARRIVE_AT = 0.7;

interface MoonSceneProps {
  reduced: boolean;
  onReady: () => void;
  /** Fired once, when the Moon has nearly settled into frame. */
  onArrive: () => void;
}

function Moon({ reduced, onReady, onArrive }: MoonSceneProps) {
  const group = useRef<THREE.Group>(null);
  const mesh = useRef<THREE.Mesh>(null);
  const elapsed = useRef(0);
  const arrived = useRef(false);
  const gl = useThree((s) => s.gl);

  const [color, height] = useTexture(
    ["/textures/lroc_color_2k.jpg", "/textures/ldem_3_8bit.jpg"],
    ([map]) => {
      map.colorSpace = THREE.SRGBColorSpace;
      map.anisotropy = gl.capabilities.getMaxAnisotropy();
      map.needsUpdate = true;
    },
  );

  useEffect(() => {
    onReady();
  }, [onReady]);

  useFrame((_, dt) => {
    const g = group.current;
    const m = mesh.current;
    if (!g || !m) return;
    if (reduced) {
      g.position.copy(REST);
      return;
    }
    // Clamp dt so a background tab doesn't skip the approach.
    const step = Math.min(dt, 0.05);
    elapsed.current += step;
    const t = Math.min(elapsed.current / APPROACH_S, 1);
    if (!arrived.current && t >= ARRIVE_AT) {
      arrived.current = true;
      onArrive();
    }
    const eased = 1 - Math.pow(1 - t, 3);
    g.position.lerpVectors(START, REST, eased);
    // Spin about the horizontal axis: terrain rolls over the limb toward the
    // viewer, the way the surface passes beneath a low orbit.
    m.rotation.x += SPIN * step;
  });

  return (
    <group ref={group} position={reduced ? REST : START}>
      <mesh ref={mesh} rotation={[0.6, 0, 0.35]}>
        <sphereGeometry args={[RADIUS, 160, 160]} />
        <meshStandardMaterial
          map={color}
          bumpMap={height}
          bumpScale={3}
          roughness={1}
          metalness={0}
        />
      </mesh>
    </group>
  );
}

/** Low-orbit view of the Moon. Decorative; textures from NASA SVS (LRO). */
export default function MoonScene({ reduced, onReady, onArrive }: MoonSceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 5], fov: 40, near: 0.1, far: 60 }}
      dpr={[1, 2]}
      frameloop={reduced ? "demand" : "always"}
      gl={{ antialias: true, alpha: true }}
    >
      <ambientLight intensity={0.05} />
      {/* Low sun from the upper left: long shadows, a terminator to the right. */}
      <directionalLight position={[-6, 2.5, 3]} intensity={2.6} color="#eef3ff" />
      <Moon reduced={reduced} onReady={onReady} onArrive={onArrive} />
    </Canvas>
  );
}
