import { Calculator, LayoutGrid, PenLine, type LucideIcon } from "lucide-react";

/**
 * Every tool the hub offers. The dashboard cards, the header navigation and
 * the per-tool pages all read from this list, so a new tool is added here once.
 *
 * `kind: "native"` tools are React pages in this app. `kind: "embedded"` tools
 * are the original standalone HTML apps served from `public/tools/` and shown
 * in a same-origin frame, so their code runs unchanged.
 */
export type Tool = {
  slug: string;
  href: string;
  name: string;
  short: string;
  tagline: string;
  description: string;
  features: string[];
  icon: LucideIcon;
  category: string;
  kind: "native" | "embedded";
  /** For embedded tools: the standalone file, also usable in its own tab. */
  src?: string;
};

export const TOOLS: Tool[] = [
  {
    slug: "canvas",
    href: "/canvas",
    name: "Canvas Lab",
    short: "Canvas Lab",
    tagline: "Business Model Canvas with a live feasibility score",
    description:
      "Map your business on the nine-block canvas, watch the feasibility score update as you type, and run an AI diagnostic that flags weak assumptions and missing inputs.",
    features: [
      "Guided prompts and worked examples for all nine blocks",
      "Live score for audience fit, pricing and differentiation",
      "AI block-by-block diagnostic and missing-input scan",
      "Export as a PNG image or copy as Markdown",
    ],
    icon: LayoutGrid,
    category: "Strategy",
    kind: "native",
  },
  {
    slug: "price-builder",
    href: "/price-builder",
    name: "Price Builder",
    short: "Price Builder",
    tagline: "Set a price that covers delivery, ads and profit",
    description:
      "Enter fulfilment costs, customer acquisition costs and a target margin. The recommended price updates instantly, with a breakdown and a reality check.",
    features: [
      "Fulfilment, CAC and profit built into one price",
      "CAC from cost per click, leads and paying customers",
      "Price breakdown chart and reality check",
      "Download the full model as an Excel workbook",
    ],
    icon: Calculator,
    category: "Finance",
    kind: "embedded",
    src: "/tools/price-builder.html",
  },
  {
    slug: "uvp",
    href: "/uvp",
    name: "UVP & Copy Workbench",
    short: "UVP Workbench",
    tagline: "Turn one clear idea into a full set of marketing copy",
    description:
      "Describe your customer, their pain and your product. Get value propositions, Instagram and TikTok bios, website hero copy, hooks and ads, written natively in four languages.",
    features: [
      "Interface and copy in English, Romanian, Russian and Ukrainian",
      "AI copywriter, with offline templates as a fallback",
      "UVPs, social bios, hero copy, hooks, PAS and AIDA ads",
      "Copy any piece or download everything as CSV",
    ],
    icon: PenLine,
    category: "Marketing",
    kind: "embedded",
    src: "/tools/uvp-workbench.html",
  },
];

export const TOOL_BY_SLUG = Object.fromEntries(TOOLS.map((t) => [t.slug, t])) as Record<
  string,
  Tool
>;
