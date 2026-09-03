'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Artist, DistributionChannel, Release, RoyaltySummary } from '@/lib/types'
import ReleaseRow from '@/components/features/releases/ReleaseRow'
import ReleaseDetail from '@/components/features/releases/ReleaseDetail'

function fmt(n: number) {
  return '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 })
}

interface MetricCellProps {
  label: string
  value: string
  valueColor?: string
}

function MetricCell({ label, value, valueColor }: MetricCellProps) {
  return (
    <div className="px-5 pt-5 pb-4 flex flex-col gap-1 min-w-0">
      <p
        className="text-[11px] uppercase tracking-widest font-medium"
        style={{ color: 'rgba(255,255,255,0.38)' }}
      >
        {label}
      </p>
      <p
        className="text-[1.75rem] font-medium leading-none tabular-nums"
        style={{ fontFamily: 'var(--font-mono)', color: valueColor ?? 'white' }}
      >
        {value}
      </p>
    </div>
  )
}

interface Props {
  summary: RoyaltySummary
  releases: Release[]
  channels: DistributionChannel[]
  artists: Artist[]
  // Distribution is admin/owner-only now. Defaults true so any other caller
  // doesn't silently lose the card.
  showDistribution?: boolean
}

export default function DashboardOverview({ summary, releases, channels, artists, showDistribution = true }: Props) {
  const [selectedRelease, setSelectedRelease] = useState<Release | null>(null)

  const liveReleases = releases.filter((r) => r.status === 'live').length
  const activeArtists = artists.filter((a) => a.status === 'active').length
  const estMonth = Math.round(summary.totalRevenue / 3)

  const recentReleases = [...releases]
    .sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime())
    .slice(0, 5)

  const healthyCount = channels.filter((c) => c.status === 'healthy').length
  const hasError = channels.some((c) => c.status === 'error')
  const hasWarning = channels.some((c) => c.status === 'warning')
  const snapshotDotColor = hasError ? 'var(--coral)' : hasWarning ? 'var(--accent)' : 'var(--primary)'
  const snapshotText = `${healthyCount} of ${channels.length} channels healthy`

  return (
    <>
      {/* Metrics strip */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}
      >
        <div
          className="h-px w-full"
          style={{
            background:
              'linear-gradient(to right, transparent, var(--accent) 20%, var(--primary) 80%, transparent)',
          }}
        />
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0"
             style={{ '--tw-divide-opacity': 1 } as React.CSSProperties}>
          {/* Use border manually since Tailwind divide doesn't support CSS vars */}
          <div style={{ borderRight: '1px solid var(--border)', borderBottom: '1px solid var(--border)' }}>
            <MetricCell label="Live releases" value={String(liveReleases)} />
          </div>
          <div style={{ borderBottom: '1px solid var(--border)' }}>
            <MetricCell label="Active artists" value={String(activeArtists)} />
          </div>
          <div style={{ borderRight: '1px solid var(--border)' }} className="lg:border-t-0">
            <MetricCell
              label="Pending payouts"
              value={fmt(summary.pendingPayouts)}
              valueColor="var(--primary)"
            />
          </div>
          <div>
            <MetricCell
              label="Est. this month"
              value={fmt(estMonth)}
              valueColor="var(--accent)"
            />
          </div>
        </div>
      </div>

      {/* Recent releases + distribution snapshot */}
      <div className={`grid grid-cols-1 gap-4 min-w-0 ${showDistribution ? 'lg:grid-cols-[1.4fr_1fr] xl:grid-cols-[1.5fr_1fr]' : ''}`}>
        {/* Recent releases */}
        <div
          className="rounded-xl overflow-hidden flex flex-col min-w-0"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <div
            className="h-px w-full"
            style={{
              background:
                'linear-gradient(to right, transparent, var(--accent) 20%, var(--primary) 80%, transparent)',
            }}
          />
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: '1px solid var(--border)' }}
          >
            <h3 className="text-sm font-semibold text-white">Recent releases</h3>
            <Link
              href="/releases"
              className="text-xs font-medium transition-opacity hover:opacity-70"
              style={{ color: 'var(--primary)' }}
            >
              View all →
            </Link>
          </div>
          <div className="flex flex-col gap-2 p-3">
            {recentReleases.map((r) => (
              <ReleaseRow key={r.id} release={r} onClick={() => setSelectedRelease(r)} />
            ))}
          </div>
        </div>

        {/* Distribution snapshot — admin/owner only */}
        {showDistribution && (
        <div
          className="rounded-xl overflow-hidden flex flex-col min-w-0"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <div
            className="h-px w-full"
            style={{
              background:
                'linear-gradient(to right, transparent, var(--accent) 20%, var(--primary) 80%, transparent)',
            }}
          />
          <div
            className="flex items-center justify-between px-4 py-3"
            style={{ borderBottom: '1px solid var(--border)' }}
          >
            <h3 className="text-sm font-semibold text-white">Distribution</h3>
            <Link
              href="/distribution"
              className="text-xs font-medium transition-opacity hover:opacity-70"
              style={{ color: 'var(--primary)' }}
            >
              View →
            </Link>
          </div>
          <div className="flex flex-col gap-3 p-4">
            <div className="flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                style={{ background: snapshotDotColor }}
              />
              <span className="text-sm" style={{ color: 'rgba(255,255,255,0.75)' }}>
                {snapshotText}
              </span>
            </div>
            {channels
              .filter((c) => c.status !== 'healthy')
              .map((c) => (
                <div
                  key={c.platform}
                  className="rounded-lg px-3 py-2.5 text-xs"
                  style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
                >
                  <span style={{ color: 'var(--coral)' }}>{c.platform}</span>
                  <span style={{ color: 'rgba(255,255,255,0.4)' }}>
                    {' '}— {c.errorMessage}
                  </span>
                </div>
              ))}
            {channels.every((c) => c.status === 'healthy') && (
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
                All channels operating normally.
              </p>
            )}
          </div>
        </div>
        )}
      </div>

      {selectedRelease && (
        <ReleaseDetail release={selectedRelease} onClose={() => setSelectedRelease(null)} />
      )}
    </>
  )
}
