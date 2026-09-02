import { getDistributionStatus, getSyncEvents } from '@/lib/data'
import DistributionClient from '@/components/features/distribution/DistributionClient'

export default async function DistributionPage() {
  const [channels, events] = await Promise.all([getDistributionStatus(), getSyncEvents()])

  return (
    <div className="flex flex-col gap-6 min-w-0">
      <div className="min-w-0">
        <p
          className="text-xs font-semibold tracking-widest uppercase"
          style={{ color: 'var(--accent)' }}
        >
          Distribution
        </p>
        <h1 className="mt-1 text-2xl font-semibold text-white">Distribution status</h1>
      </div>
      <DistributionClient channels={channels} events={events} />
    </div>
  )
}
