"use client";

import dynamic from "next/dynamic";

const ModelStage = dynamic(
  () => import("@/components/site/ModelStage").then((m) => m.ModelStage),
  { ssr: false },
);

/** The 3D ribbon mark as a floating chapter ornament — framed to fit fully,
 *  spinning with scroll, with a dark halo so it reads on any backdrop. */
export function ChapterOrnament() {
  return (
    <div className="relative h-full w-full">
      {/* contrast halo — keeps the gold mark legible over bright imagery */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(50% 50% at 50% 50%, rgba(20,8,12,0.55), transparent 72%)",
        }}
      />
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
