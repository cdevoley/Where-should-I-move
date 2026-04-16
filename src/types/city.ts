export interface MetricScore {
  raw: number;
  normalized: number;
  label: string;
  source: string;
  updatedAt: string;
}

export type MetricCategory =
  | "costOfLiving"
  | "weather"
  | "jobMarket"
  | "safety"
  | "walkability"
  | "healthcare"
  | "nightlife"
  | "education"
  | "housing"
  | "transit";

export const METRIC_CATEGORIES: MetricCategory[] = [
  "costOfLiving",
  "weather",
  "jobMarket",
  "safety",
  "walkability",
  "healthcare",
  "nightlife",
  "education",
  "housing",
  "transit",
];

export interface CostOfLivingMetrics {
  overall: MetricScore;
  medianRent: MetricScore;
  medianHomePrice: MetricScore;
  groceryIndex: MetricScore;
  transportCost: MetricScore;
}

export interface WeatherMetrics {
  overall: MetricScore;
  avgHighSummer: MetricScore;
  avgLowWinter: MetricScore;
  annualRainfall: MetricScore;
  sunnyDays: MetricScore;
  comfortIndex: MetricScore;
}

export interface JobMarketMetrics {
  overall: MetricScore;
  unemploymentRate: MetricScore;
  medianHouseholdIncome: MetricScore;
  jobGrowthRate: MetricScore;
}

export interface SafetyMetrics {
  overall: MetricScore;
  violentCrimeRate: MetricScore;
  propertyCrimeRate: MetricScore;
}

export interface WalkabilityMetrics {
  overall: MetricScore;
  walkScore: MetricScore;
  transitScore: MetricScore;
  bikeScore: MetricScore;
}

export interface HealthcareMetrics {
  overall: MetricScore;
  facilitiesPerCapita: MetricScore;
  insuranceRate: MetricScore;
}

export interface NightlifeMetrics {
  overall: MetricScore;
}

export interface EducationMetrics {
  overall: MetricScore;
  bachelorRate: MetricScore;
  highSchoolRate: MetricScore;
}

export interface HousingMetrics {
  overall: MetricScore;
  medianHomeValue: MetricScore;
  homeOwnershipRate: MetricScore;
  vacancyRate: MetricScore;
}

export interface TransitMetrics {
  overall: MetricScore;
  commuteTime: MetricScore;
  publicTransitUsage: MetricScore;
}

export interface CityMetrics {
  costOfLiving: CostOfLivingMetrics;
  weather: WeatherMetrics;
  jobMarket: JobMarketMetrics;
  safety: SafetyMetrics;
  walkability: WalkabilityMetrics;
  healthcare: HealthcareMetrics;
  nightlife: NightlifeMetrics;
  education: EducationMetrics;
  housing: HousingMetrics;
  transit: TransitMetrics;
}

export interface CityIdentifier {
  slug: string;
  name: string;
  state: string;
  stateFull: string;
  latitude: number;
  longitude: number;
  population: number;
  fipsCode: string;
}

export interface CitySummary extends CityIdentifier {
  compositeScore: number;
  rank: number;
  categoryScores: Record<MetricCategory, number>;
  tags: string[];
}

export interface City extends CitySummary {
  metrics: CityMetrics;
}

export interface CitySearchResult {
  slug: string;
  name: string;
  state: string;
}
