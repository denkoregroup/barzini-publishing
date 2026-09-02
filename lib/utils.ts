import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getDisplayName(user: {
  email?: string
  user_metadata?: { display_name?: string }
}): string {
  return user?.user_metadata?.display_name ?? user?.email?.split('@')[0] ?? 'User'
}

export function getInitials(displayName: string): string {
  const parts = displayName.trim().split(/\s+/)
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }
  return displayName.slice(0, 2).toUpperCase()
}

export function generateTempPin(): string {
  const array = new Uint32Array(1)
  crypto.getRandomValues(array)
  return String((array[0] % 900000) + 100000)
}

export function isAdminOrAbove(role?: string): boolean {
  return role === 'owner' || role === 'admin'
}

// Owner, admin, or manager — used for gating financial/royalty oversight views.
// Note: this is intentionally separate from isAdminOrAbove, which gates user-management
// actions (invite/deactivate/reactivate/reset PIN). Managers never pass isAdminOrAbove.
export function isManagerOrAbove(role?: string): boolean {
  return role === 'owner' || role === 'admin' || role === 'manager'
}

export function isOwner(role?: string): boolean {
  return role === 'owner'
}
