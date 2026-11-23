/**
 * Retry semantics for Gemini calls. A busy model (503) is worth one more
 * attempt; a quota error or a bad request is not, because retrying those just
 * burns quota and delays the error the caller needs to see.
 *
 * Run with: npm test
 */
import { withRetry, isOverloaded } from "../src/lib/retry.ts";

let pass = 0,
  fail = 0;
const ok = (name, cond, extra = "") => {
  if (cond) {
    pass++;
    console.log("  ok   ", name);
  } else {
    fail++;
    console.log("  FAIL ", name, extra);
  }
};

const err503 = () =>
  new Error('{"error":{"code":503,"message":"This model is currently experiencing high demand."}}');
const err429 = () => new Error('{"error":{"code":429,"message":"RESOURCE_EXHAUSTED quota"}}');
const err400 = () => new Error('{"error":{"code":400,"message":"INVALID_ARGUMENT"}}');

console.log("isOverloaded");
ok("503 is an overload", isOverloaded(err503()));
ok("429 is not an overload", !isOverloaded(err429()));
ok("400 is not an overload", !isOverloaded(err400()));

console.log("withRetry");
{
  let n = 0;
  const r = await withRetry(async () => {
    n++;
    return "ok";
  });
  ok("a success is not retried", n === 1 && r === "ok", `calls=${n}`);
}
{
  let n = 0;
  const t = Date.now();
  const r = await withRetry(async () => {
    n++;
    if (n === 1) throw err503();
    return "recovered";
  });
  const ms = Date.now() - t;
  ok("503 then success retries once", n === 2 && r === "recovered", `calls=${n}`);
  ok("backoff waits ~900-1300ms", ms >= 850 && ms < 1800, `${ms}ms`);
}
{
  let n = 0;
  let thrown = null;
  try {
    await withRetry(async () => {
      n++;
      throw err503();
    });
  } catch (e) {
    thrown = e;
  }
  ok("a persistent 503 stops after 2 attempts", n === 2, `calls=${n}`);
  ok("a persistent 503 is rethrown", !!thrown && isOverloaded(thrown));
}
{
  let n = 0;
  let thrown = null;
  try {
    await withRetry(async () => {
      n++;
      throw err429();
    });
  } catch (e) {
    thrown = e;
  }
  ok("429 is not retried", n === 1, `calls=${n}`);
  ok("429 is rethrown unchanged", String(thrown).includes("429"));
}
{
  let n = 0;
  try {
    await withRetry(async () => {
      n++;
      throw err400();
    });
  } catch {}
  ok("400 is not retried", n === 1, `calls=${n}`);
}
{
  let n = 0;
  try {
    await withRetry(async () => {
      n++;
      throw new Error("missing_api_key");
    });
  } catch {}
  ok("a missing key is not retried", n === 1, `calls=${n}`);
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
