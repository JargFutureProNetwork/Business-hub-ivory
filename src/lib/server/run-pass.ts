import { NextResponse } from "next/server";
import type { Schema } from "@google/genai";
import type { Canvas } from "../blocks";
import type { ApiErrorCode } from "../ai-types";
import { generateJson, getClient } from "../gemini";
import { isOverloaded } from "../retry";
import { hasContent, normalizeCanvas } from "../normalize";

/**
 * Shared plumbing for the analysis routes. The diagnostic and gap passes each
 * get their own route so the client can run them in parallel and show per-pass
 * progress, the way the artifact did with two `sample.json()` calls; the
 * combined `/api/analyze` route reuses the same pieces.
 */

export type PassInput = {
  name: string;
  canvas: Canvas;
  prevCanvas: Canvas | null;
  known: string[];
};

export function fail(code: ApiErrorCode, error: string, status: number) {
  return NextResponse.json({ code, error }, { status });
}

/** Maps an upstream failure onto one of our error codes. */
export function classify(err: unknown): ApiErrorCode {
  const msg = err instanceof Error ? err.message : String(err);
  if (msg === "missing_api_key") return "missing_api_key";
  if (msg === "invalid_json") return "invalid_json";
  if (/429|rate.?limit|quota|RESOURCE_EXHAUSTED/i.test(msg)) return "rate_limited";
  if (isOverloaded(err)) return "overloaded";
  return "upstream_error";
}

export const MESSAGE: Record<ApiErrorCode, string> = {
  missing_api_key:
    "GEMINI_API_KEY is not set on the server. Add it to .env.local and restart.",
  bad_request: "The canvas could not be read.",
  rate_limited:
    "You’ve hit the Gemini usage limit for now. Wait a few minutes, then try again.",
  overloaded:
    "Gemini is busy right now, which is usually brief. Wait a moment and click Try again — your canvas is unchanged.",
  invalid_json: "The analysis came back incomplete. Click Try again.",
  upstream_error:
    "The analysis didn’t finish. The scores and built-in checks are still up to date.",
};

export const statusFor = (code: ApiErrorCode) =>
  code === "rate_limited" ? 429 : code === "overloaded" ? 503 : 502;

/** Reads and validates the request body shared by all three analysis routes. */
export async function parseInput(
  req: Request,
): Promise<{ input: PassInput } | { response: ReturnType<typeof fail> }> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return { response: fail("bad_request", "Request body must be JSON.", 400) };
  }

  const raw = (body ?? {}) as Record<string, unknown>;
  const input: PassInput = {
    name: typeof raw.name === "string" ? raw.name.slice(0, 200) : "",
    canvas: normalizeCanvas(raw.canvas),
    prevCanvas: raw.prevCanvas ? normalizeCanvas(raw.prevCanvas) : null,
    known: (Array.isArray(raw.known) ? raw.known : []).map(String).slice(0, 40),
  };

  if (hasContent(input.canvas) < 2) {
    return {
      response: fail(
        "bad_request",
        "Fill in at least two blocks so the AI has enough context to analyze.",
        400,
      ),
    };
  }

  return { input };
}

/** Runs one Gemini pass and returns its normalized result. Throws on failure. */
export async function callPass<T>(
  input: PassInput,
  buildPrompt: (input: PassInput) => string,
  schema: Schema,
  normalize: (res: unknown, input: PassInput) => T,
): Promise<T> {
  const res = await generateJson(buildPrompt(input), schema);
  return normalize(res, input);
}

/** Handler for a route that exposes a single pass. */
export async function runPass(
  req: Request,
  buildPrompt: (input: PassInput) => string,
  schema: Schema,
  normalize: (res: unknown, input: PassInput) => unknown,
) {
  if (!getClient()) return fail("missing_api_key", MESSAGE.missing_api_key, 503);

  const parsed = await parseInput(req);
  if ("response" in parsed) return parsed.response;

  try {
    return NextResponse.json(await callPass(parsed.input, buildPrompt, schema, normalize));
  } catch (err) {
    const code = classify(err);
    console.error("analysis pass failed", err);
    return fail(code, MESSAGE[code], statusFor(code));
  }
}
