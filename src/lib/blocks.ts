import {
  Handshake,
  Workflow,
  Boxes,
  Gift,
  HeartHandshake,
  Megaphone,
  Users,
  Receipt,
  Coins,
  type LucideIcon,
} from "lucide-react";

export type BlockKey =
  | "kp"
  | "ka"
  | "kr"
  | "vp"
  | "cr"
  | "ch"
  | "cs"
  | "cost"
  | "rev";

export type Block = {
  key: BlockKey;
  title: string;
  icon: LucideIcon;
  /** CSS class that places the block in `.bmc-grid` at >=1100px. */
  area: string;
  question: string;
  prompts: string[];
  example: string[];
};

/** Each block holds a list of short items, not one blob of text. */
export type Canvas = Record<BlockKey, string[]>;

export const BLOCKS: Block[] = [
  {
    key: "kp",
    title: "Key Partners",
    icon: Handshake,
    area: "area-kp",
    question:
      "Who do you rely on to deliver the business that you can’t or shouldn’t do yourself?",
    prompts: [
      "Supplier: [name/type] provides [input] on [terms]",
      "Distribution partner: [who] gives access to [customers]",
      "Strategic ally: [organization] because [shared goal]",
    ],
    example: [
      "Local flour mill with a fixed-price supply contract",
      "Office-park property managers who introduce us to tenants",
    ],
  },
  {
    key: "ka",
    title: "Key Activities",
    icon: Workflow,
    area: "area-ka",
    question:
      "What must you do every week, really well, for the value proposition to work?",
    prompts: [
      "Production: [what you make] every [frequency]",
      "Operations: [process] that keeps [promise]",
      "Sales: [activity] to win [segment]",
    ],
    example: ["Overnight baking for 6:30 dispatch", "Morning delivery route planning"],
  },
  {
    key: "kr",
    title: "Key Resources",
    icon: Boxes,
    area: "area-kr",
    question:
      "Which assets do you own or control that a competitor would struggle to copy?",
    prompts: [
      "Physical: [equipment/location] we own",
      "Intellectual: [data/recipes/know-how] built over [time]",
      "Human: [skilled people] trained in [skill]",
      "Relationships: exclusive access to [network]",
    ],
    example: ["Own bakery with two deck ovens", "Family recipes and trained bakers"],
  },
  {
    key: "vp",
    title: "Value Propositions",
    icon: Gift,
    area: "area-vp",
    question:
      "What measurable outcome do you deliver, for which segment, better than their current workaround?",
    prompts: [
      "For [segment], we [outcome] in [time/amount], unlike [current workaround]",
      "We remove [specific pain] by [mechanism]",
      "Guarantee: [promise] or [remedy]",
    ],
    example: [
      "Fresh pastries at the office before 8:30, ordered by 16:00 the day before",
      "Turns office breakfast admin into one standing weekly order",
    ],
  },
  {
    key: "cr",
    title: "Customer Relationships",
    icon: HeartHandshake,
    area: "area-cr",
    question: "How do you win, keep, and grow each customer after the first sale?",
    prompts: [
      "Personal: dedicated [contact] for each [customer]",
      "Community: [members] meet/share via [format]",
      "Self-service with [support] when stuck",
    ],
    example: [
      "Dedicated account contact per office",
      "Standing weekly orders with easy swaps",
    ],
  },
  {
    key: "ch",
    title: "Channels",
    icon: Megaphone,
    area: "area-ch",
    question:
      "Where do customers first hear about you, buy from you, and get the product?",
    prompts: [
      "Awareness: [channel] reaching [segment]",
      "Sales: [how orders are placed]",
      "Delivery: [how the product arrives]",
    ],
    example: [
      "Direct sales visits to office parks",
      "WhatsApp ordering",
      "Referral discount for cafés",
    ],
  },
  {
    key: "cs",
    title: "Customer Segments",
    icon: Users,
    area: "area-cs",
    question:
      "Who exactly pays you? Name a role, a place, and the trigger that makes them buy.",
    prompts: [
      "[Role/type] in [place] who [trigger/problem], currently using [workaround]",
      "Size: roughly [number] of them in [market]",
      "Buyer vs. user: [who pays] for [who uses]",
    ],
    example: [
      "Office managers at Chișinău companies with 20–80 staff who order team breakfasts",
      "Cafés in Centru and Botanica that don’t bake in-house",
    ],
  },
  {
    key: "cost",
    title: "Cost Structure",
    icon: Receipt,
    area: "area-cost",
    question: "What are your biggest costs, and which ones grow with every sale?",
    prompts: [
      "Variable: [cost] at about [% or amount] per sale",
      "Fixed: [cost] of [amount] per month",
      "Acquisition: about [amount] to win one customer",
    ],
    example: ["Ingredients (variable, ~35% of revenue)", "Staff wages and delivery fuel"],
  },
  {
    key: "rev",
    title: "Revenue Streams",
    icon: Coins,
    area: "area-rev",
    question: "What do customers pay for, how much, and how often?",
    prompts: [
      "[Plan name] at [price] per [month/order/unit]",
      "Upsell: [add-on] at [price]",
      "Contract terms: [annual/B2B/wholesale] with [payment terms]",
    ],
    example: [
      "Weekly office plan from 450 MDL per 20 portions",
      "Wholesale café pricing on 30-day invoices",
    ],
  },
];

