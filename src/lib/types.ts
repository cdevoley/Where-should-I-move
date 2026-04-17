// Re-export all city-related types for consumers that import from @/lib/types
export type {
  MetricScore,
  MetricCategory,
  CityMetrics,
  CityIdentifier,
  CitySummary,
  City,
  CitySearchResult,
} from '@/types/city'

export type { WeightMap, RankedCity } from '@/types/ranking'
