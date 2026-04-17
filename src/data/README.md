# City Data

## Schema

Each city in `cities.seed.json` matches the `CitySummary` type from `src/types/city.ts`.

### `categoryScores`

All scores are normalized **0–100** (higher = better). Metrics with inverted polarity
(cost, crime) are already inverted here — a score of 90 for `costOfLiving` means very affordable.

| Key | What it measures |
|-----|-----------------|
| `costOfLiving` | Overall affordability (inverted — higher = cheaper) |
| `housing` | Home prices / rent (inverted) |
| `weather` | Climate comfort, sunshine, mild temperatures |
| `jobMarket` | Employment rate, income, job growth |
| `safety` | Low crime rate (inverted) |
| `walkability` | Walk Score, pedestrian infrastructure |
| `transit` | Public transit coverage and frequency |
| `healthcare` | Medical facility access, insurance rate |
| `education` | Degree attainment, school quality |
| `nightlife` | Restaurants, bars, entertainment density |

## Data Sources (v1 seed — hand-curated)

Scores for the 20-city seed are hand-curated estimates based on:
- US Census Bureau ACS 5-Year Estimates (population, income)
- Walk Score public data (walkability, transit)
- FBI Uniform Crime Reports (safety)
- BLS Local Area Unemployment Statistics (job market)
- NOAA climate normals (weather)
- Numbeo Cost of Living Index (cost of living, housing)

## Expanding to ~150 cities (Phase 7)

1. Use the public APIs listed above (all free or have free tiers) to pull raw values
2. Run `scripts/normalize-cities.ts` to min-max normalize each metric across all cities
3. Hand-review outliers and add `tags` manually
4. Replace `cities.seed.json` with the full dataset — no other code changes needed
