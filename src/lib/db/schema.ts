import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const cities = sqliteTable("cities", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  state: text("state").notNull(),
  stateFull: text("state_full").notNull(),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  population: integer("population").notNull(),
  fipsCode: text("fips_code").notNull(),
  compositeScore: real("composite_score").default(0),
  rank: integer("rank").default(0),
  tags: text("tags").default("[]"), // JSON array stored as text
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
  updatedAt: text("updated_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const cityMetrics = sqliteTable("city_metrics", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  cityId: integer("city_id").notNull().references(() => cities.id),
  category: text("category").notNull(), // MetricCategory
  metricKey: text("metric_key").notNull(), // e.g. "medianRent", "walkScore"
  rawValue: real("raw_value").notNull(),
  normalizedScore: real("normalized_score").notNull(), // 0-100
  formattedLabel: text("formatted_label").notNull(), // e.g. "$2,500/mo"
  source: text("source").notNull(), // e.g. "US Census ACS 2022"
  fetchedAt: text("fetched_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export const apiCache = sqliteTable("api_cache", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  cacheKey: text("cache_key").notNull().unique(),
  responseJson: text("response_json").notNull(), // JSON stored as text
  expiresAt: text("expires_at").notNull(),
  createdAt: text("created_at").notNull().$defaultFn(() => new Date().toISOString()),
});

export type City = typeof cities.$inferSelect;
export type NewCity = typeof cities.$inferInsert;
export type CityMetric = typeof cityMetrics.$inferSelect;
export type NewCityMetric = typeof cityMetrics.$inferInsert;
export type ApiCacheEntry = typeof apiCache.$inferSelect;
export type NewApiCacheEntry = typeof apiCache.$inferInsert;
