# UMBP Canvas Lab

Interactive Business Model Canvas with a live feasibility score and an AI business-model
diagnostic for early-stage entrepreneurs, built for the Utah Moldova Business Partnership.

## Getting started

```bash
npm install
cp .env.local.example .env.local   # then paste your Gemini API key into it
npm run dev
```

Open http://localhost:3000.

Get a key from [Google AI Studio](https://aistudio.google.com/apikey). It is read server-side
only. Without it the canvas, feasibility scores, built-in checks, Markdown copy and image
export all still work — only the AI diagnostic is unavailable.

## What it does

- Edit the nine canvas blocks, with guided prompts and worked examples in each.
- A rule-based feasibility audit scores audience fit, pricing viability and differentiation,
  and updates as you type.
- **Analyze** sends the canvas to Google Gemini for a block-by-block diagnostic, priority
  findings, and a scan for inputs your other blocks imply but the canvas doesn't state yet.
- Export the canvas as a 2400×1700 PNG, or copy the canvas and audit as Markdown.

Your canvas is saved in your own browser; nothing is stored on a server.

`npm test` runs the retry-policy tests. See `CLAUDE.md` for architecture and conventions.
