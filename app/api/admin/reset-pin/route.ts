import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { generateTempPin, isOwner } from '@/lib/utils'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const callerRole = user?.user_metadata?.role as string | undefined
  if (!user || !isOwner(callerRole)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json() as { userId?: string }
  const { userId } = body

  if (!userId) {
    return NextResponse.json({ error: 'userId is required.' }, { status: 400 })
  }

  const admin = createAdminClient()
  const { data: targetData, error: fetchError } = await admin.auth.admin.getUserById(userId)

  if (fetchError || !targetData.user) {
    return NextResponse.json({ error: 'User not found.' }, { status: 404 })
  }

  const targetUser = targetData.user
  const targetRole = targetUser.user_metadata?.role as string | undefined

  if (targetRole === 'owner') {
    return NextResponse.json({ error: 'Cannot reset PIN for an owner account.' }, { status: 403 })
  }

  const newPin = generateTempPin()

  const { error: updateError } = await admin.auth.admin.updateUserById(userId, {
    password: newPin,
    user_metadata: { ...targetUser.user_metadata, force_pin_change: true, pin_set: false },
  })

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 400 })
  }

  return NextResponse.json({ ok: true, tempPin: newPin })
}
