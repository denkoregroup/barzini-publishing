import { getAnalyticsStreams, getStreamsTimeseries, getArtists, getReleases, getReleaseInsight } from '@/lib/labelgrid'
import { getScopeContext, scopeArtists, scopeByArtistId, scopeToSelectedByArtistId, mergePlatformRevenue } from '@/lib/scope'
import ArtistSwitcher from '@/components/features/shared/ArtistSwitcher'
import AnalyticsClient from '@/components/features/analytics/AnalyticsClient'

interface AnalyticsPageProps {
  searchParams: Promise<{ artist?: string }>
}

export default async function AnalyticsPage({ searchParams }: AnalyticsPageProps) {
  const { artist: selectedArtistId } = await searchParams
  const ctx = await getScopeContext()

  const header = (
    <div className="min-w-0">
      <p
        className="text-xs font-semibold tracking-widest uppercase"
        style={{ color: 'var(--accent)' }}
      >
        Analytics
      </p>
      <h1 className="mt-1 text-2xl font-semibold text-white">Streaming analytics</h1>
    </div>
  )

  if (ctx.managerScoped) {
    const [allArtists, allReleases] = await Promise.all([getArtists(), getReleases()])
    const managedArtists = scopeArtists(allArtists, ctx)
    const managedReleases = scopeByArtistId(allReleases, ctx)
    const releases = scopeToSelectedByArtistId(managedReleases, selectedArtistId)

    // No label-wide getAnalyticsStreams() equivalent exists per-artist — derive
    // one by summing each in-scope release's platform breakdown.
    const insights = await Promise.all(releases.map((r) => getReleaseInsight(r.id)))
    const scopedPlatforms = mergePlatformRevenue(insights.map((i) => i.platformBreakdown))

    return (
      <div className="flex flex-col gap-6 min-w-0">
        {header}
        <ArtistSwitcher artists={managedArtists} selectedArtistId={selectedArtistId} />
        <AnalyticsClient managerScoped scopedPlatforms={scopedPlatforms} />
      </div>
    )
  }

  const [streams30, streams90, streams365, timeseries30, timeseries90, timeseries365] =
    await Promise.all([
      getAnalyticsStreams(30),
      getAnalyticsStreams(90),
      getAnalyticsStreams(365),
      getStreamsTimeseries(30),
      getStreamsTimeseries(90),
      getStreamsTimeseries(365),
    ])

  return (
    <div className="flex flex-col gap-6 min-w-0">
      {header}

      <AnalyticsClient
        streams30={streams30}
        streams90={streams90}
        streams365={streams365}
        timeseries30={timeseries30}
        timeseries90={timeseries90}
        timeseries365={timeseries365}
      />
    </div>
  )
}
