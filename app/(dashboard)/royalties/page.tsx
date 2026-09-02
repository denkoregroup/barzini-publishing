import { getRoyaltySummary, getRoyaltyStatements, getArtists, getReleases } from '@/lib/data'
import RoyaltiesClient from '@/components/features/royalties/RoyaltiesClient'

export default async function RoyaltiesPage() {
  const [summary30, summary90, summary365, statements, artists, releases] = await Promise.all([
    getRoyaltySummary(30),
    getRoyaltySummary(90),
    getRoyaltySummary(365),
    getRoyaltyStatements(),
    getArtists(),
    getReleases(),
  ])

  return (
    <div className="flex flex-col gap-6 min-w-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 min-w-0">
        <div className="min-w-0">
          <p className="text-xs text-white/40 uppercase tracking-wider font-medium">
            Label overview
          </p>
          <h1 className="mt-0.5 text-2xl font-semibold text-white">Royalties</h1>
        </div>
      </div>

      <RoyaltiesClient
        summary30={summary30}
        summary90={summary90}
        summary365={summary365}
        statements={statements}
        artists={artists}
        releases={releases}
      />
    </div>
  )
}
