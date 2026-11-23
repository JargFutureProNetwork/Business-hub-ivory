import { GAP_SCHEMA } from "@/lib/gemini";
import { gapPrompt } from "@/lib/prompts";
import { normalizeGaps } from "@/lib/normalize";
import { runPass } from "@/lib/server/run-pass";

export const runtime = "nodejs";
export const maxDuration = 60;

/** Pass 2: inputs one block implies but another is missing. */
export function POST(req: Request) {
  return runPass(
    req,
    (i) => gapPrompt(i.name, i.canvas, i.prevCanvas),
    GAP_SCHEMA,
    (res, i) => normalizeGaps(res, i.canvas),
  );
}
