# Where Should I Move? — Implementation Plan

## Context

A portfolio web app that helps users decide where to move by ranking US cities across many livability factors. This plan rebuilds the architecture from a prior Desktop/CoWork session that was lost to an error. It is broken into **checkpointable phases** so progress survives future interruptions — each phase ends with a commit and a working state.

### Decisions locked in
- **Stack:** Next.js (App Router) + TypeScript + Tailwind CSS + shadcn/ui
- **Data:** Curated static dataset (~150 US cities), optionally enriched with live weather
- **Scope:** US cities only for v1
- **Features:** Rankings, city detail pages, comparison (2–3 cities), interactive map, quiz/recommendation engine
- **Host:** Vercel

### Important correction from prior plan
The **Teleport.org Cities API was shut down in early 2023** and must not be used. v1 data comes from a bundled curated dataset; live enrichment (if any) will come from Open-Meteo (free, no key needed) for weather.

---

## Phase 0 — Scaffolding & tooling  *(checkpoint: clean Next.js app runs)*

**Goal:** A working Next.js app deployable to Vercel with nothing broken.

1. `npx create-next-app@latest . --typescript --tailwind --app --src-dir --eslint --import-alias "@/*"`
2. Install shadcn/ui: `npx shadcn@latest init` (New York style, neutral base color)
3. Add Prettier + a minimal config; add `lint` / `format` / `typecheck` npm scripts
4. Commit. Deploy a "hello world" to Vercel to confirm the pipeline works.

**Verify:** `npm run dev` serves `/` at localhost:3000; `npm run build` succeeds; Vercel preview URL loads.

**Files touched:** `package.json`, `tsconfig.json`, `tailwind.config.ts`, `src/app/layout.tsx`, `src/app/page.tsx`, `components.json`.

---

## Phase 1 — Data model & seed dataset  *(checkpoint: typed city data loads in a page)*

**Goal:** Well-typed city data that the rest of the app consumes.

1. Define TypeScript types in [src/lib/types.ts](../src/lib/types.ts):
   - `City` — `{ id, name, state, slug, lat, lng, population, metrics: Metrics }`
   - `Metrics` — normalized 0–100 scores for each factor: `costOfLiving`, `housing`, `weather`, `jobMarket`, `safety`, `walkability`, `transit`, `healthcare`, `education`, `nightlife`, `outdoors`, `diversity`
   - `MetricKey`, `WeightMap`, `RankedCity` helper types
2. Create `src/data/cities.seed.json` with ~20 cities hand-curated (NYC, SF, LA, Seattle, Austin, Denver, Chicago, Boston, Portland, Miami, etc.) — enough to build UI against.
3. Add `src/lib/cities.ts` with data access helpers: `getAllCities()`, `getCityBySlug(slug)`, `getCitiesByIds(ids[])`.
4. Document data sources and schema in `src/data/README.md` (how to expand to 150 cities later).

**Expansion to full 150 cities is deferred to Phase 7** — build against the 20-city seed to unblock UI work.

**Verify:** A throwaway server component renders city names from the dataset.

---

## Phase 2 — Ranking engine & Rankings page  *(checkpoint: sortable rankings render)*

**Goal:** `/rankings` shows cities scored by a composite across weighted metrics.

1. `src/lib/ranking.ts` — pure functions:
   - `scoreCity(city, weights)` → weighted sum of normalized metrics
   - `rankCities(cities, weights)` → sorted `RankedCity[]`
   - Sensible default weights export
2. `/src/app/rankings/page.tsx` — server component; loads cities, renders table
3. Client component `RankingsTable` with shadcn `Table`:
   - Sort by composite or any single metric
   - Filters: state, population band, min score per metric
   - Links rows to city detail pages
4. `WeightsPanel` client component: sliders per metric. Weight state lives in URL search params (`?w.costOfLiving=8&...`) for shareable links. Use `nuqs` for param sync.

**Verify:** `/rankings` sorts/filters correctly; URL updates as weights change; refresh preserves state.

---

## Phase 3 — City detail pages  *(checkpoint: `/cities/[slug]` renders full profile)*

**Goal:** Per-city deep dive with charts.

1. Dynamic route `src/app/cities/[slug]/page.tsx`. `generateStaticParams` pre-renders all cities at build (SSG). `generateMetadata` for good OG tags.
2. Page sections:
   - Hero: name, state, population, summary score
   - Metrics radar chart (Recharts)
   - Per-metric bars with percentile vs. all cities
   - Neighbors/comparables: 3 cities with similar metric profiles (simple cosine similarity in `src/lib/similarity.ts`)
3. Optional live weather strip via Open-Meteo (no key). Fetched server-side with `revalidate: 3600`. Skip if it adds friction — not required for MVP.

**Verify:** Every seed city has a working page; Lighthouse perf ≥ 90.

---

