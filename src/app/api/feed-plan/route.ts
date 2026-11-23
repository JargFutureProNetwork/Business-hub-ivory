import { NextResponse } from "next/server";
import { GEMINI_MODEL, getClient } from "@/lib/gemini";
import { withRetry } from "@/lib/retry";
import { classify } from "@/lib/server/run-pass";

/**
 * "Plan with Gemini" and "Write with Gemini" for the Feed Planner
 * (public/tools/feed-planner). Ported from the planner's own /api/ai/plan route
 * without its Meta sign-in: the planner sends its prompt and small JPEG copies
 * of the post images, and gets Gemini's JSON back as { result }.
 *
 * GET reports whether AI is configured, so the planner can hide the AI buttons.
 * The prompt and images come from the browser, so both are capped.
 */

export const runtime = "nodejs";
export const maxDuration = 60;

const MAX_PROMPT = 40_000;
const MAX_IMAGES = 12;
const MAX_IMAGE_B64 = 2_000_000; // ~1.5 MB per image; the planner sends 1024px JPEG thumbnails

const UNAVAILABLE =
  "Gemini isn't available right now. Try again in a minute; you can still write the copy yourself.";

const fail = (error: string, status = 400) => NextResponse.json({ error }, { status });

export function GET() {
  return NextResponse.json({ available: !!getClient() });
}

export async function POST(request: Request) {
  const ai = getClient();
  if (!ai) return fail(UNAVAILABLE, 503);

  const body = (await request.json().catch(() => null)) as { prompt?: unknown; images?: unknown } | null;
  if (!body || typeof body.prompt !== "string" || !body.prompt.trim()) {
    return fail("That request couldn't be read. Please try again.");
  }
  if (body.prompt.length > MAX_PROMPT) {
    return fail("There is too much text to send at once. Try planning fewer posts.", 413);
  }
  const images = (Array.isArray(body.images) ? body.images : [])
    .filter((s): s is string => typeof s === "string" && s.length <= MAX_IMAGE_B64 && /^[A-Za-z0-9+/=]+$/.test(s))
    .slice(0, MAX_IMAGES);

  try {
    const res = await withRetry(() =>
      ai.models.generateContent({
        model: GEMINI_MODEL,
        contents: [
          {
            role: "user",
            parts: [
              ...images.map((data) => ({ inlineData: { mimeType: "image/jpeg", data } })),
              { text: body.prompt as string },
            ],
          },
        ],
        config: { responseMimeType: "application/json" },
      }),
    );
    const text = (res.text || "").trim();
    if (!text) {
      return fail("Gemini didn't return any copy for this. Change the photos or the brand notes and try again.", 502);
    }
    let result: unknown;
    try {
      result = JSON.parse(text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, ""));
    } catch {
      return fail("Gemini's answer came back garbled. Please try again.", 502);
    }
    return NextResponse.json({ result });
  } catch (err) {
    console.error("feed-plan failed", err);
    return classify(err) === "rate_limited"
      ? fail("Gemini's usage limit is reached for now. Wait a few minutes and try again.", 429)
      : fail(UNAVAILABLE, 502);
  }
}
