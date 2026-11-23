"use client";

import {
  AlertTriangle,
  Check,
  ChevronDown,
  Info,
  Lightbulb,
  Loader2,
  Pencil,
  RotateCcw,
  Sparkles,
  X,
} from "lucide-react";
import { BLOCKS, BLOCK_BY_KEY, type BlockKey } from "@/lib/blocks";
import {
  PILLARS,
  TONE,
  ratingLabel,
  statusOf,
  type PillarKey,
  type Report as ReportData,
} from "@/lib/audit";
import { DIAG_STATUS, PRIORITY, type AiResult, type Finding, type Gap, type PriorityKey } from "@/lib/ai-types";
import { Bar, DiagnosticBody, Meter } from "./primitives";
import { FindingCard, FlagItem, GapCard } from "./cards";

export type AiState = "idle" | "loading" | "done" | "error";
export type PassState = "loading" | "done" | "error";

export type LastRun = {
  key: string;
  canvas: Record<string, string[]>;
  overall: number;
  prevOverall: number | null;
  prevCanvas: Record<string, string[]> | null;
};

export function Report({
  report,
  onOpenBlock,
  ai,
  aiState,
  aiAt,
  aiSteps = {},
  aiError,
  stale,
  lastRun,
  findings = [],
  gaps = [],
  isAdded,
  onAddGap,
  onDismissGap,
  onRetry,
  onStop,
}: {
  report: ReportData;
  onOpenBlock: (k: BlockKey) => void;
  ai: AiResult | null;
  aiState: AiState;
  aiAt: number | null;
  aiSteps?: Partial<Record<"diag" | "gaps", PassState>>;
  aiError: string;
  stale: boolean;
  lastRun: LastRun | null;
  findings?: Finding[];
  gaps?: Gap[];
  isAdded: (g: Gap) => boolean;
  onAddGap: (g: Gap) => void;
  onDismissGap: (g: Gap) => void;
  onRetry: () => void;
  onStop: () => void;
}) {
  const tone = TONE[statusOf(report.overall)];

  return (
    <section id="report" className="report-enter mt-10" aria-labelledby="report-title">
      <div className="rounded-2xl border border-line bg-surface overflow-hidden">
        <div className="grid md:grid-cols-[auto_1fr] gap-6 p-6 border-b border-line">
          <div className="flex items-center gap-5">
            <Meter value={report.overall} />
            <div>
              <p className={`inline-flex items-center gap-1.5 text-sm font-bold rounded-full px-3 py-1 ${tone.bg} ${tone.text}`}>
                <span className="h-2 w-2 rounded-full" style={{ background: tone.stroke }} />
                {ratingLabel(report.overall)}
              </p>
              <h2 id="report-title" className="font-display text-2xl font-bold mt-2 leading-tight">
                Feasibility scorecard
              </h2>
              <p className="text-sm text-muted mt-1">
                {report.filled} of 9 blocks filled. Incomplete canvases score lower.
              </p>
              {!!report.fitPenalty && report.fitPenalty > 0 && (
                <p className="text-sm font-semibold text-risk mt-1">
                  −{report.fitPenalty} points for critical and important issues in the AI review
                </p>
              )}
              {lastRun?.prevOverall != null && lastRun.prevOverall !== report.overall && (
                <p className={`text-sm font-bold mt-1 ${report.overall > lastRun.prevOverall ? "text-good" : "text-risk"}`}>
                  {report.overall > lastRun.prevOverall ? "▲" : "▼"}{" "}
                  {Math.abs(report.overall - lastRun.prevOverall)} points since your previous analysis
                </p>
              )}
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-3 content-center">
            {(Object.entries(PILLARS) as [PillarKey, (typeof PILLARS)[PillarKey]][]).map(([k, p]) => {
              const s = report.scores[k];
              const t = TONE[statusOf(s)];
              const PI = p.icon;
              const n = report.flags.filter((f) => f.pillar === k).length;
              return (
                <div key={k} className="rounded-xl bg-bg border border-line p-3">
                  <div className="flex items-center justify-between">
                    <PI size={16} style={{ color: t.stroke }} />
                    <span className={`text-xs font-bold ${t.text}`}>{t.label}</span>
                  </div>
                  <p className="text-sm font-bold mt-2 leading-tight">{p.label}</p>
                  <p className="font-display text-2xl font-bold mt-1">{s}%</p>
                  <Bar value={s} />
                  <p className="text-xs text-muted mt-1.5">
                    {n ? `${n} ${n === 1 ? "finding" : "findings"}` : "No findings"}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="border-b border-line p-6 bg-bg" aria-live="polite">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="max-w-3xl">
              <h3 className="font-display text-xl font-bold flex items-center gap-2">
                <Sparkles size={19} style={{ color: "var(--gold)" }} /> Business model diagnostic
              </h3>
              <p className="text-sm text-muted mt-0.5">
                {aiState === "loading"
                  ? lastRun?.prevCanvas
                    ? "Gemini is reviewing your latest edits in two passes…"
                    : "Gemini is reviewing your canvas in two passes…"
                  : aiAt
                    ? `Based on your canvas as of ${new Date(aiAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}. Runs again each time you click Analyze.`
                    : "Challenges your canvas as one connected business model each time you click Analyze."}
              </p>
            </div>
            {aiState === "loading" && (
              <button
                onClick={onStop}
                className="rounded-lg border border-line bg-surface px-4 py-2 text-sm font-bold inline-flex items-center gap-2"
              >
                <Loader2 size={15} className="animate-spin" /> Analyzing… Stop
              </button>
            )}
            {aiState === "error" && (
              <button
                onClick={onRetry}
                className="rounded-lg bg-brand text-brandink px-4 py-2 text-sm font-bold inline-flex items-center gap-2"
              >
                <RotateCcw size={15} /> Try again
              </button>
            )}
          </div>

          {aiState === "loading" && (
            <ul className="mt-3 flex flex-wrap gap-2 text-xs font-semibold">
              {([["diag", "Diagnosing each block"], ["gaps", "Scanning for missing inputs"]] as const).map(
                ([k, label]) => (
                  <li
                    key={k}
                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 ${aiSteps[k] === "done" ? "bg-goodsoft text-good" : aiSteps[k] === "error" ? "bg-risksoft text-risk" : "bg-surface2 text-muted"}`}
                  >
                    {aiSteps[k] === "done" ? (
                      <Check size={12} />
                    ) : aiSteps[k] === "error" ? (
                      <X size={12} />
                    ) : (
                      <Loader2 size={12} className="animate-spin" />
                    )}{" "}
                    {label}
                  </li>
                ),
              )}
            </ul>
          )}

          {aiState === "error" && (
            <p className="mt-3 text-sm text-risk">
              {aiError || "The analysis didn’t finish. The scores and built-in checks are still up to date."}
            </p>
          )}

          {ai?.partial && aiState === "done" && !stale && (
            <p className="mt-3 text-sm text-warn">
              {ai.partial === "diag"
                ? "The block diagnostic didn’t finish this time; it shows your previous results."
                : "The missing-input scan didn’t finish this time; it shows your previous results."}{" "}
              Click Analyze to retry.
            </p>
          )}

          {stale && aiState !== "loading" && (
            <p className="mt-3 text-sm rounded-lg bg-warnsoft text-warn px-3 py-2 font-semibold inline-flex items-center gap-2">
              <Info size={15} /> You’ve edited the canvas since this analysis. Click Analyze business feasibility to
              update it.
            </p>
          )}

          {ai && (
            <div className={`mt-4 space-y-4 transition-opacity ${aiState === "loading" || stale ? "opacity-50" : ""}`}>
              {ai.understanding && (
                <div className="rounded-xl border border-line bg-surface px-4 py-3">
                  <p className="text-xs font-bold text-muted">How the AI reads your business</p>
                  <p className="text-[15px] leading-relaxed mt-0.5">{ai.understanding}</p>
                </div>
              )}
              {ai.changeNote && (
                <div className="rounded-xl border-l-4 border-brand bg-surface px-4 py-3">
                  <p className="text-xs font-bold text-muted">What your edits changed</p>
                  <p className="text-[15px] leading-relaxed mt-0.5">{ai.changeNote}</p>
                </div>
              )}
              {ai.summary && <p className="text-[15px] leading-relaxed max-w-3xl">{ai.summary}</p>}

              {findings.length > 0 ? (
                <>
                  <div className="flex flex-wrap gap-2">
                    {(Object.entries(PRIORITY) as [PriorityKey, (typeof PRIORITY)[PriorityKey]][]).map(([k, pr]) => {
                      const n = findings.filter((f) => f.priority === k).length;
                      return n ? (
                        <span key={k} className={`text-xs font-bold rounded-full px-3 py-1 ${pr.bg} ${pr.text}`}>
                          {n} {pr.label.toLowerCase()}
                        </span>
                      ) : null;
                    })}
                  </div>
                  <ul className="grid lg:grid-cols-2 gap-3">
                    {findings.map((f, i) => (
                      <FindingCard key={i} f={f} onOpenBlock={onOpenBlock} />
                    ))}
                  </ul>
                </>
              ) : (
                <p className="text-sm rounded-lg bg-goodsoft text-good px-3 py-2 font-semibold inline-flex items-center gap-2">
                  <Check size={15} /> No significant issues found. The blocks connect into a coherent business model.
                </p>
              )}

              {ai.blocks && Object.keys(ai.blocks).length > 0 && (
                <div className="pt-2">
                  <h4 className="font-display text-lg font-bold">Block-by-block diagnostic</h4>
                  <p className="text-sm text-muted mb-3">
                    A block with content can still need investigation. Open a block to see what it tells us, what’s
                    missing, and what to answer next.
                  </p>
                  <div className="rounded-xl border border-line bg-surface divide-y divide-[var(--line)] overflow-hidden">
                    {BLOCKS.filter((b) => ai.blocks[b.key]).map((b) => {
                      const d = ai.blocks[b.key]!;
                      const st = DIAG_STATUS[d.status] || DIAG_STATUS.investigate;
                      const t = TONE[st.tone];
                      return (
                        <details key={b.key} className="group">
                          <summary className="cursor-pointer list-none px-4 py-3 flex items-start gap-3 hover:bg-surface2">
                            <span
                              className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full"
                              style={{ background: t.stroke }}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <span className="font-bold">{b.title}</span>
                                <span className={`text-[11px] font-bold rounded-full px-2 py-0.5 ${t.bg} ${t.text}`}>
                                  {st.label}
                                </span>
                              </div>
                              {d.missing && (
                                <p className="text-sm text-muted mt-0.5 leading-snug">Missing: {d.missing}</p>
                              )}
                            </div>
                            <ChevronDown size={16} className="mt-1 shrink-0 transition-transform group-open:rotate-180" />
                          </summary>
                          <div className="px-4 pb-4 pt-1">
                            <DiagnosticBody d={d} />
                            <button
                              onClick={() => onOpenBlock(b.key)}
                              className="mt-3 inline-flex items-center gap-1 text-xs font-bold hover:underline"
                            >
                              <Pencil size={12} /> Edit {b.title}
                            </button>
                          </div>
                        </details>
                      );
                    })}
                  </div>
                </div>
              )}

              {(gaps.length > 0 || ai.costQuestion) && (
                <div className="pt-2">
                  <h4 className="font-display text-lg font-bold">Possible missing inputs</h4>
                  <p className="text-sm text-muted mb-3">
                    Things your other blocks imply but the canvas doesn’t say yet. None are assumed to be true: confirm
                    each one, then add the draft and replace the [brackets] with your real details, or mark it not
                    relevant.
                  </p>
                  {ai.costQuestion && (
                    <p className="mb-3 rounded-xl border-l-4 border-brand bg-surface px-4 py-3 font-display text-lg font-bold leading-snug">
                      {ai.costQuestion}
                    </p>
                  )}
                  <div className="grid lg:grid-cols-2 gap-4">
                    {BLOCKS.map((b) => {
                      const gs = gaps.filter((g) => g.target === b.key);
                      if (!gs.length) return null;
                      return (
                        <div key={b.key} className="rounded-xl border border-line bg-bg p-3">
                          <div className="flex items-center justify-between gap-2 mb-2 px-1">
                            <p className="font-bold">{b.title}</p>
                            <button
                              onClick={() => onOpenBlock(b.key)}
                              className="text-xs font-bold inline-flex items-center gap-1 hover:underline"
                            >
                              <Pencil size={12} /> Edit
                            </button>
                          </div>
                          <ul className="space-y-2">
                            {gs.map((g) => (
                              <GapCard
                                key={g.id}
                                g={g}
                                added={isAdded(g)}
                                onAdd={onAddGap}
                                onDismiss={onDismissGap}
                                onOpenBlock={onOpenBlock}
                              />
                            ))}
                          </ul>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="grid lg:grid-cols-2 gap-6 p-6">
          <div>
            <h3 className="font-display text-lg font-bold flex items-center gap-2 mb-1">
              <AlertTriangle size={18} style={{ color: "var(--risk)" }} /> Red flags and vulnerabilities
            </h3>
            <p className="text-xs text-muted mb-3">From the built-in checks. These update as you type.</p>
            {report.flags.length ? (
              <ul className="space-y-3">
                {report.flags.map((f, i) => (
                  <FlagItem key={i} f={f} />
                ))}
              </ul>
            ) : (
              <p className="text-sm rounded-xl bg-goodsoft text-good p-4">
                No red flags. Pressure-test the assumptions with five real customers next.
              </p>
            )}
          </div>
          <div>
            <h3 className="font-display text-lg font-bold flex items-center gap-2 mb-1">
              <Lightbulb size={18} style={{ color: "var(--gold)" }} /> What to change
            </h3>
            <p className="text-xs text-muted mb-3">From the built-in checks. These update as you type.</p>
            {report.recs.length ? (
              <ol className="space-y-3">
                {report.recs.map((r, i) => (
                  <li key={i} className="rounded-xl border border-line bg-bg p-4 flex gap-3">
                    <span className="grid place-items-center h-7 w-7 shrink-0 rounded-full bg-navy text-navyink text-sm font-bold">
                      {i + 1}
                    </span>
                    <div className="min-w-0">
                      <p className="font-bold leading-snug">{r.title}</p>
                      <p className="text-sm text-muted mt-1 leading-relaxed">{r.detail}</p>
                      <button
                        onClick={() => onOpenBlock(r.block)}
                        className="mt-2 inline-flex items-center gap-1 text-xs font-bold hover:underline"
                      >
                        <Pencil size={12} /> Edit {BLOCK_BY_KEY[r.block].title}
                      </button>
                    </div>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-muted">No changes suggested.</p>
            )}
            {report.strengths.length > 0 && (
              <div className="mt-5">
                <h4 className="text-sm font-bold mb-2 flex items-center gap-1.5">
                  <Check size={15} style={{ color: "var(--good)" }} /> Working well
                </h4>
                <ul className="flex flex-wrap gap-2">
                  {report.strengths.map((s, i) => (
                    <li key={i} className="text-xs font-semibold rounded-full bg-goodsoft text-good px-3 py-1">
                      {s.title}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
