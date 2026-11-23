"use client";

import { statusOf, TONE } from "@/lib/audit";
import type { BlockDiagnostic } from "@/lib/ai-types";

export function Meter({ value, size = 132, stroke = 12 }: { value: number; size?: number; stroke?: number }) {
  const r = (size - stroke) / 2,
    c = 2 * Math.PI * r;
  const tone = TONE[statusOf(value)];
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      role="img"
      aria-label={`Feasibility ${value} percent`}
    >
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--line)" strokeWidth={stroke} />
      <circle
        className="meter-arc"
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={tone.stroke}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - value / 100)}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="central"
        fill="var(--ink)"
        style={{ font: `700 ${size / 4}px Fraunces, Georgia, serif` }}
      >
        {value}%
      </text>
    </svg>
  );
}

export function Bar({ value }: { value: number }) {
  const t = TONE[statusOf(value)];
  return (
    <div className="h-2 w-full rounded-full bg-surface2 overflow-hidden" aria-hidden="true">
      <div
        className="h-full rounded-full"
        style={{ width: `${value}%`, background: t.stroke, transition: "width .8s ease" }}
      />
    </div>
  );
}

/** One labelled section of a block diagnostic; renders nothing when empty. */
function Sec({ label, children }: { label: string; children?: React.ReactNode }) {
  if (!children) return null;
  return (
    <div>
      <p className="text-[11px] font-bold text-muted">{label}</p>
      <div className="text-sm leading-relaxed mt-0.5">{children}</div>
    </div>
  );
}

const bullets = (arr: string[]) =>
  arr.length ? (
    <ul className="list-disc pl-5 space-y-0.5">
      {arr.map((x, i) => (
        <li key={i}>{x}</li>
      ))}
    </ul>
  ) : null;

export function DiagnosticBody({ d, compact }: { d: BlockDiagnostic; compact?: boolean }) {
  return (
    <div className={`grid gap-3 ${compact ? "" : "md:grid-cols-2"}`}>
      <Sec label="What this tells us">{d.tells}</Sec>
      <Sec label="What’s still missing">{d.missing}</Sec>
      <Sec label="Assumptions being made">{bullets(d.assumptions)}</Sec>
      <Sec label="Questions to answer">{bullets(d.questions)}</Sec>
      <Sec label="Implications for other blocks">{d.implications}</Sec>
      <Sec label="Potential risk">{d.risk}</Sec>
    </div>
  );
}
