import { Target, TrendingUp, ShieldCheck, type LucideIcon } from "lucide-react";
import { BLOCKS, type BlockKey, type Canvas } from "./blocks";

/* -------------------------------------------------------- audit engine */

export type PillarKey = "audience" | "pricing" | "diff";

export const PILLARS: Record<PillarKey, { label: string; icon: LucideIcon }> = {
  audience: { label: "Audience & value fit", icon: Target },
  pricing: { label: "Pricing & revenue viability", icon: TrendingUp },
  diff: { label: "Differentiation & defense", icon: ShieldCheck },
};

/** Approximate, for comparison only. */
export const MDL_PER_EUR = 19.5;
/** Illustrative paid-acquisition cost per subscriber, EUR. */
const ASSUMED_CAC = 40;

export type Severity = "risk" | "caution" | "suggestion";

export type Flag = {
  pillar: PillarKey | "ai";
  severity: Severity;
  block: BlockKey;
  title: string;
  detail: string;
  /** Overrides the default severity wording; used by the AI-derived flags. */
  label?: string;
};

export type Rec = { pillar: PillarKey; block: BlockKey; title: string; detail: string };
export type Strength = { pillar: PillarKey; block: BlockKey; title: string };

export type Report = {
  scores: Record<PillarKey, number>;
  overall: number;
  filled: number;
  completeness: number;
  flags: Flag[];
  recs: Rec[];
  strengths: Strength[];
  /** Points deducted for critical and important AI findings. Added by the app. */
  fitPenalty?: number;
};

export function parsePrices(text: string) {
  const out: { eur: number; raw: string }[] = [];
  const re =
    /(€|\$|eur|usd|mdl|lei)\s?(\d+(?:[.,]\d+)?)|(\d+(?:[.,]\d+)?)\s?(€|\$|eur|usd|mdl|lei)\b/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(text))) {
    const cur = (m[1] || m[4] || "").toLowerCase();
    const n = parseFloat((m[2] || m[3]).replace(",", "."));
    if (isNaN(n)) continue;
    const eur = cur === "mdl" || cur === "lei" ? n / MDL_PER_EUR : n;
    out.push({ eur, raw: m[0] });
  }
  return out;
}

export const uniq = <T,>(a: T[]): T[] => [...new Set(a)];
const fmt = (n: number) => (Math.round(n * 10) / 10).toString().replace(/\.0$/, "");

