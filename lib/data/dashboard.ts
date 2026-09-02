import type { Artist, Release, RoyaltySummary } from '@/lib/types'
import { getArtists } from './artists'
import { getReleases } from './releases'
import { getRoyaltySummary } from './royalties'

export interface DashboardSummary {
  artists: Artist[]
  releases: Release[]
  summary: RoyaltySummary
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  // NOTE: convenience aggregator — calls service functions, not lgFetch directly.
  // TODO: consider parallel fetch via Promise.all once all three functions hit live APIs.
  const [artists, releases, summary] = await Promise.all([
    getArtists(),
    getReleases(),
    getRoyaltySummary(90),
  ])
  return { artists, releases, summary }
}
