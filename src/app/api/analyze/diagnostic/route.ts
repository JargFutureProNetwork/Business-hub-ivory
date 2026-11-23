import { DIAGNOSTIC_SCHEMA } from "@/lib/gemini";
import { diagnosticPrompt } from "@/lib/prompts";
import { normalizeDiagnostic } from "@/lib/normalize";
import { runPass } from "@/lib/server/run-pass";

export const runtime = "nodejs";
export const maxDuration = 60;

/** Pass 1: block-by-block diagnostic plus the priority findings. */
export function POST(req: Request) {
  return runPass(
    req,
    (i) => diagnosticPrompt(i.name, i.canvas, i.prevCanvas, i.known),
    DIAGNOSTIC_SCHEMA,
    (res, i) => normalizeDiagnostic(res, i.canvas, !!i.prevCanvas),
  );
}
