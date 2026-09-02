import type { PlatformRevenue } from '@/lib/types'
// import { lgFetch } from '@/lib/labelgrid/client'

export async function getAnalyticsStreams(period: 30 | 90 | 365): Promise<PlatformRevenue[]> {
  // TODO: replace with lgFetch<PlatformRevenue[]>(
  //   `/analytics/streams?filter[start_date]=${startDate}&filter[end_date]=${endDate}`
  // ) when API creds are active — with Supabase cache layer (TTL: 1h). See architecture doc.
  if (period === 30) {
    return [
      { platform: 'Spotify', revenue: 7200, streams: 600000 },
      { platform: 'Apple Music', revenue: 4600, streams: 300000 },
      { platform: 'YouTube Music', revenue: 2300, streams: 200000 },
      { platform: 'Tidal', revenue: 1400, streams: 68000 },
      { platform: 'Amazon Music', revenue: 640, streams: 30000 },
      { platform: 'Other DSPs', revenue: 290, streams: 13000 },
    ]
  }
  if (period === 365) {
    return [
      { platform: 'Spotify', revenue: 76200, streams: 6400000 },
      { platform: 'Apple Music', revenue: 49400, streams: 3200000 },
      { platform: 'YouTube Music', revenue: 24800, streams: 2100000 },
      { platform: 'Tidal', revenue: 15900, streams: 730000 },
      { platform: 'Amazon Music', revenue: 7200, streams: 340000 },
      { platform: 'Other DSPs', revenue: 3400, streams: 148000 },
    ]
  }
  // 90d
  return [
    { platform: 'Spotify', revenue: 22100, streams: 1840000 },
    { platform: 'Apple Music', revenue: 14300, streams: 920000 },
    { platform: 'YouTube Music', revenue: 7200, streams: 610000 },
    { platform: 'Tidal', revenue: 4600, streams: 210000 },
    { platform: 'Amazon Music', revenue: 2100, streams: 98000 },
    { platform: 'Other DSPs', revenue: 980, streams: 42000 },
  ]
}

export async function getStreamsTimeseries(
  period: 30 | 90 | 365,
): Promise<{ date: string; streams: number }[]> {
  // TODO: replace with lgFetch same analytics/streams endpoint, reshape response to
  // timeseries format when API creds are active. See architecture doc.
  return buildTimeseries(
    period,
    period === 30 ? 15000 : period === 365 ? 12000 : 18000,
    period === 30 ? 4000 : period === 365 ? 18000 : 8000,
  )
}

function buildTimeseries(
  days: number,
  base: number,
  trendTotal: number,
): { date: string; streams: number }[] {
  const seed = [
    0.2, -0.3, 0.5, 0.1, -0.1, 0.6, -0.2, 0.4, 0.3, -0.4, 0.7, 0.1, -0.2,
    0.5, 0.2, -0.1, 0.8, 0.3, 0.1, -0.3, 0.4, 0.6, -0.1, 0.3, 0.5, 0.2,
    -0.2, 0.7, 0.4, 0.1, 0.3, -0.1, 0.6, 0.2, 0.4, -0.3, 0.8, 0.1, 0.5,
    0.3, -0.2, 0.7, 0.2, 0.4, 0.1, -0.1, 0.5, 0.3, 0.6, 0.2,
  ]
  const now = new Date('2026-06-15')
  const result: { date: string; streams: number }[] = []
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now)
    d.setDate(d.getDate() - i)
    const trend = ((days - 1 - i) / (days - 1)) * trendTotal
    const noise = Math.round(seed[i % seed.length] * (base * 0.14))
    result.push({
      date: d.toISOString().slice(0, 10),
      streams: Math.max(Math.round(base * 0.4), Math.round(base + trend + noise)),
    })
  }
  return result
}
