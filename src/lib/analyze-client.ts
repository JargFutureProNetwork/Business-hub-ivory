import type { Canvas } from "./blocks";
import type {
  ApiError,
  ApiErrorCode,
  DiagnosticResult,
  GapResult,
  PassRequest,
} from "./ai-types";

/**
 * Calls one analysis pass. The two passes are separate endpoints so the caller
 * can run them with Promise.allSettled and show per-pass progress, the way the
 * artifact did with two `sample.json()` calls.
 */
async function pass<T>(path: string, body: PassRequest, signal: AbortSignal): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
    signal,
  });

  if (!res.ok) {
    const err = (await res.json().catch(() => null)) as ApiError | null;
    throw {
      code: (err?.code ?? "upstream_error") as ApiErrorCode,
      error: err?.error ?? "The analysis didn’t finish.",
    } satisfies ApiError;
  }
  return (await res.json()) as T;
}

export const runDiagnosticPass = (body: PassRequest, signal: AbortSignal) =>
  pass<DiagnosticResult>("/api/analyze/diagnostic", body, signal);

export const runGapPass = (body: PassRequest, signal: AbortSignal) =>
  pass<GapResult>("/api/analyze/gaps", body, signal);

export const isApiError = (e: unknown): e is ApiError =>
  !!e && typeof e === "object" && "code" in e;

export type { Canvas };
