"use client";

import { useGLTF } from "@react-three/drei";
import { ModelStage } from "@/components/site/ModelStage";

const MODEL_URL = "/models/hero-ribbon-opt.glb";

/** The hero ribbon — now larger and rendered on its own lit stage. */
export function Hero3D() {
  return (
    <ModelStage
      src={MODEL_URL}
      fit={5.4}
      distance={5.2}
      spin={0.22}
      lift={1.05}
      className="!absolute inset-0"
    />
  );
}

useGLTF.preload(MODEL_URL);
