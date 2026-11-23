"use client";

import { useEffect, useRef, useState } from "react";
import { Gauge, Lightbulb, Plus, Sparkles, Trash2, Wand2, X } from "lucide-react";
import type { Block } from "@/lib/blocks";
import { TONE, type Flag } from "@/lib/audit";
import { DIAG_STATUS, type BlockDiagnostic, type Gap } from "@/lib/ai-types";
import { DiagnosticBody } from "./primitives";
import { GapCard } from "./cards";

function AutoTextarea({
  value,
  onChange,
  onKeyDown,
  placeholder,
  inputRef,
  ariaLabel,
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  placeholder: string;
  inputRef: (el: HTMLTextAreaElement | null) => void;
  ariaLabel: string;
}) {
  const local = useRef<HTMLTextAreaElement | null>(null);
  const setRef = (el: HTMLTextAreaElement | null) => {
    local.current = el;
    inputRef(el);
  };
  useEffect(() => {
    const el = local.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = el.scrollHeight + "px";
    }
  }, [value]);
  return (
    <textarea
      ref={setRef}
      rows={1}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      aria-label={ariaLabel}
      className="auto w-full bg-transparent text-[15px] leading-snug outline-none placeholder:text-muted py-1"
    />
  );
}

export function EditorModal({
  block,
  items,
  flags,
  diag,
  stale,
  gaps = [],
  addedIds = [],
  onDismissGap,
  onMarkAdded,
  onChange,
  onClose,
}: {
  block: Block;
  items: string[];
  flags: Flag[];
  diag?: BlockDiagnostic;
  stale: boolean;
  gaps?: Gap[];
  addedIds?: string[];
  onDismissGap: (g: Gap) => void;
  onMarkAdded: (g: Gap) => void;
  onChange: (list: string[]) => void;
  onClose: () => void;
}) {
  const Icon = block.icon;
  const [list, setList] = useState<string[]>(items.length ? items : [""]);
  const refs = useRef<(HTMLTextAreaElement | null)[]>([]);
  const [focusIdx, setFocusIdx] = useState(0);

  useEffect(() => {
    onChange(list.filter((s) => s.trim()));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list]);

  useEffect(() => {
    refs.current[focusIdx]?.focus();
  }, [focusIdx, list.length]);

  useEffect(() => {
    const k = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);

  const update = (i: number, v: string) => setList((l) => l.map((x, j) => (j === i ? v : x)));

  const remove = (i: number) => {
    setList((l) => {
      const n = l.filter((_, j) => j !== i);
      return n.length ? n : [""];
    });
    setFocusIdx(Math.max(0, i - 1));
  };

  const addAfter = (i: number, text = "") => {
    setList((l) => {
      const n = [...l];
      n.splice(i + 1, 0, text);
      return n;
    });
    setFocusIdx(i + 1);
  };

  /** Fills the first empty line, so a prompt never leaves a blank row behind. */
  const addPrompt = (p: string) => {
    setList((l) => {
      const emptyIdx = l.findIndex((s) => !s.trim());
      if (emptyIdx >= 0) {
        const n = [...l];
        n[emptyIdx] = p;
        setFocusIdx(emptyIdx);
        return n;
      }
      setFocusIdx(l.length);
      return [...l, p];
    });
  };

  const onKey = (i: number, e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      addAfter(i);
    }
    if (e.key === "Backspace" && !list[i] && list.length > 1) {
      e.preventDefault();
      remove(i);
    }
  };

  const anyContent = list.some((s) => s.trim());

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="editor-title"
    >
      <div className="absolute inset-0 bg-black/45" onClick={onClose} />
      <div
        className="sheet-enter relative w-full sm:max-w-2xl max-h-[92vh] overflow-y-auto rounded-t-2xl sm:rounded-2xl bg-surface border border-line shadow-2xl"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        <div className="sticky top-0 z-10 bg-surface border-b border-line px-5 py-4 flex items-start gap-3">
          <span className="grid place-items-center h-10 w-10 rounded-xl bg-navy text-navyink shrink-0">
            <Icon size={20} />
          </span>
          <div className="flex-1 min-w-0">
            <h2 id="editor-title" className="font-display text-xl font-bold leading-tight">
              {block.title}
            </h2>
            <p className="text-sm text-muted mt-0.5 leading-snug">{block.question}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-surface2" aria-label="Close editor">
            <X size={18} />
          </button>
        </div>

        <div className="px-5 py-4 space-y-5">
          <div>
            <div className="rounded-xl border border-line bg-bg px-3 py-2 space-y-1">
              {list.map((val, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="mt-[11px] h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                  <AutoTextarea
                    value={val}
                    inputRef={(el) => {
                      refs.current[i] = el;
                    }}
                    ariaLabel={`${block.title} item ${i + 1}`}
                    onChange={(e) => update(i, e.target.value)}
                    onKeyDown={(e) => onKey(i, e)}
                    placeholder={i === 0 ? `e.g. ${block.example[0]}` : "Add another point"}
                  />
                  {(val || list.length > 1) && (
                    <button
                      onClick={() => remove(i)}
                      className="mt-1 p-1 rounded text-muted hover:text-risk"
                      aria-label={`Remove item ${i + 1}`}
                    >
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between mt-2">
              <button
                onClick={() => addAfter(list.length - 1)}
                className="inline-flex items-center gap-1.5 text-sm font-semibold hover:underline"
              >
                <Plus size={15} /> Add point
              </button>
              <span className="text-xs text-muted">Enter adds a new point. Shift+Enter adds a line break.</span>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold mb-2 flex items-center gap-1.5">
              <Wand2 size={15} /> Guided prompts
            </h3>
            <div className="flex flex-wrap gap-2">
              {block.prompts.map((p) => (
                <button
                  key={p}
                  onClick={() => addPrompt(p)}
                  className="text-left text-[13px] rounded-lg border border-line bg-surface2 px-3 py-1.5 hover:border-navy"
                >
                  {p}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted mt-2">Replace the [brackets] with your own details.</p>
          </div>

          <details className="rounded-xl border border-line px-4 py-3">
            <summary className="cursor-pointer text-sm font-bold flex items-center gap-1.5">
              <Lightbulb size={15} /> See a strong example
            </summary>
            <ul className="mt-2 space-y-1 text-sm text-muted">
              {block.example.map((e) => (
                <li key={e}>• {e}</li>
              ))}
            </ul>
          </details>

          {gaps.length > 0 && (
            <div className="rounded-xl border border-line p-4">
              <h3 className="text-sm font-bold mb-1 flex items-center gap-1.5">
                <Plus size={15} /> Possibly missing here
              </h3>
              <p className="text-xs text-muted mb-3">
                Implied by your other blocks. Confirm before adding, then replace the [brackets].
              </p>
              <ul className="space-y-2">
                {gaps.map((g) => (
                  <GapCard
                    key={g.id}
                    g={g}
                    compact
                    added={addedIds.includes(g.id) || list.some((x) => x.trim() === g.draft)}
                    onAdd={(x) => {
                      addPrompt(x.draft);
                      onMarkAdded(x);
                    }}
                    onDismiss={onDismissGap}
                    onOpenBlock={() => {}}
                  />
                ))}
              </ul>
            </div>
          )}

          {diag && (
            <div className={`rounded-xl border border-line p-4 ${stale ? "opacity-60" : ""}`}>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <h3 className="text-sm font-bold flex items-center gap-1.5">
                  <Sparkles size={15} style={{ color: "var(--gold)" }} /> Diagnostic
                </h3>
                {DIAG_STATUS[diag.status] && (
                  <span
                    className={`text-[11px] font-bold rounded-full px-2 py-0.5 ${TONE[DIAG_STATUS[diag.status].tone].bg} ${TONE[DIAG_STATUS[diag.status].tone].text}`}
                  >
                    {DIAG_STATUS[diag.status].label}
                  </span>
                )}
              </div>
              {stale && (
                <p className="text-xs text-muted mb-2">
                  Based on an earlier version of the canvas. Click Analyze to refresh.
                </p>
              )}
              <DiagnosticBody d={diag} compact />
            </div>
          )}

          <div aria-live="polite">
            <h3 className="text-sm font-bold mb-2 flex items-center gap-1.5">
              <Gauge size={15} /> Live feedback
            </h3>
            {flags.length ? (
              <ul className="space-y-2">
                {flags.map((f, i) => {
                  const t =
                    f.severity === "risk"
                      ? TONE.risk
                      : f.severity === "suggestion"
                        ? { border: "border-line", bg: "bg-surface2", text: "text-ink" }
                        : TONE.warn;
                  return (
                    <li key={i} className={`rounded-lg border-l-4 ${t.border} ${t.bg} px-3 py-2`}>
                      <p className={`text-sm font-bold ${t.text}`}>{f.title}</p>
                      <p className="text-sm mt-0.5">{f.detail}</p>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p
                className={`text-sm rounded-lg px-3 py-2 ${anyContent ? "bg-goodsoft text-good" : "bg-surface2 text-muted"}`}
              >
                {anyContent
                  ? "The built-in checks found nothing here. Filled isn’t the same as complete: run Analyze for a full diagnostic."
                  : "Feedback appears here as you type."}
              </p>
            )}
          </div>
        </div>

        <div className="sticky bottom-0 bg-surface border-t border-line px-5 py-3 flex justify-end">
          <button onClick={onClose} className="rounded-lg bg-navy text-navyink px-4 py-2 text-sm font-bold">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
