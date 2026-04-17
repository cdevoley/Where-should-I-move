import type { MetricCategory, CitySummary } from './city'

export type WeightMap = Record<MetricCategory, number>

export interface RankedCity extends CitySummary {
  rank: number
  compositeScore: number
}
