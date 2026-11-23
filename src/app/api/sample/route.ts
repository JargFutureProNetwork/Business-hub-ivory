import { NextResponse } from "next/server";
import { GEMINI_MODEL, getClient } from "@/lib/gemini";
import { withRetry } from "@/lib/retry";
import { MESSAGE, classify, fail, statusFor } from "@/lib/server/run-pass";

/**
 * Stand-in for claude.ai's `sample` capability, used by the embedded tools
 * through `public/tools/hub-bridge.js`. The UVP & Copy Workbench builds its own
 * prompt and asks for one JSON object back; this route sends that prompt to
 * Gemini in JSON mode and returns the parsed object.
 *
 * GET reports whether AI is available, so a tool can start straight in its
 * offline mode when no key is configured instead of failing on first use.
 *
 * The prompt comes from the browser, so it is capped: the workbench's longest
 * prompt (all six sections plus a "try a different angle" block) is ~6 KB.
 */

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_PROMPT = 16_000;

export function GET() {
  return NextResponse.json({ available: !!getClient() });
}

export async function POST(req: Request) {
  const ai = getClient();
  if (!ai) return fail("missing_api_key", MESSAGE.missing_api_key, 503);

  let prompt: unknown;
  try {
    prompt = ((await req.json()) as { prompt?: unknown })?.prompt;
  } catch {
    return fail("bad_request", "Request body must be JSON.", 400);
  }
  if (typeof prompt !== "string" || !prompt.trim()) {
    return fail("bad_request", "A prompt is required.", 400);
  }
  if (prompt.length > MAX_PROMPT) {
    return fail("bad_request", "The prompt is too long.", 413);
  }

  try {
    const res = await withRetry(() =>
      ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt as string,
        config: { responseMimeType: "application/json", temperature: 0.9 },
      }),
    );
    const text = res.text;
    if (!text) throw new Error("invalid_json");
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      throw new Error("invalid_json");
    }
    return NextResponse.json(parsed);
  } catch (err) {
    const code = classify(err);
    console.error("sample request failed", err);
    return fail(code, MESSAGE[code], statusFor(code));
  }
}
