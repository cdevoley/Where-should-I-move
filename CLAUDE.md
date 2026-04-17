# Where Should I Move? — Claude Code Context

## Project Overview
A city ranking portfolio app that helps users decide where to move based on personalized criteria (cost of living, weather, job market, culture, etc.).

## Repo & Remote
- **Remote:** https://github.com/chamims/where-should-i-move.git
- **Branch strategy:** `main` for stable, feature branches for new work
- **CoWork planning folder:** `~/Documents/Claude/Projects/Where Should I Move Project/`

## Workflow: Claude Code ↔ CoWork
This project uses **two Claude tools in tandem**:
- **Claude Code** (here) — coding, file edits, running tests, git operations
- **CoWork** — project planning, research docs, design briefs, content drafts

Files generated in CoWork are saved to the CoWork planning folder, then moved/referenced here as needed. Always `git pull` before starting a new coding session to pick up any files added from CoWork.

## Tech Stack (locked 2026-04-17)
- **Framework:** Next.js (App Router) + TypeScript
- **Styling:** Tailwind CSS + shadcn/ui
- **Data:** Curated static dataset (~150 US cities, v1). Optional live weather enrichment via Open-Meteo (free, no API key).
- **Scope:** US cities only for v1.
- **Hosting:** Vercel
- **Note:** Teleport.org Cities API is **discontinued** (shut down early 2023) — do not use.

Incrementally added deps: `nuqs` (Phase 2), `recharts` (Phase 3), `leaflet` + `react-leaflet` (Phase 5), `@vercel/analytics` (Phase 7).

## Project Structure
```
where-should-i-move/
├── CLAUDE.md
├── README.md
├── docs/PLAN.md         # Phased implementation plan
├── src/
│   ├── app/             # Next.js App Router pages
│   ├── components/
│   │   ├── ui/          # shadcn/ui primitives
│   │   ├── layout/      # Header, Footer, ThemeProvider
│   │   ├── rankings/    # RankingsTable, WeightsPanel
│   │   ├── city/        # MetricsRadar, MetricBar
│   │   ├── compare/     # CitySelector, ComparisonTable
│   │   ├── map/         # CitiesMap (client-only)
│   │   └── quiz/        # QuizFlow, QuizQuestion
│   ├── data/
│   │   ├── cities.seed.json
│   │   └── README.md    # Data sources & schema docs
│   ├── lib/
│   │   ├── types.ts     # Re-exports from src/types/
│   │   ├── cities.ts    # getAllCities, getCityBySlug, etc.
│   │   ├── ranking.ts   # scoreCity, rankCities
│   │   ├── similarity.ts
│   │   ├── quiz.ts
│   │   └── scoring/     # composite, normalize, weights
│   └── types/           # TypeScript interfaces
└── ...
```

## Key Commands
```bash
npm run dev        # Start dev server
npm run build      # Production build
npm run typecheck  # tsc --noEmit
npm run lint       # ESLint
npm run format     # Prettier

git pull origin main
git push origin main
```

## Phase Progress
Full plan: [docs/PLAN.md](docs/PLAN.md). Update this checklist when a phase's checkpoint is green.
- [x] **Phase 0** — Scaffolding & tooling (Next.js + Tailwind + shadcn/ui; build passes)
- [x] **Phase 1** — Data model & 20-city seed dataset
- [ ] **Phase 2** — Ranking engine + `/rankings` page (weights in URL via `nuqs`)
- [ ] **Phase 3** — City detail pages `/cities/[slug]` (radar + bars; SSG)
- [ ] **Phase 4** — Comparison tool `/compare` (2–3 cities via URL params)
- [ ] **Phase 5** — Interactive map `/map` (react-leaflet + OSM)
- [ ] **Phase 6** — Quiz `/quiz` (emits weights → redirects to rankings)
- [ ] **Phase 7** — Expand to ~150 cities, polish, SEO, analytics, ship

## CoWork ↔ Claude Code Sync Protocol
1. In CoWork: do planning, generate docs/assets → saved to `~/Documents/Claude/Projects/Where Should I Move Project/`
2. Move relevant files into this repo directory as needed
3. `git add . && git commit -m "..." && git push` to sync to GitHub
4. In Claude Code: `git pull` to pick up latest before coding
