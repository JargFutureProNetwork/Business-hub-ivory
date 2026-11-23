"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, Check, Globe, Home, Menu, Moon, Sun, X } from "lucide-react";
import { TOOLS, toolText } from "@/lib/tools";
import { LANGS, useLang } from "@/lib/i18n";

type Theme = "light" | "dark";

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");
}

/** Small globe button with an EN / RO / RU menu. */
function LanguageMenu() {
  const { lang, setLang, t } = useLang();
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent | KeyboardEvent) => {
      if (e instanceof KeyboardEvent ? e.key === "Escape" : !box.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", close);
    document.addEventListener("keydown", close);
    return () => {
      document.removeEventListener("mousedown", close);
      document.removeEventListener("keydown", close);
    };
  }, [open]);

  const current = LANGS.find((l) => l.code === lang) ?? LANGS[0];
  return (
    <div className="relative" ref={box}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-1 p-2 rounded-lg hover:bg-surface2 text-xs font-bold"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`${t("language")}: ${current.label}`}
      >
        <Globe size={18} />
        <span>{current.short}</span>
      </button>
      {open && (
        <ul
          role="menu"
          aria-label={t("language")}
          className="absolute right-0 mt-1 w-40 rounded-lg border border-line bg-surface p-1 shadow-lg z-50"
        >
          {LANGS.map((l) => (
            <li key={l.code} role="none">
              <button
                role="menuitemradio"
                aria-checked={l.code === lang}
                lang={l.code}
                onClick={() => {
                  setLang(l.code);
                  setOpen(false);
                }}
                className="flex w-full items-center justify-between gap-2 rounded-md px-3 py-2 text-sm font-semibold hover:bg-surface2"
              >
                {l.label}
                {l.code === lang && <Check size={15} className="text-brand" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * Hub-wide header: logo, navigation, language menu and the theme toggle. The
 * theme is written to `<html data-theme>` and saved as `umbp-theme`, the key
 * Canvas Lab always used. Embedded tools watch `data-theme` and `lang` through
 * `public/tools/hub-bridge.js`.
 */
export function SiteHeader() {
  const pathname = usePathname();
  const { lang, t } = useLang();
  const [theme, setTheme] = useState<Theme | null>(null);
  const [open, setOpen] = useState(false);

  const nav = [
    { href: "/", label: t("nav_dashboard"), icon: Home },
    ...TOOLS.map((tool) => ({ href: tool.href, label: toolText(tool, lang).short, icon: tool.icon })),
    { href: "/resources", label: t("nav_resources"), icon: BookOpen },
  ];

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
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 h-14 flex items-center gap-2 sm:gap-3">
        <Link href="/" className="flex items-center gap-3 min-w-0 mr-auto" aria-label={t("home_aria")}>
          <Image
            src="/logo-umbp.png"
            alt="Ivory Center / Utah-Moldova Business Partnership"
            width={859}
            height={54}
            priority
            className="logo-light h-4 sm:h-6 w-auto"
          />
          <Image
            src="/logo-umbp-dark.png"
            alt="Ivory Center / Utah-Moldova Business Partnership"
            width={859}
            height={54}
            priority
            className="logo-dark h-4 sm:h-6 w-auto"
          />
          <span className="hidden 2xl:block h-6 w-px bg-line" aria-hidden="true" />
          <span className="hidden 2xl:block font-display font-bold text-base leading-none whitespace-nowrap">
            {t("business_hub")}
          </span>
        </Link>

        <nav aria-label="Main" className="hidden xl:flex items-center gap-1">
          {nav.map((n) => {
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

        <LanguageMenu />
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg hover:bg-surface2"
          aria-label={theme === "dark" ? t("theme_to_light") : t("theme_to_dark")}
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button
          onClick={() => setOpen((o) => !o)}
          className="xl:hidden p-2 rounded-lg hover:bg-surface2"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? t("menu_close") : t("menu_open")}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>
      <div className="h-1 bg-brand" aria-hidden="true" />

      {open && (
        <nav id="mobile-nav" aria-label="Main" className="xl:hidden border-b border-line bg-surface sheet-enter">
          <ul className="max-w-[1400px] mx-auto px-4 py-2">
            {nav.map((n) => {
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
