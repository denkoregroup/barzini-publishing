import type { SupabaseClient } from '@supabase/supabase-js'

// An artist can only be overseen by one manager at a time. There isn't a real
// relational constraint for this yet (managed_artist_ids is a plain string
// array on user_metadata / profiles — the Supabase schema pass tracks giving
// it a proper one-manager-per-artist relation), so this is the server-side
// guard until then. The client (UsersClient) already filters these artists
// out of the invite/assignment pickers; this is defense in depth for a
// direct API call.

interface ConflictCheckResult {
  // Artist ids in the requested set that are already owned by a different manager.
  conflicts: string[]
  // conflicting artistId -> the manager's display name/email, for the error message.
  ownerLabels: Map<string, string>
}

// Looks across all manager accounts (except `excludeUserId`, e.g. the manager
// currently being edited) for any overlap with `requestedArtistIds`.
export async function findConflictingArtistOwners(
  admin: SupabaseClient,
  requestedArtistIds: string[],
  excludeUserId?: string,
): Promise<ConflictCheckResult> {
  const conflicts: string[] = []
  const ownerLabels = new Map<string, string>()
  if (requestedArtistIds.length === 0) return { conflicts, ownerLabels }

  const requested = new Set(requestedArtistIds)
  const { data, error } = await admin.auth.admin.listUsers()
  if (error) return { conflicts, ownerLabels } // fail open here — listUsers failing isn't this check's problem to surface

  for (const u of data.users) {
    if (u.id === excludeUserId) continue
    const meta = u.user_metadata ?? {}
    if (meta.role !== 'manager') continue
    const owned: string[] = Array.isArray(meta.managed_artist_ids) ? meta.managed_artist_ids : []
    for (const id of owned) {
      if (requested.has(id)) {
        conflicts.push(id)
        ownerLabels.set(id, meta.display_name ?? u.email ?? 'another manager')
      }
    }
  }

  return { conflicts, ownerLabels }
}
