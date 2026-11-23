"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import {
  Copy,
  Gauge,
  ImageDown,
  Info,
  Loader2,
  Moon,
  RotateCcw,
  Sun,
  Check,
} from "lucide-react";
import {
  BLOCKS,
  BLOCK_BY_KEY,
  EMPTY,
  EXAMPLES,
  type BlockKey,
  type Canvas,
  type Meta,
} from "@/lib/blocks";
import { MDL_PER_EUR, TONE, analyze, statusOf, uniq, type Flag } from "@/lib/audit";
import { PRIORITY, type AiResult, type Gap } from "@/lib/ai-types";
import { buildMarkdown } from "@/lib/markdown";
import { renderCanvasPNG } from "@/lib/canvas-image";
import { isApiError, runDiagnosticPass, runGapPass } from "@/lib/analyze-client";
import { BlockCard, type Highlight } from "@/components/cards";
import { EditorModal } from "@/components/EditorModal";
import { ImageModal } from "@/components/ImageModal";
import { Report, type AiState, type LastRun, type PassState } from "@/components/Report";

const STORAGE_KEY = "umbp-bmc-v1";

type Saved = {
  name?: string;
  meta?: Meta;
  canvas?: Canvas;
  showReport?: boolean;
  ai?: AiResult;
  aiAt?: number | null;
  aiKey?: string;
  lastRun?: LastRun | null;
  dismissed?: string[];
  addedIds?: string[];
};

function load(): Saved | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as Saved;
  } catch {
    /* a corrupt or blocked store just means we start fresh */
  }
  return null;
}

