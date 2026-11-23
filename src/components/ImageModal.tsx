"use client";

import { useEffect } from "react";
import { Copy, Download, X } from "lucide-react";

/**
 * Unlike the Claude artifact, a real page can download a file, so the primary
 * action is a download; the image stays on screen for right-click or long-press
 * saving on the browsers where the download attribute is ignored.
 */
export function ImageModal({
  url,
  filename,
  onCopy,
  onClose,
}: {
  url: string;
  filename: string;
  onCopy: () => void;
  onClose: () => void;
}) {
  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="img-title"
    >
      <div className="absolute inset-0 bg-black/55" onClick={onClose} />
      <div className="sheet-enter relative w-full max-w-5xl max-h-[94vh] overflow-y-auto rounded-2xl bg-surface border border-line shadow-2xl">
        <div className="flex items-start gap-3 px-5 py-4 border-b border-line">
          <div className="flex-1">
            <h2 id="img-title" className="font-display text-xl font-bold">
              Your canvas image is ready
            </h2>
            <p className="text-sm text-muted mt-1 leading-snug">
              Use Download image below. If your browser blocks it,{" "}
              <strong className="text-ink">on a computer</strong> right-click the image and choose “Save image
              as”, or <strong className="text-ink">on a phone</strong> press and hold it and tap “Save to Photos”.
            </p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-surface2" aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="p-4 bg-bg">
          {/* A data URL of a canvas we just drew; next/image would only add a round trip. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={url} alt="Business Model Canvas image" className="w-full h-auto rounded-md border border-line shadow-sm" />
        </div>
        <div className="flex flex-wrap justify-end gap-2 px-5 py-3 border-t border-line">
          <button
            onClick={onCopy}
            className="rounded-lg border border-line bg-surface px-4 py-2 text-sm font-semibold inline-flex items-center gap-2"
          >
            <Copy size={15} /> Copy image
          </button>
          <a
            href={url}
            download={filename}
            className="rounded-lg bg-navy text-navyink px-4 py-2 text-sm font-bold inline-flex items-center gap-2"
          >
            <Download size={15} /> Download image
          </a>
        </div>
      </div>
    </div>
  );
}
