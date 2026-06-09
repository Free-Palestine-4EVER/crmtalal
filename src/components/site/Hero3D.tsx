"use client";

import { ModelStage } from "@/components/site/ModelStage";

const MODEL_URL = "/models/hero-ribbon-opt.glb";

/** The hero ribbon — large, solid, on its own lit stage. */
export function Hero3D() {
  return (
    <ModelStage
      src={MODEL_URL}
      fit={5.4}
      distance={5.2}
      spin={0.22}
      lift={1.05}
      scrollSpin={Math.PI * 1.2}
      className="!absolute inset-0"
    />
  );
}
