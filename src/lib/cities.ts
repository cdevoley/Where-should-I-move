import type { CitySummary, CitySearchResult } from '@/types/city'
import seedData from '@/data/cities.seed.json'

const cities: CitySummary[] = seedData as CitySummary[]

export function getAllCities(): CitySummary[] {
  return cities
}

export function getCityBySlug(slug: string): CitySummary | undefined {
  return cities.find((c) => c.slug === slug)
}

export function getCitiesByIds(slugs: string[]): CitySummary[] {
  const set = new Set(slugs)
  return cities.filter((c) => set.has(c.slug))
}

export function searchCities(query: string): CitySearchResult[] {
  const q = query.toLowerCase()
  return cities
    .filter((c) => c.name.toLowerCase().includes(q) || c.state.toLowerCase().includes(q))
    .map(({ slug, name, state }) => ({ slug, name, state }))
}
