import { redirect } from 'next/navigation'
import { isManagerOrAbove } from '@/lib/utils'
import type { RoyaltySummary } from '@/lib/types'
import { getRoyaltySummary, getRoyaltyStatements, getArtists, getReleases } from '@/lib/labelgrid'
import {
  getScopeContext,
  scopeArtists,
  scopeByArtistId,
  scopeToSelected,
  scopeToSelectedByArtistId,
  buildScopedSummary,
} from '@/lib/scope'
import ArtistSwitcher from '@/components/features/shared/ArtistSwitcher'
import RoyaltiesClient from '@/components/features/royalties/RoyaltiesClient'

interface RoyaltiesPageProps {
  searchParams: Promise<{ artist?: string }>
}

export default async function RoyaltiesPage({ searchParams }: RoyaltiesPageProps) {
  const { artist: selectedArtistId } = await searchParams
  const ctx = await getScopeContext()

  // Defense in depth — proxy.ts already blocks non-manager/admin/owner roles from this route.
  if (!isManagerOrAbove(ctx.role)) {
    redirect('/')
  }

  const [allArtists, allReleases, allStatements] = await Promise.all([
    getArtists(),
    getReleases(),
    getRoyaltyStatements(),
  ])

  const managedArtists = scopeArtists(allArtists, ctx)
  const managedReleases = scopeByArtistId(allReleases, ctx)
  const managedStatements = scopeByArtistId(allStatements, ctx)

  const artists = scopeToSelected(managedArtists, ctx.managerScoped ? selectedArtistId : undefined)
  const releases = scopeToSelectedByArtistId(managedReleases, ctx.managerScoped ? selectedArtistId : undefined)
  const statements = scopeToSelectedByArtistId(managedStatements, ctx.managerScoped ? selectedArtistId : undefined)

  let summary30: RoyaltySummary
  let summary90: RoyaltySummary
  let summary365: RoyaltySummary

  if (ctx.managerScoped) {
    summary30 = buildScopedSummary(statements, artists, 30)
    summary90 = buildScopedSummary(statements, artists, 90)
    summary365 = buildScopedSummary(statements, artists, 365)
  } else {
    ;[summary30, summary90, summary365] = await Promise.all([
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
            {ctx.managerScoped ? 'Manager oversight — assigned artists only' : 'Label overview'}
          </p>
          <h1 className="mt-0.5 text-2xl font-semibold text-white">Royalties</h1>
        </div>
      </div>

      {ctx.managerScoped && (
        <ArtistSwitcher artists={managedArtists} selectedArtistId={selectedArtistId} />
      )}

      <RoyaltiesClient
        summary30={summary30}
        summary90={summary90}
        summary365={summary365}
        statements={statements}
        artists={artists}
        releases={releases}
        managerScoped={ctx.managerScoped}
      />
    </div>
  )
}
