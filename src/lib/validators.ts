import { z } from "zod";

export const citiesQuerySchema = z.object({
  sort: z
    .enum([
      "composite",
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
      "population",
      "name",
    ])
    .default("composite"),
  order: z.enum(["asc", "desc"]).default("desc"),
  minPop: z.coerce.number().optional(),
  maxPop: z.coerce.number().optional(),
  state: z.string().optional(),
  limit: z.coerce.number().min(1).max(200).default(50),
  offset: z.coerce.number().min(0).default(0),
  search: z.string().optional(),
});

export type CitiesQuery = z.infer<typeof citiesQuerySchema>;

export const compareQuerySchema = z.object({
  cities: z.string().transform((s) => s.split(",").filter(Boolean)),
});

export type CompareQuery = z.infer<typeof compareQuerySchema>;

export const quizRecommendSchema = z.object({
  answers: z.array(
    z.object({
      questionId: z.string(),
      value: z.union([z.string(), z.number(), z.array(z.string())]),
    })
  ),
});

export type QuizRecommendBody = z.infer<typeof quizRecommendSchema>;
