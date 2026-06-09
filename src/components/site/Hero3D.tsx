"use client";

import { Suspense, useEffect, useLayoutEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

const MODEL_URL = "/models/hero-ribbon-opt.glb";

function Ribbon({ scroll }: { scroll: React.RefObject<number> }) {
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
    // idle float + rotation, plus scroll-driven spin & drift
    g.rotation.y = t * 0.18 + s * Math.PI * 2.2;
    g.rotation.x = Math.sin(t * 0.5) * 0.06 + s * 0.5;
    g.rotation.z = Math.sin(t * 0.35) * 0.04;
    g.position.y = Math.sin(t * 0.6) * 0.12 - s * 1.6;
    const sc = 1 - s * 0.18;
    g.scale.setScalar(sc);
  });

  return (
    <group ref={group}>
      <primitive object={scene} />
    </group>
  );
}

export function Hero3D() {
  const scroll = useRef(0);

  useEffect(() => {
    const onScroll = () => {
      const h = window.innerHeight || 800;
      scroll.current = Math.min(1, Math.max(0, window.scrollY / (h * 0.85)));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
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
        <Ribbon scroll={scroll} />
      </Suspense>
    </Canvas>
  );
}

useGLTF.preload(MODEL_URL);
