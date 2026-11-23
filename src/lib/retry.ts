/**
 * Retry policy for Gemini calls. Kept free of imports so `tests/retry.test.mjs`
 * can load it directly with Node's TypeScript stripping.
 */

/** A 503 UNAVAILABLE from Gemini: the model is busy, and the same call may well succeed. */
export const isOverloaded = (err: unknown) =>
  /503|UNAVAILABLE|high demand|overloaded/i.test(
    err instanceof Error ? err.message : String(err),
  );

/** One retry, so a busy model costs one extra attempt rather than a loop. */
const MAX_ATTEMPTS = 2;
const RETRY_DELAY_MS = 900;
/**
 * Don't start a retry this late into the route's 60s budget. A 503 is normally
 * refused in a second or two, so this only bites when the first attempt was
 * slow for some other reason — better to surface the error than to time out.
 */
const RETRY_BUDGET_MS = 25_000;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * Retries `fn` once when Gemini reports it is overloaded. Every other failure —
 * a bad key, a rate limit, a malformed schema — is thrown straight through,
 * because retrying those just burns quota and delays the real error.
 */
export async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  const started = Date.now();
  for (let attempt = 1; ; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const canRetry =
        attempt < MAX_ATTEMPTS && isOverloaded(err) && Date.now() - started < RETRY_BUDGET_MS;
      if (!canRetry) throw err;
      // Jitter so two passes firing together don't retry in lockstep.
      const wait = RETRY_DELAY_MS + Math.floor(Math.random() * 400);
      console.warn(`Gemini overloaded; retrying once in ${wait}ms`);
      await sleep(wait);
    }
  }
}
