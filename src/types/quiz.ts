import type { CitySummary, MetricCategory } from "./city";

export type QuestionType = "slider" | "single-select" | "multi-select";

export interface QuizOption {
  value: string;
  label: string;
  icon?: string;
}

export interface SliderRange {
  min: number;
  max: number;
  step: number;
  labels: [string, string];
  formatValue?: (value: number) => string;
}

export interface QuizQuestion {
  id: string;
  text: string;
  description?: string;
  type: QuestionType;
  options?: QuizOption[];
  range?: SliderRange;
  affectsCategories: MetricCategory[];
}

export interface QuizAnswer {
  questionId: string;
  value: string | number | string[];
}

export interface QuizState {
  currentStep: number;
  answers: QuizAnswer[];
  isComplete: boolean;
}

export interface QuizResult {
  weights: Record<MetricCategory, number>;
  recommendations: CitySummary[];
  explanations: Record<string, string>;
}
