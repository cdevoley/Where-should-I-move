'use client'

import { useQueryStates, parseAsInteger } from 'nuqs'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { METRIC_CATEGORIES_LIST } from '@/lib/constants/metrics'
import { DEFAULT_WEIGHTS } from '@/lib/scoring/weights'
import type { MetricCategory } from '@/types/city'
import { RotateCcw } from 'lucide-react'

// Weights are stored as integers 0–20 in URL params (default sum = 100)
const DEFAULT_INT_WEIGHTS = Object.fromEntries(
  Object.entries(DEFAULT_WEIGHTS).map(([k, v]) => [k, Math.round(v * 100)])
) as Record<MetricCategory, number>

const parsers = Object.fromEntries(
  Object.keys(DEFAULT_INT_WEIGHTS).map((k) => [k, parseAsInteger.withDefault(DEFAULT_INT_WEIGHTS[k as MetricCategory])])
) as Record<MetricCategory, ReturnType<typeof parseAsInteger.withDefault>>

export function WeightsPanel() {
  const [weights, setWeights] = useQueryStates(parsers, { shallow: false })

  function handleChange(key: MetricCategory, value: number) {
    setWeights({ [key]: value })
  }

  function handleReset() {
    setWeights(DEFAULT_INT_WEIGHTS)
  }

  const total = Object.values(weights).reduce((a, b) => a + b, 0)

  return (
    <aside className="w-full lg:w-72 shrink-0">
      <div className="rounded-lg border bg-card p-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Adjust Weights</h2>
          <Button variant="ghost" size="sm" onClick={handleReset} className="h-7 gap-1 px-2 text-xs">
            <RotateCcw className="h-3 w-3" />
            Reset
          </Button>
        </div>
        <div className="space-y-4">
          {METRIC_CATEGORIES_LIST.map(({ key, label }) => {
            const val = weights[key] ?? DEFAULT_INT_WEIGHTS[key]
            const pct = total > 0 ? Math.round((val / total) * 100) : 0
            return (
              <div key={key}>
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="font-medium">{label}</span>
                  <span className="text-muted-foreground">{pct}%</span>
                </div>
                <Slider
                  min={0}
                  max={30}
                  step={1}
                  value={[val]}
                  onValueChange={([v]) => handleChange(key, v)}
                  className="w-full"
                />
              </div>
            )
          })}
        </div>
        <p className="mt-4 text-center text-xs text-muted-foreground">
          Weights auto-normalize to 100%
        </p>
      </div>
    </aside>
  )
}
