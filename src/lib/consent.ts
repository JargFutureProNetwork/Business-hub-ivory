"use client";

import { useEffect, useState } from "react";

/**
 * Storage consent for the work people do in the tools. Until "Accept" is
 * chosen, Canvas Lab, the UVP workbench and the Feed Planner keep work only in
 * memory. The choice itself, the theme and the language are preferences and
 * are always remembered.
 */
export const CONSENT_KEY = "ivory-consent";
export type Consent = "accepted" | "declined" | null;

/** Work the tools save in this browser, removed when storage is declined. */
const WORK_KEYS = ["umbp-bmc-v1", "uvp_form_draft", "fps:projects", "fps:last"];
const WORK_DBS = ["feed-planner"];

export const OPEN_EVENT = "ivory-consent-open";
const CHANGE_EVENT = "ivory-consent-change";

export function readConsent(): Consent {
  try {
    const v = localStorage.getItem(CONSENT_KEY);
    return v === "accepted" || v === "declined" ? v : null;
  } catch {
    return null;
  }
}

export function setConsent(v: "accepted" | "declined") {
  try {
    localStorage.setItem(CONSENT_KEY, v);
    if (v === "declined") {
      for (const k of WORK_KEYS) localStorage.removeItem(k);
      for (const db of WORK_DBS) indexedDB.deleteDatabase(db);
    }
  } catch {
    /* storage blocked: nothing was saved anyway */
  }
  // Same-document listeners; iframes hear the localStorage "storage" event.
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export const hasConsent = () => readConsent() === "accepted";

/** Current consent, kept up to date across the page, its tool frames and other tabs. */
export function useConsent(): Consent {
  const [c, setC] = useState<Consent>(null);
  useEffect(() => {
    const sync = () => setC(readConsent());
    sync();
    const onStorage = (e: StorageEvent) => {
      if (e.key === CONSENT_KEY) sync();
    };
    window.addEventListener(CHANGE_EVENT, sync);
    window.addEventListener("storage", onStorage);
    return () => {
      window.removeEventListener(CHANGE_EVENT, sync);
      window.removeEventListener("storage", onStorage);
    };
  }, []);
  return c;
}
