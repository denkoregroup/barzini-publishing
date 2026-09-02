import { getArtists, getReleases } from '@/lib/labelgrid'
import { getScopeContext, scopeArtists, scopeByArtistId, scopeToSelected, scopeToSelectedByArtistId } from '@/lib/scope'
import ArtistSwitcher from '@/components/features/shared/ArtistSwitcher'
import ArtistsClient from '@/components/features/artists/ArtistsClient'

interface ArtistsPageProps {
  searchParams: Promise<{ artist?: string; debug?: string }>
}

export default async function ArtistsPage({ searchParams }: ArtistsPageProps) {
  const { artist: selectedArtistId, debug } = await searchParams
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

      {/* TEMPORARY diagnostic — visit ?debug=1 to see what the server computed
          for this account. Remove once the switcher visibility issue is resolved. */}
      {debug === '1' && (
        <pre
          className="text-xs whitespace-pre-wrap rounded-lg p-4"
          style={{ background: 'var(--surface-2)', border: '1px solid var(--coral)', color: 'rgba(255,255,255,0.8)' }}
        >
{JSON.stringify(
  {
    role: ctx.role,
    managerScoped: ctx.managerScoped,
    managedArtistIds_fromAccount: ctx.managedArtistIds,
    allArtistIds_fromMockData: allArtists.map((a) => a.id),
    managedArtists_afterScoping: managedArtists.map((a) => ({ id: a.id, name: a.name })),
    switcherShouldRender: ctx.managerScoped && managedArtists.length > 1,
  },
  null,
  2,
)}
        </pre>
      )}

      {ctx.managerScoped && (
        <ArtistSwitcher artists={managedArtists} selectedArtistId={selectedArtistId} />
      )}

      <ArtistsClient artists={artists} releases={releases} />
    </div>
  )
}
