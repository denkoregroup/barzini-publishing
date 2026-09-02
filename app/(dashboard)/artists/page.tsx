import { getArtists, getReleases } from '@/lib/labelgrid'
import { getScopeContext, scopeArtists, scopeByArtistId, scopeToSelected, scopeToSelectedByArtistId } from '@/lib/scope'
import ArtistSwitcher from '@/components/features/shared/ArtistSwitcher'
import ArtistsClient from '@/components/features/artists/ArtistsClient'

interface ArtistsPageProps {
  searchParams: Promise<{ artist?: string }>
}

export default async function ArtistsPage({ searchParams }: ArtistsPageProps) {
  const { artist: selectedArtistId } = await searchParams
  const ctx = await getScopeContext()

  const [allArtists, allReleases] = await Promise.all([getArtists(), getReleases()])

  const managedArtists = scopeArtists(allArtists, ctx)
  const managedReleases = scopeByArtistId(allReleases, ctx)

  const artists = scopeToSelected(managedArtists, ctx.managerScoped ? selectedArtistId : undefined)
  const releases = scopeToSelectedByArtistId(managedReleases, ctx.managerScoped ? selectedArtistId : undefined)

  return (
    <div className="flex flex-col gap-6 min-w-0">
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wider font-medium"
           style={{ color: 'var(--accent)' }}>
          Artists
        </p>
        <h1 className="mt-0.5 text-2xl font-semibold text-white">Artist Roster</h1>
      </div>

      {ctx.managerScoped && (
        <ArtistSwitcher artists={managedArtists} selectedArtistId={selectedArtistId} />
      )}

      <ArtistsClient artists={artists} releases={releases} />
    </div>
  )
}
