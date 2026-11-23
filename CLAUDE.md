# UMBP Canvas Lab (Next.js)

Business Model Canvas editor with a rule-based feasibility audit and an AI business-model
diagnostic, for the Utah Moldova Business Partnership. This is the Next.js port of the
single-file Claude artifact; the AI now runs on Google Gemini through this app's own API
routes instead of Claude's `sample` capability.

Stack: Next.js 16 (App Router, Turbopack), React 19, TypeScript, Tailwind CSS v4,
lucide-react, `@google/genai`.

## Commands

- `npm run dev` — dev server at http://localhost:3000
- `npm run build` — production build; also runs the TypeScript check
- `npm run lint`
- `npm test` — retry-policy tests (`tests/retry.test.mjs`, run with Node's TypeScript stripping)

Run `npm run build` and `npm run lint` after every change.

## Setup

Copy `.env.local.example` to `.env.local` and set `GEMINI_API_KEY`
(from https://aistudio.google.com/apikey). `GEMINI_MODEL` is optional and defaults to
`gemini-2.5-flash`. The key is read server-side only — never expose it with `NEXT_PUBLIC_`.
Without a key the app still works: the scores, built-in checks, Markdown copy and image
export are all local, and the AI panel shows a `missing_api_key` message.

## Layout

| Path | What it holds |
|---|---|
| `src/lib/blocks.ts` | `BLOCKS` (the 9 blocks: key, title, Lucide icon, grid-area class, guiding question, guided prompts, example), `EXAMPLES`, `BLOCK_BY_KEY`, `EMPTY` |
| `src/lib/audit.ts` | `analyze(canvas)`: the deterministic rule-based checks, 3 pillar scores + overall, flags, recs, strengths. Runs live on every edit. Also `TONE`, `statusOf`, `ratingLabel`, `PILLARS` |
| `src/lib/ai-types.ts` | `PRIORITY`, `TYPE_LABEL`, `DIAG_STATUS` vocabularies and the `AiResult` shape |
| `src/lib/prompts.ts` | The two prompts, carried over verbatim from the artifact, plus the edit diff |
| `src/lib/gemini.ts` | Client and the two `responseSchema` definitions |
| `src/lib/retry.ts` | `withRetry` / `isOverloaded`. Import-free so the test can load it directly |
| `src/lib/normalize.ts` | Field-by-field normalization, including resolving quoted inputs back to canvas items |
| `src/lib/analyze-client.ts` | Browser-side calls to the two passes |
| `src/lib/markdown.ts` | `buildMarkdown()` for "Copy as Markdown" |
| `src/lib/canvas-image.ts` | `renderCanvasPNG()`: a fixed 2400×1700 image drawn with Canvas 2D (no html2canvas) |
| `src/lib/server/run-pass.ts` | Shared request handling, validation and error mapping for both routes |
| `src/app/api/analyze/diagnostic` `.../gaps` | The two passes the UI calls |
| `src/app/api/analyze` | Combined one-call endpoint: `{ feasibility, suggestions, alerts, detail }`. Not used by the UI |
| `src/components/` | `primitives` (Meter, Bar, DiagnosticBody), `cards` (BlockCard, FlagItem, FindingCard, GapCard), `EditorModal`, `ImageModal`, `Report` |
| `src/app/page.tsx` | `App`: state, localStorage persistence, `runAnalysis`, `askAI` |
| `src/app/globals.css` | Brand tokens, dark mode, `.bmc-frame` / `.bmc-grid` |

Block keys: `kp` Key Partners, `ka` Key Activities, `kr` Key Resources, `vp` Value Propositions,
`cr` Customer Relationships, `ch` Channels, `cs` Customer Segments, `cost` Cost Structure,
`rev` Revenue Streams. A canvas is `Record<BlockKey, string[]>` — each block holds a list of
short items, not one blob of text.

## AI analysis (`askAI` in App)

Clicking Analyze fires both routes in parallel under `Promise.allSettled`:

1. **`POST /api/analyze/diagnostic`** — Business Model Diagnostic Mode. Returns `understanding`,
   `summary`, `changeNote`, `blocks` (per-block status/tells/missing/assumptions/questions/
   implications/risk) and 3–7 `findings` in the Block / Type / Severity / Observation /
   Why it matters / Recommendation format.
2. **`POST /api/analyze/gaps`** — missing-input scan. Returns `costQuestion` and up to 16 `gaps`
   (`target`, `from`, `source`, `missing`, `why`, `question`, `draft`, `severity`).

They are two routes rather than one so the client can show per-pass progress and keep one
pass's results when the other fails (`ai.partial`) — the same behavior the artifact got from
two `sample.json()` calls. Both take `{ name, canvas, prevCanvas, known }`; `prevCanvas` feeds
the edit diff both prompts use on re-analysis, and `known` lists the built-in checks that already
fired so the model doesn't repeat them.

### The combined `/api/analyze` route

`POST /api/analyze` runs both passes and reduces them to one flat result:
`feasibility` (the deterministic score plus the AI penalty), `suggestions` (AI recommendations,
rule-based recs, and each implied missing input, tagged `source: "ai" | "rules" | "gap"`),
`alerts` (critical and important findings plus the rule-based red flags) and `detail` (the raw
per-block diagnostic and cost question).

**The app's own UI does not use it.** It calls the two pass routes separately so it can show
per-pass progress and keep one pass's results when the other fails. The combined route exists for
anything else — another client, a script, curl — and it reuses the same prompts, schemas and
normalizers via `callPass`, so the two paths can't drift. The feasibility score is computed by
`analyze()` on the server, not by Gemini, so the same canvas always scores the same.

Results are stored as `ai` with `v: 4`. **Bump `v` when the shape changes**; old saved results are
then discarded on load.

Error codes come back as `{ code, error }`: `missing_api_key`, `bad_request`, `rate_limited`,
`overloaded` (Gemini 503, usually brief), `invalid_json`, `upstream_error`. Don't retry in a loop —
show the message and a Try again button.

A 503 is retried **once** by `withRetry` in `src/lib/retry.ts`, after ~900ms plus jitter. Nothing
else is retried: a 429, a bad key or a malformed schema would only burn quota and delay the error.
The retry is skipped if the first attempt already ate 25s of the route's 60s budget — a 503 normally
comes back in a second or two, so that only trips when something else was slow. `tests/retry.test.mjs`
covers this; the live path was verified against real 503s only indirectly, since Gemini recovered.

Gemini rejects an empty string as an enum member, so a field that may legitimately be `""` — like a
gap's `from` — has to be a plain string in the schema and is validated in `normalize.ts` instead.

A diagnostic pass takes roughly 30s, so both routes set `maxDuration = 60`.

Gemini's `responseSchema` constrains the JSON shape but not the content, so `normalize.ts` still
checks every field and falls back on a bad enum value. It also resolves each finding's quoted
`item` back to the real canvas string (`itemBlock` + `item`), which is what lets the UI drop a
finding once the founder edits that input away.

Derived state in `App`:
- `findings`: AI findings minus ones whose quoted input no longer exists
- `report`: `analyze()` minus a penalty (critical −8, important −4, capped at 30)
- `gaps`: minus dismissed ids. `addedIds` keeps a gap resolved after the user edits its [brackets]
- `stale`: the canvas changed since the AI result (`aiKey` ≠ current name+canvas JSON)

## TLS on this machine

`npm run dev` and `npm start` run Node with `--use-system-ca`. Something on this machine
intercepts TLS, and without the flag every Gemini call fails with
`UNABLE_TO_VERIFY_LEAF_SIGNATURE`. The flag makes Node trust the Windows certificate store; it is
harmless on machines that don't need it. `npm run build` doesn't make network calls, so it is
left alone.

## Notes carried over from the artifact

- The saved canvas is read from localStorage (`umbp-bmc-v1`, `umbp-theme`) in a mount effect,
  not during render, so the server and client markup agree. `<html>` carries
  `suppressHydrationWarning` because the pre-paint theme script in `layout.tsx` sets
  `data-theme` before React hydrates.
- The PNG export lifts its icon artwork from the hidden `#icon-src` node `page.tsx` renders.
- Unlike the artifact, `<a download>` works here, so `ImageModal` offers a real download and
  keeps the on-screen image only as a fallback.
- The artifact's Claude-specific plumbing is gone: no `window.claude`, no `sample` capability,
  no CSP restriction on external requests.

## Brand

Ivory Center / Utah-Moldova Business Partnership: **red `#C10926`, black, white**.

| Token | Light | Dark | Used for |
|---|---|---|---|
| `--brand` | `#C10926` | `#E11D3C` | The Analyze button, the rule under the masthead, accent borders, focus rings |
| `--navy` | `#000000` | `#F4F4F5` | Solid secondary UI: Done, Add draft, the toast, numbered badges |
| `--ink` | `#000000` | `#F4F4F5` | Text and the canvas frame |
| `--gold` | `#C10926` | `#EF4059` | Bullets and small accents (the token name is historical) |

Red is brighter in dark mode so it still carries on near-black. `--navy` and `--gold` kept their
names so the retheme stayed a token change rather than a rename across every component; only their
values moved.

**Green and amber survive**, in `--good` and `--warn`. A strict red/black/white palette cannot
express a three-state score — "strong", "caution" and "at risk" would all be red — so the scorecard
meters, pillar cards and status pills keep them. Everything else is brand-only.

Red does double duty as both the brand accent and the `risk` status. That was already true of the
old palette (the risk colour was Moldovan-flag red), and context separates them: solid buttons
versus soft-background pills.

### Logo

`public/logo-umbp.png` (black ink) and `public/logo-umbp-dark.png` (white ink, red preserved),
both 859×54 with transparent backgrounds, swapped by the `.logo-light` / `.logo-dark` rules in
`globals.css`. The supplied artwork was a screenshot matted onto white; it was un-matted to
transparency and the neutral ink inverted for the dark variant. If you get the original vector,
replace both files — nothing else needs to change.

### Favicon

`src/app/favicon.ico` (64px), `src/app/icon.png` (512px) and `src/app/apple-icon.png` (180px) are
the round UMBP mark — the red disc with the Utah and Moldova silhouettes — cut off the brown
backdrop it was supplied on and saved with a transparent surround. Next's App Router picks these
filenames up automatically and emits the `<link>` tags; there is no manual head markup. The `.ico`
wraps a PNG rather than a BMP, which every browser since Vista reads.

The PNG export draws `logo-umbp.png` into its footer, so the exported canvas carries the real
lockup rather than a drawn placeholder.

Fonts are Fraunces (`font-display`) and Manrope (`font-sans`) via `next/font`.
