import type { Metadata } from "next";
import { ArrowUpRight, BookOpen } from "lucide-react";
import { RESOURCES, groupResources, hostOf } from "@/lib/resources";
import { SiteFooter } from "@/components/hub/SiteFooter";

export const metadata: Metadata = {
  title: "Resources",
  description: "Curated links and reference material for entrepreneurs.",
};

export default function ResourcesPage() {
  const groups = groupResources(RESOURCES);

  return (
    <>
      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 py-10 sm:py-12 min-h-[60vh]">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand">Business Hub</p>
        <h1 className="mt-2 font-display font-bold text-3xl sm:text-4xl">Resources</h1>
        <p className="mt-3 text-muted max-w-2xl">
          Guides, programs and reference material for entrepreneurs. Links open in a new tab.
        </p>

        {groups.length === 0 ? (
          <div className="mt-10 rounded-xl border border-dashed border-line bg-surface p-8 sm:p-10 text-center">
            <span className="mx-auto grid place-items-center h-12 w-12 rounded-full bg-goldsoft text-brand">
              <BookOpen size={22} />
            </span>
            <h2 className="mt-4 font-display font-bold text-xl">Resources are on the way</h2>
            <p className="mt-2 text-sm text-muted max-w-md mx-auto">
              No links have been added yet. Check back soon.
            </p>
          </div>
        ) : (
          <div className="mt-8 space-y-10">
            {groups.map(([category, items]) => (
              <section key={category}>
                <h2 className="font-display font-bold text-xl border-b border-line pb-2">{category}</h2>
                <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((r) => (
                    <li key={r.url}>
                      <a
                        href={r.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group flex h-full flex-col rounded-xl border border-line bg-surface p-5 transition hover:border-brand"
                      >
                        <span className="flex items-start justify-between gap-3">
                          <span className="font-bold leading-snug">{r.title}</span>
                          <ArrowUpRight size={18} className="shrink-0 text-muted group-hover:text-brand" />
                        </span>
                        {r.description && <span className="mt-2 text-sm text-muted leading-relaxed">{r.description}</span>}
                        <span className="mt-auto pt-3 text-xs font-semibold text-brand truncate">{hostOf(r.url)}</span>
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
