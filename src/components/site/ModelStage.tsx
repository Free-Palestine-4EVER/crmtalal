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
import {
  useGLTF,
  ContactShadows,
  Environment,
  Lightformer,
} from "@react-three/drei";
import * as THREE from "three";

type Props = {
  src: string;
  /** target size of the model's largest dimension, in world units */
  fit?: number;
  /** camera distance — smaller = bigger on screen */
  distance?: number;
  /** baseline idle spin speed */
  spin?: number;
  /** axis the model spins around (default "y") */
  spinAxis?: "x" | "y";
  /** lift the model on screen (positive = higher) */
  lift?: number;
  /** how strongly scroll progress spins the model (radians across the section) */
  scrollSpin?: number;
  /** cinematic entrance: the model rises + scales into place on first view */
  rise?: boolean;
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
  spinAxis = "y",
  lift = 0,
  scrollSpin = Math.PI * 1.6,
  rise = false,
  scroll,
  mouse,
}: {
  src: string;
  fit?: number;
  spin?: number;
  spinAxis?: "x" | "y";
  lift?: number;
  scrollSpin?: number;
  rise?: boolean;
  scroll: React.RefObject<number>;
  mouse: React.RefObject<{ x: number; y: number }>;
}) {
  const { scene } = useGLTF(src);
  const group = useRef<THREE.Group>(null);
  const born = useRef<number | null>(null);

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
          mat.envMapIntensity = 1.6;
          // fully-metallic mirror materials go black wherever the environment
          // doesn't cover — soften so direct lights always contribute
          if (typeof mat.metalness === "number" && mat.metalness > 0.85) {
            mat.metalness = 0.8;
          }
          if (typeof mat.roughness === "number" && mat.roughness < 0.18) {
            mat.roughness = 0.18;
          }
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

    // cinematic build-up: rise from below + scale into place on first view
    if (born.current === null) born.current = t;
    const age = t - born.current;
    const e = rise ? 1 - Math.pow(1 - Math.min(1, age / 1.8), 3) : 1; // easeOutCubic

    let targetX: number;
    let targetY: number;
    if (spinAxis === "x") {
      // continuous tumble around X; Y keeps only a gentle sway + cursor parallax
      targetX = t * spin + s * scrollSpin - my * 0.4 + (1 - e) * 0.9;
      targetY = Math.sin(t * 0.5) * 0.08 + mx * 0.55;
    } else {
      targetY = t * spin + s * scrollSpin + mx * 0.55 + (1 - e) * 0.9;
      targetX = Math.sin(t * 0.5) * 0.08 - my * 0.4 + (s - 0.5) * 0.45;
    }
    g.rotation.y += (targetY - g.rotation.y) * 0.06;
    g.rotation.x += (targetX - g.rotation.x) * 0.06;
    g.rotation.z = Math.sin(t * 0.35) * 0.05;
    g.position.y = lift + Math.sin(t * 0.6) * 0.1 - (1 - e) * 3.2;
    g.scale.setScalar(rise ? 0.55 + 0.45 * e : 1);
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
  spinAxis = "y",
  lift = 0,
  scrollSpin,
  rise = false,
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
      { rootMargin: "1600px" }, // start fetching well ahead — models are ready before arrival
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
            <directionalLight position={[-6, 2, -4]} intensity={1.0} color="#e3c98a" />
            <pointLight position={[0, -3, 4]} intensity={0.8} color="#7f1836" />
            <spotLight position={[0, 6, 2]} angle={0.5} penumbra={1} intensity={1.1} color="#fff3d6" />
            <Suspense fallback={null}>
              {/* procedural gold environment — metallic PBR materials need
                  something to reflect or they render black. Generated on the
                  GPU (no network fetch). */}
              <Environment resolution={256} frames={1}>
                <Lightformer
                  intensity={2.6}
                  position={[0, 4, 3]}
                  scale={[9, 5, 1]}
                  color="#fff6e0"
                />
                <Lightformer
                  intensity={1.8}
                  position={[-4, 1, -2]}
                  rotation-y={Math.PI / 2}
                  scale={[7, 3, 1]}
                  color="#e3c98a"
                />
                <Lightformer
                  intensity={1.3}
                  position={[4, -1, 2]}
                  rotation-y={-Math.PI / 2}
                  scale={[7, 3, 1]}
                  color="#b48a32"
                />
                <Lightformer
                  intensity={0.9}
                  position={[0, -3, -3]}
                  scale={[9, 3, 1]}
                  color="#7f1836"
                />
                {/* wrap-around fill so no facing angle ever goes black */}
                <Lightformer
                  intensity={1.4}
                  position={[0, 1, -5]}
                  rotation-y={Math.PI}
                  scale={[10, 6, 1]}
                  color="#d1ab5c"
                />
                <Lightformer
                  intensity={1.2}
                  position={[0, 6, 0]}
                  rotation-x={Math.PI / 2}
                  scale={[10, 10, 1]}
                  color="#fff1d6"
                />
              </Environment>
              <Model
                src={src}
                fit={fit}
                spin={spin}
                spinAxis={spinAxis}
                lift={lift}
                scrollSpin={scrollSpin}
                rise={rise}
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
                  color="#2c0813"
                />
              )}
            </Suspense>
          </Canvas>
        </GLBoundary>
      )}
    </div>
  );
}
