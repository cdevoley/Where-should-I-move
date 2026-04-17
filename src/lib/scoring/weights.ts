import type { MetricCategory } from "@/types/city";

export const DEFAULT_WEIGHTS: Record<MetricCategory, number> = {
  costOfLiving: 0.15,
  jobMarket: 0.15,
  safety: 0.12,
  housing: 0.12,
  weather: 0.10,
  healthcare: 0.10,
  walkability: 0.08,
  education: 0.08,
  nightlife: 0.05,
  transit: 0.05,
};

export function validateWeights(weights: Record<MetricCategory, number>): boolean {
  const sum = Object.values(weights).reduce((a, b) => a + b, 0);
  return Math.abs(sum - 1.0) < 0.001;
}

export function normalizeWeights(
  weights: Record<MetricCategory, number>
): Record<MetricCategory, number> {
  const sum = Object.values(weights).reduce((a, b) => a + b, 0);
  if (sum === 0) return DEFAULT_WEIGHTS;

  const normalized = {} as Record<MetricCategory, number>;
  for (const [key, value] of Object.entries(weights)) {
    normalized[key as MetricCategory] = value / sum;
  }
  return normalized;
}
