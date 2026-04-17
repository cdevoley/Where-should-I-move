'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import type { RankedCity } from '@/types/ranking'
import type { MetricCategory } from '@/types/city'
import { METRIC_CATEGORY_INFO } from '@/lib/constants/metrics'
import { cn } from '@/lib/utils'
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react'

type SortKey = 'rank' | MetricCategory
type SortDir = 'asc' | 'desc'

function ScoreBar({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            'h-full rounded-full',
            score >= 75 ? 'bg-green-500' : score >= 50 ? 'bg-yellow-500' : 'bg-red-400'
          )}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="w-7 text-right tabular-nums text-xs text-muted-foreground">{score}</span>
    </div>
  )
}

export function RankingsTable({ cities }: { cities: RankedCity[] }) {
  const [sortKey, setSortKey] = useState<SortKey>('rank')
  const [sortDir, setSortDir] = useState<SortDir>('asc')

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir(key === 'rank' ? 'asc' : 'desc')
    }
  }

  const sorted = [...cities].sort((a, b) => {
    const av = sortKey === 'rank' ? a.rank : a.categoryScores[sortKey]
    const bv = sortKey === 'rank' ? b.rank : b.categoryScores[sortKey]
    return sortDir === 'asc' ? av - bv : bv - av
  })

  function SortIcon({ col }: { col: SortKey }) {
    if (sortKey !== col) return <ArrowUpDown className="ml-1 inline h-3 w-3 opacity-40" />
    return sortDir === 'asc'
      ? <ArrowUp className="ml-1 inline h-3 w-3" />
      : <ArrowDown className="ml-1 inline h-3 w-3" />
  }

  const metricCols = Object.values(METRIC_CATEGORY_INFO)

  return (
    <div className="min-w-0 flex-1 overflow-x-auto rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead
              className="w-12 cursor-pointer select-none whitespace-nowrap"
              onClick={() => handleSort('rank')}
            >
              # <SortIcon col="rank" />
            </TableHead>
            <TableHead className="min-w-40">City</TableHead>
            <TableHead className="w-24 text-right font-semibold">Score</TableHead>
            {metricCols.map(({ key, label }) => (
              <TableHead
                key={key}
                className="w-28 cursor-pointer select-none whitespace-nowrap"
                onClick={() => handleSort(key)}
              >
                {label} <SortIcon col={key} />
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorted.map((city) => (
            <TableRow key={city.slug}>
              <TableCell className="font-mono text-sm text-muted-foreground">{city.rank}</TableCell>
              <TableCell>
                <Link
                  href={`/cities/${city.slug}`}
                  className="font-medium hover:underline"
                >
                  {city.name}
                </Link>
                <div className="text-xs text-muted-foreground">{city.state}</div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {city.tags.slice(0, 2).map((tag) => (
                    <Badge key={tag} variant="secondary" className="px-1 py-0 text-[10px]">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <span
                  className={cn(
                    'text-sm font-semibold tabular-nums',
                    city.compositeScore >= 65 ? 'text-green-600 dark:text-green-400' :
                    city.compositeScore >= 55 ? 'text-yellow-600 dark:text-yellow-400' :
                    'text-red-600 dark:text-red-400'
                  )}
                >
                  {city.compositeScore.toFixed(1)}
                </span>
              </TableCell>
              {metricCols.map(({ key }) => (
                <TableCell key={key}>
                  <ScoreBar score={city.categoryScores[key]} />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
