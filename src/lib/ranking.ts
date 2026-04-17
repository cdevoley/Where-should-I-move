import type { CitySummary } from '@/types/city'
import type { RankedCity, WeightMap } from '@/types/ranking'
import { calculateCompositeScore } from '@/lib/scoring/composite'
import { DEFAULT_WEIGHTS } from '@/lib/scoring/weights'

export { DEFAULT_WEIGHTS } from '@/lib/scoring/weights'

export function scoreCity(city: CitySummary, weights: WeightMap = DEFAULT_WEIGHTS): number {
  return calculateCompositeScore(city.categoryScores, weights)
}

export function rankCities(cities: CitySummary[], weights: WeightMap = DEFAULT_WEIGHTS): RankedCity[] {
  return cities
    .map((city) => ({ ...city, compositeScore: scoreCity(city, weights) }))
    .sort((a, b) => b.compositeScore - a.compositeScore)
    .map((city, i) => ({ ...city, rank: i + 1 }))
}
