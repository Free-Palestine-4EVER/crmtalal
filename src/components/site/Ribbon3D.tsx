"use client";

import { ModelStage } from "@/components/site/ModelStage";

const MODEL_URL = "/models/hero-ribbon-opt.glb";

/** The crimson-gold ribbon — Edarah's 3D mark, spinning hard on scroll. */
export function Ribbon3D() {
  return (
    <ModelStage
      src={MODEL_URL}
      fit={4.8}
      distance={5.4}
      spin={0.2}
      scrollSpin={Math.PI * 2.6}
      className="!absolute inset-0"
    />
  );
}
