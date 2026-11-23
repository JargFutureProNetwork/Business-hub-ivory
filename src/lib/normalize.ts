import {
  BLOCKS,
  BLOCK_BY_KEY,
  BLOCK_KEYS,
  EMPTY,
  isBlockKey,
  type BlockKey,
  type Canvas,
} from "./blocks";
import { uniq } from "./audit";
import {
  DIAG_STATUS,
  PRIORITY,
  TYPE_LABEL,
  type BlockDiagnostic,
  type DiagnosticResult,
  type Finding,
  type Gap,
  type GapResult,
} from "./ai-types";

/**
 * Gemini's responseSchema constrains the shape but not the content, so every
 * field is still checked here and a bad value falls back rather than reaching
 * the UI. Quoted inputs are resolved against the real canvas, which is what
 * lets the app clear a finding once the founder edits that input away.
 */

const norm = (t: unknown) =>
  String(t ?? "")
    .toLowerCase()
    .replace(/[“”"'‘’.,;:!?()\[\]]/g, "")
    .replace(/\s+/g, " ")
    .trim();

const strArr = (a: unknown, n: number) =>
  (Array.isArray(a) ? a : []).map(String).filter(Boolean).slice(0, n);

/** Normalizes an untrusted canvas from the request body. */
export function normalizeCanvas(v: unknown): Canvas {
  const input = (v ?? {}) as Record<string, unknown>;
  return Object.fromEntries(
    BLOCK_KEYS.map((k) => [
      k,
      (Array.isArray(input[k]) ? (input[k] as unknown[]) : [])
        .map((x) => String(x ?? "").slice(0, 600))
        .filter((x) => x.trim())
        .slice(0, 40),
    ]),
  ) as Canvas;
}

export function normalizeDiagnostic(res: unknown, canvas: Canvas, withChangeNote: boolean): DiagnosticResult {
  const r = (res ?? {}) as Record<string, unknown>;

  /**
   * Matches a quoted input back to the canvas item it came from. Tries the
   * finding's own block first, then every other block, exact match before
   * substring, so a lightly reworded quote still resolves.
   */
  const resolveItem = (blockKey: BlockKey | undefined, quoted: unknown) => {
    const q = norm(quoted);
    if (!q) return null;
    const search = uniq([blockKey, ...BLOCK_KEYS]).filter(
      (k): k is BlockKey => !!k && isBlockKey(k),
    );
    for (const k of search) {
      const items = canvas[k] || [];
      const hit =
        items.find((x) => norm(x) === q) ||
        items.find((x) => {
          const n = norm(x);
          return n && (n.includes(q) || q.includes(n));
        });
      if (hit) return { block: k, item: hit };
    }
    return null;
  };

  const rawFindings = Array.isArray(r.findings) ? r.findings : [];
  const findings: Finding[] = rawFindings
    .filter((f): f is Record<string, unknown> => !!f && typeof f === "object" && !!(f as Record<string, unknown>).title)
    .slice(0, 7)
    .map((f) => {
      const blocks = uniq(
        (Array.isArray(f.blocks) ? f.blocks : [f.blocks]).filter(isBlockKey),
      );
      const resolved = f.item ? resolveItem(blocks[0], f.item) : null;
      if (resolved && !blocks.includes(resolved.block)) blocks.unshift(resolved.block);
      const sev = String(f.severity ?? f.priority ?? "").toLowerCase();
      const type = String(f.type ?? "").toLowerCase();
      return {
        priority: sev in PRIORITY ? (sev as Finding["priority"]) : "suggestion",
        type: type in TYPE_LABEL ? (type as Finding["type"]) : "business logic",
        clarify: f.clarify === true || f.clarify === "true",
        blocks,
        item: resolved ? resolved.item : "",
        itemBlock: resolved ? resolved.block : null,
        title: String(f.title),
        observation: String(f.observation ?? ""),
        whyItMatters: String(f.whyItMatters ?? ""),
        recommendation: String(f.recommendation ?? ""),
        questions: strArr(f.questions, 4),
      };
    });

  const blocksIn = (r.blocks ?? {}) as Record<string, unknown>;
  const blocks: Partial<Record<BlockKey, BlockDiagnostic>> = {};
  BLOCKS.forEach((b) => {
    const d = blocksIn[b.key];
    if (!d || typeof d !== "object") return;
    const o = d as Record<string, unknown>;
    const st = String(o.status ?? "").toLowerCase();
    blocks[b.key] = {
      status: st in DIAG_STATUS ? (st as BlockDiagnostic["status"]) : "investigate",
      tells: String(o.tells ?? ""),
      missing: String(o.missing ?? ""),
      assumptions: strArr(o.assumptions, 3),
      questions: strArr(o.questions, 3),
      implications: String(o.implications ?? ""),
      risk: String(o.risk ?? ""),
    };
  });

  return {
    blocks,
    understanding: typeof r.understanding === "string" ? r.understanding : "",
    summary: typeof r.summary === "string" ? r.summary : "",
    changeNote: withChangeNote && typeof r.changeNote === "string" ? r.changeNote : "",
    findings,
  };
}

export function normalizeGaps(res: unknown, canvas: Canvas): GapResult {
  const r = (res ?? {}) as Record<string, unknown>;
  const raw = Array.isArray(r.gaps) ? r.gaps : [];

  const gaps: Gap[] = raw
    .filter(
      (g): g is Record<string, unknown> =>
        !!g &&
        typeof g === "object" &&
        isBlockKey((g as Record<string, unknown>).target) &&
        !!(g as Record<string, unknown>).missing,
    )
    .slice(0, 16)
    .map((g, i) => {
      const sev = String(g.severity ?? "").toLowerCase();
      const src = String(g.source ?? "");
      const fromKey = isBlockKey(g.from) ? g.from : null;
      // Prefer the founder's real wording over the model's paraphrase of it.
      const srcHit =
        fromKey && src
          ? (canvas[fromKey] || []).find(
              (x) =>
                norm(x) === norm(src) ||
                norm(x).includes(norm(src)) ||
                norm(src).includes(norm(x)),
            )
          : null;
      const target = g.target as BlockKey;
      return {
        id: `${target}:${norm(g.missing)}`.slice(0, 120) || `gap-${i}`,
        target,
        from: fromKey,
        source: srcHit || src,
        missing: String(g.missing),
        why: String(g.why ?? ""),
        question: String(g.question ?? ""),
        draft: String(g.draft ?? "").trim(),
        severity: sev in PRIORITY ? (sev as Gap["severity"]) : "suggestion",
      };
    });

  // Ids are derived from the text, so disambiguate any collisions.
  const seen = new Set<string>();
  gaps.forEach((g, i) => {
    if (seen.has(g.id)) g.id = `${g.id}-${i}`;
    seen.add(g.id);
  });

  return {
    gaps,
    costQuestion: typeof r.costQuestion === "string" ? r.costQuestion : "",
  };
}

export const hasContent = (canvas: Canvas) =>
  BLOCK_KEYS.filter((k) => (canvas[k] || []).length).length;

export { EMPTY, BLOCK_BY_KEY };
