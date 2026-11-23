import Image from "next/image";
import type { ReactNode } from "react";
import { Globe, Mail } from "lucide-react";
import { BRAND_ICONS } from "@/lib/brand-icons";
import { ORG, SOCIAL, type SiteLink } from "@/lib/site";

const stroke = {
  width: 16,
  height: 16,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

/** Outline brand glyphs in Lucide's style (Lucide 1.x no longer ships brand icons). */
const OUTLINE: Record<"instagram" | "facebook" | "linkedin", ReactNode> = {
  instagram: (
    <svg {...stroke}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <path d="M17.5 6.5h.01" />
    </svg>
  ),
  facebook: (
    <svg {...stroke}>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  ),
  linkedin: (
    <svg {...stroke}>
      <rect x="3" y="3" width="18" height="18" rx="3" />
      <path d="M8 11v5M8 8v.01M12 16v-5M12 13.5a2.5 2.5 0 0 1 5 0V16" />
    </svg>
  ),
};

function Glyph({ name }: { name: "x" | "whatsapp" }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d={BRAND_ICONS[name].path} />
    </svg>
  );
}

function FooterLink({ link, icon, external = true }: { link: SiteLink; icon?: ReactNode; external?: boolean }) {
  const body = (
    <>
      {icon && <span className="shrink-0 opacity-80">{icon}</span>}
      <span>{link.label}</span>
    </>
  );
  const cls = "inline-flex items-center gap-3 text-muted";
  if (!link.href) return <span className={cls}>{body}</span>;
  return (
    <a
      href={link.href}
      className={`${cls} hover:text-ink`}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
    >
      {body}
    </a>
  );
}

function Heading({ children }: { children: ReactNode }) {
  return <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-ink">{children}</h2>;
}

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-surface text-[15px]">
      <div className="max-w-[1440px] mx-auto grid sm:grid-cols-2 lg:grid-cols-3">
        <div className="px-6 sm:px-8 py-10 border-b lg:border-b-0 sm:border-r border-line">
          <Image src="/umbp-mark.png" alt="" width={296} height={227} className="h-9 w-auto" />
          <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] leading-relaxed text-ink">
            {ORG.name}
          </p>
          <address className="mt-4 not-italic text-muted leading-relaxed">
            {ORG.addressLines.map((l) => (
              <span key={l} className="block">
                {l}
              </span>
            ))}
          </address>
          <div className="mt-4">
            <FooterLink link={ORG.website} icon={<Globe size={16} />} />
          </div>
        </div>

        <nav aria-label="Follow" className="px-6 sm:px-8 py-10 border-b lg:border-b-0 lg:border-r border-line">
          <Heading>Follow</Heading>
          <ul className="mt-5 space-y-3">
            {SOCIAL.map((s) => (
              <li key={s.network}>
                <FooterLink link={s} icon={s.network === "x" ? <Glyph name="x" /> : OUTLINE[s.network]} />
              </li>
            ))}
          </ul>
        </nav>

        <div className="px-6 sm:px-8 py-10">
          <Heading>Contact</Heading>
          <ul className="mt-5 space-y-3">
            <li>
              <FooterLink
                link={{ label: ORG.email, href: `mailto:${ORG.email}` }}
                icon={<Mail size={16} />}
                external={false}
              />
            </li>
            <li>
              <FooterLink
                link={{ label: ORG.phone.label, href: ORG.phone.whatsapp }}
                icon={<Glyph name="whatsapp" />}
              />
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-line">
        <div className="max-w-[1440px] mx-auto px-6 sm:px-8 py-5 flex items-center justify-between gap-4 text-sm text-muted">
          <p>
            © {new Date().getFullYear()} {ORG.short} — {ORG.founded}
          </p>
          <span className="flex shrink-0" role="img" aria-label="Flag of Moldova">
            <span className="h-4 w-2.5 bg-[#0046AE]" />
            <span className="h-4 w-2.5 bg-[#FFD200]" />
            <span className="h-4 w-2.5 bg-[#CC092F]" />
          </span>
        </div>
      </div>
    </footer>
  );
}
