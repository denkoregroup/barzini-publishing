'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import type { Artist } from '@/lib/types'

interface ArtistSwitcherProps {
  // The manager's full assigned artist list (already scoped to
  // managedArtistIds, unfiltered by the current selection).
  artists: Artist[]
  // The currently selected artist id, or undefined/'all' for the aggregate.
  selectedArtistId?: string
}

// Sticky pill row letting a manager with multiple assigned artists narrow
// the current page down to one of them via the `?artist=` search param.
// Only renders when there's actually a choice to make (>1 assigned artist) —
// callers are responsible for the manager-scoped gate.
export default function ArtistSwitcher({ artists, selectedArtistId }: ArtistSwitcherProps) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  if (artists.length <= 1) return null

  const active = selectedArtistId && selectedArtistId !== 'all' ? selectedArtistId : 'all'

  function hrefFor(id: string) {
    const params = new URLSearchParams(searchParams.toString())
    if (id === 'all') {
      params.delete('artist')
    } else {
      params.set('artist', id)
    }
    const qs = params.toString()
    return qs ? `${pathname}?${qs}` : pathname
  }

  function pillStyle(isActive: boolean) {
    return {
      color: isActive ? 'var(--primary)' : 'rgba(255,255,255,0.55)',
      background: isActive ? 'color-mix(in oklch, var(--primary) 12%, transparent)' : 'var(--surface-2)',
      border: `1px solid ${isActive ? 'color-mix(in oklch, var(--primary) 30%, transparent)' : 'var(--border)'}`,
    }
  }

  return (
    <div
      className="sticky z-30 rounded-xl px-3 py-2.5"
      style={{
        top: '3.5rem', // matches TopBar's h-14
        background: 'var(--surface)',
        border: '1px solid var(--border)',
      }}
    >
      <div className="flex items-center gap-2 overflow-x-auto pb-0.5 flex-nowrap">
        <span
          className="text-[11px] uppercase tracking-widest font-medium flex-shrink-0 pr-1"
          style={{ color: 'rgba(255,255,255,0.35)' }}
        >
          Viewing
        </span>
        <Link
          href={hrefFor('all')}
          className="rounded-full px-3 py-1 text-xs font-semibold flex-shrink-0 transition-colors"
          style={pillStyle(active === 'all')}
        >
          All
        </Link>
        {artists.map((a) => {
          const isActive = active === a.id
          // Clicking the already-active artist again deselects it, back to "All" —
          // rather than re-navigating to the same artist it's already showing.
          return (
            <Link
              key={a.id}
              href={hrefFor(isActive ? 'all' : a.id)}
              className="flex items-center gap-1.5 rounded-full pl-1.5 pr-3 py-1 text-xs font-semibold flex-shrink-0 transition-colors"
              style={pillStyle(isActive)}
            >
              <span
                className="flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold flex-shrink-0"
                style={{
                  background: 'color-mix(in oklch, var(--primary) 20%, transparent)',
                  color: 'var(--primary)',
                }}
              >
                {a.initials}
              </span>
              {a.name}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
