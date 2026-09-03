'use client'

import { useState } from 'react'
import type { Artist, Release, RoyaltyStatement, RoyaltySummary } from '@/lib/types'
import SummaryStrip from '@/components/features/royalties/SummaryStrip'
import PlatformBreakdown from '@/components/features/royalties/PlatformBreakdown'
import TopArtists from '@/components/features/royalties/TopArtists'
import PayoutTable from '@/components/features/royalties/PayoutTable'
import ArtistDetail from '@/components/features/artists/ArtistDetail'

type Period = 30 | 90 | 365

const PERIOD_PILLS: { label: string; days: Period }[] = [
  { label: '30D', days: 30 },
  { label: '90D', days: 90 },
  { label: '1Y', days: 365 },
]

interface Props {
  summary30: RoyaltySummary
  summary90: RoyaltySummary
  summary365: RoyaltySummary
  statements: RoyaltyStatement[]
  artists: Artist[]
  releases: Release[]
  // buildScopedSummary() doesn't bucket statements by date at all (the mock
  // RoyaltyStatement data just carries a fixed periodStart/periodEnd, and
  // `days` is only echoed into periodDays, never used to filter) — so for a
  // manager-scoped viewer, 30D/90D/1Y are currently identical numbers.
  // Rather than show pills that don't do anything, hide the extras and stay
  // on 30D. Non-manager summaries genuinely differ per period, so they keep
  // all three.
  managerScoped?: boolean
}

export default function RoyaltiesClient({
  summary30,
  summary90,
  summary365,
  statements,
  artists,
  releases,
  managerScoped = false,
}: Props) {
  const [activePeriod, setActivePeriod] = useState<Period>(30)
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null)

  const summary = activePeriod === 30 ? summary30 : activePeriod === 365 ? summary365 : summary90
  const visiblePills = managerScoped ? PERIOD_PILLS.filter((p) => p.days === 30) : PERIOD_PILLS

  function handleArtistClick(artistId: string) {
    const match = artists.find((a) => a.id === artistId)
    if (match) setSelectedArtist(match)
  }

  function getArtistReleases(artist: Artist) {
    return releases.filter((r) => r.artistId === artist.id)
  }

  return (
    <>
      {/* Period pills — hidden entirely for manager-scoped viewers, since there's
          only one meaningful period (see managerScoped prop doc above) */}
      {visiblePills.length > 1 && (
      <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
        {visiblePills.map(({ label, days }) => {
          const active = activePeriod === days
          return (
            <button
              key={label}
              onClick={() => setActivePeriod(days)}
              className="rounded-full px-3 py-1 text-xs font-semibold flex-shrink-0 transition-colors"
              style={{
                background: active
                  ? 'var(--primary)'
                  : 'color-mix(in oklch, var(--primary) 10%, transparent)',
                color: active ? 'var(--primary-foreground)' : 'var(--primary)',
                border: '1px solid color-mix(in oklch, var(--primary) 30%, transparent)',
              }}
            >
              {label}
            </button>
          )
        })}
      </div>
      )}

      <SummaryStrip summary={summary} />

      <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-4 min-w-0">
        <PlatformBreakdown platforms={summary.revenueByPlatform} />
        <TopArtists artists={summary.topArtists} onArtistClick={handleArtistClick} />
      </div>

      <PayoutTable statements={statements} />

      {selectedArtist && (
        <ArtistDetail
          artist={selectedArtist}
          releases={getArtistReleases(selectedArtist)}
          onClose={() => setSelectedArtist(null)}
        />
      )}
    </>
  )
}
