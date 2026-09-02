import { NextResponse, type NextRequest } from 'next/server'
import { createServerClient, type CookieMethodsServer } from '@supabase/ssr'
import { isAdminOrAbove, isManagerOrAbove } from '@/lib/utils'

const PUBLIC_PATHS = [
  '/login',
  '/change-pin',
  '/forgot-pin',
  '/reset-pin',
  '/api/auth/update-pin',
  '/api/auth/change-pin',
]

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  let response = NextResponse.next({ request })

  const cookieMethods: CookieMethodsServer = {
    getAll() {
      return request.cookies.getAll()
    },
    setAll(cookiesToSet) {
      cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
      response = NextResponse.next({ request })
      cookiesToSet.forEach(({ name, value, options }) =>
        response.cookies.set(name, value, options),
      )
    },
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    { cookies: cookieMethods },
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  const meta = user.user_metadata

  if (meta?.active === false) {
    await supabase.auth.signOut()
    const url = new URL('/login', request.url)
    url.searchParams.set('message', 'Your account has been deactivated. Please contact your administrator.')
    return NextResponse.redirect(url)
  }

  if (meta?.force_pin_change === true || meta?.pin_set !== true) {
    if (!pathname.startsWith('/change-pin')) {
      return NextResponse.redirect(new URL('/change-pin', request.url))
    }
  }

  if (pathname.startsWith('/settings/users') && !isAdminOrAbove(meta?.role)) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  if (pathname.startsWith('/royalties') && !isManagerOrAbove(meta?.role)) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
}
