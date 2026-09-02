import type { RoyaltySummary, RoyaltyStatement } from '@/lib/types'
// import { lgFetch } from '@/lib/labelgrid/client'

export async function getRoyaltySummary(period: 30 | 90 | 365): Promise<RoyaltySummary> {
  // TODO: replace with lgFetch<Transaction[]>('/transactions') when API creds are active
  // — aggregate client-side by period using filter[start_date] / filter[end_date] params
  if (period === 30) {
    return {
      totalRevenue: 8820,
      artistRoyaltiesOwed: 5640,
      pendingPayouts: 2100,
      labelRetained: 3180,
      periodDays: 30,
      revenueByPlatform: [
        { platform: 'Spotify', revenue: 4050, streams: 560000 },
        { platform: 'Apple Music', revenue: 2620, streams: 280000 },
        { platform: 'YouTube Music', revenue: 1300, streams: 190000 },
        { platform: 'Tidal', revenue: 850, streams: 65000 },
      ],
      topArtists: [
        {
          artistId: 'artist-001',
          artistName: 'Theo Marsh',
          initials: 'TM',
          splitPercentage: 70,
          releaseCount: 4,
          royaltyOwed: 3410,
          deltaPercent: 7.2,
        },
        {
          artistId: 'artist-003',
          artistName: 'Nine Rivers',
          initials: 'NR',
          splitPercentage: 70,
          releaseCount: 3,
          royaltyOwed: 2230,
          deltaPercent: -1.8,
        },
      ],
    }
  }

  if (period === 365) {
    return {
      totalRevenue: 98200,
      artistRoyaltiesOwed: 62400,
      pendingPayouts: 18600,
      labelRetained: 35800,
      periodDays: 365,
      revenueByPlatform: [
        { platform: 'Spotify', revenue: 45100, streams: 6200000 },
        { platform: 'Apple Music', revenue: 29300, streams: 3100000 },
        { platform: 'YouTube Music', revenue: 14800, streams: 2050000 },
        { platform: 'Tidal', revenue: 9000, streams: 710000 },
      ],
      topArtists: [
        {
          artistId: 'artist-001',
          artistName: 'Theo Marsh',
          initials: 'TM',
          splitPercentage: 70,
          releaseCount: 4,
          royaltyOwed: 38200,
          deltaPercent: 22.1,
        },
        {
          artistId: 'artist-003',
          artistName: 'Nine Rivers',
          initials: 'NR',
          splitPercentage: 70,
          releaseCount: 3,
          royaltyOwed: 24200,
          deltaPercent: 11.4,
        },
        {
          artistId: 'artist-002',
          artistName: 'Coral & Vine',
          initials: 'CV',
          splitPercentage: 65,
          releaseCount: 2,
          royaltyOwed: 0,
          deltaPercent: 0,
        },
      ],
    }
  }

  // 90d
  return {
    totalRevenue: 28940,
    artistRoyaltiesOwed: 18402,
    pendingPayouts: 6180,
    labelRetained: 10538,
    periodDays: 90,
    revenueByPlatform: [
      { platform: 'Spotify', revenue: 13240, streams: 1840000 },
      { platform: 'Apple Music', revenue: 8610, streams: 920000 },
      { platform: 'YouTube Music', revenue: 4320, streams: 610000 },
      { platform: 'Tidal', revenue: 2770, streams: 210000 },
    ],
    topArtists: [
      {
        artistId: 'artist-001',
        artistName: 'Theo Marsh',
        initials: 'TM',
        splitPercentage: 70,
        releaseCount: 4,
        royaltyOwed: 11200,
        deltaPercent: 12.4,
      },
      {
        artistId: 'artist-003',
        artistName: 'Nine Rivers',
        initials: 'NR',
        splitPercentage: 70,
        releaseCount: 3,
        royaltyOwed: 7202,
        deltaPercent: -3.1,
      },
    ],
  }
}

export async function getRoyaltyStatements(artistId?: string): Promise<RoyaltyStatement[]> {
  // TODO: replace with lgFetch<RoyaltyStatement[]>('/statements') when API creds are active
  // — filter by artistId client-side until Supabase cache layer is in place
  // NOTE: statements will be cached in Supabase in a future PR —
  // this function will read from cache first, fall back to lgFetch
  const statements: RoyaltyStatement[] = [
    {
      id: 'stmt-001',
      artistId: 'artist-001',
      artistName: 'Theo Marsh',
      periodStart: '2025-01-01',
      periodEnd: '2025-03-31',
      grossRevenue: 26300,
      splitPercentage: 70,
      royaltyOwed: 18410,
      status: 'paid',
      paidAt: '2025-04-15',
      platforms: [
        { platform: 'Spotify', revenue: 14000, streams: 1100000 },
        { platform: 'Apple Music', revenue: 12300, streams: 740000 },
      ],
    },
    {
      id: 'stmt-002',
      artistId: 'artist-003',
      artistName: 'Nine Rivers',
      periodStart: '2025-01-01',
      periodEnd: '2025-03-31',
      grossRevenue: 14200,
      splitPercentage: 65,
      royaltyOwed: 9230,
      status: 'pending',
      scheduledPayoutDate: '2025-07-15',
      platforms: [
        { platform: 'Spotify', revenue: 8100, streams: 620000 },
        { platform: 'YouTube Music', revenue: 6100, streams: 490000 },
      ],
    },
  ]
  if (artistId) return statements.filter((s) => s.artistId === artistId)
  return statements
}