export default function App() {
  // Read localStorage after mount so the server and first client render match.
  const [hydrated, setHydrated] = useState(false);
  const [name, setName] = useState(EXAMPLES.investing.name);
  const [canvas, setCanvas] = useState<Canvas>(EXAMPLES.investing.canvas);
  const [meta, setMeta] = useState<Meta>({ by: "", date: "", version: "1" });
  const [openKey, setOpenKey] = useState<BlockKey | null>(null);
  const [showReport, setShowReport] = useState(false);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [toast, setToast] = useState("");
  const [imgUrl, setImgUrl] = useState("");
  const [imgBusy, setImgBusy] = useState(false);
  const [ai, setAi] = useState<AiResult | null>(null);
  const [aiState, setAiState] = useState<AiState>("idle");
  const [aiAt, setAiAt] = useState<number | null>(null);
  const [aiSteps, setAiSteps] = useState<Partial<Record<"diag" | "gaps", PassState>>>({});
  const [aiError, setAiError] = useState("");
  const [dismissed, setDismissed] = useState<string[]>([]);
  const [addedIds, setAddedIds] = useState<string[]>([]);
  const [aiKey, setAiKey] = useState("");
  const [lastRun, setLastRun] = useState<LastRun | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Restoring the saved canvas has to happen after mount: reading localStorage
  // during render would make the server and client markup disagree. One
  // mount-time restore is exactly the cascading render this rule guards against,
  // so it is suppressed here rather than worked around.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const saved = load();
    if (saved) {
      if (saved.name != null) setName(saved.name);
      if (saved.canvas) setCanvas(saved.canvas);
      if (saved.meta) setMeta(saved.meta);
      if (saved.showReport) setShowReport(true);
      // A stored result from an older shape is discarded rather than rendered.
      if (saved.ai?.v === 4) setAi(saved.ai);
      setAiAt(saved.aiAt ?? null);
      setAiKey(saved.aiKey ?? "");
      setLastRun(saved.lastRun ?? null);
      setDismissed(saved.dismissed ?? []);
      setAddedIds(saved.addedIds ?? []);
    }
    setMeta((m) =>
      m.date ? m : { ...m, date: new Date().toLocaleDateString("en-GB").replace(/\//g, ".") },
    );
    setTheme(
      (document.documentElement.getAttribute("data-theme") as "light" | "dark" | null) ??
        (matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"),
    );
    setHydrated(true);
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const baseReport = useMemo(() => analyze(canvas), [canvas]);

  // AI findings; item-specific ones disappear once the user edits or removes that input
  const findings = useMemo(
    () =>
      (ai?.findings || [])
        .filter((f) => !f.item || (f.itemBlock ? (canvas[f.itemBlock] || []).includes(f.item) : true))
        .sort((a, b) => PRIORITY[a.priority].rank - PRIORITY[b.priority].rank),
    [ai, canvas],
  );

  const report = useMemo(() => {
    const penalty = Math.min(30, findings.reduce((a, f) => a + PRIORITY[f.priority].penalty, 0));
    return { ...baseReport, overall: Math.max(5, baseReport.overall - penalty), fitPenalty: penalty };
  }, [baseReport, findings]);

  const aiFlagsFor = (key: BlockKey): Flag[] =>
    findings
      .filter((f) => f.blocks.includes(key) || f.itemBlock === key)
      .map((f) => ({
        pillar: "ai",
        severity: PRIORITY[f.priority].severity,
        label: f.clarify ? `${PRIORITY[f.priority].label}: clarification needed` : PRIORITY[f.priority].label,
        block: key,
        title: f.title,
        detail: `${f.observation}${f.whyItMatters ? ` Why it matters: ${f.whyItMatters}` : ""}${f.recommendation ? ` Recommendation: ${f.recommendation}` : ""}`,
      }));

  const highlightsFor = (key: BlockKey): Highlight[] =>
    findings.filter((f) => f.item && f.itemBlock === key).map((f) => ({ item: f.item, priority: f.priority }));

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ name, meta, canvas, showReport, ai, aiAt, aiKey, lastRun, dismissed, addedIds }),
      );
    } catch {
      /* a full or blocked store shouldn't break editing */
    }
  }, [hydrated, name, meta, canvas, showReport, ai, aiAt, aiKey, lastRun, dismissed, addedIds]);

  // Missing-input gaps: hide dismissed ones; a gap counts as added once its draft is in the target block.
  // Remember added gaps by id so they stay resolved after the user edits the [brackets].
  const isAdded = (g: Gap) =>
    addedIds.includes(g.id) || (!!g.draft && (canvas[g.target] || []).some((x) => x.trim() === g.draft));
  const markAdded = (g: Gap) => setAddedIds((a) => uniq([...a, g.id]));

  const gaps = useMemo(
    () =>
      (ai?.gaps || [])
        .filter((g) => !dismissed.includes(g.id))
        .sort((a, b) => PRIORITY[a.severity].rank - PRIORITY[b.severity].rank),
    [ai, dismissed],
  );
  const openGapsFor = (key: BlockKey) => gaps.filter((g) => g.target === key && !isAdded(g));

  const addGap = (g: Gap) => {
    if (!g.draft || isAdded(g)) return;
    setCanvas((c) => ({ ...c, [g.target]: [...(c[g.target] || []).filter((x) => x.trim()), g.draft] }));
    markAdded(g);
    setToast(`Added to ${BLOCK_BY_KEY[g.target].title}. Replace the [brackets] with your details.`);
  };
  const dismissGap = (g: Gap) => setDismissed((d) => uniq([...d, g.id]));

  useEffect(() => {
    if (!hydrated) return;
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("umbp-theme", theme);
    } catch {
      /* ignore */
    }
  }, [hydrated, theme]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(""), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  const currentKey = JSON.stringify({ name, canvas });
  const stale = !!ai && aiKey !== currentKey;
  const changedSinceRun = !!lastRun && lastRun.key !== currentKey;

  const askAI = useCallback(
    async (prevCanvasArg?: Canvas | null) => {
      const prevCanvas = prevCanvasArg === undefined ? (lastRun?.prevCanvas as Canvas | null) : prevCanvasArg;
      const keyAtCall = JSON.stringify({ name, canvas });

      abortRef.current?.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;
      setAiState("loading");
      setAiError("");
      setAiSteps({ diag: "loading", gaps: "loading" });

      const body = {
        name,
        canvas,
        prevCanvas: prevCanvas ?? null,
        known: baseReport.flags.map((f) => `${f.title} (${BLOCK_BY_KEY[f.block].title})`),
      };

      const runA = runDiagnosticPass(body, ctrl.signal).then(
        (r) => {
          setAiSteps((st) => ({ ...st, diag: "done" }));
          return r;
        },
        (e) => {
          setAiSteps((st) => ({ ...st, diag: "error" }));
          throw e;
        },
      );
      const runB = runGapPass(body, ctrl.signal).then(
        (r) => {
          setAiSteps((st) => ({ ...st, gaps: "done" }));
          return r;
        },
        (e) => {
          setAiSteps((st) => ({ ...st, gaps: "error" }));
          throw e;
        },
      );

      const [ra, rb] = await Promise.allSettled([runA, runB]);
      if (abortRef.current !== ctrl) return; // superseded by a newer analysis
      if (ctrl.signal.aborted) {
        setAiState("idle");
        return;
      }

      if (ra.status === "rejected" && rb.status === "rejected") {
        const reason = ra.reason;
        setAiError(
          isApiError(reason)
            ? reason.error
            : "The analysis didn’t finish. The scores and built-in checks are still up to date.",
        );
        setAiState("error");
        return;
      }

      // Keep whatever succeeded; carry the previous result forward for a pass that failed
      const next: AiResult = {
        v: 4,
        ...(ra.status === "fulfilled"
          ? ra.value
          : {
              blocks: ai?.blocks ?? {},
              understanding: ai?.understanding ?? "",
              summary: ai?.summary ?? "",
              changeNote: "",
              findings: ai?.findings ?? [],
            }),
        ...(rb.status === "fulfilled"
          ? rb.value
          : { gaps: ai?.gaps ?? [], costQuestion: ai?.costQuestion ?? "" }),
        partial: ra.status === "rejected" ? "diag" : rb.status === "rejected" ? "gaps" : "",
      };

      setAi(next);
      setAiState("done");
      setAiAt(Date.now());
      setAiKey(keyAtCall);
      setDismissed([]);
      setAddedIds([]);

      const nGaps = next.gaps.length,
        nF = next.findings.length;
      setToast(
        next.partial
          ? "Analysis partly updated. One pass didn’t finish; click Analyze to retry."
          : `Analysis updated: ${nF} ${nF === 1 ? "finding" : "findings"}, ${nGaps} possible missing ${nGaps === 1 ? "input" : "inputs"}`,
      );
    },
    [ai, baseReport.flags, canvas, lastRun, name],
  );

  const runAnalysis = () => {
    const prev = lastRun;
    setLastRun({
      key: currentKey,
      canvas,
      overall: report.overall,
      prevOverall: prev ? prev.overall : null,
      prevCanvas: prev ? prev.canvas : null,
    });
    setShowReport(true);
    if (report.filled >= 2) askAI(prev ? (prev.canvas as Canvas) : null);
    else setToast("Fill in at least two blocks so the AI has enough context to analyze.");
    setTimeout(
      () =>
        document.getElementById("report")?.scrollIntoView({
          behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
          block: "start",
        }),
      60,
    );
  };

  const resetAi = () => {
    setAi(null);
    setAiKey("");
    setAiAt(null);
    setLastRun(null);
    setDismissed([]);
    setAddedIds([]);
  };

  const loadExample = (key: string) => {
    const ex = EXAMPLES[key];
    setName(ex.name);
    setCanvas(ex.canvas);
    resetAi();
    setToast(`Loaded example: ${ex.name}`);
  };

  const clearAll = () => {
    setName("Untitled business");
    setCanvas(EMPTY);
    setShowReport(false);
    resetAi();
    setToast("Canvas cleared");
  };

  const saveImage = async () => {
    setImgBusy(true);
    try {
      setImgUrl(await renderCanvasPNG(name, meta, canvas));
    } catch {
      setToast("The image couldn’t be created. Try again.");
    }
    setImgBusy(false);
  };

  const copyImage = async () => {
    try {
      const blob = await (await fetch(imgUrl)).blob();
      await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      setToast("Canvas image copied");
    } catch {
      setToast("Copying isn’t allowed here. Use Download image, or press and hold it.");
    }
  };

  const copyReport = async () => {
    const text = buildMarkdown(name, canvas, showReport ? report : null, ai, meta);
    try {
      await navigator.clipboard.writeText(text);
      setToast("Copied canvas and audit as Markdown");
    } catch {
      setToast("Copy isn’t available in this view. Select the text manually.");
    }
  };

  const openBlock = openKey ? BLOCK_BY_KEY[openKey] : null;
  const liveTone = TONE[statusOf(report.overall)];
  const imgName = `${(name || "business-model-canvas").replace(/[^\w\- ]+/g, "").trim().replace(/\s+/g, "-").toLowerCase() || "canvas"}.png`;

  return (
    <div className="min-h-screen">
      {/* Brand band: the logo on paper, over a red rule. */}
      <header className="bg-surface border-b border-line">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center gap-x-4 gap-y-2">
          <div className="mr-auto flex items-center gap-3 min-w-0">
            <Image
              src="/logo-umbp.png"
              alt="Ivory Center / Utah-Moldova Business Partnership"
              width={859}
              height={54}
              priority
              className="logo-light h-7 sm:h-8 w-auto"
            />
            <Image
              src="/logo-umbp-dark.png"
              alt="Ivory Center / Utah-Moldova Business Partnership"
              width={859}
              height={54}
              priority
              className="logo-dark h-7 sm:h-8 w-auto"
            />
            <span className="hidden lg:block h-7 w-px bg-line" aria-hidden="true" />
            <p className="hidden lg:block font-display font-bold text-lg leading-none">Canvas Lab</p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className="hidden sm:inline-flex items-center gap-2 rounded-full bg-surface2 px-3 py-1.5 text-xs font-semibold"
              title="Updates as you edit"
            >
              <span className="h-2 w-2 rounded-full" style={{ background: liveTone.stroke }} />
              Live score {report.overall}%
            </span>
            <button
              onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
              className="p-2 rounded-lg hover:bg-surface2"
              aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>
        <div className="h-1 bg-brand" aria-hidden="true" />
      </header>

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 pb-16">
        {/* Actions */}
        <div className="pt-5 flex flex-wrap items-center justify-end gap-2">
          <select
            onChange={(e) => {
              if (e.target.value) loadExample(e.target.value);
              e.target.value = "";
            }}
            defaultValue=""
            className="rounded-lg border border-line bg-surface px-3 py-2 text-sm font-semibold"
            aria-label="Load an example canvas"
          >
            <option value="" disabled>
              Load example…
            </option>
            <option value="investing">Investing app (weak fit)</option>
            <option value="bakery">Office bakery (strong fit)</option>
          </select>
          <button
            onClick={clearAll}
            className="rounded-lg border border-line bg-surface px-3 py-2 text-sm font-semibold inline-flex items-center gap-1.5"
          >
            <RotateCcw size={15} /> Clear
          </button>
          <button
            onClick={saveImage}
            disabled={imgBusy}
            className="rounded-lg border border-line bg-surface px-3 py-2 text-sm font-semibold inline-flex items-center gap-1.5 disabled:opacity-60"
          >
            {imgBusy ? <Loader2 size={15} className="animate-spin" /> : <ImageDown size={15} />} Save canvas as image
          </button>
          <button
            onClick={runAnalysis}
            disabled={aiState === "loading"}
            className="relative rounded-lg bg-brand text-brandink px-4 py-2 text-sm font-bold inline-flex items-center gap-2 shadow-sm disabled:opacity-70"
          >
            {aiState === "loading" ? <Loader2 size={16} className="animate-spin" /> : <Gauge size={16} />}
            {aiState === "loading"
              ? "Analyzing…"
              : changedSinceRun
                ? "Re-analyze with my changes"
                : "Analyze business feasibility"}
            {changedSinceRun && aiState !== "loading" && (
              <span
                className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-ink border-2 border-[var(--bg)]"
                aria-hidden="true"
              />
            )}
          </button>
        </div>

        {/* Sheet header, as on the printed canvas */}
        <div className="pt-5 pb-4 flex flex-col xl:flex-row xl:items-end gap-4">
          <h1 className="font-display text-3xl sm:text-[2.4rem] font-bold leading-none tracking-tight shrink-0">
            The Business Model Canvas
          </h1>
          <div className="flex-1 grid grid-cols-2 md:grid-cols-[2fr_2fr_1fr_1fr] gap-2">
            <div className="meta-field col-span-2 md:col-span-1">
              <label htmlFor="bizname">Designed for</label>
              <input id="bizname" value={name} onChange={(e) => setName(e.target.value)} placeholder="Business name" />
            </div>
            <div className="meta-field col-span-2 md:col-span-1">
              <label htmlFor="designer">Designed by</label>
              <input
                id="designer"
                value={meta.by}
                onChange={(e) => setMeta((m) => ({ ...m, by: e.target.value }))}
                placeholder="Your name or team"
              />
            </div>
            <div className="meta-field">
              <label htmlFor="mdate">Date</label>
              <input
                id="mdate"
                value={meta.date}
                onChange={(e) => setMeta((m) => ({ ...m, date: e.target.value }))}
                placeholder="dd.mm.yyyy"
              />
            </div>
            <div className="meta-field">
              <label htmlFor="mversion">Version</label>
              <input
                id="mversion"
                value={meta.version}
                onChange={(e) => setMeta((m) => ({ ...m, version: e.target.value }))}
                placeholder="1"
              />
            </div>
          </div>
        </div>

        {/* Canvas */}
        <div className="bmc-frame">
          <div className="bmc-grid">
            {BLOCKS.map((b) => (
              <BlockCard
                key={b.key}
                block={b}
                items={(canvas[b.key] || []).filter((s) => s.trim())}
                flags={[...aiFlagsFor(b.key), ...report.flags.filter((f) => f.block === b.key)]}
                highlights={highlightsFor(b.key)}
                diag={ai?.blocks?.[b.key]}
                stale={stale}
                gapCount={openGapsFor(b.key).length}
                onOpen={() => setOpenKey(b.key)}
              />
            ))}
          </div>
        </div>
        <p className="text-xs text-muted mt-3 flex items-center gap-1.5">
          <Info size={13} /> Click any block to edit. Your canvas saves automatically in this browser.
        </p>

        {showReport && (
          <>
            <Report
              report={report}
              onOpenBlock={setOpenKey}
              ai={ai}
              aiState={aiState}
              aiAt={aiAt}
              aiSteps={aiSteps}
              aiError={aiError}
              stale={stale}
              lastRun={lastRun}
              findings={findings}
              gaps={gaps}
              isAdded={isAdded}
              onAddGap={addGap}
              onDismissGap={dismissGap}
              onRetry={() => askAI()}
              onStop={() => abortRef.current?.abort()}
            />
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={copyReport}
                className="rounded-lg bg-navy text-navyink px-4 py-2 text-sm font-bold inline-flex items-center gap-2"
              >
                <Copy size={15} /> Copy as Markdown
              </button>
            </div>
            <p className="text-xs text-muted mt-3 max-w-3xl leading-relaxed">
              Scores come from rule-based checks of what’s written on the canvas; they flag gaps to investigate, not a
              verdict on the business. MDL prices are converted at about {MDL_PER_EUR} MDL per euro for comparison.
            </p>
          </>
        )}
      </main>

      {openBlock && openKey && (
        <EditorModal
          key={openKey}
          block={openBlock}
          items={(canvas[openKey] || []).filter((s) => s.trim())}
          flags={[...aiFlagsFor(openKey), ...report.flags.filter((f) => f.block === openKey)]}
          diag={ai?.blocks?.[openKey]}
          stale={stale}
          gaps={gaps.filter((g) => g.target === openKey)}
          onDismissGap={dismissGap}
          onMarkAdded={markAdded}
          addedIds={addedIds}
          onChange={(list) => setCanvas((c) => ({ ...c, [openKey]: list }))}
          onClose={() => setOpenKey(null)}
        />
      )}

      {imgUrl && (
        <ImageModal url={imgUrl} filename={imgName} onCopy={copyImage} onClose={() => setImgUrl("")} />
      )}

      {/* Source of the Lucide artwork the PNG export draws into the image. */}
      <div id="icon-src" style={{ display: "none" }} aria-hidden="true">
        {BLOCKS.map((b) => {
          const I = b.icon;
          return (
            <span key={b.key} data-key={b.key}>
              <I size={40} strokeWidth={2.2} />
            </span>
          );
        })}
      </div>

      {toast && (
        <div
          role="status"
          className="fixed left-1/2 -translate-x-1/2 z-[60] rounded-full bg-navy text-navyink px-4 py-2 text-sm font-semibold shadow-lg"
          style={{ bottom: "calc(16px + env(safe-area-inset-bottom, 0px))" }}
        >
          <span className="inline-flex items-center gap-2">
            <Check size={15} /> {toast}
          </span>
        </div>
      )}
    </div>
  );
}
