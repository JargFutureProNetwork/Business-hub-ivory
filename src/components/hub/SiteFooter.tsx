import Link from "next/link";
import { TOOLS } from "@/lib/tools";

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-surface">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 flex flex-col sm:flex-row gap-6 sm:items-start justify-between text-sm">
        <div>
          <p className="font-display font-bold text-base">Ivory Center Business Hub</p>
          <p className="mt-1 text-muted">Utah-Moldova Business Partnership</p>
        </div>
        <nav aria-label="Footer" className="flex flex-wrap gap-x-5 gap-y-2">
          <Link href="/" className="text-muted hover:text-ink">Dashboard</Link>
          {TOOLS.map((t) => (
            <Link key={t.slug} href={t.href} className="text-muted hover:text-ink">
              {t.short}
            </Link>
          ))}
          <Link href="/resources" className="text-muted hover:text-ink">Resources</Link>
        </nav>
      </div>
    </footer>
  );
}
