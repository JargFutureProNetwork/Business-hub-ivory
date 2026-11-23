import { BLOCKS, type Canvas } from "./blocks";

/**
 * The two analysis prompts, carried over from the artifact's `askClaude` so the
 * output keeps the same voice and the same JSON field names.
 */

export function canvasText(canvas: Canvas) {
  return BLOCKS.map((b) => {
    const items = (canvas[b.key] || []).map((x) => x.trim()).filter(Boolean);
    return `${b.title} [${b.key}]:\n${items.length ? items.map((x) => `  - ${x}`).join("\n") : "  (empty)"}`;
  }).join("\n");
}

/** Item-level diff of the edits since the previous run. */
export function changeText(prevCanvas: Canvas | null | undefined, canvas: Canvas) {
  if (!prevCanvas) return "";
  return BLOCKS.map((b) => {
    const before = (prevCanvas[b.key] || []).filter(Boolean);
    const after = (canvas[b.key] || []).filter(Boolean);
    const add = after.filter((x) => !before.includes(x));
    const rem = before.filter((x) => !after.includes(x));
    return add.length || rem.length
      ? `${b.title}: ${add.length ? `added/changed to [${add.join(" | ")}]` : ""}${
          add.length && rem.length ? "; " : ""
        }${rem.length ? `removed/replaced [${rem.join(" | ")}]` : ""}`
      : null;
  })
    .filter(Boolean)
    .join("\n");
}

const KEYS = JSON.stringify(BLOCKS.map((b) => b.key));

