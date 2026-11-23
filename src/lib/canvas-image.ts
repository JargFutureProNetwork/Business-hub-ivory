import { BLOCKS, type BlockKey, type Canvas, type Meta } from "./blocks";

/**
 * Draws the canvas as a fixed 2400x1700 PNG with Canvas 2D (no html2canvas), so
 * the export looks the same on every device. Block icons are lifted from the
 * hidden `#icon-src` node the page renders, which keeps the Lucide artwork
 * without bundling a second copy of it.
 */

const IMG = {
  W: 2400,
  H: 1700,
  M: 60,
  ink: "#000000",
  muted: "#56565C",
  /** Brand red, used for the bullets and the value-proposition rule. */
  gold: "#C10926",
  paper: "#FFFFFF",
};

/** [column, row, colSpan, rowSpan] on a 10-column, 3-row grid. */
const CELLS: Record<BlockKey, [number, number, number, number]> = {
  kp: [0, 0, 2, 2],
  ka: [2, 0, 2, 1],
  kr: [2, 1, 2, 1],
  vp: [4, 0, 2, 2],
  cr: [6, 0, 2, 1],
  ch: [6, 1, 2, 1],
  cs: [8, 0, 2, 2],
  cost: [0, 2, 5, 1],
  rev: [5, 2, 5, 1],
};

function wrapLines(ctx: CanvasRenderingContext2D, text: string, maxW: number) {
  const words = String(text).split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let line = "";
  words.forEach((w) => {
    const test = line ? line + " " + w : w;
    if (ctx.measureText(test).width > maxW && line) {
      lines.push(line);
      line = w;
    } else line = test;
  });
  if (line) lines.push(line);
  return lines;
}

/** Loads a same-origin image; resolves to null rather than throwing on failure. */
function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((res) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = () => res(null);
    img.src = src;
  });
}

function loadIcon(key: BlockKey): Promise<HTMLImageElement | null> {
  const svg = document.querySelector(`#icon-src [data-key="${key}"] svg`);
  if (!svg) return Promise.resolve(null);
  const markup = svg.outerHTML.replace(/currentColor/g, IMG.ink);
  return new Promise((res) => {
    const img = new Image();
    img.onload = () => res(img);
    img.onerror = () => res(null);
    img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(markup);
  });
}

