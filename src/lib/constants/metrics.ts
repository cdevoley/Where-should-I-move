import type { MetricCategory } from "@/types/city";

export interface MetricCategoryInfo {
  key: MetricCategory;
  label: string;
  description: string;
  icon: string; // Lucide icon name
  color: string; // Tailwind color class
  invertedPolarity: boolean; // true = lower raw value is better (cost, crime)
}

export const METRIC_CATEGORY_INFO: Record<MetricCategory, MetricCategoryInfo> = {
  costOfLiving: {
    key: "costOfLiving",
    label: "Cost of Living",
    description: "Housing costs, groceries, transportation, and overall affordability",
    icon: "DollarSign",
    color: "text-green-500",
    invertedPolarity: true,
  },
  weather: {
    key: "weather",
    label: "Weather",
    description: "Climate comfort, sunshine, rainfall, and seasonal temperatures",
    icon: "Sun",
    color: "text-yellow-500",
    invertedPolarity: false,
  },
  jobMarket: {
    key: "jobMarket",
    label: "Job Market",
    description: "Employment rate, median income, and job growth",
    icon: "Briefcase",
    color: "text-blue-500",
    invertedPolarity: false,
  },
  safety: {
    key: "safety",
    label: "Safety",
    description: "Violent and property crime rates",
    icon: "Shield",
    color: "text-indigo-500",
    invertedPolarity: true,
  },
  walkability: {
    key: "walkability",
    label: "Walkability",
    description: "Walk Score, bike-friendliness, and pedestrian infrastructure",
    icon: "Footprints",
    color: "text-emerald-500",
    invertedPolarity: false,
  },
  healthcare: {
    key: "healthcare",
    label: "Healthcare",
    description: "Medical facilities access and insurance coverage rates",
    icon: "Heart",
    color: "text-red-500",
    invertedPolarity: false,
  },
  nightlife: {
    key: "nightlife",
    label: "Nightlife & Dining",
    description: "Entertainment, restaurants, and cultural scene vibrancy",
    icon: "Wine",
    color: "text-purple-500",
    invertedPolarity: false,
  },
  education: {
    key: "education",
    label: "Education",
    description: "Educational attainment and school quality",
    icon: "GraduationCap",
    color: "text-orange-500",
    invertedPolarity: false,
  },
  housing: {
    key: "housing",
    label: "Housing",
    description: "Home values, ownership rates, and housing availability",
    icon: "Home",
    color: "text-teal-500",
    invertedPolarity: false,
  },
  transit: {
    key: "transit",
    label: "Transit",
    description: "Commute times and public transportation usage",
    icon: "Bus",
    color: "text-cyan-500",
    invertedPolarity: false,
  },
};

export const METRIC_CATEGORIES_LIST = Object.values(METRIC_CATEGORY_INFO);
