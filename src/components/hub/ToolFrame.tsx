"use client";

import { useState } from "react";
import { ExternalLink, Loader2 } from "lucide-react";
import { TOOL_BY_SLUG } from "@/lib/tools";

/**
 * Shows one of the original standalone HTML tools inside the hub. The frame is
 * same-origin, so the tool keeps its own storage, downloads and clipboard, and
 * `hub-bridge.js` inside it can reach the hub's AI route and theme. It fills
 * the viewport below the hub header and scrolls on its own, which keeps the
 * tool's fixed-position dialogs where the tool expects them.
 */
export function ToolFrame({ slug }: { slug: string }) {
  const tool = TOOL_BY_SLUG[slug];
  const [loaded, setLoaded] = useState(false);
  const I = tool.icon;

  return (
    <div className="flex flex-col" style={{ height: "calc(100dvh - 3.5rem - 4px)" }}>
      <div className="bg-surface border-b border-line">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-2.5 flex items-center gap-3">
          <span className="grid place-items-center h-8 w-8 rounded-lg bg-goldsoft text-brand shrink-0">
            <I size={17} />
          </span>
          <div className="min-w-0 mr-auto">
            <h1 className="font-display font-bold text-base sm:text-lg leading-tight truncate">{tool.name}</h1>
            <p className="hidden sm:block text-xs text-muted truncate">{tool.tagline}</p>
          </div>
          <a
            href={tool.src}
            target="_blank"
            rel="noopener"
            className="inline-flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs font-semibold hover:bg-surface2 shrink-0"
          >
            <ExternalLink size={14} />
            <span className="hidden sm:inline">Open full screen</span>
            <span className="sm:hidden">Open</span>
          </a>
        </div>
      </div>
      <div className="relative flex-1 min-h-0">
        {!loaded && (
          <div className="absolute inset-0 grid place-items-center text-muted text-sm" role="status">
            <span className="inline-flex items-center gap-2">
              <Loader2 size={16} className="animate-spin" /> Loading {tool.short}…
            </span>
          </div>
        )}
        <iframe
          src={tool.src}
          title={tool.name}
          onLoad={() => setLoaded(true)}
          className={`absolute inset-0 h-full w-full border-0 transition-opacity ${loaded ? "opacity-100" : "opacity-0"}`}
          allow="clipboard-write"
        />
      </div>
    </div>
  );
}
