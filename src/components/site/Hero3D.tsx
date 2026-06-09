"use client";

import { ModelStage } from "@/components/site/ModelStage";

const MODEL_URL = "/models/tower-opt.glb";

/** The hero tower — a Riyadh-style skyscraper that turns as you scroll. */
export function Hero3D() {
  return (
    <ModelStage
      src={MODEL_URL}
      fit={5.8}
      distance={5.2}
      spin={0.14}
      lift={0.85}
      scrollSpin={Math.PI * 1.8}
      rise
      className="!absolute inset-0"
    />
  );
}
