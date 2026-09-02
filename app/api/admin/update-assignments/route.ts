import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { isAdminOrAbove } from '@/lib/utils'
import { findConflictingArtistOwners } from '@/lib/managerAssignments'

// Updates the set of artist IDs a manager has oversight/reporting access to.
// Restricted to admin-or-above — managers can never edit their own or anyone else's scope.
export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const callerRole = user?.user_metadata?.role as string | undefined
  if (!user || !isAdminOrAbove(callerRole)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json() as { userId?: string; managedArtistIds?: string[] }
  const { userId, managedArtistIds } = body

  if (!userId || !Array.isArray(managedArtistIds)) {
    return NextResponse.json({ error: 'userId and managedArtistIds are required.' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data: targetData, error: fetchError } = await admin.auth.admin.getUserById(userId)

  if (fetchError || !targetData.user) {
    return NextResponse.json({ error: 'User not found.' }, { status: 404 })
  }

  const targetUser = targetData.user
  const targetRole = targetUser.user_metadata?.role as string | undefined

  if (targetRole !== 'manager') {
    return NextResponse.json({ error: 'Artist assignments only apply to manager accounts.' }, { status: 400 })
  }

  const scopedArtistIds = managedArtistIds.filter((id) => typeof id === 'string')

  // An artist can only be overseen by one manager at a time — exclude this
  // manager's own existing assignments from the conflict check.
  if (scopedArtistIds.length > 0) {
    const { conflicts, ownerLabels } = await findConflictingArtistOwners(admin, scopedArtistIds, userId)
    if (conflicts.length > 0) {
      const detail = conflicts.map((id) => `${id} (already assigned to ${ownerLabels.get(id)})`).join(', ')
      return NextResponse.json(
        { error: `Some artists are already assigned to another manager: ${detail}` },
        { status: 409 },
      )
    }
  }

  const { error: updateError } = await admin.auth.admin.updateUserById(userId, {
    user_metadata: { ...targetUser.user_metadata, managed_artist_ids: scopedArtistIds },
  })

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 })
  }

  const { error: profileError } = await admin
    .from('profiles')
    .update({ managed_artist_ids: scopedArtistIds })
    .eq('id', userId)

  if (profileError) {
    console.error('Profile assignment sync failed:', profileError)
  }

  return NextResponse.json({ ok: true, managedArtistIds: scopedArtistIds })
}
