import { createClient } from '@/lib/supabase/server'
import { getDisplayName } from '@/lib/utils'
import { getRoyaltySummary, getReleases, getDistributionStatus, getArtists } from '@/lib/data'
import DashboardOverview from '@/components/features/dashboard/DashboardOverview'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const displayName = user
    ? getDisplayName({ email: user.email ?? undefined, user_metadata: user.user_metadata })
    : null

  const [summary, releases, channels, artists] = await Promise.all([
    getRoyaltySummary(90),
    getReleases(),
    getDistributionStatus(),
    getArtists(),
  ])

  return (
    <div className="flex flex-col gap-6 min-w-0">
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold text-white">
          {displayName ? `Welcome back, ${displayName}.` : 'Dashboard'}
        </h1>
        <p className="mt-1 text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
          Here&apos;s your label at a glance.
        </p>
      </div>

      <DashboardOverview
        summary={summary}
        releases={releases}
        channels={channels}
        artists={artists}
      />
    </div>
  )
}
