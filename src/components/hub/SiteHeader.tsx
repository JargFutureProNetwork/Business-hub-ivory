"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Home, Menu, Moon, Sun, X } from "lucide-react";
import { TOOLS } from "@/lib/tools";

type Theme = "light" | "dark";

const NAV = [
  { href: "/", label: "Dashboard", icon: Home },
  ...TOOLS.map((t) => ({ href: t.href, label: t.short, icon: t.icon })),
  { href: "/resources", label: "Resources", icon: BookOpen },
];

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");
}

/**
 * Hub-wide header: logo, navigation and the theme toggle. The theme is written
 * to `<html data-theme>` and saved as `umbp-theme`, the same key Canvas Lab
 * always used, so a saved preference carries over. Embedded tools watch this
 * attribute through `public/tools/hub-bridge.js`.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const [theme, setTheme] = useState<Theme | null>(null);
  const [open, setOpen] = useState(false);

  // The effective theme is only knowable in the browser (saved choice or OS).
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    setTheme(
      (document.documentElement.getAttribute("data-theme") as Theme | null) ??
        (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"),
    );
  }, []);

  useEffect(() => setOpen(false), [pathname]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const toggleTheme = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("umbp-theme", next);
    } catch {
      /* ignore */
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-surface border-b border-line">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
        <Link href="/" className="flex items-center gap-3 min-w-0 mr-auto" aria-label="Ivory Center Business Hub home">
          <Image
            src="/logo-umbp.png"
            alt="Ivory Center / Utah-Moldova Business Partnership"
            width={859}
            height={54}
            priority
            className="logo-light h-5 sm:h-6 w-auto"
          />
          <Image
            src="/logo-umbp-dark.png"
            alt="Ivory Center / Utah-Moldova Business Partnership"
            width={859}
            height={54}
            priority
            className="logo-dark h-5 sm:h-6 w-auto"
          />
          <span className="hidden xl:block h-6 w-px bg-line" aria-hidden="true" />
          <span className="hidden xl:block font-display font-bold text-base leading-none whitespace-nowrap">
            Business Hub
          </span>
        </Link>

        <nav aria-label="Main" className="hidden lg:flex items-center gap-1">
          {NAV.map((n) => {
            const active = isActive(pathname, n.href);
            return (
              <Link
                key={n.href}
                href={n.href}
                aria-current={active ? "page" : undefined}
                className={`relative px-3 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-colors ${
                  active ? "text-ink" : "text-muted hover:text-ink hover:bg-surface2"
                }`}
              >
                {n.label}
                {active && (
                  <span className="absolute left-3 right-3 -bottom-[9px] h-[3px] rounded-full bg-brand" aria-hidden="true" />
                )}
              </Link>
            );
          })}
        </nav>

        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-surface2"
          aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button
          onClick={() => setOpen((o) => !o)}
          className="lg:hidden p-2 rounded-lg hover:bg-surface2"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      <div className="h-1 bg-brand" aria-hidden="true" />

      {open && (
        <nav id="mobile-nav" aria-label="Main" className="lg:hidden border-b border-line bg-surface sheet-enter">
          <ul className="max-w-[1400px] mx-auto px-4 py-2">
            {NAV.map((n) => {
              const active = isActive(pathname, n.href);
              const I = n.icon;
              return (
                <li key={n.href}>
                  <Link
                    href={n.href}
                    aria-current={active ? "page" : undefined}
                    className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-semibold ${
                      active ? "bg-surface2 text-ink" : "text-muted"
                    }`}
                  >
                    <I size={18} className={active ? "text-brand" : ""} />
                    {n.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      )}
    </header>
  );
}
