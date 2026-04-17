import type { Metadata } from 'next'
import { getAllCities } from '@/lib/cities'
import { rankCities, DEFAULT_WEIGHTS } from '@/lib/ranking'
import { normalizeWeights } from '@/lib/scoring/weights'
import { RankingsTable } from '@/components/rankings/RankingsTable'
import { WeightsPanel } from '@/components/rankings/WeightsPanel'
import type { MetricCategory } from '@/types/city'
import type { WeightMap } from '@/types/ranking'

export const metadata: Metadata = {
  title: 'City Rankings',
  description: 'Rank US cities by cost of living, weather, jobs, safety, and more with adjustable weights.',
}

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function parseWeights(params: Record<string, string | string[] | undefined>): WeightMap {
  const weights = { ...DEFAULT_WEIGHTS }
  for (const key of Object.keys(DEFAULT_WEIGHTS) as MetricCategory[]) {
    const raw = params[key]
    const val = typeof raw === 'string' ? parseInt(raw, 10) : NaN
    if (!isNaN(val) && val >= 0 && val <= 30) {
      weights[key] = val / 100
    }
  }
  return normalizeWeights(weights)
}

export default async function RankingsPage({ searchParams }: PageProps) {
  const params = await searchParams
  const weights = parseWeights(params)
  const cities = getAllCities()
  const ranked = rankCities(cities, weights)

  return (
    <div className="mx-auto max-w-[1600px] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">City Rankings</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {ranked.length} cities ranked. Drag the sliders to adjust what matters most to you.
        </p>
      </div>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <WeightsPanel />
        <RankingsTable cities={ranked} />
      </div>
    </div>
  )
}
