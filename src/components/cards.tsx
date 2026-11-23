"use client";

import { AlertTriangle, Check, Pencil, Plus } from "lucide-react";
import { BLOCK_BY_KEY, type Block, type BlockKey } from "@/lib/blocks";
import { TONE, type Flag } from "@/lib/audit";
import {
  CLARIFY_LABEL,
  DIAG_STATUS,
  PRIORITY,
  TYPE_LABEL,
  type BlockDiagnostic,
  type Finding,
  type Gap,
  type PriorityKey,
} from "@/lib/ai-types";

const NEUTRAL = { border: "border-line", bg: "bg-surface2", text: "text-ink" };

export type Highlight = { item: string; priority: PriorityKey };

export function BlockCard({
  block,
  items,
  flags,
  highlights = [],
  diag,
  stale,
  gapCount = 0,
  onOpen,
}: {
  block: Block;
  items: string[];
  flags: Flag[];
  highlights?: Highlight[];
  diag?: BlockDiagnostic;
  stale: boolean;
  gapCount?: number;
  onOpen: () => void;
}) {
  const Icon = block.icon;
  const issues = flags.filter((f) => f.severity !== "suggestion");
  const ds = diag && DIAG_STATUS[diag.status];
  // A filled block is not a complete block: only the diagnostic can call it solid
  const worst = ds
    ? ds.tone
    : issues.some((f) => f.severity === "risk")
      ? "risk"
      : issues.length
        ? "warn"
        : items.length
          ? "muted"
          : null;

  const hl = (it: string) =>
    highlights
      .filter((h) => h.item === it)
      .sort((a, b) => PRIORITY[a.priority].rank - PRIORITY[b.priority].rank)[0];

  return (
    <div className={block.area}>
      <button onClick={onOpen} className="block-card group h-full w-full text-left p-4 sm:p-5 flex flex-col gap-3">
        <div className="flex items-start justify-between gap-3">
          <h3 className="font-display text-[1.15rem] font-bold leading-tight">{block.title}</h3>
          <Icon size={22} strokeWidth={2.2} className="shrink-0" style={{ color: "var(--ink)" }} aria-hidden="true" />
        </div>

        {items.length ? (
          <ul className="space-y-1.5 text-sm leading-snug">
            {items.slice(0, 6).map((it, i) => {
              const h = hl(it);
              return h ? (
                <li
                  key={i}
                  className={`flex gap-2 rounded-md -mx-1.5 px-1.5 py-0.5 ${PRIORITY[h.priority].bg}`}
                  title={`${PRIORITY[h.priority].label}: see the AI review`}
                >
                  <AlertTriangle size={13} className="mt-[3px] shrink-0" style={{ color: PRIORITY[h.priority].color }} />
                  <span
                    className="underline decoration-wavy underline-offset-4"
                    style={{ textDecorationColor: PRIORITY[h.priority].color }}
                  >
                    {it}
                  </span>
                </li>
              ) : (
                <li key={i} className="flex gap-2">
                  <span className="mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full bg-gold" />
                  <span>{it}</span>
                </li>
              );
            })}
            {items.length > 6 && <li className="text-muted text-xs pl-3.5">+{items.length - 6} more</li>}
          </ul>
        ) : (
          <p className="text-[13px] text-muted leading-snug">{block.question}</p>
        )}

        {gapCount > 0 && (
          <p className="text-xs font-semibold rounded-md border border-dashed border-line px-2 py-1 text-muted group-hover:text-ink">
            + {gapCount} possible missing {gapCount === 1 ? "input" : "inputs"}
          </p>
        )}

        <div className="mt-auto flex items-center justify-between gap-2 pt-1">
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-muted group-hover:text-ink">
            {items.length ? (
              <>
                <Pencil size={13} /> Edit
              </>
            ) : (
              <>
                <Plus size={13} /> Add items
              </>
            )}
          </span>
          {worst === "muted" && (
            <span className="shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold bg-surface2 text-muted">
              Not yet diagnosed
            </span>
          )}
          {worst && worst !== "muted" && (
            <span
              className={`shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ${TONE[worst].bg} ${TONE[worst].text} ${stale && ds ? "opacity-60" : ""}`}
              title={stale && ds ? "Canvas changed since this diagnosis" : undefined}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: TONE[worst].stroke }} />
              {ds ? ds.label : `${issues.length} to review`}
            </span>
          )}
        </div>
      </button>
    </div>
  );
}

export function FlagItem({ f }: { f: Flag }) {
  const t = f.severity === "risk" ? TONE.risk : f.severity === "suggestion" ? NEUTRAL : TONE.warn;
  const label = f.label || (f.severity === "risk" ? "Risk" : f.severity === "suggestion" ? "Suggestion" : "Caution");
  return (
    <li className={`rounded-xl border border-line bg-surface p-4 border-l-4 ${t.border}`}>
      <div className="flex flex-wrap items-center gap-2 mb-1">
        <span className={`text-[11px] font-bold rounded-full px-2 py-0.5 ${t.bg} ${t.text}`}>{label}</span>
        {f.block && BLOCK_BY_KEY[f.block] && <span className="text-xs text-muted">{BLOCK_BY_KEY[f.block].title}</span>}
      </div>
      <p className="font-bold leading-snug">{f.title}</p>
      <p className="text-sm text-muted mt-1 leading-relaxed">{f.detail}</p>
    </li>
  );
}

