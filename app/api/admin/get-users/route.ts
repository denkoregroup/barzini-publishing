import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from "@/lib/supabase/admin"
import { isAdminOrAbove } from '@/lib/utils'
import type { UserRecord, UserRole } from '@/lib/types'

export async function GET() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const callerRole = user?.user_metadata?.role as string | undefined
  if (!user || !isAdminOrAbove(callerRole)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const admin = createAdminClient()
  const { data, error } = await admin.auth.admin.listUsers()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const users: UserRecord[] = data.users.map((u) => {
    const meta = u.user_metadata ?? {}
    const active = meta.active !== false
    const pinSet = meta.pin_set === true
    const status: UserRecord['status'] = !active ? 'inactive' : 'active'
    return {
      id: u.id,
      email: u.email ?? '',
      displayName: meta.display_name ?? u.email?.split('@')[0] ?? '',
      role: (meta.role ?? 'user') as UserRole,
      status,
      createdAt: u.created_at,
      lastSignInAt: u.last_sign_in_at ?? undefined,
      managedArtistIds: Array.isArray(meta.managed_artist_ids) ? meta.managed_artist_ids : undefined,
    }
  })

  return NextResponse.json({ users })
}
