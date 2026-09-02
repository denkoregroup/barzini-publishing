const LABELGRID_BASE = process.env.LABELGRID_BASE_URL ?? 'https://api.labelgrid.com'
const LABELGRID_KEY = process.env.LABELGRID_API_KEY ?? ''

export async function lgFetch<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  const res = await fetch(`${LABELGRID_BASE}${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${LABELGRID_KEY}`,
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    // No Next.js cache — all caching decisions are made per service function
    cache: 'no-store',
  })

  if (!res.ok) {
    throw new Error(
      `LabelGrid API error: ${res.status} ${res.statusText} — ${path}`,
    )
  }

  return res.json() as Promise<T>
}
