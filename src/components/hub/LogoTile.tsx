"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { BRAND_ICONS } from "@/lib/brand-icons";
import type { Resource } from "@/lib/resources";

/** Relative luminance check so a glyph on a light brand colour (Mailchimp yellow) stays visible. */
function isLight(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  return 0.299 * r + 0.587 * g + 0.114 * b > 170;
}

/**
 * A tool's logo. A supplied logo (`resource.logo`) is shown as-is. Otherwise it
 * shows the site's own icon, fetched by the visitor's
 * browser from Google's favicon service. If that fails, or comes back as a
 * tiny placeholder, it falls back to a local simple-icons glyph, and failing
 * that a monogram, both on the brand colour.
 */
export function LogoTile({ resource, size = 48 }: { resource: Resource; size?: number }) {
  const [failed, setFailed] = useState(false);
  const img = useRef<HTMLImageElement>(null);

  // An error that fires before hydration is missed by onError, so check once on mount.
  useEffect(() => {
    const el = img.current;
    if (el && el.complete && el.naturalWidth < 32) setFailed(true);
  }, []);

  const box = { width: size, height: size };

  if (resource.logo) {
    return (
      <span className="block shrink-0 rounded-xl overflow-hidden ring-1 ring-black/5" style={box}>
        <Image src={resource.logo} alt="" width={160} height={160} className="h-full w-full object-cover" />
      </span>
    );
  }

  if (!failed) {
    return (
      <span className="grid place-items-center shrink-0 rounded-xl bg-white ring-1 ring-black/5 overflow-hidden" style={box}>
        {/* eslint-disable-next-line @next/next/no-img-element -- remote favicon with a local fallback */}
        <img
          ref={img}
          src={`https://www.google.com/s2/favicons?domain=${resource.domain}&sz=128`}
          alt=""
          width={size * 0.62}
          height={size * 0.62}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setFailed(true)}
          onLoad={(e) => {
            if (e.currentTarget.naturalWidth < 32) setFailed(true);
          }}
        />
      </span>
    );
  }

  const fg = isLight(resource.color) ? "#000000" : "#FFFFFF";
  const icon = resource.icon ? BRAND_ICONS[resource.icon] : null;
  const initials = resource.name
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <span
      className="grid place-items-center shrink-0 rounded-xl font-bold"
      style={{ ...box, background: resource.color, color: fg, fontSize: size * 0.34 }}
      aria-hidden="true"
    >
      {icon ? (
        <svg width={size * 0.52} height={size * 0.52} viewBox="0 0 24 24" fill="currentColor">
          <path d={icon.path} />
        </svg>
      ) : (
        initials
      )}
    </span>
  );
}
