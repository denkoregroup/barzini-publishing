'use client'

import { useState, useMemo } from 'react'
import type { Artist, Release } from '@/lib/types'
import RosterGrid from '@/components/features/artists/RosterGrid'

const STATUS_FILTERS = ['All', 'Active', 'Inactive'] as const
type StatusFilter = (typeof STATUS_FILTERS)[number]

interface Props {
  artists: Artist[]
  releases: Release[]
  // Manager-scoped viewers already narrow by assigned artist via the
  // ArtistSwitcher above this component — the genre/status filter row is
  // redundant noise against a roster of one or two artists, so it's hidden
  // for them instead of stacking two filter mechanisms.
  hideFilters?: boolean
}

export default function ArtistsClient({ artists, releases, hideFilters = false }: Props) {
  const [activeGenre, setActiveGenre] = useState('All')
  const [activeStatus, setActiveStatus] = useState<StatusFilter>('All')

  const genres = useMemo(() => {
    const set = new Set<string>()
    artists.forEach((a) => a.genres.forEach((g) => set.add(g)))
    return ['All', ...Array.from(set).sort()]
  }, [artists])

  const filtered = useMemo(() => {
    return artists.filter((a) => {
      const genreMatch = activeGenre === 'All' || a.genres.includes(activeGenre)
      const statusMatch =
        activeStatus === 'All' ||
        (activeStatus === 'Active' && a.status === 'active') ||
        (activeStatus === 'Inactive' && a.status === 'inactive')
      return genreMatch && statusMatch
    })
  }, [artists, activeGenre, activeStatus])

  function pillStyle(active: boolean) {
    return {
      background: active ? 'var(--primary)' : 'var(--surface-2)',
      color: active ? 'var(--primary-foreground)' : 'rgba(255,255,255,0.55)',
      border: `1px solid ${active ? 'transparent' : 'var(--border)'}`,
    }
  }

  return (
    <>
      {!hideFilters && (
        <div className="flex gap-2 overflow-x-auto pb-0.5 flex-nowrap">
          {genres.map((g) => (
            <button
              key={g}
              onClick={() => setActiveGenre(g)}
              className="rounded-full px-3 py-1 text-xs font-medium flex-shrink-0 transition-colors"
              style={pillStyle(activeGenre === g)}
            >
              {g}
            </button>
          ))}
          <div
            className="w-px flex-shrink-0 self-stretch my-0.5"
            style={{ background: 'var(--border)' }}
          />
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setActiveStatus(s)}
              className="rounded-full px-3 py-1 text-xs font-medium flex-shrink-0 transition-colors"
              style={pillStyle(activeStatus === s)}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      <RosterGrid artists={hideFilters ? artists : filtered} releases={releases} />
    </>
  )
}
