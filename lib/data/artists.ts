import type { Artist } from '@/lib/types'
// import { lgFetch } from '@/lib/labelgrid/client'

export async function getArtists(): Promise<Artist[]> {
  // TODO: replace with lgFetch<Artist[]>('/artists') when API creds are active
  return [
    {
      id: 'artist-001',
      name: 'Theo Marsh',
      initials: 'TM',
      genres: ['Indie Folk', 'Acoustic'],
      releaseCount: 4,
      splitPercentage: 70,
      status: 'active',
      monthlyListeners: 48200,
    },
    {
      id: 'artist-002',
      name: 'Coral & Vine',
      initials: 'CV',
      genres: ['Dream Pop', 'Shoegaze'],
      releaseCount: 2,
      splitPercentage: 65,
      status: 'active',
      monthlyListeners: 21400,
    },
    {
      id: 'artist-003',
      name: 'Nine Rivers',
      initials: 'NR',
      genres: ['Electronic', 'Ambient'],
      releaseCount: 3,
      splitPercentage: 70,
      status: 'active',
      monthlyListeners: 33800,
    },
    {
      id: 'artist-004',
      name: 'Lena Kade',
      initials: 'LK',
      genres: ['Singer-Songwriter'],
      releaseCount: 1,
      splitPercentage: 60,
      status: 'active',
      monthlyListeners: 7200,
    },
    {
      id: 'artist-005',
      name: 'Driftwood Sons',
      initials: 'DS',
      genres: ['Americana', 'Country'],
      releaseCount: 2,
      splitPercentage: 65,
      status: 'active',
      monthlyListeners: 14600,
    },
    {
      id: 'artist-006',
      name: 'Static Bloom',
      initials: 'SB',
      genres: ['Noise Pop', 'Indie'],
      releaseCount: 1,
      splitPercentage: 70,
      status: 'active',
      monthlyListeners: 2900,
    },
  ]
}

export async function getArtistById(id: string): Promise<Artist | undefined> {
  // TODO: replace with lgFetch<Artist>(`/artists/${id}`) when API creds are active
  const artists = await getArtists()
  return artists.find((a) => a.id === id)
}
