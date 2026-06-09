"use client";

/**
 * ModelStage — a self-contained, opaque-reading 3D viewport.
 * Loads a quantized + webp GLB (no extra decoder needed), normalises its
 * size, and drives an idle spin eased toward a scroll + cursor-parallax target.
 * Used for the hero ribbon and the golden-pen signature section.
 */

import { Suspense, useEffect, useLayoutEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

type Props = {
  src: string;
  /** target size of the model's largest dimension, in world units */
  fit?: number;
  /** camera distance — smaller = bigger on screen */
  distance?: number;
  /** baseline idle spin speed on Y */
  spin?: number;
  /** lift the model on screen (positive = higher) */
  lift?: number;
  className?: string;
  shadow?: boolean;
};

function Model({
  src,
  fit = 4.4,
  spin = 0.16,
  lift = 0,
  scroll,
  mouse,
}: {
  src: string;
  fit?: number;
  spin?: number;
  lift?: number;
  scroll: React.RefObject<number>;
  mouse: React.RefObject<{ x: number; y: number }>;
}) {
  const { scene } = useGLTF(src);
  const group = useRef<THREE.Group>(null);

  useLayoutEffect(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    scene.scale.setScalar(fit / maxDim);
    box.setFromObject(scene);
    const center = box.getCenter(new THREE.Vector3());
    scene.position.sub(center);
    scene.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.castShadow = true;
        mesh.receiveShadow = false;
        const mat = mesh.material as THREE.MeshStandardMaterial;
        if (mat) {
          mat.envMapIntensity = 1.35;
          // make gold read richer + fully opaque
          if (mat.transparent && mat.opacity < 1) {
            mat.transparent = false;
            mat.opacity = 1;
          }
          mat.needsUpdate = true;
        }
      }
    });
  }, [scene, fit]);

  useFrame((state) => {
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    const s = scroll.current ?? 0;
    const mx = mouse.current?.x ?? 0;
    const my = mouse.current?.y ?? 0;
    const targetY = t * spin + s * Math.PI * 1.4 + mx * 0.55;
    const targetX = Math.sin(t * 0.5) * 0.08 - my * 0.4 + s * 0.25;
    g.rotation.y += (targetY - g.rotation.y) * 0.06;
    g.rotation.x += (targetX - g.rotation.x) * 0.06;
    g.rotation.z = Math.sin(t * 0.35) * 0.05;
    g.position.y = lift + Math.sin(t * 0.6) * 0.1;
  });

  return (
    <group ref={group}>
      <primitive object={scene} />
    </group>
  );
}

export function ModelStage({
  src,
  fit = 4.4,
  distance = 5.4,
  spin = 0.16,
  lift = 0,
  className,
  shadow = false,
}: Props) {
  const scroll = useRef(0);
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onScroll = () => {
      const h = window.innerHeight || 800;
      scroll.current = Math.min(1, Math.max(0, window.scrollY / (h * 1.1)));
    };
    const onMove = (e: PointerEvent) => {
      mouse.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1,
      };
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <Canvas
      className={className}
      camera={{ position: [0, 0, distance], fov: 40 }}
      gl={{ alpha: true, antialias: true }}
      dpr={[1, 2]}
    >
      <ambientLight intensity={1.0} />
      <directionalLight position={[4, 6, 5]} intensity={2.1} />
      <directionalLight position={[-6, 2, -4]} intensity={1.0} color="#e7ce8e" />
      <pointLight position={[0, -3, 4]} intensity={0.8} color="#72142f" />
      <spotLight position={[0, 6, 2]} angle={0.5} penumbra={1} intensity={1.1} color="#fff3d6" />
      <Suspense fallback={null}>
        <Model src={src} fit={fit} spin={spin} lift={lift} scroll={scroll} mouse={mouse} />
        {shadow && (
          <ContactShadows
            position={[0, -fit / 2.1, 0]}
            opacity={0.5}
            scale={fit * 2.2}
            blur={2.6}
            far={fit}
            color="#2a0712"
          />
        )}
      </Suspense>
    </Canvas>
  );
}
