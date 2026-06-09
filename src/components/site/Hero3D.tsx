"use client";

import { ModelStage } from "@/components/site/ModelStage";

const MODEL_URL = "/models/skyward-spire-opt.glb";

/** The hero tower — the Skyward Spire. Starts half-revealed; scrolling
 *  lifts the rest into frame while it turns at a measured pace. */
export function Hero3D() {
  return (
    <ModelStage
      src={MODEL_URL}
      fit={7.2}
      distance={4.6}
      spin={0.06}
      lift={0.35}
      scrollSpin={Math.PI * 1.1}
      className="!absolute inset-0"
    />
  );
}
