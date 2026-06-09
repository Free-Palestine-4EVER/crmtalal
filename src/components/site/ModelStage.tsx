"use client";

/**
 * ModelStage — a self-contained, opaque-reading 3D viewport.
 *
 * Hardened: WebGL capability check (graceful static fallback), an error
 * boundary so a GPU/driver failure can never blank the page, mounts only
 * when near the viewport, and pauses the frameloop while offscreen.
 *
 * Motion: scroll progress is computed from the stage's own position in the
 * viewport (0 = entering from below, 1 = leaving above), so models react to
 * scroll wherever the section lives on the page — plus cursor parallax.
 */

import {
  Component,
  Suspense,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
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
  /** how strongly scroll progress spins the model (radians across the section) */
  scrollSpin?: number;
  className?: string;
  shadow?: boolean;
};

/* ── crash shield: a 3D failure must never take the page down ── */
class GLBoundary extends Component<{ children: ReactNode }, { dead: boolean }> {
  state = { dead: false };
  static getDerivedStateFromError() {
    return { dead: true };
  }
  componentDidCatch() {
    /* swallow — fallback is the styled backdrop behind the canvas */
  }
  render() {
    return this.state.dead ? null : this.props.children;
  }
}

function supportsWebGL(): boolean {
  try {
    const c = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (c.getContext("webgl2") || c.getContext("webgl"))
    );
  } catch {
    return false;
  }
}

function Model({
  src,
  fit = 4.4,
  spin = 0.16,
  lift = 0,
  scrollSpin = Math.PI * 1.6,
  scroll,
  mouse,
}: {
  src: string;
  fit?: number;
  spin?: number;
  lift?: number;
  scrollSpin?: number;
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
    const s = scroll.current ?? 0; // 0..1 through this stage's viewport journey
    const mx = mouse.current?.x ?? 0;
    const my = mouse.current?.y ?? 0;
    const targetY = t * spin + s * scrollSpin + mx * 0.55;
    const targetX = Math.sin(t * 0.5) * 0.08 - my * 0.4 + (s - 0.5) * 0.45;
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
  scrollSpin,
  className,
  shadow = false,
}: Props) {
  const holder = useRef<HTMLDivElement>(null);
  const scroll = useRef(0);
  const mouse = useRef({ x: 0, y: 0 });
  const [webgl, setWebgl] = useState<boolean | null>(null);
  const [near, setNear] = useState(false);
  const [inView, setInView] = useState(false);

  // capability + lazy mount + visibility-driven frameloop
  useEffect(() => {
    setWebgl(supportsWebGL());
    const el = holder.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      setNear(true);
      setInView(true);
      return;
    }
    const nearObs = new IntersectionObserver(
      ([e]) => e.isIntersecting && (setNear(true), nearObs.disconnect()),
      { rootMargin: "600px" },
    );
    const viewObs = new IntersectionObserver(
      ([e]) => setInView(e.isIntersecting),
      { rootMargin: "80px" },
    );
    nearObs.observe(el);
    viewObs.observe(el);
    return () => {
      nearObs.disconnect();
      viewObs.disconnect();
    };
  }, []);

  // per-stage scroll progress + cursor parallax
  useEffect(() => {
    const update = () => {
      const el = holder.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight || 800;
      // 0 when the stage's top enters the bottom edge → 1 when its bottom exits the top
      const total = vh + r.height;
      const passed = vh - r.top;
      scroll.current = Math.min(1, Math.max(0, passed / total));
    };
    const onMove = (e: PointerEvent) => {
      mouse.current = {
        x: (e.clientX / window.innerWidth) * 2 - 1,
        y: (e.clientY / window.innerHeight) * 2 - 1,
      };
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      window.removeEventListener("pointermove", onMove);
    };
  }, []);

  return (
    <div ref={holder} className={className}>
      {webgl && near && (
        <GLBoundary>
          <Canvas
            className="!absolute inset-0"
            camera={{ position: [0, 0, distance], fov: 40 }}
            gl={{ alpha: true, antialias: true, powerPreference: "default", failIfMajorPerformanceCaveat: false }}
            dpr={[1, 1.75]}
            frameloop={inView ? "always" : "never"}
          >
            <ambientLight intensity={1.0} />
            <directionalLight position={[4, 6, 5]} intensity={2.1} />
            <directionalLight position={[-6, 2, -4]} intensity={1.0} color="#e7ce8e" />
            <pointLight position={[0, -3, 4]} intensity={0.8} color="#72142f" />
            <spotLight position={[0, 6, 2]} angle={0.5} penumbra={1} intensity={1.1} color="#fff3d6" />
            <Suspense fallback={null}>
              <Model
                src={src}
                fit={fit}
                spin={spin}
                lift={lift}
                scrollSpin={scrollSpin}
                scroll={scroll}
                mouse={mouse}
              />
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
        </GLBoundary>
      )}
    </div>
  );
}
