import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, Check } from "lucide-react";
import { TOOLS } from "@/lib/tools";
import { RESOURCES } from "@/lib/resources";
import { SiteFooter } from "@/components/hub/SiteFooter";

const PATH = [
  { step: "Model", slug: "canvas", text: "Lay out who you serve, what you offer and how you earn, then check the score." },
  { step: "Price", slug: "price-builder", text: "Find the price that covers delivery, customer acquisition and the profit you need." },
  { step: "Message", slug: "uvp", text: "Turn your offer into a value proposition and ready-to-post marketing copy." },
];

export default function Dashboard() {
  const byslug = Object.fromEntries(TOOLS.map((t) => [t.slug, t]));

  return (
    <>
      <main>
        {/* Welcome */}
        <section className="bg-surface border-b border-line">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-10 sm:py-14 grid gap-8 md:grid-cols-[1fr_auto] items-center">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand">
                Ivory Center · Utah-Moldova Business Partnership
              </p>
              <h1 className="mt-3 font-display font-bold text-3xl sm:text-5xl leading-[1.08] text-balance">
                Welcome to the Business Hub
              </h1>
              <p className="mt-4 text-base sm:text-lg text-muted leading-relaxed text-pretty">
                Practical tools for entrepreneurs, in one place. Test your business model, set a price
                that pays, and write marketing copy your customers will read. Everything runs in your
                browser and your work is saved on your own device.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/canvas"
                  className="inline-flex items-center gap-2 rounded-lg bg-brand text-brandink px-4 py-2.5 text-sm font-bold hover:opacity-90"
                >
                  Start with Canvas Lab <ArrowRight size={16} />
                </Link>
                <a
                  href="#tools"
                  className="inline-flex items-center gap-2 rounded-lg border border-line px-4 py-2.5 text-sm font-bold hover:bg-surface2"
                >
                  Browse all tools
                </a>
              </div>
            </div>
            <Image
              src="/icon.png"
              alt=""
              width={512}
              height={512}
              priority
              className="hidden md:block h-44 w-44 lg:h-52 lg:w-52"
            />
          </div>
        </section>

        {/* Tools */}
        <section id="tools" className="max-w-[1200px] mx-auto px-4 sm:px-6 py-10 sm:py-12 scroll-mt-20">
          <div className="flex flex-wrap items-end justify-between gap-2">
            <h2 className="font-display font-bold text-2xl sm:text-3xl">Tools</h2>
            <p className="text-sm text-muted">{TOOLS.length} tools available</p>
          </div>
          <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {TOOLS.map((t) => {
              const I = t.icon;
              return (
                <Link
                  key={t.slug}
                  href={t.href}
                  className="group flex flex-col rounded-xl border border-line bg-surface p-5 sm:p-6 transition hover:border-brand hover:shadow-[0_8px_24px_rgba(0,0,0,0.08)]"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="grid place-items-center h-11 w-11 rounded-lg bg-goldsoft text-brand">
                      <I size={22} />
                    </span>
                    <span className="rounded-full bg-surface2 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-muted">
                      {t.category}
                    </span>
                  </div>
                  <h3 className="mt-4 font-display font-bold text-xl">{t.name}</h3>
                  <p className="mt-1 text-sm font-semibold">{t.tagline}</p>
                  <p className="mt-2 text-sm text-muted leading-relaxed">{t.description}</p>
                  <ul className="mt-4 space-y-1.5 text-sm">
                    {t.features.map((f) => (
                      <li key={f} className="flex gap-2">
                        <Check size={15} className="mt-0.5 shrink-0 text-brand" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                  <span className="mt-auto pt-5 inline-flex items-center gap-1.5 text-sm font-bold text-brand">
                    Open {t.short}
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Suggested path */}
        <section className="border-y border-line bg-surface">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-10 sm:py-12">
            <h2 className="font-display font-bold text-2xl sm:text-3xl">How the tools fit together</h2>
            <p className="mt-2 text-sm text-muted max-w-2xl">
              Each tool works on its own. Used in this order, each one feeds the next.
            </p>
            <ol className="mt-6 grid gap-4 md:grid-cols-3">
              {PATH.map((p, i) => {
                const t = byslug[p.slug];
                return (
                  <li key={p.slug} className="relative rounded-xl border border-line bg-bg p-5">
                    <div className="flex items-center gap-3">
                      <span className="grid place-items-center h-8 w-8 rounded-full bg-navy text-navyink text-sm font-bold">
                        {i + 1}
                      </span>
                      <span className="font-display font-bold text-lg">{p.step}</span>
                    </div>
                    <p className="mt-3 text-sm text-muted leading-relaxed">{p.text}</p>
                    <Link href={t.href} className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-brand hover:underline">
                      {t.name} <ArrowRight size={14} />
                    </Link>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>

        {/* Resources teaser */}
        <section className="max-w-[1200px] mx-auto px-4 sm:px-6 py-10 sm:py-12">
          <Link
            href="/resources"
            className="group flex flex-col sm:flex-row sm:items-center gap-4 rounded-xl bg-navy text-navyink p-6 sm:p-8"
          >
            <span className="grid place-items-center h-12 w-12 rounded-lg bg-brand text-brandink shrink-0">
              <BookOpen size={22} />
            </span>
            <div className="mr-auto">
              <h2 className="font-display font-bold text-xl sm:text-2xl">Resources</h2>
              <p className="mt-1 text-sm opacity-80">
                {RESOURCES.length
                  ? `${RESOURCES.length} curated links for Moldovan entrepreneurs: guides, programs and reference material.`
                  : "Curated links for Moldovan entrepreneurs: guides, programs and reference material."}
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 text-sm font-bold">
              View resources <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
