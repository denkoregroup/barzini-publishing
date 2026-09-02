import { createClient } from '@/lib/supabase/server'
import { getDisplayName } from '@/lib/utils'
import type { RoyaltySummary } from '@/lib/types'
import { getRoyaltySummary, getReleases, getDistributionStatus, getArtists, getRoyaltyStatements } from '@/lib/labelgrid'
import {
  getScopeContext,
  scopeArtists,
  scopeByArtistId,
  scopeToSelected,
  scopeToSelectedByArtistId,
  buildScopedSummary,
} from '@/lib/scope'
import ArtistSwitcher from '@/components/features/shared/ArtistSwitcher'
import DashboardOverview from '@/components/features/dashboard/DashboardOverview'

interface DashboardPageProps {
  searchParams: Promise<{ artist?: string }>
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const { artist: selectedArtistId } = await searchParams
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const displayName = user
    ? getDisplayName({ email: user.email ?? undefined, user_metadata: user.user_metadata })
    : null

  const ctx = await getScopeContext()

  const [allReleases, channels, allArtists, allStatements] = await Promise.all([
    getReleases(),
    getDistributionStatus(),
    getArtists(),
    // Only needed to build a manager-scoped summary; skip the label-wide call below when scoped.
    ctx.managerScoped ? getRoyaltyStatements() : Promise.resolve([]),
  ])

  const managedArtists = scopeArtists(allArtists, ctx)
  const managedReleases = scopeByArtistId(allReleases, ctx)
  const managedStatements = scopeByArtistId(allStatements, ctx)

  const artists = scopeToSelected(managedArtists, ctx.managerScoped ? selectedArtistId : undefined)
  const releases = scopeToSelectedByArtistId(managedReleases, ctx.managerScoped ? selectedArtistId : undefined)
  const statements = scopeToSelectedByArtistId(managedStatements, ctx.managerScoped ? selectedArtistId : undefined)

  const summary: RoyaltySummary = ctx.managerScoped
    ? buildScopedSummary(statements, artists, 90)
    : await getRoyaltySummary(90)

  return (
    <div className="flex flex-col gap-6 min-w-0">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold text-white">
          {displayName ? `Welcome back, ${displayName}.` : 'Dashboard'}
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Here&apos;s your label at a glance.
        </p>
      </div>

      {ctx.managerScoped && (
        <ArtistSwitcher artists={managedArtists} selectedArtistId={selectedArtistId} />
      )}

      <DashboardOverview
        summary={summary}
        releases={releases}
        channels={channels}
        artists={artists}
      />
    </div>
  )
}
