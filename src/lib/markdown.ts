import { BLOCKS, BLOCK_BY_KEY, type Canvas, type Meta } from "./blocks";
import { PILLARS, TONE, ratingLabel, statusOf, type PillarKey, type Report } from "./audit";
import { DIAG_STATUS, PRIORITY, TYPE_LABEL, type AiResult } from "./ai-types";

export function buildMarkdown(
  name: string,
  canvas: Canvas,
  report: Report | null,
  ai: AiResult | null,
  meta: Partial<Meta> = {},
) {
  const lines = [
    `# ${name || "Untitled business"}`,
    "",
    `Designed by: ${meta.by || "-"} | Date: ${meta.date || "-"} | Version: ${meta.version || "-"}`,
    "",
    `_Business Model Canvas and feasibility audit, generated with UMBP Canvas Lab on ${new Date().toLocaleDateString()}._`,
    "",
    "## Business Model Canvas",
    "",
  ];

  BLOCKS.forEach((b) => {
    lines.push(`### ${b.title}`);
    const items = (canvas[b.key] || []).filter((s) => s.trim());
    lines.push(...(items.length ? items.map((i) => `- ${i}`) : ["- _(empty)_"]), "");
  });

  if (report) {
    lines.push(
      "## Feasibility audit",
      "",
      `**Overall: ${report.overall}% (${ratingLabel(report.overall)})**, canvas ${report.filled}/9 complete`,
      "",
    );
    (Object.entries(PILLARS) as [PillarKey, { label: string }][]).forEach(([k, p]) =>
      lines.push(
        `- ${p.label}: ${report.scores[k]}% (${TONE[statusOf(report.scores[k])].label})`,
      ),
    );
    lines.push("", "### Red flags and vulnerabilities", "");
    if (!report.flags.length) lines.push("- None found.");
    report.flags.forEach((f) =>
      lines.push(
        `- **[${f.severity === "risk" ? "Risk" : "Caution"}] ${f.title}** (${BLOCK_BY_KEY[f.block].title}): ${f.detail}`,
      ),
    );
    lines.push("", "### Recommendations", "");
    report.recs.forEach((r) =>
      lines.push(`- **${r.title}** (${BLOCK_BY_KEY[r.block].title}): ${r.detail}`),
    );
    if (report.strengths.length) {
      lines.push("", "### Strengths", "");
      report.strengths.forEach((s) => lines.push(`- ${s.title}`));
    }
  }

  if (ai) {
    lines.push("", "## AI validation review", "");
    if (ai.understanding) lines.push(`**How the business reads:** ${ai.understanding}`, "");
    if (ai.changeNote) lines.push(`**What the latest edits changed:** ${ai.changeNote}`, "");
    if (ai.summary) lines.push(ai.summary, "");

    if (ai.blocks && Object.keys(ai.blocks).length) {
      lines.push("### Block-by-block diagnostic", "");
      BLOCKS.forEach((b) => {
        const d = ai.blocks[b.key];
        if (!d) return;
        lines.push(`#### ${b.title}: ${DIAG_STATUS[d.status]?.label || d.status}`);
        if (d.tells) lines.push(`- **What this tells us:** ${d.tells}`);
        if (d.missing) lines.push(`- **Still missing:** ${d.missing}`);
        d.assumptions.forEach((a) => lines.push(`- **Assumption:** ${a}`));
        d.questions.forEach((q) => lines.push(`- **Question:** ${q}`));
        if (d.implications) lines.push(`- **Implications:** ${d.implications}`);
        if (d.risk) lines.push(`- **Risk:** ${d.risk}`);
        lines.push("");
      });
    }

    if (ai.gaps.length) {
      lines.push("### Possible missing inputs", "");
      if (ai.costQuestion) lines.push(`**${ai.costQuestion}**`, "");
      BLOCKS.forEach((b) => {
        const gs = ai.gaps.filter((g) => g.target === b.key);
        if (!gs.length) return;
        lines.push(`#### ${b.title}`);
        gs.forEach((g) =>
          lines.push(
            `- **${g.missing}** [${PRIORITY[g.severity].label}]${
              g.from
                ? ` (implied by ${BLOCK_BY_KEY[g.from].title}${g.source ? `: “${g.source}”` : ""})`
                : ""
            }. ${g.why} _Question:_ ${g.question}${g.draft ? ` _Draft:_ ${g.draft}` : ""}`,
          ),
        );
        lines.push("");
      });
    }

    if (ai.findings.length) lines.push("### Priority findings", "");
    ai.findings.forEach((f, i) => {
      const blocks = f.blocks
        .map((k) => BLOCK_BY_KEY[k]?.title)
        .filter(Boolean)
        .join(" ↔ ");
      lines.push(`### ${i + 1}. ${f.title}`, "");
      lines.push(
        `- **Block:** ${blocks || "-"}`,
        `- **Type:** ${TYPE_LABEL[f.type] || f.type}`,
        `- **Severity:** ${PRIORITY[f.priority].label}${f.clarify ? " (Potential inconsistency — clarification needed)" : ""}`,
      );
      if (f.item) lines.push(`- **Input:** “${f.item}”`);
      lines.push(
        `- **Observation:** ${f.observation}`,
        `- **Why it matters:** ${f.whyItMatters}`,
        `- **Recommendation:** ${f.recommendation}`,
      );
      if (f.questions.length) {
        lines.push("- **Questions:**");
        f.questions.forEach((q) => lines.push(`  - ${q}`));
      }
      lines.push("");
    });
  }

  return lines.join("\n");
}
