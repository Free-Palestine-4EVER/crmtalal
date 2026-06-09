"use client";

import { ModelStage } from "@/components/site/ModelStage";

const MODEL_URL = "/models/empire-tower.glb";

/** The hero tower — the user's own Empire tower, served at original quality.
 *  Starts half-revealed; scrolling lifts the rest into frame while it turns
 *  at a measured pace. Sized to fit the frustum fully. */
export function Hero3D() {
  return (
    <ModelStage
      src={MODEL_URL}
      fit={6.8}
      distance={10}
      spin={0.3}
      lift={0}
      scrollSpin={Math.PI * 1.7}
      className="!absolute inset-0"
    />
  );
}
