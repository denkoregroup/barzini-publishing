'use client'

import { useState } from 'react'
import { ExternalLink, ChevronDown, ChevronUp } from 'lucide-react'
import type { Artist, Release, ReleaseInsight } from '@/lib/types'
import Sheet from '@/components/ui/Sheet'
import { getReleaseInsight } from '@/lib/data'

interface ArtistDetailProps {
  artist: Artist
  releases: Release[]
  onClose: () => void
}

const STATUS_DOT: Record<Release['status'], string> = {
  live: 'var(--primary)',
  scheduled: 'var(--accent)',
  processing: 'rgba(255,255,255,0.4)',
  draft: 'rgba(255,255,255,0.2)',
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function fmtListeners(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k'
  return n.toString()
}

function fmtMoney(n: number) {
  return '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 })
}

function fmtStreams(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(2) + 'M'
  if (n >= 1_000) return (n / 1_000).toFixed(0) + 'k'
  return String(n)
}

function InsightPanel({ insight }: { insight: ReleaseInsight }) {
  return (
    <div
      className="mt-2 rounded-lg p-3 flex flex-col gap-3"
      style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
    >
      <div className="grid grid-cols-2 gap-3">
        <div>
          <p className="text-[10px] uppercase tracking-wider font-medium mb-0.5"
             style={{ color: 'var(--primary)', opacity: 0.7 }}>Total streams</p>
          <p className="text-sm font-medium tabular-nums"
             style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary)' }}>
            {fmtStreams(insight.totalStreams)}
          </p>
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-wider font-medium mb-0.5"
             style={{ color: 'var(--accent)', opacity: 0.7 }}>Total revenue</p>
          <p className="text-sm font-medium tabular-nums"
             style={{ fontFamily: 'var(--font-mono)', color: 'var(--accent)' }}>
            {fmtMoney(insight.totalRevenue)}
          </p>
        </div>
      </div>
      <div className="flex flex-col gap-1">
        {insight.platformBreakdown.map((p) => (
          <div key={p.platform} className="flex items-center justify-between gap-2 text-xs min-w-0">
            <span style={{ color: 'rgba(255,255,255,0.5)' }} className="truncate">{p.platform}</span>
            <span className="flex-shrink-0 tabular-nums"
                  style={{ fontFamily: 'var(--font-mono)', color: 'rgba(255,255,255,0.65)' }}>
              {fmtMoney(p.revenue)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

function ReleaseRowItem({ release }: { release: Release }) {
  const [expanded, setExpanded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [insight, setInsight] = useState<ReleaseInsight | null>(null)

  async function handleToggle() {
    if (!expanded && insight === null) {
      setLoading(true)
      const data = await getReleaseInsight(release.id)
      setInsight(data)
      setLoading(false)
    }
    setExpanded((v) => !v)
  }

  return (
    <div className="rounded-lg min-w-0"
         style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}>
      <div className="flex items-center gap-3 px-3 py-3 min-w-0">
        <div className="h-2 w-2 rounded-full flex-shrink-0"
             style={{ background: STATUS_DOT[release.status] }} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <p className="text-sm font-medium text-white truncate">{release.title}</p>
            {release.smartLinkUrl && (
              <a
                href={release.smartLinkUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex-shrink-0 transition-colors"
                style={{ color: 'rgba(255,255,255,0.3)' }}
                onMouseEnter={(e) => { e.currentTarget.style.color = 'var(--primary)' }}
                onMouseLeave={(e) => { e.currentTarget.style.color = 'rgba(255,255,255,0.3)' }}
                aria-label={`Smart link for ${release.title}`}
              >
                <ExternalLink size={13} />
              </a>
            )}
          </div>
          <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.38)' }}>
            {release.type.charAt(0).toUpperCase() + release.type.slice(1)} · {fmtDate(release.releaseDate)}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-[11px] capitalize" style={{ color: STATUS_DOT[release.status] }}>
            {release.status}
          </span>
          <button
            onClick={handleToggle}
            className="rounded p-0.5 transition-opacity hover:opacity-70"
            style={{ color: 'rgba(255,255,255,0.4)' }}
            aria-label={expanded ? 'Collapse' : 'Expand'}
          >
            {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        </div>
      </div>
      {expanded && (
        <div className="px-3 pb-3">
          {loading ? (
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>Loading…</p>
          ) : insight ? (
            <InsightPanel insight={insight} />
          ) : null}
        </div>
      )}
    </div>
  )
}

export default function ArtistDetail({ artist, releases, onClose }: ArtistDetailProps) {
  const artistSplit = artist.splitPercentage
  const labelSplit = 100 - artistSplit

  return (
    <Sheet open title={artist.name} onClose={onClose}>
      {/* Avatar + meta */}
      <div className="flex items-center gap-4 mb-6">
        <div
          className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full text-lg font-bold"
          style={{
            background: 'color-mix(in oklch, var(--accent) 15%, transparent)',
            color: 'var(--accent)',
          }}
        >
          {artist.initials}
        </div>
        <div className="min-w-0">
          <p className="text-base font-semibold text-white">{artist.name}</p>
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {artist.genres.join(' · ')}
          </p>
          {artist.monthlyListeners != null && (
            <p
              className="text-xs tabular-nums mt-0.5"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary)' }}
            >
              {fmtListeners(artist.monthlyListeners)} monthly listeners
            </p>
          )}
        </div>
      </div>

      {/* Royalty split bar */}
      <div className="mb-6">
        <p className="text-[11px] uppercase tracking-widest font-medium mb-2"
           style={{ color: 'rgba(255,255,255,0.38)' }}>
          Royalty Split
        </p>
        <div className="flex rounded-full overflow-hidden h-2.5" style={{ background: 'var(--surface-2)' }}>
          <div
            style={{ width: `${artistSplit}%`, background: 'var(--accent)' }}
            className="h-full"
          />
          <div
            style={{ width: `${labelSplit}%`, background: 'var(--primary)' }}
            className="h-full"
          />
        </div>
        <div className="flex justify-between mt-1.5 text-[10px]" style={{ color: 'rgba(255,255,255,0.4)' }}>
          <span style={{ color: 'var(--accent)' }}>Artist {artistSplit}%</span>
          <span style={{ color: 'var(--primary)' }}>Label {labelSplit}%</span>
        </div>
      </div>

      {/* Release history */}
      <div>
        <p className="text-[11px] uppercase tracking-widest font-medium mb-3"
           style={{ color: 'rgba(255,255,255,0.38)' }}>
          Releases ({releases.length})
        </p>
        {releases.length === 0 ? (
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.3)' }}>No releases yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {releases.map((r) => (
              <ReleaseRowItem key={r.id} release={r} />
            ))}
          </div>
        )}
      </div>
    </Sheet>
  )
}