/** One labelled row of a finding. */
function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mt-2.5">
      <p className="text-[11px] font-bold text-muted">{label}</p>
      <div className="text-sm leading-relaxed mt-0.5">{children}</div>
    </div>
  );
}

export function FindingCard({ f, onOpenBlock }: { f: Finding; onOpenBlock: (k: BlockKey) => void }) {
  const pr = PRIORITY[f.priority];
  const blocks = f.blocks.filter((k) => BLOCK_BY_KEY[k]);

  return (
    <li
      className={`rounded-xl border border-line bg-surface p-4 border-l-4 ${pr.border}`}
      style={f.priority === "suggestion" ? { borderLeftColor: "var(--navy)" } : undefined}
    >
      <p className="font-bold leading-snug">{f.title}</p>
      <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-xs">
        <dt className="font-bold text-muted">Block</dt>
        <dd>{blocks.length ? blocks.map((k) => BLOCK_BY_KEY[k].title).join(" ↔ ") : "Whole canvas"}</dd>
        <dt className="font-bold text-muted">Type</dt>
        <dd>{TYPE_LABEL[f.type] || f.type || "Business logic"}</dd>
        <dt className="font-bold text-muted">Severity</dt>
        <dd className="flex flex-wrap items-center gap-1.5">
          <span className={`font-bold rounded-full px-2 py-0.5 ${pr.bg} ${pr.text}`}>{pr.label}</span>
          {f.clarify && (
            <span className="font-semibold rounded-full px-2 py-0.5 bg-warnsoft text-warn">{CLARIFY_LABEL}</span>
          )}
        </dd>
      </dl>
      {f.item && <p className="mt-2.5 text-sm italic rounded-md bg-bg border border-line px-2.5 py-1.5">“{f.item}”</p>}
      <Row label="Observation">{f.observation}</Row>
      {f.whyItMatters && <Row label="Why it matters">{f.whyItMatters}</Row>}
      {f.recommendation && <Row label="Recommendation">{f.recommendation}</Row>}
      {f.questions.length > 0 && (
        <Row label="Questions to answer">
          <ul className="list-disc pl-5 space-y-0.5">
            {f.questions.map((q, i) => (
              <li key={i}>{q}</li>
            ))}
          </ul>
        </Row>
      )}
      {blocks.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1">
          {blocks.map((k) => (
            <button
              key={k}
              onClick={() => onOpenBlock(k)}
              className="inline-flex items-center gap-1 text-xs font-bold hover:underline"
            >
              <Pencil size={12} /> Edit {BLOCK_BY_KEY[k].title}
            </button>
          ))}
        </div>
      )}
    </li>
  );
}

export function GapCard({
  g,
  added,
  onAdd,
  onDismiss,
  onOpenBlock,
  compact,
}: {
  g: Gap;
  added: boolean;
  onAdd: (g: Gap) => void;
  onDismiss: (g: Gap) => void;
  onOpenBlock: (k: BlockKey) => void;
  compact?: boolean;
}) {
  const pr = PRIORITY[g.severity];
  return (
    <li
      className={`rounded-lg border border-line bg-surface px-3 py-2.5 border-l-4 ${pr.border}`}
      style={g.severity === "suggestion" ? { borderLeftColor: "var(--navy)" } : undefined}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className={`text-[11px] font-bold rounded-full px-2 py-0.5 ${pr.bg} ${pr.text}`}>{pr.label}</span>
        <span className="font-bold text-sm leading-snug">{g.missing}</span>
      </div>
      {g.from && (
        <p className="text-xs text-muted mt-1">
          Implied by {BLOCK_BY_KEY[g.from].title}
          {g.source ? (
            <>
              : <span className="italic">“{g.source}”</span>
            </>
          ) : null}
        </p>
      )}
      {g.why && <p className="text-sm mt-1 leading-relaxed">{g.why}</p>}
      {g.question && (
        <p className="text-sm mt-1 leading-relaxed">
          <span className="font-bold">Ask yourself: </span>
          {g.question}
        </p>
      )}
      <div className="mt-2 flex flex-wrap items-center gap-2">
        {g.draft &&
          (added ? (
            <span className="text-xs font-bold rounded-full px-2 py-1 bg-goodsoft text-good inline-flex items-center gap-1">
              <Check size={12} /> Added to {BLOCK_BY_KEY[g.target].title}
            </span>
          ) : (
            <button
              onClick={() => onAdd(g)}
              className="text-xs font-bold rounded-lg bg-navy text-navyink px-2.5 py-1.5 inline-flex items-center gap-1 text-left"
            >
              <Plus size={12} className="shrink-0" /> Add draft: “{g.draft}”
            </button>
          ))}
        {!compact && !g.draft && (
          <button
            onClick={() => onOpenBlock(g.target)}
            className="text-xs font-bold inline-flex items-center gap-1 hover:underline"
          >
            <Pencil size={12} /> Fill in {BLOCK_BY_KEY[g.target].title}
          </button>
        )}
        {!added && (
          <button
            onClick={() => onDismiss(g)}
            className="text-xs font-semibold text-muted hover:text-ink px-1.5 py-1"
          >
            Not relevant
          </button>
        )}
      </div>
    </li>
  );
}
