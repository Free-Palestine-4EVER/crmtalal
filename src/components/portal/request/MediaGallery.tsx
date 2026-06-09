"use client";

import { useEffect, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Download, ImageIcon } from "lucide-react";
import { useI18n } from "@/i18n";
import { fmtDate } from "@/lib/format";
import type { ProjectDocument } from "@/lib/types";

export function isImageDoc(d: ProjectDocument) {
  return (
    d.contentType?.startsWith("image/") ||
    /\.(png|jpe?g|gif|webp|bmp|heic|heif)$/i.test(d.name || "")
  );
}

/** Thumbnail grid + lightbox for image documents on a request. */
export function MediaGallery({ documents }: { documents: ProjectDocument[] }) {
  const { locale } = useI18n();
  const images = documents.filter(isImageDoc);
  const [active, setActive] = useState<number | null>(null);

  const close = useCallback(() => setActive(null), []);
  const next = useCallback(
    () => setActive((i) => (i === null ? null : (i + 1) % images.length)),
    [images.length],
  );
  const prev = useCallback(
    () =>
      setActive((i) =>
        i === null ? null : (i - 1 + images.length) % images.length,
      ),
    [images.length],
  );

  useEffect(() => {
    if (active === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") next();
      else if (e.key === "ArrowLeft") prev();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [active, close, next, prev]);

  if (images.length === 0) return null;

  const current = active !== null ? images[active] : null;

  return (
    <div>
      <div className="mb-1 flex items-center gap-1.5 text-xs text-ink-500">
        <ImageIcon className="h-3.5 w-3.5" />
        {images.length} {locale === "ar" ? "صورة" : "photos"}
      </div>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {images.map((img, i) => (
          <button
            key={img.id}
            type="button"
            onClick={() => setActive(i)}
            className="group relative aspect-square overflow-hidden rounded-xl border border-ink-700 bg-ink-850"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={img.url}
              alt={img.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <span className="absolute inset-0 bg-gradient-to-t from-ink-950/60 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          </button>
        ))}
      </div>

      <AnimatePresence>
        {current && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[120] flex flex-col bg-ink-950/95 backdrop-blur-sm"
            onClick={close}
          >
            {/* top bar */}
            <div
              className="flex items-center justify-between gap-3 px-5 py-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-cream-50">
                  {current.name}
                </p>
                <p className="text-xs text-ink-500">
                  {current.uploadedByName} · {fmtDate(current.uploadedAt, locale)}
                  {images.length > 1 && ` · ${(active ?? 0) + 1}/${images.length}`}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href={current.url}
                  target="_blank"
                  rel="noreferrer"
                  download
                  onClick={(e) => e.stopPropagation()}
                  className="grid h-10 w-10 place-items-center rounded-full border border-ink-700 text-cream-100/80 hover:text-gold-300"
                  aria-label="Download"
                >
                  <Download className="h-4.5 w-4.5" />
                </a>
                <button
                  type="button"
                  onClick={close}
                  className="grid h-10 w-10 place-items-center rounded-full border border-ink-700 text-cream-100/80 hover:text-white"
                  aria-label="Close"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* image */}
            <div
              className="relative flex flex-1 items-center justify-center px-4 pb-6"
              onClick={(e) => e.stopPropagation()}
            >
              {images.length > 1 && (
                <button
                  type="button"
                  onClick={prev}
                  className="absolute start-2 grid h-11 w-11 place-items-center rounded-full bg-ink-850/80 text-cream-50 hover:bg-ink-800 sm:start-6"
                  aria-label="Previous"
                >
                  <ChevronLeft className="h-6 w-6" />
                </button>
              )}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <motion.img
                key={current.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                src={current.url}
                alt={current.name}
                className="max-h-full max-w-full rounded-lg object-contain shadow-elevated"
              />
              {images.length > 1 && (
                <button
                  type="button"
                  onClick={next}
                  className="absolute end-2 grid h-11 w-11 place-items-center rounded-full bg-ink-850/80 text-cream-50 hover:bg-ink-800 sm:end-6"
                  aria-label="Next"
                >
                  <ChevronRight className="h-6 w-6" />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
