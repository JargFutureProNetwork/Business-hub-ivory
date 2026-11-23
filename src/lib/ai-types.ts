import type { BlockKey, Canvas } from "./blocks";
import type { Severity, Tone } from "./audit";

export type PriorityKey = "critical" | "important" | "suggestion";

export const PRIORITY: Record<
  PriorityKey,
  {
    label: string;
    severity: Severity;
    rank: number;
    penalty: number;
    color: string;
    bg: string;
    text: string;
    border: string;
  }
> = {
  critical: {
    label: "Critical",
    severity: "risk",
    rank: 0,
    penalty: 8,
    color: "var(--risk)",
    bg: "bg-risksoft",
    text: "text-risk",
    border: "border-risk",
  },
  important: {
    label: "Important",
    severity: "caution",
    rank: 1,
    penalty: 4,
    color: "var(--warn)",
    bg: "bg-warnsoft",
    text: "text-warn",
    border: "border-warn",
  },
  suggestion: {
    label: "Suggestion",
    severity: "suggestion",
    rank: 2,
    penalty: 0,
    color: "var(--navy)",
    bg: "bg-surface2",
    text: "text-ink",
    border: "border-line",
  },
};

export type FindingType =
  | "completeness"
  | "clarity"
  | "consistency"
  | "cross-block relationship"
  | "business logic"
  | "specificity";

export const TYPE_LABEL: Record<FindingType, string> = {
  completeness: "Completeness",
  clarity: "Clarity",
  consistency: "Consistency",
  "cross-block relationship": "Cross-block relationship",
  "business logic": "Business logic",
  specificity: "Specificity",
};

export const CLARIFY_LABEL = "Potential inconsistency — clarification needed";

export type DiagStatusKey = "solid" | "investigate" | "critical";

export const DIAG_STATUS: Record<DiagStatusKey, { label: string; tone: Tone }> = {
  solid: { label: "Solid", tone: "good" },
  investigate: { label: "Needs investigation", tone: "warn" },
  critical: { label: "Critical gap", tone: "risk" },
};

export type Finding = {
  priority: PriorityKey;
  type: FindingType;
  clarify: boolean;
  blocks: BlockKey[];
  /** The exact canvas item this finding is about, resolved server-side against the canvas. */
  item: string;
  itemBlock: BlockKey | null;
  title: string;
  observation: string;
  whyItMatters: string;
  recommendation: string;
  questions: string[];
};

export type BlockDiagnostic = {
  status: DiagStatusKey;
  tells: string;
  missing: string;
  assumptions: string[];
  questions: string[];
  implications: string;
  risk: string;
};

export type Gap = {
  id: string;
  target: BlockKey;
  from: BlockKey | null;
  source: string;
  missing: string;
  why: string;
  question: string;
  /** Short line the founder can add to the target block, with [brackets] for unknowns. */
  draft: string;
  severity: PriorityKey;
};

/** Result of the diagnostic pass. */
export type DiagnosticResult = {
  blocks: Partial<Record<BlockKey, BlockDiagnostic>>;
  understanding: string;
  summary: string;
  changeNote: string;
  findings: Finding[];
};

/** Result of the missing-input scan. */
export type GapResult = { gaps: Gap[]; costQuestion: string };

/**
 * The stored AI result. Bump `v` when this shape changes so old saved results
 * are discarded on load.
 */
export type AiResult = DiagnosticResult &
  GapResult & {
    v: 4;
    /** Which pass failed, when only one did. */
    partial: "" | "diag" | "gaps";
  };

export type PassRequest = {
  name: string;
  canvas: Canvas;
  /** The canvas as of the previous run, so the prompt can include a diff. */
  prevCanvas?: Canvas | null;
  /** Titles of the built-in checks that already fired, so the model doesn't repeat them. */
  known?: string[];
};

export type ApiErrorCode =
  | "bad_request"
  | "missing_api_key"
  | "rate_limited"
  /** Gemini returned 503 UNAVAILABLE: the model is busy, not a problem with the canvas. */
  | "overloaded"
  | "invalid_json"
  | "upstream_error";

export type ApiError = { code: ApiErrorCode; error: string };