export function analyze(c: Canvas): Report {
  const L = (k: BlockKey) => (c[k] || []).map((s) => s.trim()).filter(Boolean);
  const T = (...ks: BlockKey[]) =>
    ks.map((k) => L(k).join(" \n ")).join(" \n ").toLowerCase();
  const filled = BLOCKS.filter((b) => L(b.key).length).length;
  const flags: Flag[] = [];
  const recs: Rec[] = [];
  const strengths: Strength[] = [];
  const P: Record<PillarKey, number> = { audience: 100, pricing: 100, diff: 100 };

  const hit = (
    pillar: PillarKey,
    severity: Severity,
    pts: number,
    block: BlockKey,
    title: string,
    detail: string,
  ) => {
    P[pillar] -= pts;
    flags.push({ pillar, severity, block, title, detail });
  };
  const rec = (pillar: PillarKey, block: BlockKey, title: string, detail: string) => {
    if (!recs.some((r) => r.title === title)) recs.push({ pillar, block, title, detail });
  };
  const good = (pillar: PillarKey, block: BlockKey, title: string) =>
    strengths.push({ pillar, block, title });

  /* Audience & value fit */
  const segs = L("cs");
  if (!segs.length) {
    hit(
      "audience",
      "risk",
      45,
      "cs",
      "No customer segment defined",
      "Without a named buyer, nothing else on the canvas can be tested: price, channel, and message all depend on who pays.",
    );
    rec(
      "audience",
      "cs",
      "Name one paying segment first",
      "Use the pattern “[role] in [place] who [trigger], currently using [workaround]”. Start with the group that feels the pain most often.",
    );
  } else {
    const vagueRe =
      /\b(anyone|anybody|everyone|everybody|all people|general public|all ages|all kinds of|any business|all businesses|any company)\b/i;
    const rangeRe = /\bfrom\s+[\w\s-]{2,30}?\s+to\s+[\w\s-]{2,30}/i;
    let vague = 0;
    segs.forEach((s) => {
      if (vagueRe.test(s) || rangeRe.test(s)) {
        vague++;
        hit(
          "audience",
          "risk",
          20,
          "cs",
          "Segment is too broad",
          `“${s}” bundles people with different needs, budgets, and buying triggers. One message and one price can’t serve all of them.`,
        );
      }
    });
    if (vague)
      rec(
        "audience",
        "cs",
        "Pick one beachhead niche",
        "Choose the sub-group with the sharpest pain and the easiest path to reach, e.g. “first-time investors aged 22–30 in Chișinău earning their first salary”. Expand only after they convert.",
      );
    if (segs.length > 3)
      hit(
        "audience",
        "caution",
        10,
        "cs",
        "Too many segments at once",
        `${segs.length} segments split a small team’s attention. Rank them and keep the top one or two for launch.`,
      );
    const specRe =
      /(\d|\baged?\b|\bin\s+[A-ZȘȚĂÂÎ]|\bwho\b|\bowners?\b|\bmanagers?\b|\bparents?\b|\bstudents?\b|\bfreelancers?\b|\bfounders?\b|\bteachers?\b|\bclinics?\b|\bcaf[eé]s?\b|\bstartups?\b|\bSMEs?\b|\bretailers?\b|\bdoctors?\b|\bnurses?\b)/;
    const specific = segs.filter((s) => specRe.test(s)).length;
    if (specific === 0) {
      hit(
        "audience",
        "caution",
        15,
        "cs",
        "Segments lack defining traits",
        "None of the segments mention a role, location, size, or trigger. Add at least two of these so you can find and count these customers.",
      );
    } else if (!vague) {
      good("audience", "cs", "Segments are specific enough to find and count");
    }
  }

  const vp = L("vp");
  const vpT = T("vp");
  if (!vp.length) {
    hit(
      "audience",
      "risk",
      25,
      "vp",
      "No value proposition",
      "The canvas doesn’t say what customers get. Everything on the left side exists to deliver this box.",
    );
    rec(
      "audience",
      "vp",
      "Write the promise as an outcome",
      "“For [segment], we [measurable outcome] in [time], unlike [their current workaround].”",
    );
  } else {
    const buzz = uniq(
      vpT.match(
        /\b(best|high[- ]quality|innovative|easy[- ]to[- ]use|all[- ]in[- ]one|revolutionary|unique|seamless|cutting[- ]edge|world[- ]class|smart)\b/g,
      ) || [],
    );
    if (buzz.length) {
      hit(
        "audience",
        "caution",
        Math.min(16, 8 * buzz.length),
        "vp",
        "Value proposition leans on adjectives",
        `Words like ${buzz.map((b) => `“${b}”`).join(", ")} are claims every competitor makes. Replace them with the result a customer can check.`,
      );
      rec(
        "audience",
        "vp",
        "Swap adjectives for a checkable result",
        "Instead of “easy-to-use”, say what changes for the customer: time saved, money earned, a step removed, a deadline met.",
      );
    }
    const outcomeRe =
      /(\d|\bsaves?\b|\bcuts?\b|\breduces?\b|\bfaster\b|\bbefore\b|\bwithin\b|\bwithout\b|instead of|\bguarantee|\bturns?\b|\bremoves?\b)/i;
    if (!outcomeRe.test(vpT))
      hit(
        "audience",
        "caution",
        7,
        "vp",
        "No measurable outcome",
        "Add a number, deadline, or before/after contrast so a customer can tell whether you delivered.",
      );
    else good("audience", "vp", "Value proposition states a concrete outcome");
  }
  if (!L("cr").length)
    hit(
      "audience",
      "caution",
      5,
      "cr",
      "Relationship after the first sale is undefined",
      "Repeat purchases usually come from how you treat customers after they buy. Say how you’ll keep them.",
    );

  /* Pricing & revenue viability */
  const revT = T("rev");
  if (!L("rev").length) {
    hit(
      "pricing",
      "risk",
      45,
      "rev",
      "No revenue stream",
      "The canvas doesn’t say who pays, for what, or how often, so viability can’t be judged.",
    );
    rec(
      "pricing",
      "rev",
      "State at least one price point",
      "Write it as “[plan] at [price] per [period/unit]”. A rough number you can test beats no number.",
    );
  } else {
    const prices = parsePrices(revT);
    const isSub = /(\/\s?(mo|month)\b|monthly|per month|subscription)/.test(revT);
    const aiExposed =
      /\b(ai|chatbot|gpt|advice|tips|content|courses?|lessons?|education|learning|templates?|insights?|signals?|analysis|newsletters?|recommendations?|coaching|tutorials?)\b/.test(
        T("vp", "ka", "rev"),
      );
    if (!prices.length)
      hit(
        "pricing",
        "caution",
        15,
        "rev",
        "No price points stated",
        "Without numbers, margin and payback can’t be checked. Add the price for each stream.",
      );
    const low = prices.length ? Math.min(...prices.map((p) => p.eur)) : null;
    if (isSub && low != null && low <= 15) {
      hit(
        "pricing",
        "caution",
        15,
        "rev",
        "Low-tier price leaves thin margins",
        `At about €${fmt(low)}/mo, app-store fees, payment processing, and support can take a large share of each subscription before any marketing spend.`,
      );
      if (aiExposed) {
        hit(
          "pricing",
          "risk",
          15,
          "rev",
          "AI substitution risk at this price",
          "Tips, content, and generic analysis overlap with what general-purpose AI assistants already provide for a similar monthly fee. Customers will ask why they should pay for both.",
        );
        rec(
          "pricing",
          "rev",
          "Price for the part AI can’t do",
          "Build a higher tier around something personal or verified: live group sessions, expert review of the customer’s own plan, local-market data, or accountability. Keep a low tier only as an entry point.",
        );
      }
      rec(
        "pricing",
        "rev",
        "Add an annual plan and a premium tier",
        "An annual plan improves cash flow and retention; a premium tier (2–4× the base price) lifts average revenue per customer without raising the entry price.",
      );
    }
    const paid =
      /\b(ads?|advertising|facebook|instagram|meta|tiktok|google ads|paid|influencers?|sponsored)\b/.test(
        T("ch", "cost"),
      );
    if (paid && isSub && low != null && low <= 25) {
      const months = Math.ceil(ASSUMED_CAC / (low * 0.8));
      hit(
        "pricing",
        "caution",
        10,
        "ch",
        "Paid acquisition pays back slowly",
        `If paid ads cost about €${ASSUMED_CAC} per new subscriber (an illustrative figure; replace it with your own), a €${fmt(low)}/mo plan needs roughly ${months} months to recover that cost, before churn.`,
      );
      rec(
        "pricing",
        "ch",
        "Lower acquisition cost with owned channels",
        "Add a referral reward, partner distribution, or community events so fewer customers arrive through paid ads.",
      );
    }
    if (/\bfree\b|freemium/.test(revT) && !/(upgrade|convert|trial|limit|unlock)/.test(revT)) {
      hit(
        "pricing",
        "caution",
        6,
        "rev",
        "Free tier has no upgrade trigger",
        "Say what makes a free user pay: a usage limit, a locked feature, or a trial end date.",
      );
    }
    if (prices.length >= 2) good("pricing", "rev", "Multiple price points to test");
    if (/\b(annual|yearly|b2b|wholesale|licen[cs]e|contracts?|invoices?|retainer|standing)\b/.test(revT))
      good("pricing", "rev", "Revenue includes committed or B2B terms");
  }
  if (!L("cost").length) {
    hit(
      "pricing",
      "caution",
      12,
      "cost",
      "Costs are not mapped",
      "Margin can’t be estimated without costs. List the biggest fixed costs and the costs that grow with each sale.",
    );
  } else if (/(\d|%)/.test(T("cost"))) {
    good("pricing", "cost", "Costs include rough numbers");
  }

  /* Differentiation & defense */
  const moats = uniq(
    T("kr", "kp", "vp", "cr").match(
      /\b(proprietary|patent\w*|exclusive|own|owned|dataset|data|network|community|licensed|certified|accredited|local|in[- ]person|physical|relationships?|brand|contracts?|trained|recipes?|equipment|ovens?|vans?|dedicated)\b/g,
    ) || [],
  );
  if (!L("kr").length)
    hit(
      "diff",
      "risk",
      15,
      "kr",
      "Key resources are empty",
      "List what you own or control. This is where defensibility comes from.",
    );
  if (!moats.length) {
    hit(
      "diff",
      "risk",
      25,
      "kr",
      "No defensible asset listed",
      "Nothing on the canvas would be hard for a competitor to copy: no owned data, exclusive partner, community, license, or physical asset.",
    );
    rec(
      "diff",
      "kr",
      "Build one asset competitors can’t buy",
      "Options: proprietary data from your users, an exclusive partnership, a local community, certifications, or in-person delivery that software can’t replace.",
    );
  } else if (moats.length >= 3) {
    good("diff", "kr", "Several hard-to-copy assets");
  }

  const repl = uniq(
    T("ka", "vp").match(
      /\b(content|articles?|videos?|tips|templates?|chatbot|gpt|ai[- ]generated|courses?|newsletters?|blog|posts|generic)\b/g,
    ) || [],
  );
  if (repl.length >= 2 && moats.length < 2) {
    hit(
      "diff",
      "risk",
      20,
      "ka",
      "Core activity is easy for AI tools to replicate",
      `Activities built on ${repl.slice(0, 3).map((r) => `“${r}”`).join(", ")} can be generated at near-zero cost by anyone with an AI tool.`,
    );
    rec(
      "diff",
      "ka",
      "Shift effort toward what compounds",
      "Spend less time producing generic content and more on things that get better with each customer: personalized feedback, a member community, or data from real outcomes.",
    );
  }
  if (/\bai[- ]?(powered|driven|based)\b/.test(vpT) && !/\b(data|dataset|proprietary|model)\b/.test(T("kr"))) {
    hit(
      "diff",
      "caution",
      10,
      "vp",
      "“AI-powered” isn’t a moat on its own",
      "Most competitors can call the same models. The advantage has to come from your data, workflow, or customer access, and Key Resources doesn’t list any.",
    );
  }
  if (!L("kp").length) {
    hit(
      "diff",
      "caution",
      10,
      "kp",
      "No key partners",
      "Partners can give you distribution or supply that competitors can’t easily get. Think about who already serves your segment.",
    );
    rec(
      "diff",
      "kp",
      "Find one distribution partner",
      "Look for an organization that already has your segment’s trust (a bank, university, business association, or retailer) and offer them a revenue share.",
    );
  }

  /* Unfinished drafts and duplicates (any block) */
  const PILLAR_OF: Record<BlockKey, PillarKey> = {
    cs: "audience",
    vp: "audience",
    cr: "audience",
    ch: "pricing",
    rev: "pricing",
    cost: "pricing",
    kp: "diff",
    ka: "diff",
    kr: "diff",
  };
  BLOCKS.forEach((b) => {
    const items = L(b.key);
    const drafts = items.filter((x) => /\[[^\]]+\]/.test(x));
    if (drafts.length)
      hit(
        PILLAR_OF[b.key],
        "caution",
        4,
        b.key,
        drafts.length === 1 ? "Draft needs real details" : `${drafts.length} drafts need real details`,
        `Replace the [bracketed] parts in ${drafts.map((d) => `“${d}”`).join(", ")} with your actual numbers, names or terms, or delete the line if it doesn’t apply.`,
      );
    const seen = new Set<string>();
    const dups = uniq(
      items.filter((x) => {
        const k = x.toLowerCase();
        if (seen.has(k)) return true;
        seen.add(k);
        return false;
      }),
    );
    if (dups.length)
      hit(
        PILLAR_OF[b.key],
        "caution",
        2,
        b.key,
        "Repeated input",
        `${dups.map((d) => `“${d}”`).join(", ")} appears more than once. Merge the duplicates.`,
      );
  });

  (Object.keys(P) as PillarKey[]).forEach((k) => {
    P[k] = Math.max(5, Math.min(100, Math.round(P[k])));
  });
  const completeness = filled / BLOCKS.length;
  const overall = Math.round(
    (P.audience * 0.35 + P.pricing * 0.35 + P.diff * 0.3) * (0.55 + 0.45 * completeness),
  );
  flags.sort((a, b) => (a.severity === b.severity ? 0 : a.severity === "risk" ? -1 : 1));
  return { scores: P, overall, filled, completeness, flags, recs, strengths };
}

export type Tone = "good" | "warn" | "risk";

export const statusOf = (s: number): Tone => (s >= 70 ? "good" : s >= 45 ? "warn" : "risk");

export const ratingLabel = (s: number) =>
  s >= 70 ? "High feasibility" : s >= 45 ? "Medium feasibility" : "High risk";

export const TONE: Record<
  Tone,
  { text: string; bg: string; border: string; stroke: string; label: string }
> = {
  good: {
    text: "text-good",
    bg: "bg-goodsoft",
    border: "border-good",
    stroke: "var(--good)",
    label: "Strong",
  },
  warn: {
    text: "text-warn",
    bg: "bg-warnsoft",
    border: "border-warn",
    stroke: "var(--warn)",
    label: "Caution",
  },
  risk: {
    text: "text-risk",
    bg: "bg-risksoft",
    border: "border-risk",
    stroke: "var(--risk)",
    label: "Risk",
  },
};
