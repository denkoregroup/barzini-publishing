import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { isAdminOrAbove } from '@/lib/utils'
import { getDistributionStatus, getSyncEvents } from '@/lib/labelgrid'
import DistributionClient from '@/components/features/distribution/DistributionClient'

export default async function DistributionPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const role = user?.user_metadata?.role as string | undefined

  // Defense in depth — proxy.ts already blocks non-admin/owner roles from this route.
  if (!isAdminOrAbove(role)) {
    redirect('/')
  }

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
