import { getReleases } from '@/lib/data'
import PipelineBoard from '@/components/features/releases/PipelineBoard'

export default async function ReleasesPage() {
  const releases = await getReleases()

  return (
    <div className="flex flex-col gap-6 min-w-0">
      {/* Page header */}
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wider font-medium"
           style={{ color: 'var(--accent)' }}>
          Releases
        </p>
        <h1 className="mt-0.5 text-2xl font-semibold text-white">Release Pipeline</h1>
      </div>

      <PipelineBoard releases={releases} />
    </div>
  )
}