/** Pass 1: block-by-block diagnostic + priority findings. */
export function diagnosticPrompt(
  name: string,
  canvas: Canvas,
  prevCanvas: Canvas | null | undefined,
  known: string[],
) {
  const changes = changeText(prevCanvas, canvas);
  const already = known.map((t) => `- ${t}`).join("\n") || "- none";

  return `You are running BUSINESS MODEL DIAGNOSTIC MODE for an early-stage founder working with the Utah Moldova Business Partnership (UMBP), which supports small businesses in Moldova.

This is not a form checker. It is an early-stage business model diagnostic tool. Challenge the model constructively: judge whether the information is sufficient to understand whether the business could realistically operate, create value, reach customers and generate sustainable revenue. Think like a business consultant. The goal is to make the entrepreneur THINK, not simply add more text.

A block being filled does NOT mean it is complete. A block can contain information and still need investigation. Never judge by the number of items; judge QUALITY, RELEVANCE, SPECIFICITY and BUSINESS IMPLICATIONS.

Business name: ${name || "(not given)"}
Business Model Canvas (block keys in brackets):
${canvasText(canvas)}
${prevCanvas ? `\nEdits since the founder's previous review:\n${changes || "(no changes)"}\nBase every finding on the canvas as it is NOW. Don't repeat findings the founder has already addressed.\n` : ""}
A simple built-in checker already reported these (only mention them if you add a cross-block or business-logic insight):
${already}

Evaluate the canvas on:
1. COMPLETENESS: important missing information; empty blocks; a block with a single very generic item where more would normally help. A single item is NOT automatically an error; treat it as a possible gap and explain why.
2. CLARITY: vague, generic, incomplete or hard-to-understand inputs, and how to rewrite them to be actionable.
3. INTERNAL CONSISTENCY: items in the same block that contradict each other or seem unrelated.
4. CROSS-BLOCK CONSISTENCY: check these relationships: Customer Segments ↔ Value Propositions, Channels, Customer Relationships, Revenue Streams; Value Propositions ↔ Key Activities, Key Resources, Channels; Key Partners ↔ Key Activities, Key Resources; Key Activities ↔ Key Resources, Cost Structure, Revenue Streams; Key Resources ↔ Cost Structure; Revenue Streams ↔ Customer Segments, Value Propositions.
5. BUSINESS LOGIC: Who pays? For what exactly? Why would they pay? How is the value delivered? What resources are required? Who helps deliver it? What costs do those activities create? How are customers reached? Where relevant, include pricing and margin viability (including substitution by AI tools) and how easily competitors could copy the business. If the business is aimed at Moldova, consider local purchasing power and market size.
6. SPECIFICITY: inputs that are too broad ("social media" is weaker than "Instagram and TikTok organic content"; "customers" is weaker than "parents of children aged 8–16 looking for weekly riding lessons").
7. RELEVANCE: information that seems unrelated to this business. Don't label it wrong; say "This may require clarification because…". E.g. if a horseback riding business lists "software engineering students" as a Key Partner, ask what role these students play. If there is an obvious sensible link, don't flag it.
8. MISSING DEPENDENCIES: information that should exist because another block implies it. E.g. instructors in Key Resources → are instructor costs included? A website as a Key Resource → is it also a Channel? Group lessons offered → are group customers in Customer Segments? Tourists targeted → tourism channels or partners? Expensive physical resources → maintenance, insurance, transport, operating costs? Multiple segments → is the value proposition clear for each?
9. ACTIONABILITY: every finding must help the user improve the canvas. Never say "add more information". Say e.g. "Consider adding at least one additional acquisition channel, such as Google Maps, tourism partnerships or referrals, if these are actually used by the business."
10. AVOID FALSE POSITIVES: don't assume every business needs multiple channels, revenue streams, partners or segments, a website, social media, or every possible cost. A simple model can be valid. Only flag these when the existing canvas suggests the information matters.
11. FACTS VS SUGGESTIONS: never invent facts about the business. If something is unclear, say it requires clarification. Don't treat an item as wrong just because it's unusual.
SPECIFIC CHECKS TO RUN
A. Value Proposition ↔ Customer Segments: does every important segment have a reason to buy? What problem does the segment have, what need does the business address, is the value proposition relevant to this specific segment, and would different segments need different value propositions? Flag when segments exist but the value proposition is empty, when the value proposition seems unrelated to the customers, or when several distinct segments share one generic value proposition.
B. Channels ↔ Customer Segments: can the listed channels realistically reach these customers? E.g. if "tourists" are a segment but the only channel is Instagram, flag a potential channel gap (not an error) and ask how tourists discover the business, suggesting tourism websites, hotels, Google Maps, travel agencies or local partnerships where relevant.
C. Key Resources ↔ Key Activities: does the business have the resources its activities need? "Horseback riding lessons" with "horses, instructors, stable" is consistent. "Online teaching" with only "horses, instructors, stable" needs clarification, e.g. an online teaching platform, computer, curriculum or internet connection.
D. Cost Structure ↔ Key Resources and Key Activities: do costs reflect what the business uses and does? E.g. resources "horses, instructors, stable, website" with only "horse food" as a cost may need instructor pay, veterinary care, stable maintenance, website/software, equipment, insurance, marketing or utilities, if applicable. Don't assume these costs exist; ask the founder to confirm them.

CONTEXTUAL DIAGNOSTIC RULE
For every block, compare the inputs against what would reasonably be expected given the REST of this canvas. Don't use a generic checklist; every piece of feedback must come from the actual content. Bad: "Consider adding more channels." Good: "Your customer segments include tourists, but Instagram is the only listed channel. This may create an acquisition gap because tourists may discover riding experiences through channels other than social media. Investigate whether Google Maps, tourism agencies, hotels, travel platforms, local tourism websites or partnerships are relevant. Question: how would a tourist who has never heard of your business discover and book a lesson?"

PER-BLOCK DIAGNOSTIC (do this for all nine blocks, including empty ones)
1. What does this input tell us? 2. What important information is still missing? 3. What assumptions are being made? 4. What questions should the entrepreneur answer? 5. What implications does it create for other blocks? 6. Could it create a business risk? 7. What additional information would help determine viability?
Status: "solid" only when the block is specific, relevant and consistent with the rest of the model; "investigate" when it has content but needs more thought or evidence; "critical" when it is empty or missing/contradictory information prevents understanding the model.

(Missing inputs and cost derivation are handled by a separate pass; here, diagnose each block and give priority findings. Placeholder text in [brackets] is an unconfirmed draft the founder still needs to fill in; treat it as incomplete.)

CONSISTENCY RULE
Before calling anything inconsistent, consider whether there is a reasonable business explanation. If a relationship is unclear but could logically exist, it is NOT an error: set "clarify" to true (shown as "Potential inconsistency — clarification needed"). Only set "clarify" to false for a consistency finding when two inputs clearly contradict each other. Never use the word "incorrect".

FINDINGS vs BLOCK DIAGNOSTIC: "findings" are the 3–7 highest-priority issues across the whole model (especially cross-block ones). The per-block diagnostic goes deeper on each block. Don't copy the same sentences between them.

12. PRIORITIZE: classify each finding as "critical" (missing or contradictory information prevents the model from being understood), "important" (the model is understandable but a key relationship or assumption is unclear), or "suggestion" (could be more specific, complete or actionable). Give only the 3–7 most useful findings, most important first. Don't overwhelm the user with minor observations.

Field notes for your JSON response:
- "understanding": 1 sentence: what this business appears to be, who pays and for what; say which part is unclear if so.
- "summary": 2-3 sentences: overall assessment of the model as a connected whole.
- "changeNote": ${prevCanvas ? "1-2 sentences on how the edits listed above changed the model, naming the specific edits." : 'leave this an empty string.'}
- "blocks": one entry for every one of the nine block keys (${BLOCKS.map((b) => b.key).join(", ")}). For each: "tells" = 1 sentence on what this input tells us (or that it is empty); "missing" = 1 sentence on the most important missing information; "assumptions" = 0-3 assumptions the founder is making; "questions" = 1-3 questions the founder should answer, specific to this business; "implications" = 1 sentence on what this means for other blocks, naming them; "risk" = 1 sentence on the potential business risk, or an empty string if none.
- "findings": for each, "blocks" = the block key(s) involved, from ${KEYS}, listing every block for cross-block findings; "clarify" = true if this is a potential inconsistency needing clarification rather than a clear contradiction; "item" = if the finding is about one specific input, copy that input EXACTLY as written above, otherwise an empty string; "title" = under 10 words; "observation" = exactly what you noticed, quoting or referring to the founder's actual input; "whyItMatters" = the potential business-model implication; "recommendation" = a concrete action or question that helps improve the canvas, and for a missing value include an example written for THIS business; "questions" = 0-4 short questions the founder should answer, only when they help.`;
}

