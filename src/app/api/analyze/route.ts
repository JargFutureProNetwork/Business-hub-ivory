import { NextResponse } from "next/server";
import { BLOCK_BY_KEY } from "@/lib/blocks";
import { analyze, ratingLabel, statusOf } from "@/lib/audit";
import { PRIORITY, type DiagnosticResult, type GapResult } from "@/lib/ai-types";
import { diagnosticPrompt, gapPrompt } from "@/lib/prompts";
import { DIAGNOSTIC_SCHEMA, GAP_SCHEMA, getClient } from "@/lib/gemini";
import { normalizeDiagnostic, normalizeGaps } from "@/lib/normalize";
import {
  MESSAGE,
  callPass,
  classify,
  fail,
  parseInput,
  statusFor,
} from "@/lib/server/run-pass";

/**
 * One-call analysis of the nine canvas blocks: `{ feasibility, suggestions, alerts }`.
 *
 * The app's own UI does NOT use this route. It calls `./diagnostic` and `./gaps`
 * separately so it can show per-pass progress and keep one pass's results when
 * the other fails. This route is the convenient shape for anything else —
 * another client, a script, or curl — and it runs the same two passes over the
 * same prompts, so the two never drift.
 */

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  if (!getClient()) return fail("missing_api_key", MESSAGE.missing_api_key, 503);

  const parsed = await parseInput(req);
  if ("response" in parsed) return parsed.response;
  const { input } = parsed;

  const [diag, gapRes] = await Promise.allSettled([
    callPass<DiagnosticResult>(input, (i) => diagnosticPrompt(i.name, i.canvas, i.prevCanvas, i.known), DIAGNOSTIC_SCHEMA, (r, i) =>
      normalizeDiagnostic(r, i.canvas, !!i.prevCanvas),
    ),
    callPass<GapResult>(input, (i) => gapPrompt(i.name, i.canvas, i.prevCanvas), GAP_SCHEMA, (r, i) =>
      normalizeGaps(r, i.canvas),
    ),
  ]);

  if (diag.status === "rejected" && gapRes.status === "rejected") {
    const code = classify(diag.reason);
    console.error("analysis failed", diag.reason);
    return fail(code, MESSAGE[code], statusFor(code));
  }

  const diagnostic = diag.status === "fulfilled" ? diag.value : null;
  const gaps = gapRes.status === "fulfilled" ? gapRes.value : null;
  const findings = diagnostic?.findings ?? [];

  // The feasibility score is deterministic and computed here, not by Gemini, so
  // the same canvas always scores the same. The AI only adds the penalty.
  const audit = analyze(input.canvas);
  const penalty = Math.min(30, findings.reduce((a, f) => a + PRIORITY[f.priority].penalty, 0));
  const overall = Math.max(5, audit.overall - penalty);

  const title = (k: keyof typeof BLOCK_BY_KEY) => BLOCK_BY_KEY[k].title;

  return NextResponse.json({
    v: 1,
    /** True when one pass failed and the other's results were kept. */
    partial: diag.status === "rejected" ? "diagnostic" : gapRes.status === "rejected" ? "gaps" : "",

    feasibility: {
      overall,
      rating: ratingLabel(overall),
      status: statusOf(overall),
      blocksFilled: audit.filled,
      aiPenalty: penalty,
      pillars: {
        audience: { score: audit.scores.audience, label: "Audience & value fit" },
        pricing: { score: audit.scores.pricing, label: "Pricing & revenue viability" },
        differentiation: { score: audit.scores.diff, label: "Differentiation & defense" },
      },
      strengths: audit.strengths.map((s) => s.title),
      summary: diagnostic?.summary ?? "",
      understanding: diagnostic?.understanding ?? "",
    },

    // What to change: the AI's recommendations first, then the rule-based ones,
    // then each missing input the canvas implies but doesn't state.
    suggestions: [
      ...findings
        .filter((f) => f.recommendation)
        .map((f) => ({
          source: "ai" as const,
          priority: f.priority,
          blocks: f.blocks.map(title),
          title: f.title,
          recommendation: f.recommendation,
          questions: f.questions,
        })),
      ...audit.recs.map((r) => ({
        source: "rules" as const,
        priority: "suggestion" as const,
        blocks: [title(r.block)],
        title: r.title,
        recommendation: r.detail,
        questions: [],
      })),
      ...(gaps?.gaps ?? []).map((g) => ({
        source: "gap" as const,
        priority: g.severity,
        blocks: [title(g.target)],
        title: g.missing,
        recommendation: g.draft
          ? `Add to ${title(g.target)}: "${g.draft}" — replace the [brackets] with your details.`
          : g.why,
        questions: g.question ? [g.question] : [],
      })),
    ],

    // Things that could sink the model: the serious AI findings and the
    // rule-based red flags. Suggestion-level findings stay out of here.
    alerts: [
      ...findings
        .filter((f) => f.priority !== "suggestion")
        .map((f) => ({
          source: "ai" as const,
          severity: f.priority,
          type: f.type,
          needsClarification: f.clarify,
          blocks: f.blocks.map(title),
          title: f.title,
          quotedInput: f.item,
          observation: f.observation,
          whyItMatters: f.whyItMatters,
        })),
      ...audit.flags
        .filter((f) => f.severity !== "suggestion")
        .map((f) => ({
          source: "rules" as const,
          severity: f.severity === "risk" ? ("critical" as const) : ("important" as const),
          type: "business logic" as const,
          needsClarification: false,
          blocks: [title(f.block)],
          title: f.title,
          quotedInput: "",
          observation: f.detail,
          whyItMatters: "",
        })),
    ],

    /** The unreduced pass output, for callers that want the per-block detail. */
    detail: {
      costQuestion: gaps?.costQuestion ?? "",
      blocks: diagnostic?.blocks ?? {},
      changeNote: diagnostic?.changeNote ?? "",
    },
  });
}
