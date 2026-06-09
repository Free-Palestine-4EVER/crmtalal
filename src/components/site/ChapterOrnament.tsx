"use client";

import dynamic from "next/dynamic";

const ModelStage = dynamic(
  () => import("@/components/site/ModelStage").then((m) => m.ModelStage),
  { ssr: false },
);

/** The 3D ribbon mark as a floating chapter ornament — framed to fit fully,
 *  spinning with scroll. */
export function ChapterOrnament() {
  return (
    <div className="relative h-full w-full">
      <ModelStage
        src="/models/hero-ribbon-opt.glb"
        fit={3.2}
        distance={6.4}
        spin={0.2}
        scrollSpin={Math.PI * 2.2}
        className="!absolute inset-0"
      />
    </div>
  );
}