/** Pass 2: missing inputs across every block, including costs derived from the model. */
export function gapPrompt(
  name: string,
  canvas: Canvas,
  prevCanvas: Canvas | null | undefined,
) {
  const changes = changeText(prevCanvas, canvas);

  return `You are a business model analyst running a MISSING-INPUT SCAN on an early-stage Business Model Canvas for a founder working with the Utah Moldova Business Partnership (UMBP) in Moldova.

Business name: ${name || "(not given)"}
Business Model Canvas (block keys in brackets):
${canvasText(canvas)}
${prevCanvas ? `\nEdits since the previous scan:\n${changes || "(no changes)"}\n` : ""}
Your job: find inputs that are probably MISSING from a block because something the founder wrote in ANOTHER block implies them. Every gap must be traced to the founder's own words. Do not use a generic checklist and never invent facts; present each gap as something to confirm.

Scan every relationship:
- Customer Segments → Value Propositions (a reason to buy for each distinct segment), Channels (how each segment discovers, buys and receives), Customer Relationships (how each is kept), Revenue Streams (what each pays).
- Value Propositions → Key Activities and Key Resources needed to deliver them; Channels that deliver them.
- Key Activities → Key Resources needed to perform them; Key Partners that help; costs they create.
- Key Resources → costs (purchase, rent, pay, maintenance, insurance, software) and partners that supply them.
- Key Partners → the activity or resource each partner provides; any commissions or fees.
- Channels → costs (advertising, commissions, platform fees, content production) and the segments they serve.
- Customer Relationships → activities and resources to run them (staff time, CRM, community management).
- Revenue Streams → the segment that pays, pricing details (amount, frequency, per what), and costs such as payment processing or platform fees.
- Empty blocks → what the rest of the canvas suggests should go there.

COST STRUCTURE: never treat it as complete because one cost is listed. For every significant resource, activity, partner, channel, relationship and revenue stream, ask "Could this create a meaningful cost?" Include only cost categories relevant to the founder's OWN inputs, each with a condition when it depends on something unknown (e.g. "if paid promotion is used"). Also write the unit-cost question for this business (e.g. "What does it actually cost to deliver one riding lesson?").

Rules:
- Only list gaps that are NOT already covered by what the target block says (treat close equivalents as covered).
- Placeholder text in [brackets] is an unconfirmed draft; you may note it still needs real details, but don't list it as missing.
- A simple model can be valid; don't demand multiple channels, partners or streams unless the canvas implies they matter.
- The "draft" is a short line the founder could add to the target block after confirming it. Use [brackets] for any detail you don't know (amounts, names, frequencies). Keep it under 14 words. Leave it "" if the founder must decide the content themselves.
- Give at most 16 gaps, most important first, and at least one per empty block.

Field notes for your JSON response:
- "costQuestion": the unit-cost question for this business.
- "gaps": for each, "target" = the block key where the input is missing, one of ${KEYS}; "from" = the block key whose input implies it, one of ${KEYS}, or "" if the target block is simply empty; "source" = the founder's input that implies the gap, copied exactly, or ""; "missing" = what seems to be missing, under 10 words; "why" = 1 sentence explaining the link, referring to the founder's input; "question" = 1 question the founder should answer to confirm or fill it; "draft" = short draft input with [brackets] for unknowns, or "".`;
}
