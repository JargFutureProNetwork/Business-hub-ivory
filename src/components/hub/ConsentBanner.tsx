"use client";

import { useEffect, useState } from "react";
import { HardDrive } from "lucide-react";
import { useLang } from "@/lib/i18n";
import { OPEN_EVENT, readConsent, setConsent } from "@/lib/consent";

/**
 * Asks once whether work may be kept in this browser. It shows until a choice
 * is made, and again when "Storage settings" in the footer is used.
 */
export function ConsentBanner() {
  const { t } = useLang();
  const [show, setShow] = useState(false);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (readConsent() === null) setShow(true);
    const open = () => setShow(true);
    const onStorage = (e: StorageEvent) => {
      // Accepted from inside a tool (the Feed Planner's notice has its own button).
      if (e.key === "ivory-consent" && readConsent() !== null) setShow(false);
    };
    window.addEventListener(OPEN_EVENT, open);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(OPEN_EVENT, open);
      window.removeEventListener("storage", onStorage);
    };
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  if (!show) return null;

  const choose = (v: "accepted" | "declined") => {
    setConsent(v);
    setShow(false);
  };

  return (
    <div
      role="dialog"
      aria-labelledby="consent-title"
      aria-describedby="consent-text"
      className="fixed inset-x-3 sm:inset-x-auto sm:right-5 z-[70] sm:max-w-md rounded-xl border border-line bg-surface p-5 shadow-2xl sheet-enter"
      style={{ bottom: "calc(12px + env(safe-area-inset-bottom, 0px))" }}
    >
      <div className="flex items-start gap-3">
        <span className="grid place-items-center h-9 w-9 shrink-0 rounded-lg bg-goldsoft text-brand">
          <HardDrive size={18} />
        </span>
        <div className="min-w-0">
          <h2 id="consent-title" className="font-bold text-base leading-snug">
            {t("c_title")}
          </h2>
          <p id="consent-text" className="mt-1.5 text-sm text-muted leading-relaxed">
            {t("c_text")}
          </p>
        </div>
      </div>
      <div className="mt-4 flex justify-end gap-2">
        <button
          onClick={() => choose("declined")}
          className="rounded-lg border border-line px-4 py-2 text-sm font-semibold hover:bg-surface2"
        >
          {t("c_decline")}
        </button>
        <button
          onClick={() => choose("accepted")}
          className="rounded-lg bg-brand text-brandink px-4 py-2 text-sm font-bold hover:opacity-90"
        >
          {t("c_accept")}
        </button>
      </div>
    </div>
  );
}
