"use client";

import dynamic from "next/dynamic";

const Ribbon3D = dynamic(
  () => import("@/components/site/Ribbon3D").then((m) => m.Ribbon3D),
  { ssr: false },
);

/** The 3D ribbon mark as a floating chapter ornament — spins with scroll. */
export function ChapterOrnament() {
  return (
    <div className="relative h-full w-full">
      <Ribbon3D />
    </div>
  );
}