## Phase 4 — Comparison tool  *(checkpoint: `/compare` handles 2–3 cities)*

**Goal:** Side-by-side comparison.

1. `src/app/compare/page.tsx` — selected cities in URL params (`?a=austin-tx&b=denver-co&c=seattle-wa`)
2. `CitySelector` client component — combobox (shadcn `Command`) with city search
3. Comparison view: metric-by-metric table with color-coded winners; grouped radar chart overlay; cost-of-living breakdown
4. "Share this comparison" button that copies the URL

**Verify:** Can pick 2 or 3 cities; metrics display correctly; URL is shareable.

---

## Phase 5 — Interactive map  *(checkpoint: `/map` renders cities with overlay)*

**Goal:** Geographic view of cities with metric overlay.

1. **Library:** react-leaflet + OpenStreetMap tiles (free, no token). Mapbox is an option if we want prettier styling later, but free tier requires attribution and a token.
2. `src/app/map/page.tsx` — dynamic import with `ssr: false` for the map component
3. `CitiesMap` client component:
   - Circle markers sized by population, colored by selected metric
   - Metric selector in top-right
   - Click marker → popup with mini-card linking to detail page
4. Default view: continental US fit-to-bounds.

**Verify:** Markers render for all seed cities; metric selector changes colors; click navigates to detail page.

---

## Phase 6 — Quiz / recommendation engine  *(checkpoint: `/quiz` produces ranked recommendations)*

**Goal:** Guided questionnaire that outputs personalized city recommendations.

1. Quiz definition in `src/lib/quiz.ts` — declarative array of questions, each producing a weight adjustment. Examples:
   - "How important is affordability?" → adjusts `costOfLiving`, `housing` weights
   - "Hot or cold climate?" → biases weather scoring (may need a derived "climate match" score)
   - "Big city energy or small-town quiet?" → biases population filter + `nightlife`
   - "Work-from-home or need strong job market?" → adjusts `jobMarket`
   - 6–8 questions total
2. `src/app/quiz/page.tsx` — multi-step client form; progress bar; answers held in local state
3. On completion, compute effective weights and redirect to `/rankings?w.*=...&source=quiz` so the quiz is just a weight builder — no duplicate ranking logic
4. Results page shows top 10 with "why this city" explanation (which metrics scored highest for their weights)

**Verify:** Completing the quiz lands on rankings with appropriate weights; different answers produce different top results.

---

## Phase 7 — Polish, expand dataset, ship  *(checkpoint: public URL to share)*

**Goal:** Portfolio-ready.

1. Expand `cities.seed.json` from 20 → ~150 cities (can be its own focused session — script to generate from public sources, then hand-review)
2. Home page: clear hero, links to each feature, a featured ranking
3. Nav/layout: header with links to Rankings / Compare / Map / Quiz
4. Empty states, loading skeletons, 404 page, error boundary
5. SEO: `sitemap.ts`, `robots.ts`, per-page metadata
6. Analytics: Vercel Analytics (one line) or Plausible
7. README: screenshots, stack, data sources, "run locally" steps
8. Deploy to Vercel; put URL in portfolio

**Verify:** Lighthouse ≥ 90 across all categories on 3 key pages; link to live app.

---

## Key files / conventions reference

```
src/
├── app/
│   ├── layout.tsx, page.tsx
│   ├── rankings/page.tsx
│   ├── cities/[slug]/page.tsx
│   ├── compare/page.tsx
│   ├── map/page.tsx
│   └── quiz/page.tsx
├── components/
│   ├── ui/               # shadcn primitives
│   ├── rankings/         # RankingsTable, WeightsPanel
│   ├── city/             # MetricsRadar, MetricBar
│   ├── compare/          # CitySelector, ComparisonTable
│   ├── map/              # CitiesMap (client-only)
│   └── quiz/             # QuizFlow, QuizQuestion
├── data/
│   ├── cities.seed.json
│   └── README.md
└── lib/
    ├── types.ts
    ├── cities.ts
    ├── ranking.ts
    ├── similarity.ts
    └── quiz.ts
```

**Dependencies (added incrementally, not all at Phase 0):**
- Phase 0: `next`, `react`, `typescript`, `tailwindcss`, shadcn/ui
- Phase 2: `nuqs` (URL state)
- Phase 3: `recharts`
- Phase 5: `leaflet`, `react-leaflet`
- Phase 7: `@vercel/analytics`

---

## Housekeeping at end of each phase
- Commit with message `phase N: <what shipped>`
- Update the "Phase Progress" checklist in [CLAUDE.md](../CLAUDE.md)
- Push to GitHub
- Trigger Vercel preview deploy so we always have a live checkpoint

## Global verification
- `npm run build && npm run lint && npm run typecheck` passes at every phase checkpoint
- Every phase ends with a working `npm run dev` — no broken-in-progress commits on `main`; use a feature branch per phase and merge when the checkpoint is green
