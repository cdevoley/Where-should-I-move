import type { MetricCategory, CitySummary } from "@/types/city";
import type { QuizAnswer } from "@/types/quiz";
import { DEFAULT_WEIGHTS } from "./weights";
import { calculateCompositeScore } from "./composite";

interface QuizWeightModifier {
  category: MetricCategory;
  multiplier: number;
}

function getWeightModifiers(answer: QuizAnswer): QuizWeightModifier[] {
  const modifiers: QuizWeightModifier[] = [];

  switch (answer.questionId) {
    case "climate":
      modifiers.push({ category: "weather", multiplier: 1.8 });
      break;

    case "career":
      if (answer.value === "remote") {
        modifiers.push({ category: "jobMarket", multiplier: 0.5 });
        modifiers.push({ category: "costOfLiving", multiplier: 1.5 });
      } else {
        modifiers.push({ category: "jobMarket", multiplier: 1.6 });
      }
      break;

    case "commute":
      if (answer.value === "transit") {
        modifiers.push({ category: "transit", multiplier: 2.5 });
        modifiers.push({ category: "walkability", multiplier: 1.5 });
      } else if (answer.value === "walk-bike") {
        modifiers.push({ category: "walkability", multiplier: 2.5 });
      }
      break;

    case "household":
      if (answer.value === "family") {
        modifiers.push({ category: "education", multiplier: 2.0 });
        modifiers.push({ category: "safety", multiplier: 1.8 });
      } else if (answer.value === "retiree") {
        modifiers.push({ category: "healthcare", multiplier: 2.0 });
        modifiers.push({ category: "costOfLiving", multiplier: 1.5 });
        modifiers.push({ category: "safety", multiplier: 1.3 });
      }
      break;

    case "nightlife-importance": {
      const importance = typeof answer.value === "number" ? answer.value : 3;
      modifiers.push({ category: "nightlife", multiplier: importance / 3 });
      break;
    }

    case "safety-priority": {
      const priority = typeof answer.value === "number" ? answer.value : 3;
      modifiers.push({ category: "safety", multiplier: priority / 3 });
      break;
    }

    case "must-haves": {
      const values = Array.isArray(answer.value) ? answer.value : [];
      if (values.includes("affordable")) {
        modifiers.push({ category: "costOfLiving", multiplier: 1.5 });
      }
      if (values.includes("good-schools")) {
        modifiers.push({ category: "education", multiplier: 1.8 });
      }
      if (values.includes("walkable")) {
        modifiers.push({ category: "walkability", multiplier: 1.8 });
      }
      break;
    }
  }

  return modifiers;
}

function getPopulationFilter(
  answers: QuizAnswer[]
): ((pop: number) => boolean) | null {
  const sizeAnswer = answers.find((a) => a.questionId === "city-size");
  if (!sizeAnswer) return null;

  switch (sizeAnswer.value) {
    case "major":
      return (pop) => pop >= 500000;
    case "midsize":
      return (pop) => pop >= 100000 && pop < 500000;
    case "smaller":
      return (pop) => pop < 250000;
    default:
      return null;
  }
}

function getBudgetFilter(
  answers: QuizAnswer[]
): number | null {
  const budgetAnswer = answers.find((a) => a.questionId === "budget");
  if (!budgetAnswer || typeof budgetAnswer.value !== "number") return null;
  return budgetAnswer.value;
}

export function computeQuizWeights(
  answers: QuizAnswer[]
): Record<MetricCategory, number> {
  const weights = { ...DEFAULT_WEIGHTS };

  for (const answer of answers) {
    const modifiers = getWeightModifiers(answer);
    for (const mod of modifiers) {
      weights[mod.category] *= mod.multiplier;
    }
  }

  // Normalize so weights sum to 1
  const sum = Object.values(weights).reduce((a, b) => a + b, 0);
  for (const key of Object.keys(weights) as MetricCategory[]) {
    weights[key] /= sum;
  }

  return weights;
}

export function recommendCities(
  allCities: CitySummary[],
  answers: QuizAnswer[],
  limit = 10
): { recommendations: CitySummary[]; weights: Record<MetricCategory, number> } {
  const weights = computeQuizWeights(answers);
  const popFilter = getPopulationFilter(answers);
  const budgetMax = getBudgetFilter(answers);

  let candidates = allCities;

  // Apply population filter
  if (popFilter) {
    candidates = candidates.filter((c) => popFilter(c.population));
  }

  // Apply budget filter (rough: filter cities where costOfLiving score is reasonable)
  if (budgetMax !== null) {
    // Cities with higher cost-of-living score = more affordable
    // If budget is low (<1500), require costOfLiving score > 50
    const minCostScore = budgetMax < 1500 ? 50 : budgetMax < 2500 ? 30 : 0;
    candidates = candidates.filter(
      (c) => c.categoryScores.costOfLiving >= minCostScore
    );
  }

  // Score each city with custom weights
  const scored = candidates.map((city) => ({
    ...city,
    compositeScore: calculateCompositeScore(city.categoryScores, weights),
  }));

  // Sort by personalized score
  scored.sort((a, b) => b.compositeScore - a.compositeScore);

  return {
    recommendations: scored.slice(0, limit),
    weights,
  };
}
