'use client'

import { useState } from 'react'
import type { PlatformRevenue } from '@/lib/types'
import AnalyticsSummary from '@/components/features/analytics/AnalyticsSummary'
import StreamsChart from '@/components/features/analytics/StreamsChart'
import PlatformRevenueTable from '@/components/features/analytics/PlatformRevenueTable'

type Period = 30 | 90 | 365
type PeriodLabel = '30d' | '90d' | 'YTD' | 'All time'

const PILLS: { label: PeriodLabel; days: Period }[] = [
  { label: '30d', days: 30 },
  { label: '90d', days: 90 },
  { label: 'YTD', days: 365 },
  { label: 'All time', days: 365 },
]

interface Timeseries { date: string; streams: number }

interface Props {
  // Manager-scoped: only a merged, period-invariant PlatformRevenue[] is
  // available (built from each assigned artist's releases via
  // getReleaseInsight, which has no date dimension) — no daily timeseries
  // exists at the artist level, so the chart and period pills don't apply.
  managerScoped?: boolean
  scopedPlatforms?: PlatformRevenue[]
  // Label-wide (admin/owner): genuinely differs per period, all provided up front.
  streams30?: PlatformRevenue[]
  streams90?: PlatformRevenue[]
  streams365?: PlatformRevenue[]
  timeseries30?: Timeseries[]
  timeseries90?: Timeseries[]
  timeseries365?: Timeseries[]
}

export default function AnalyticsClient({
  managerScoped = false,
  scopedPlatforms = [],
  streams30 = [], streams90 = [], streams365 = [],
  timeseries30 = [], timeseries90 = [], timeseries365 = [],
}: Props) {
  const [activeLabel, setActiveLabel] = useState<PeriodLabel>('30d')

  if (managerScoped) {
    return (
      <>
        <AnalyticsSummary platforms={scopedPlatforms} timeseries={[]} />
        <PlatformRevenueTable platforms={scopedPlatforms} />
      </>
    )
  }

  const activeDays: Period =
    activeLabel === '30d' ? 30 : activeLabel === '90d' ? 90 : 365

  const platforms = activeDays === 30 ? streams30 : activeDays === 365 ? streams365 : streams90
  const timeseries = activeDays === 30 ? timeseries30 : activeDays === 365 ? timeseries365 : timeseries90

  return (
    <>
      {/* Period pills */}
      <div
        className="flex items-center gap-1 rounded-lg p-1 self-start"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        {PILLS.map(({ label }) => (
          <button
            key={label}
            onClick={() => setActiveLabel(label)}
            className="rounded-md px-3 py-1.5 text-xs font-medium transition-colors"
            style={{
              background: activeLabel === label ? 'var(--surface-2)' : 'transparent',
              color: activeLabel === label ? 'var(--primary)' : 'rgba(255,255,255,0.45)',
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <AnalyticsSummary platforms={platforms} timeseries={timeseries} days={activeDays} />
      <StreamsChart data={timeseries} />
      <PlatformRevenueTable platforms={platforms} />
    </>
  )
}