export async function renderCanvasPNG(name: string, meta: Meta, canvas: Canvas) {
  try {
    await Promise.all(
      ["700 40px Fraunces", "400 24px Manrope", "600 24px Manrope", "italic 400 18px Manrope"].map(
        (f) => document.fonts.load(f),
      ),
    );
  } catch {
    /* fonts fall back to the generic family */
  }

  const { W, H, M } = IMG;
  const cv = document.createElement("canvas");
  cv.width = W;
  cv.height = H;
  const ctx = cv.getContext("2d");
  if (!ctx) throw new Error("canvas unavailable");
  ctx.fillStyle = "#F0F0F2";
  ctx.fillRect(0, 0, W, H);

  // Header: title + meta boxes
  ctx.fillStyle = IMG.ink;
  ctx.textBaseline = "alphabetic";
  const metaDefs: [string, string, number][] = [
    ["Designed for", name, 520],
    ["Designed by", meta.by, 380],
    ["Date", meta.date, 200],
    ["Version", meta.version, 150],
  ];
  let mx =
    W - M - metaDefs.reduce((a, d) => a + d[2], 0) - 16 * (metaDefs.length - 1);
  let tSize = 64;
  do {
    ctx.font = `700 ${tSize}px Fraunces, Georgia, serif`;
    tSize -= 2;
  } while (ctx.measureText("The Business Model Canvas").width > mx - M - 40 && tSize > 30);
  ctx.fillText("The Business Model Canvas", M, 150);

  metaDefs.forEach(([label, val, w]) => {
    ctx.fillStyle = IMG.paper;
    ctx.fillRect(mx, 70, w, 96);
    ctx.strokeStyle = "#D9D9DE";
    ctx.lineWidth = 2;
    ctx.strokeRect(mx, 70, w, 96);
    ctx.fillStyle = IMG.muted;
    ctx.font = "italic 400 20px Manrope, sans-serif";
    ctx.fillText(label + ":", mx + 16, 102);
    ctx.fillStyle = IMG.ink;
    ctx.font = "600 26px Manrope, sans-serif";
    let v = String(val || "");
    while (v && ctx.measureText(v).width > w - 32) v = v.slice(0, -2) + "…";
    ctx.fillText(v, mx + 16, 146);
    mx += w + 16;
  });

  // Frame
  const top = 220,
    bottom = H - 100,
    colW = (W - 2 * M) / 10;
  const rowH = [(bottom - top) * 0.34, (bottom - top) * 0.34, (bottom - top) * 0.32];
  const rowY = [top, top + rowH[0], top + rowH[0] + rowH[1]];
  ctx.fillStyle = IMG.paper;
  ctx.fillRect(M, top, W - 2 * M, bottom - top);

  const icons = Object.fromEntries(
    await Promise.all(BLOCKS.map(async (b) => [b.key, await loadIcon(b.key)] as const)),
  ) as Record<BlockKey, HTMLImageElement | null>;

  for (const b of BLOCKS) {
    const [c, r, cs, rs] = CELLS[b.key];
    const x = M + c * colW,
      y = rowY[r],
      w = cs * colW,
      h = rowH.slice(r, r + rs).reduce((a, v) => a + v, 0);
    const pad = 26;
    ctx.fillStyle = IMG.ink;
    ctx.font = "700 34px Fraunces, Georgia, serif";
    const titleLines = wrapLines(ctx, b.title, w - pad * 2 - 56);
    titleLines.forEach((t, i) => ctx.fillText(t, x + pad, y + pad + 32 + i * 40));
    const icon = icons[b.key];
    if (icon) ctx.drawImage(icon, x + w - pad - 40, y + pad, 40, 40);

    const items = (canvas[b.key] || []).map((s) => s.trim()).filter(Boolean);
    const bodyTop = y + pad + 32 + titleLines.length * 40 + 14;
    const maxW = w - pad * 2 - 26,
      maxH = y + h - pad - bodyTop;

    if (!items.length) {
      ctx.fillStyle = IMG.muted;
      ctx.font = "italic 400 20px Manrope, sans-serif";
      wrapLines(ctx, b.question, w - pad * 2)
        .slice(0, 4)
        .forEach((t, i) => ctx.fillText(t, x + pad, bodyTop + 22 + i * 28));
      continue;
    }

    // Shrink text until every item fits the cell
    let size = 26;
    let layout: string[][] = [];
    let lh = 0,
      gap = 0;
    for (;;) {
      ctx.font = `400 ${size}px Manrope, sans-serif`;
      lh = size * 1.32;
      gap = size * 0.5;
      layout = items.map((it) => wrapLines(ctx, it, maxW));
      const total = layout.reduce((a, ls) => a + ls.length * lh + gap, 0);
      if (total <= maxH || size <= 14) break;
      size -= 1;
    }

    let ty = bodyTop;
    ctx.font = `400 ${size}px Manrope, sans-serif`;
    layout.forEach((ls) => {
      ctx.fillStyle = IMG.gold;
      ctx.beginPath();
      ctx.arc(x + pad + 6, ty + lh * 0.62, size * 0.22, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = IMG.ink;
      ls.forEach((t, i) => ctx.fillText(t, x + pad + 26, ty + lh * 0.8 + i * lh));
      ty += ls.length * lh + gap;
    });
  }

  // Grid lines
  ctx.strokeStyle = IMG.ink;
  ctx.lineWidth = 3;
  BLOCKS.forEach((b) => {
    const [c, r, cs, rs] = CELLS[b.key];
    const x = M + c * colW,
      y = rowY[r],
      w = cs * colW,
      h = rowH.slice(r, r + rs).reduce((a, v) => a + v, 0);
    ctx.strokeRect(x, y, w, h);
  });
  {
    const [c, , cs] = CELLS.vp;
    ctx.fillStyle = IMG.gold;
    ctx.fillRect(M + c * colW + 2, top + 4, cs * colW - 4, 10);
  }
  ctx.lineWidth = 8;
  ctx.strokeRect(M, top, W - 2 * M, bottom - top);

  // Footer: the real brand lockup, drawn from the same PNG the header uses.
  const logo = await loadImage("/logo-umbp.png");
  if (logo) {
    const lh = 34,
      lw = (logo.width / logo.height) * lh;
    ctx.drawImage(logo, M, H - 74, lw, lh);
  }
  ctx.fillStyle = IMG.muted;
  ctx.font = "400 17px Manrope, sans-serif";
  ctx.fillText("Made with UMBP Canvas Lab", M, H - 26);

  return cv.toDataURL("image/png");
}
