"use client";

import { useEffect } from "react";

/** Route-level crash screen — bilingual, with a one-tap recovery. */
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[Edarah] route error:", error);
  }, [error]);

  return (
    <div className="grid min-h-svh place-items-center bg-ink-900 px-6 text-center">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-gold-500">
          Edarah
        </p>
        <h1 className="mt-4 font-display text-3xl font-semibold text-cream-50">
          حدث خطأ غير متوقع
        </h1>
        <p className="mt-2 text-sm text-cream-100/60">
          Something went wrong while loading this page.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            onClick={reset}
            className="h-12 rounded-full bg-gradient-to-b from-gold-500 to-gold-600 px-7 font-semibold text-ink-950"
          >
            إعادة المحاولة · Try again
          </button>
          <a
            href="/"
            className="grid h-12 place-items-center rounded-full border border-ink-600 px-7 font-medium text-cream-100"
          >
            الصفحة الرئيسية · Home
          </a>
        </div>
      </div>
    </div>
  );
}
