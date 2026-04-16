import type { MetricCategory } from "@/types/city";
import { DEFAULT_WEIGHTS, normalizeWeights } from "./weights";

/**
 * Calculate a weighted composite score from category scores.
 * @param categoryScores - Map of category to normalized score (0-100)
 * @param weights - Optional custom weights (defaults to DEFAULT_WEIGHTS)
 * @returns Composite score 0-100
 */
export function calculateCompositeScore(
  categoryScores: Record<MetricCategory, number>,
  weights?: Partial<Record<MetricCategory, number>>
): number {
  const finalWeights = weights
    ? normalizeWeights({ ...DEFAULT_WEIGHTS, ...weights })
    : DEFAULT_WEIGHTS;

  let score = 0;
  for (const [category, weight] of Object.entries(finalWeights)) {
    const categoryScore = categoryScores[category as MetricCategory] ?? 0;
    score += categoryScore * weight;
  }

  return Math.round(score * 10) / 10;
}

/**
 * Rank cities by composite score (descending).
 * Returns a map of slug -> rank (1-indexed).
 */
export function rankCities(
  cities: { slug: string; compositeScore: number }[]
): Map<string, number> {
  const sorted = [...cities].sort(
    (a, b) => b.compositeScore - a.compositeScore
  );

  const rankings = new Map<string, number>();
  sorted.forEach((city, index) => {
    rankings.set(city.slug, index + 1);
  });

  return rankings;
}
