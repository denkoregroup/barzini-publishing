import type { Release, ReleaseInsight } from '@/lib/types'
// import { lgFetch } from '@/lib/labelgrid/client'

export async function getReleases(): Promise<Release[]> {
  // TODO: replace with lgFetch<Release[]>('/releases') when API creds are active
  return [
    {
      id: 'release-001',
      title: 'Midnight Tide',
      artistId: 'artist-001',
      artistName: 'Theo Marsh',
      type: 'single',
      status: 'live',
      releaseDate: '2025-02-14',
      smartLinkUrl: 'https://labelgrid.link/midnight-tide',
      platforms: [
        { name: 'spotify', status: 'live', lastSyncAt: '2025-02-14T10:00:00Z' },
        { name: 'apple_music', status: 'live', lastSyncAt: '2025-02-14T10:00:00Z' },
        { name: 'tidal', status: 'live', lastSyncAt: '2025-02-14T11:00:00Z' },
      ],
      labelgridId: 'lg-0101',
    },
    {
      id: 'release-002',
      title: 'Shoreline Sessions',
      artistId: 'artist-002',
      artistName: 'Coral & Vine',
      type: 'ep',
      status: 'scheduled',
      releaseDate: '2025-08-01',
      smartLinkUrl: 'https://labelgrid.link/shoreline-sessions',
      platforms: [
        { name: 'spotify', status: 'pending' },
        { name: 'apple_music', status: 'pending' },
        { name: 'youtube_music', status: 'pending' },
      ],
    },
    {
      id: 'release-003',
      title: 'Static Bloom',
      artistId: 'artist-003',
      artistName: 'Nine Rivers',
      type: 'album',
      status: 'draft',
      releaseDate: '2025-10-15',
      platforms: [],
    },
    {
      id: 'release-004',
      title: 'Harbour Lights',
      artistId: 'artist-001',
      artistName: 'Theo Marsh',
      type: 'ep',
      status: 'live',
      releaseDate: '2024-11-08',
      smartLinkUrl: 'https://labelgrid.link/harbour-lights',
      platforms: [
        { name: 'spotify', status: 'live', lastSyncAt: '2024-11-08T12:00:00Z' },
        { name: 'apple_music', status: 'live', lastSyncAt: '2024-11-08T12:00:00Z' },
        { name: 'amazon_music', status: 'live', lastSyncAt: '2024-11-09T08:00:00Z' },
      ],
      labelgridId: 'lg-0102',
    },
    {
      id: 'release-005',
      title: 'Undertow',
      artistId: 'artist-003',
      artistName: 'Nine Rivers',
      type: 'single',
      status: 'live',
      releaseDate: '2025-03-22',
      smartLinkUrl: 'https://labelgrid.link/undertow',
      platforms: [
        { name: 'spotify', status: 'live', lastSyncAt: '2025-03-22T09:00:00Z' },
        { name: 'tidal', status: 'live', lastSyncAt: '2025-03-22T10:00:00Z' },
      ],
      labelgridId: 'lg-0103',
    },
    {
      id: 'release-006',
      title: 'Reverie',
      artistId: 'artist-004',
      artistName: 'Lena Kade',
      type: 'single',
      status: 'processing',
      releaseDate: '2025-07-10',
      platforms: [
        { name: 'spotify', status: 'pending' },
        { name: 'apple_music', status: 'pending' },
      ],
    },
    {
      id: 'release-007',
      title: 'Delta Run',
      artistId: 'artist-005',
      artistName: 'Driftwood Sons',
      type: 'album',
      status: 'scheduled',
      releaseDate: '2025-09-05',
      platforms: [
        { name: 'spotify', status: 'pending' },
        { name: 'apple_music', status: 'pending' },
        { name: 'youtube_music', status: 'pending' },
        { name: 'tidal', status: 'pending' },
      ],
    },
    {
      id: 'release-008',
      title: 'Pale Signal',
      artistId: 'artist-006',
      artistName: 'Static Bloom',
      type: 'single',
      status: 'draft',
      releaseDate: '2025-11-01',
      platforms: [],
    },
    {
      id: 'release-009',
      title: 'Low Country',
      artistId: 'artist-005',
      artistName: 'Driftwood Sons',
      type: 'single',
      status: 'live',
      releaseDate: '2025-01-18',
      smartLinkUrl: 'https://labelgrid.link/low-country',
      platforms: [
        { name: 'spotify', status: 'live', lastSyncAt: '2025-01-18T10:00:00Z' },
        { name: 'apple_music', status: 'live', lastSyncAt: '2025-01-18T10:00:00Z' },
      ],
      labelgridId: 'lg-0104',
    },
  ]
}

export async function getReleaseById(id: string): Promise<Release | undefined> {
  // TODO: replace with lgFetch<Release>(`/releases/${id}`) when API creds are active
  const releases = await getReleases()
  return releases.find((r) => r.id === id)
}

export async function createRelease(data: Partial<Release>): Promise<Release> {
  // TODO: replace with lgFetch<Release>('/releases', { method: 'POST', body: JSON.stringify(data) })
  return {
    id: `rel-${Date.now()}`,
    title: data.title ?? 'Untitled',
    artistId: data.artistId ?? '',
    artistName: data.artistName ?? '',
    type: data.type ?? 'single',
    status: 'draft',
    releaseDate: data.releaseDate ?? new Date().toISOString(),
    platforms: data.platforms ?? [],
  }
}

export async function getReleaseInsight(releaseId: string): Promise<ReleaseInsight> {
  // TODO: replace with lgFetch<ReleaseInsight>(`/releases/${releaseId}/insight`)
  // when API creds are active — derived from release detail endpoint
  const MOCK: Record<string, ReleaseInsight> = {
    'release-001': {
      releaseId: 'release-001',
      totalStreams: 620000,
      totalRevenue: 7440,
      platformBreakdown: [
        { platform: 'Spotify', revenue: 4100, streams: 380000 },
        { platform: 'Apple Music', revenue: 2800, streams: 190000 },
        { platform: 'Tidal', revenue: 540, streams: 50000 },
      ],
    },
    'release-004': {
      releaseId: 'release-004',
      totalStreams: 480000,
      totalRevenue: 5760,
      platformBreakdown: [
        { platform: 'Spotify', revenue: 3200, streams: 300000 },
        { platform: 'Apple Music', revenue: 2100, streams: 145000 },
        { platform: 'Amazon Music', revenue: 460, streams: 35000 },
      ],
    },
    'release-005': {
      releaseId: 'release-005',
      totalStreams: 310000,
      totalRevenue: 3720,
      platformBreakdown: [
        { platform: 'Spotify', revenue: 2800, streams: 240000 },
        { platform: 'Tidal', revenue: 920, streams: 70000 },
      ],
    },
    'release-009': {
      releaseId: 'release-009',
      totalStreams: 195000,
      totalRevenue: 2340,
      platformBreakdown: [
        { platform: 'Spotify', revenue: 1400, streams: 120000 },
        { platform: 'Apple Music', revenue: 940, streams: 75000 },
      ],
    },
  }
  return (
    MOCK[releaseId] ?? {
      releaseId,
      totalStreams: 42000,
      totalRevenue: 504,
      platformBreakdown: [{ platform: 'Spotify', revenue: 504, streams: 42000 }],
    }
  )
}
