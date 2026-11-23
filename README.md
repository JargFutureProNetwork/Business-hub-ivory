# Ivory Center Business Hub

A central website for Ivory Center and the Utah-Moldova Business Partnership, bringing its
interactive business tools together under one dashboard.

| Page | What it does |
|---|---|
| **Dashboard** (`/`) | Welcome, an overview of every tool, and quick links |
| **Canvas Lab** (`/canvas`) | Business Model Canvas with a live feasibility score, AI diagnostic, PNG and Markdown export |
| **Price Builder** (`/price-builder`) | Price from fulfilment cost, customer acquisition cost and target margin; Excel export |
| **UVP & Copy Workbench** (`/uvp`) | Value propositions, bios, hero copy, hooks and ads in English, Romanian, Russian and Ukrainian; CSV export |
| **Resources** (`/resources`) | Curated links, edited in `src/lib/resources.ts` |

## Getting started

```bash
npm install
cp .env.local.example .env.local   # then paste your Gemini API key into it
npm run dev
```

Open http://localhost:3000.

Get a key from [Google AI Studio](https://aistudio.google.com/apikey). It is read server-side
only and powers both AI features: the Canvas Lab diagnostic and the UVP workbench's AI
copywriter. Without it everything else still works. Canvas scores, checks and exports are
local, the Price Builder needs no AI, and the UVP workbench switches to its offline templates.

Work is saved in each visitor's own browser; nothing is stored on a server.

## Adding resources or tools

- **Links:** add entries to `RESOURCES` in `src/lib/resources.ts`.
- **A new tool:** add it to `TOOLS` in `src/lib/tools.ts`. A standalone HTML tool goes in
  `public/tools/` and gets a page like `src/app/price-builder/page.tsx`.

`npm run build`, `npm run lint` and `npm test` should pass before deploying. See `CLAUDE.md`
for architecture and conventions.
