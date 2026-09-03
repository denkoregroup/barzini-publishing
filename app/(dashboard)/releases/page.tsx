import { getArtists, getReleases } from '@/lib/labelgrid'
import { getScopeContext, scopeArtists, scopeByArtistId, scopeToSelectedByArtistId } from '@/lib/scope'
import ArtistSwitcher from '@/components/features/shared/ArtistSwitcher'
import PipelineBoard from '@/components/features/releases/PipelineBoard'

interface ReleasesPageProps {
  searchParams: Promise<{ artist?: string }>
}

export default async function ReleasesPage({ searchParams }: ReleasesPageProps) {
  const { artist: selectedArtistId } = await searchParams
  const ctx = await getScopeContext()

  // Artists are only fetched here to power the switcher — the board itself
  // renders releases.
  const [allArtists, allReleases] = await Promise.all([getArtists(), getReleases()])

  const managedArtists = scopeArtists(allArtists, ctx)
  const managedReleases = scopeByArtistId(allReleases, ctx)
  const releases = scopeToSelectedByArtistId(managedReleases, ctx.managerScoped ? selectedArtistId : undefined)

  return (
    <div className="flex flex-col gap-6 min-w-0">
      {/* Page header */}
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wider font-medium"
           style={{ color: 'var(--accent)' }}>
          Releases
        </p>
        <h1 className="mt-0.5 text-2xl font-semibold text-white">Release Pipeline</h1>
      </div>

      {ctx.managerScoped && (
        <ArtistSwitcher artists={managedArtists} selectedArtistId={selectedArtistId} />
      )}

      <PipelineBoard releases={releases} />
    </div>
  )
}
