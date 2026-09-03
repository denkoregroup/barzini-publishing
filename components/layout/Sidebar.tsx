'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import * as Dialog from '@radix-ui/react-dialog'
import { LayoutGrid, Users, Disc3, Banknote, Radio, BarChart3, Settings, LogOut, X, Users2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { isAdminOrAbove, isManagerOrAbove } from '@/lib/utils'

const MAIN_NAV = [
  { href: '/', label: 'Dashboard', Icon: LayoutGrid },
  { href: '/artists', label: 'Artists', Icon: Users },
  { href: '/releases', label: 'Releases', Icon: Disc3 },
  { href: '/royalties', label: 'Royalties', Icon: Banknote, visible: isManagerOrAbove },
  { href: '/distribution', label: 'Distribution', Icon: Radio, visible: isAdminOrAbove },
  { href: '/analytics', label: 'Analytics', Icon: BarChart3 },
  { href: '/settings', label: 'Settings', Icon: Settings },
]

interface SidebarProps {
  open: boolean
  onOpenChange: (v: boolean) => void
  role?: string
}

function NavLink({
  href,
  label,
  Icon,
  active,
  onClick,
}: {
  href: string
  label: string
  Icon: React.ElementType
  active: boolean
  onClick?: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors"
      style={{
        color: active ? 'var(--primary)' : 'rgba(255,255,255,0.55)',
        background: active ? 'color-mix(in oklch, var(--primary) 10%, transparent)' : 'transparent',
        borderLeft: active ? '2px solid var(--primary)' : '2px solid transparent',
      }}
    >
      <Icon size={16} strokeWidth={active ? 2.2 : 1.6} />
      {label}
    </Link>
  )
}

function BrandMark() {
  return (
    <div className="flex items-center gap-3 px-5 py-5">
      <div
        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg text-sm font-bold"
        style={{
          background: 'color-mix(in oklch, var(--accent) 15%, transparent)',
          color: 'var(--accent)',
        }}
      >
        B
      </div>
      <span className="text-sm font-semibold text-white/90 truncate">
        Barzini Publishing
      </span>
    </div>
  )
}

export default function Sidebar({ open, onOpenChange, role }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  function NavContent({ onNavClick }: { onNavClick?: () => void }) {
    return (
      <nav className="flex flex-col gap-1 px-3 pt-2 pb-4">
        {MAIN_NAV.filter(({ visible }) => !visible || visible(role)).map(({ href, label, Icon }) => (
          <NavLink
            key={href}
            href={href}
            label={label}
            Icon={Icon}
            active={pathname === href || (href !== '/' && href !== '/settings' && pathname.startsWith(href))}
            onClick={onNavClick}
          />
        ))}
        {isAdminOrAbove(role) && (
          <NavLink
            href="/settings/users"
            label="Users"
            Icon={Users2}
            active={pathname.startsWith('/settings/users')}
            onClick={onNavClick}
          />
        )}
        <button
          onClick={async () => {
            onNavClick?.()
            await handleSignOut()
          }}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors text-left"
          style={{
            color: 'rgba(255,255,255,0.55)',
            background: 'transparent',
            borderLeft: '2px solid transparent',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'rgba(255,255,255,0.85)'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'rgba(255,255,255,0.55)'
          }}
        >
          <LogOut size={16} strokeWidth={1.6} />
          Sign out
        </button>
      </nav>
    )
  }

  return (
    <>
      {/* Mobile: hamburger-triggered drawer */}
      <Dialog.Root open={open} onOpenChange={onOpenChange}>
        <Dialog.Portal>
          <Dialog.Overlay
            className="fixed inset-0 z-40 md:hidden"
            style={{ background: 'rgba(0,0,0,0.5)' }}
          />
          <Dialog.Content
            className="fixed inset-y-0 left-0 z-50 flex flex-col md:hidden"
            style={{
              width: 'min(280px, 85vw)',
              background: 'var(--surface)',
              borderRight: '1px solid var(--border)',
            }}
          >
            <div className="flex items-center justify-between pr-4 flex-shrink-0">
              <BrandMark />
              <Dialog.Close asChild>
                <button
                  className="rounded-lg p-1.5 transition-opacity hover:opacity-70"
                  style={{ color: 'rgba(255,255,255,0.45)' }}
                  aria-label="Close menu"
                >
                  <X size={16} />
                </button>
              </Dialog.Close>
            </div>
            <Dialog.Title className="sr-only">Navigation</Dialog.Title>
            <NavContent onNavClick={() => onOpenChange(false)} />
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Desktop: persistent left sidebar */}
      <aside
        className="hidden md:flex md:flex-col md:w-60 md:flex-shrink-0 min-h-screen"
        style={{
          background: 'var(--surface)',
          borderRight: '1px solid var(--border)',
        }}
      >
        <BrandMark />
        <NavContent />
      </aside>
    </>
  )
}
