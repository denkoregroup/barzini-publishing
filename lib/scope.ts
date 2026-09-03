import { createClient } from '@/lib/supabase/server'
import type { Artist, PlatformRevenue, RoyaltyStatement, RoyaltySummary } from '@/lib/types'

// Shared manager-scoping helpers. A manager only ever sees the artists (and
// artist-attributed data) they've been assigned — everyone else sees the
// full catalog. Centralized here so every route that surfaces artist,
// release, or financial data applies the same rule instead of reimplementing
// it inline (see royalties/page.tsx history for what drifts when it isn't).

export interface ScopeContext {
  role?: string
  managerScoped: boolean // true only when role === 'manager'
  managedArtistIds: string[] // only populated when managerScoped
}

export async function getScopeContext(): Promise<ScopeContext> {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const role = user?.user_metadata?.role as string | undefined
  const managerScoped = role === 'manager'
  const managedArtistIds =
    managerScoped && Array.isArray(user?.user_metadata?.managed_artist_ids)
      ? (user!.user_metadata.managed_artist_ids as string[])
      : []
  return { role, managerScoped, managedArtistIds }
}

// Narrows a list of artists down to the manager's assigned set. No-op for
// non-manager-scoped viewers.
export function scopeArtists<T extends { id: string }>(items: T[], ctx: ScopeContext): T[] {
  return ctx.managerScoped ? items.filter((a) => ctx.managedArtistIds.includes(a.id)) : items
}

// Narrows a list of artist-attributed records (releases, statements, ...)
// down to the manager's assigned artists. No-op for non-manager-scoped viewers.
export function scopeByArtistId<T extends { artistId: string }>(items: T[], ctx: ScopeContext): T[] {
  return ctx.managerScoped ? items.filter((a) => ctx.managedArtistIds.includes(a.artistId)) : items
}

// Further narrows an already-scoped list of artists down to a single
// selected artist (the `?artist=` switcher). `undefined` or `'all'` is the
// aggregate view — a no-op.
export function scopeToSelected<T extends { id: string }>(
  items: T[],
  selectedArtistId: string | undefined,
): T[] {
  if (!selectedArtistId || selectedArtistId === 'all') return items
  return items.filter((a) => a.id === selectedArtistId)
}

// Same as scopeToSelected, keyed by artistId — for releases/statements.
export function scopeToSelectedByArtistId<T extends { artistId: string }>(
  items: T[],
  selectedArtistId: string | undefined,
): T[] {
  if (!selectedArtistId || selectedArtistId === 'all') return items
  return items.filter((a) => a.artistId === selectedArtistId)
}

// Builds a manager-scoped (and optionally single-artist-scoped) summary
// directly from the artists/statements they're assigned to, rather than
// exposing label-wide totals. This is an oversight/reporting view, not the
// full ledger — used anywhere a manager-scoped page surfaces royalty totals
// (royalties, dashboard home).
export function buildScopedSummary(
  statements: RoyaltyStatement[],
  artists: Artist[],
  days: 30 | 90 | 365,
): RoyaltySummary {
  const totalRevenue = statements.reduce((sum, s) => sum + s.grossRevenue, 0)
  const artistRoyaltiesOwed = statements.reduce((sum, s) => sum + s.royaltyOwed, 0)
  const pendingPayouts = statements
    .filter((s) => s.status !== 'paid')
    .reduce((sum, s) => sum + s.royaltyOwed, 0)
  const labelRetained = Math.max(totalRevenue - artistRoyaltiesOwed, 0)

  const platformMap = new Map<string, PlatformRevenue>()
  for (const s of statements) {
    for (const p of s.platforms) {
      const cur = platformMap.get(p.platform) ?? { platform: p.platform, revenue: 0, streams: 0 }
      cur.revenue += p.revenue
      cur.streams += p.streams
      platformMap.set(p.platform, cur)
    }
  }

  const topArtists = artists
    .map((a) => {
      const owed = statements
        .filter((s) => s.artistId === a.id)
        .reduce((sum, s) => sum + s.royaltyOwed, 0)
      return {
        artistId: a.id,
        artistName: a.name,
        initials: a.initials,
        splitPercentage: a.splitPercentage,
        releaseCount: a.releaseCount,
        royaltyOwed: owed,
        deltaPercent: 0,
      }
    })
    .filter((a) => a.royaltyOwed > 0)
    .sort((a, b) => b.royaltyOwed - a.royaltyOwed)

  return {
    totalRevenue,
    artistRoyaltiesOwed,
    pendingPayouts,
    labelRetained,
    periodDays: days,
    revenueByPlatform: [...platformMap.values()],
    topArtists,
  }
}

// Sums a set of per-release PlatformRevenue[] breakdowns (e.g. from
// getReleaseInsight) into one platform-keyed array, for a manager-scoped
// Analytics view where there's no label-wide getAnalyticsStreams()
// equivalent to call. Note this has no date dimension — ReleaseInsight is an
// all-time cumulative figure — so it can't be bucketed by period the way the
// label-wide analytics mock data is.
export function mergePlatformRevenue(breakdowns: PlatformRevenue[][]): PlatformRevenue[] {
  const platformMap = new Map<string, PlatformRevenue>()
  for (const breakdown of breakdowns) {
    for (const p of breakdown) {
      const cur = platformMap.get(p.platform) ?? { platform: p.platform, revenue: 0, streams: 0 }
      cur.revenue += p.revenue
      cur.streams += p.streams
      platformMap.set(p.platform, cur)
    }
  }
  return [...platformMap.values()]
}
