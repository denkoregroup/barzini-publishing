import { getArtists, getReleases } from '@/lib/data'
import ArtistsClient from '@/components/features/artists/ArtistsClient'

export default async function ArtistsPage() {
  const [artists, releases] = await Promise.all([getArtists(), getReleases()])

  return (
    <div className="flex flex-col gap-6 min-w-0">
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wider font-medium"
           style={{ color: 'var(--accent)' }}>
          Artists
        </p>
        <h1 className="mt-0.5 text-2xl font-semibold text-white">Artist Roster</h1>
      </div>
      <ArtistsClient artists={artists} releases={releases} />
    </div>
  )
}
