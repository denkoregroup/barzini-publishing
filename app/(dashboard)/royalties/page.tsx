import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isManagerOrAbove, isAdminOrAbove } from '@/lib/utils'
import type { Artist, PlatformRevenue, Release, RoyaltyStatement, RoyaltySummary } from '@/lib/types'
import { getRoyaltySummary, getRoyaltyStatements, getArtists, getReleases } from '@/lib/labelgrid'
import RoyaltiesClient from '@/components/features/royalties/RoyaltiesClient'

// Builds a manager-scoped summary directly from the artists/statements they're assigned to,
// rather than exposing label-wide totals. This is an oversight/reporting view, not the full ledger.
function buildScopedSummary(
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

export default async function RoyaltiesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const role = user?.user_metadata?.role as string | undefined

  // Defense in depth — proxy.ts already blocks non-manager/admin/owner roles from this route.
  if (!user || !isManagerOrAbove(role)) {
    redirect('/')
  }

  const managerScoped = !isAdminOrAbove(role) // true only for role === 'manager'
  const managedArtistIds: string[] = Array.isArray(user.user_metadata?.managed_artist_ids)
    ? user.user_metadata.managed_artist_ids
    : []

  const [allArtists, allReleases, allStatements] = await Promise.all([
    getArtists(),
    getReleases(),
    getRoyaltyStatements(),
  ])

  let artists: Artist[] = allArtists
  let releases: Release[] = allReleases
  let statements: RoyaltyStatement[] = allStatements
  let summary30: RoyaltySummary
  let summary90: RoyaltySummary
  let summary365: RoyaltySummary

  if (managerScoped) {
    artists = allArtists.filter((a) => managedArtistIds.includes(a.id))
    releases = allReleases.filter((r) => managedArtistIds.includes(r.artistId))
    statements = allStatements.filter((s) => managedArtistIds.includes(s.artistId))
    summary30 = buildScopedSummary(statements, artists, 30)
    summary90 = buildScopedSummary(statements, artists, 90)
    summary365 = buildScopedSummary(statements, artists, 365)
  } else {
    [summary30, summary90, summary365] = await Promise.all([
      getRoyaltySummary(30),
      getRoyaltySummary(90),
      getRoyaltySummary(365),
    ])
  }

  return (
    <div className="flex flex-col gap-6 min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 min-w-0">
        <div className="min-w-0">
          <p className="text-xs text-white/40 uppercase tracking-wider font-medium">
            {managerScoped ? 'Manager oversight — assigned artists only' : 'Label overview'}
          </p>
          <h1 className="mt-0.5 text-2xl font-semibold text-white">Royalties</h1>
        </div>
      </div>

      <RoyaltiesClient
        summary30={summary30}
        summary90={summary90}
        summary365={summary365}
        statements={statements}
        artists={artists}
        releases={releases}
      />
    </div>
  )
}
