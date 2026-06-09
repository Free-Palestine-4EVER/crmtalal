"use client";

import { Suspense, useEffect, useLayoutEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

const MODEL_URL = "/models/hero-ribbon-opt.glb";

function Ribbon({
  scroll,
  mouse,
}: {
  scroll: React.RefObject<number>;
  mouse: React.RefObject<{ x: number; y: number }>;
}) {
  const { scene } = useGLTF(MODEL_URL);
  const group = useRef<THREE.Group>(null);

  // Normalize any model to a consistent size + center it (Meshy exports vary).
  useLayoutEffect(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z) || 1;
    scene.scale.setScalar(3.6 / maxDim);
    box.setFromObject(scene);
    const center = box.getCenter(new THREE.Vector3());
    scene.position.sub(center);
    scene.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (mesh.isMesh) {
        mesh.castShadow = false;
        mesh.receiveShadow = false;
        const mat = mesh.material as THREE.MeshStandardMaterial;
        if (mat) {
          mat.envMapIntensity = 1.1;
          mat.needsUpdate = true;
        }
      }
    });
  }, [scene]);

  useFrame((state) => {
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    const s = scroll.current ?? 0;
    const mx = mouse.current?.x ?? 0;
    const my = mouse.current?.y ?? 0;
    // idle spin + scroll-driven motion, eased toward a cursor-parallax target
    const targetY = t * 0.18 + s * Math.PI * 2.2 + mx * 0.5;
    const targetX = Math.sin(t * 0.5) * 0.06 + s * 0.5 - my * 0.35;
    g.rotation.y += (targetY - g.rotation.y) * 0.07;
    g.rotation.x += (targetX - g.rotation.x) * 0.07;
    g.rotation.z = Math.sin(t * 0.35) * 0.04;
    g.position.y = Math.sin(t * 0.6) * 0.12 - s * 1.6;
    g.scale.setScalar(1 - s * 0.18);
  });

  return (
    <group ref={group}>
      <primitive object={scene} />
    </group>
  );
}

export function Hero3D() {
  const scroll = useRef(0);
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const onScroll = () => {
      const h = window.innerHeight || 800;
      scroll.current = Math.min(1, Math.max(0, window.scrollY / (h * 0.85)));
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
      className="!absolute inset-0"
      camera={{ position: [0, 0, 6], fov: 42 }}
      gl={{ alpha: true, antialias: true }}
      dpr={[1, 2]}
    >
      <ambientLight intensity={0.85} />
      <directionalLight position={[4, 6, 5]} intensity={1.5} />
      <directionalLight position={[-6, 2, -4]} intensity={0.7} color="#c9a24c" />
      <pointLight position={[0, -3, 4]} intensity={0.6} color="#72142f" />
      <Suspense fallback={null}>
        <Ribbon scroll={scroll} mouse={mouse} />
      </Suspense>
    </Canvas>
  );
}

useGLTF.preload(MODEL_URL);
