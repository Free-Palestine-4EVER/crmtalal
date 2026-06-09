"use client";

import { useRef, useState } from "react";
import {
  ref as storageRef,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import { Upload, Paperclip, X } from "lucide-react";
import { storage } from "@/lib/firebase/client";
import { Spinner } from "@/components/ui/Spinner";
import { useDict } from "@/i18n";
import { cn } from "@/lib/cn";

export type UploadedFile = {
  name: string;
  url: string;
  path: string;
  size: number;
  contentType: string;
};

export function FileUpload({
  pathPrefix,
  value,
  onChange,
  onUploaded,
  accept,
  compact,
}: {
  pathPrefix: string;
  value: UploadedFile[];
  onChange: (files: UploadedFile[]) => void;
  onUploaded?: (f: UploadedFile) => void;
  accept?: string;
  compact?: boolean;
}) {
  const d = useDict();
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<Record<string, number>>({});
  const [drag, setDrag] = useState(false);
  const valueRef = useRef(value);
  valueRef.current = value;

  const uploadOne = (file: File) => {
    const safe = file.name.replace(/[^\w.\-]+/g, "_");
    const path = `${pathPrefix}/${Date.now()}-${safe}`;
    const task = uploadBytesResumable(storageRef(storage, path), file, {
      contentType: file.type || "application/octet-stream",
    });
    setProgress((p) => ({ ...p, [path]: 0 }));
    task.on(
      "state_changed",
      (snap) =>
        setProgress((p) => ({
          ...p,
          [path]: Math.round((snap.bytesTransferred / snap.totalBytes) * 100),
        })),
      () =>
        setProgress((p) => {
          const n = { ...p };
          delete n[path];
          return n;
        }),
      async () => {
        const url = await getDownloadURL(task.snapshot.ref);
        const meta: UploadedFile = {
          name: file.name,
          url,
          path,
          size: file.size,
          contentType: file.type || "application/octet-stream",
        };
        onChange([...valueRef.current, meta]);
        onUploaded?.(meta);
        setProgress((p) => {
          const n = { ...p };
          delete n[path];
          return n;
        });
      },
    );
  };

  const handleFiles = (files: FileList | null) => {
    if (!files) return;
    Array.from(files).forEach(uploadOne);
  };

  const remove = (path: string) =>
    onChange(value.filter((f) => f.path !== path));

  const uploading = Object.entries(progress);

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => inputRef.current?.click()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-6 py-8 text-center transition-colors",
          drag
            ? "border-gold-500/60 bg-gold-500/5"
            : "border-ink-700 hover:border-gold-500/40 hover:bg-ink-850/40",
        )}
      >
        <Upload className="h-6 w-6 text-gold-500" />
        <p className="text-sm text-cream-100/70">{d.project.dropFiles}</p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept={accept}
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>

      {(value.length > 0 || uploading.length > 0) && (
        <ul className="space-y-2">
          {value.map((f) => (
            <li
              key={f.path}
              className="flex items-center gap-3 rounded-lg border border-ink-700 bg-ink-850/50 px-3 py-2"
            >
              <Paperclip className="h-4 w-4 shrink-0 text-gold-400" />
              <span className="min-w-0 flex-1 truncate text-sm text-cream-50">
                {f.name}
              </span>
              <span className="text-xs text-ink-500">
                {(f.size / 1024).toFixed(0)} KB
              </span>
              <button
                type="button"
                onClick={() => remove(f.path)}
                className="text-ink-500 hover:text-critical"
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
          {uploading.map(([path, pct]) => (
            <li
              key={path}
              className="flex items-center gap-3 rounded-lg border border-ink-700 bg-ink-850/50 px-3 py-2"
            >
              <Spinner className="h-4 w-4 text-gold-400" />
              <span className="flex-1 text-sm text-ink-500">
                {d.project.uploading}
              </span>
              <span className="text-xs text-gold-400">{pct}%</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
