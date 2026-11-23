"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight, Search, X } from "lucide-react";
import { CATEGORIES, RESOURCES, hostOf } from "@/lib/resources";
import { LogoTile } from "./LogoTile";

const ALL = "All";

export function ResourceBrowser() {
  const [category, setCategory] = useState(ALL);
  const [query, setQuery] = useState("");

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return RESOURCES.filter(
      (r) =>
        (category === ALL || r.category === category) &&
        (!q || [r.name, r.maker, r.category, r.description, r.domain].join(" ").toLowerCase().includes(q)),
    );
  }, [category, query]);

  const count = (c: string) => (c === ALL ? RESOURCES.length : RESOURCES.filter((r) => r.category === c).length);

  return (
    <div className="mt-8">
      <div className="flex flex-col gap-4">
        <label className="relative block max-w-md">
          <span className="sr-only">Search resources</span>
          <Search size={17} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search tools, e.g. video, email, SEO"
            className="w-full rounded-lg border border-line bg-surface pl-10 pr-3 py-2.5 text-sm outline-none focus:border-brand"
          />
        </label>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by category">
          {[ALL, ...CATEGORIES].map((c) => {
            const on = c === category;
            return (
              <button
                key={c}
                onClick={() => setCategory(c)}
                aria-pressed={on}
                className={`rounded-full border px-3.5 py-1.5 text-sm font-semibold transition-colors ${
                  on ? "border-navy bg-navy text-navyink" : "border-line bg-surface text-muted hover:text-ink"
                }`}
              >
                {c} <span className={on ? "opacity-70" : "opacity-60"}>{count(c)}</span>
              </button>
            );
          })}
        </div>
      </div>

      <p className="mt-5 text-sm text-muted" aria-live="polite">
        {shown.length === RESOURCES.length ? `${shown.length} tools` : `${shown.length} of ${RESOURCES.length} tools`}
      </p>

      {shown.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-line bg-surface p-8 text-center text-sm text-muted">
          No tools match that search.{" "}
          <button
            className="inline-flex items-center gap-1 font-semibold text-brand"
            onClick={() => {
              setQuery("");
              setCategory(ALL);
            }}
          >
            <X size={14} /> Clear filters
          </button>
        </div>
      ) : (
        <ul className="mt-4 grid gap-5 md:grid-cols-2">
          {shown.map((r) => (
            <li key={r.url}>
              <a
                href={r.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex h-full flex-col overflow-hidden rounded-xl border border-line bg-surface transition hover:border-brand"
              >
                <div className="flex-1 p-5 sm:p-6">
                  <div className="flex items-center gap-4">
                    <LogoTile resource={r} />
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-lg leading-tight">{r.name}</h3>
                      <p className="mt-1 font-mono text-[13px] text-muted truncate">{hostOf(r.url)}</p>
                    </div>
                    <ArrowUpRight size={18} className="shrink-0 self-start text-muted group-hover:text-brand" aria-hidden="true" />
                  </div>
                  <p className="mt-4 text-[15px] leading-relaxed text-muted line-clamp-3">{r.description}</p>
                </div>
                <div className="flex items-center justify-between gap-3 border-t border-line bg-surface2 px-5 sm:px-6 py-3 text-sm">
                  <span className="font-semibold truncate">{r.maker}</span>
                  <span className="shrink-0 rounded-full bg-surface px-2.5 py-0.5 text-xs font-semibold text-muted">
                    {r.category}
                  </span>
                </div>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
