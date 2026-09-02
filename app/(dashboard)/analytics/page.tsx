import { getAnalyticsStreams, getStreamsTimeseries } from '@/lib/data'
import AnalyticsClient from '@/components/features/analytics/AnalyticsClient'

export default async function AnalyticsPage() {
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
      <div className="min-w-0">
        <p
          className="text-xs font-semibold tracking-widest uppercase"
          style={{ color: 'var(--accent)' }}
        >
          Analytics
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-white">Streaming analytics</h1>
      </div>

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
