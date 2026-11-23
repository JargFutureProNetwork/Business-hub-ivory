import { GoogleGenAI, Type, type Schema } from "@google/genai";
import { BLOCKS } from "./blocks";
import { DIAG_STATUS, PRIORITY, TYPE_LABEL } from "./ai-types";
import { withRetry } from "./retry";

export const GEMINI_MODEL = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";

let client: GoogleGenAI | null = null;

export function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!client) client = new GoogleGenAI({ apiKey });
  return client;
}

const str = { type: Type.STRING } as Schema;
const strList = { type: Type.ARRAY, items: str } as Schema;
const enumOf = (values: string[]) => ({ type: Type.STRING, enum: values }) as Schema;

const BLOCK_KEY_ENUM = BLOCKS.map((b) => b.key);
const blockKey = enumOf(BLOCK_KEY_ENUM);
/**
 * "from" may be an empty string when the target block is simply empty, and
 * Gemini rejects an empty member in an enum, so it stays a plain string here.
 * `normalizeGaps` drops anything that isn't a real block key.
 */
const blockKeyOrBlank = str;

const BLOCK_DIAGNOSTIC: Schema = {
  type: Type.OBJECT,
  required: [
    "status",
    "tells",
    "missing",
    "assumptions",
    "questions",
    "implications",
    "risk",
  ],
  properties: {
    status: enumOf(Object.keys(DIAG_STATUS)),
    tells: str,
    missing: str,
    assumptions: strList,
    questions: strList,
    implications: str,
    risk: str,
  },
};

export const DIAGNOSTIC_SCHEMA: Schema = {
  type: Type.OBJECT,
  required: ["understanding", "summary", "changeNote", "blocks", "findings"],
  properties: {
    understanding: str,
    summary: str,
    changeNote: str,
    blocks: {
      type: Type.OBJECT,
      required: BLOCK_KEY_ENUM,
      properties: Object.fromEntries(
        BLOCK_KEY_ENUM.map((k) => [k, BLOCK_DIAGNOSTIC]),
      ) as Record<string, Schema>,
    },
    findings: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        required: [
          "blocks",
          "type",
          "severity",
          "clarify",
          "item",
          "title",
          "observation",
          "whyItMatters",
          "recommendation",
          "questions",
        ],
        properties: {
          blocks: { type: Type.ARRAY, items: blockKey },
          type: enumOf(Object.keys(TYPE_LABEL)),
          severity: enumOf(Object.keys(PRIORITY)),
          clarify: { type: Type.BOOLEAN },
          item: str,
          title: str,
          observation: str,
          whyItMatters: str,
          recommendation: str,
          questions: strList,
        },
      },
    },
  },
};

export const GAP_SCHEMA: Schema = {
  type: Type.OBJECT,
  required: ["costQuestion", "gaps"],
  properties: {
    costQuestion: str,
    gaps: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        required: [
          "target",
          "from",
          "source",
          "missing",
          "why",
          "question",
          "draft",
          "severity",
        ],
        properties: {
          target: blockKey,
          from: blockKeyOrBlank,
          source: str,
          missing: str,
          why: str,
          question: str,
          draft: str,
          severity: enumOf(Object.keys(PRIORITY)),
        },
      },
    },
  },
};

/** Calls Gemini with a response schema and returns the parsed JSON. */
export async function generateJson(prompt: string, schema: Schema): Promise<unknown> {
  const ai = getClient();
  if (!ai) throw new Error("missing_api_key");

  const res = await withRetry(() =>
    ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: prompt,
    config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.4,
      },
    }),
  );

  const text = res.text;
  if (!text) throw new Error("invalid_json");
  try {
    return JSON.parse(text);
  } catch {
    throw new Error("invalid_json");
  }
}
