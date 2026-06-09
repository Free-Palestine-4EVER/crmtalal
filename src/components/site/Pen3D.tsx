"use client";

import { useGLTF } from "@react-three/drei";
import { ModelStage } from "@/components/site/ModelStage";

const MODEL_URL = "/models/golden-pen-opt.glb";

/** The golden pen — the "signature" of every certified valuation report. */
export function Pen3D() {
  return (
    <ModelStage
      src={MODEL_URL}
      fit={4.6}
      distance={5.6}
      spin={0.14}
      shadow
      className="!absolute inset-0"
    />
  );
}

useGLTF.preload(MODEL_URL);