export const BLOCK_KEYS = BLOCKS.map((b) => b.key);

export const BLOCK_BY_KEY = Object.fromEntries(
  BLOCKS.map((b) => [b.key, b]),
) as Record<BlockKey, Block>;

export const EMPTY: Canvas = Object.fromEntries(
  BLOCKS.map((b) => [b.key, [] as string[]]),
) as Canvas;

export const isBlockKey = (v: unknown): v is BlockKey =>
  typeof v === "string" && v in BLOCK_BY_KEY;

export type Meta = { by: string; date: string; version: string };

export const EXAMPLES: Record<string, { name: string; canvas: Canvas }> = {
  investing: {
    name: "PocketInvest — investing learning app",
    canvas: {
      kp: [],
      ka: ["Creating daily investing content and short videos", "Maintaining the mobile app"],
      kr: ["Mobile app", "Small content team"],
      vp: ["AI-powered investing tips and market insights", "Easy-to-use, all-in-one learning app"],
      cr: ["Automated chatbot support"],
      ch: ["Instagram and TikTok ads", "App Store listing"],
      cs: ["Anyone interested in investing, from beginners to pro investors"],
      cost: ["App development", "Paid social ads"],
      rev: ["Premium subscription at €10/mo", "Free tier with limited tips"],
    },
  },
  bakery: {
    name: "Morning Crust — office breakfast delivery",
    canvas: {
      kp: [
        "Local flour mill with a fixed-price supply contract",
        "Office-park property managers who introduce us to tenants",
      ],
      ka: [
        "Overnight baking for 6:30 dispatch",
        "Morning delivery route planning",
        "Seasonal menu development",
      ],
      kr: [
        "Own bakery with two deck ovens",
        "Two delivery vans",
        "Family recipes and trained bakers",
      ],
      vp: [
        "Fresh pastries at the office before 8:30, ordered by 16:00 the day before",
        "Turns office breakfast admin into one standing weekly order",
      ],
      cr: ["Dedicated account contact per office", "Standing weekly orders with easy swaps"],
      ch: [
        "Direct sales visits to office parks",
        "WhatsApp ordering",
        "Referral discount for cafés",
      ],
      cs: [
        "Office managers at Chișinău companies with 20–80 staff who order team breakfasts",
        "Cafés in Centru and Botanica that don’t bake in-house",
      ],
      cost: [
        "Ingredients (variable, ~35% of revenue)",
        "Staff wages",
        "Fuel and van maintenance",
        "Equipment depreciation",
      ],
      rev: [
        "Weekly office plan from 450 MDL per 20 portions",
        "Wholesale café pricing on 30-day invoices",
        "Catering add-ons for events",
      ],
    },
  },
};
