"use client";

import { ModelStage } from "@/components/site/ModelStage";

const MODEL_URL = "/models/golden-pen-opt.glb";

/** The golden pen — the "signature" of every certified valuation report. */
export function Pen3D() {
  return (
    <ModelStage
      src={MODEL_URL}
      fit={4.6}
      distance={5.4}
      spin={0.1}
      spinAxis="x"
      scrollSpin={Math.PI * 2.4}
      shadow
      className="!absolute inset-0"
    />
  );
}
