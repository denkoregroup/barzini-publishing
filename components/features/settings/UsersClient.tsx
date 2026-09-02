'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { UserPlus, X, AlertTriangle } from 'lucide-react'
import type { UserRecord, UserRole } from '@/lib/types'
import UserList from '@/components/features/settings/UserList'
import InviteUserForm from '@/components/features/settings/InviteUserForm'
import PinShare from '@/components/shared/PinShare'
import { deactivateUser, reactivateUser } from '@/app/actions/users'

interface TempPinDisplay {
  pin: string
  displayName: string
  emailWarning?: string
}

interface Toast {
  message: string
  type: 'success' | 'error'
}

interface UsersClientProps {
  currentUserId: string
  callerRole: UserRole
}

export default function UsersClient({ currentUserId, callerRole }: UsersClientProps) {
  const [users, setUsers] = useState<UserRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [showInvite, setShowInvite] = useState(false)
  const [tempPin, setTempPin] = useState<TempPinDisplay | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [toast, setToast] = useState<Toast | null>(null)
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Reset PIN confirm modal
  const [confirmResetTarget, setConfirmResetTarget] = useState<UserRecord | null>(null)
  const [resetPinLoading, setResetPinLoading] = useState(false)
  const [resetPinError, setResetPinError] = useState<string | null>(null)

  // PIN reveal modal
  const [pinRevealOpen, setPinRevealOpen] = useState(false)
  const [revealedPin, setRevealedPin] = useState('')
  const [pinRevealTarget, setPinRevealTarget] = useState<UserRecord | null>(null)

  function showToast(message: string, type: 'success' | 'error') {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current)
    setToast({ message, type })
    toastTimerRef.current = setTimeout(() => setToast(null), 4000)
  }

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/admin/get-users')
      const data = await res.json() as { users?: UserRecord[]; error?: string }
      if (!res.ok) {
        setError(data.error ?? 'Failed to load users.')
      } else {
        setUsers(data.users ?? [])
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchUsers() }, [fetchUsers])

  async function handleDeactivate(userId: string): Promise<string | undefined> {
    setLoadingId(userId)
    try {
      const result = await deactivateUser(userId)
      if ('error' in result) {
        showToast(result.error, 'error')
        return result.error
      }
      setUsers((prev) =>
        prev.map((u) => u.id === userId ? { ...u, status: 'inactive' as const } : u)
      )
      showToast('User deactivated.', 'success')
    } finally {
      setLoadingId(null)
    }
  }

  async function handleReactivate(userId: string): Promise<string | undefined> {
    setLoadingId(userId)
    try {
      const result = await reactivateUser(userId)
      if ('error' in result) {
        showToast(result.error, 'error')
        return result.error
      }
      setUsers((prev) =>
        prev.map((u) => u.id === userId ? { ...u, status: 'active' as const } : u)
      )
      showToast('User reactivated.', 'success')
    } finally {
      setLoadingId(null)
    }
  }

  function handleResetPinClick(userId: string) {
    const user = users.find((u) => u.id === userId) ?? null
    setResetPinError(null)
    setConfirmResetTarget(user)
  }

  async function handleResetPinConfirm() {
    if (!confirmResetTarget) return
    setResetPinLoading(true)
    setResetPinError(null)
    try {
      const res = await fetch('/api/admin/reset-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: confirmResetTarget.id }),
      })
      const data = await res.json() as { ok?: boolean; tempPin?: string; error?: string }
      if (!res.ok || !data.tempPin) {
        setResetPinError(data.error ?? 'Failed to reset PIN.')
        return
      }
      const target = confirmResetTarget
      setConfirmResetTarget(null)
      setRevealedPin(data.tempPin)
      setPinRevealTarget(target)
      setPinRevealOpen(true)
    } finally {
      setResetPinLoading(false)
    }
  }

  function handleInviteSuccess(pin: string, displayName: string, emailWarning?: string) {
    setShowInvite(false)
    setTempPin({ pin, displayName, emailWarning })
    fetchUsers()
  }

  return (
    <>
      <div className="flex items-center justify-between gap-4 min-w-0">
        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
          {loading ? 'Loading…' : `${users.length} user${users.length !== 1 ? 's' : ''}`}
        </p>
        <button
          onClick={() => setShowInvite(true)}
          className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-opacity hover:opacity-85"
          style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
        >
          <UserPlus size={15} />
          Invite user
        </button>
      </div>

      {tempPin && (
        <div
          className="rounded-xl p-5 flex flex-col gap-3 relative"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
        >
          <button
            onClick={() => setTempPin(null)}
            className="absolute top-4 right-4 rounded-md p-1 transition-opacity hover:opacity-60"
            style={{ color: 'rgba(255,255,255,0.4)' }}
            aria-label="Dismiss"
          >
            <X size={14} />
          </button>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: 'var(--accent)' }}>
              Temporary PIN
            </p>
            <p className="mt-1 text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
              Share this PIN with {tempPin.displayName}. It will not be shown again.
            </p>
          </div>
          <p
            className="text-4xl font-medium tracking-[0.25em]"
            style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary)' }}
          >
            {tempPin.pin}
          </p>
          <PinShare pin={tempPin.pin} recipientName={tempPin.displayName} />
          {tempPin.emailWarning && (
            <div className="flex items-start gap-2 mt-1">
              <AlertTriangle size={13} className="flex-shrink-0 mt-0.5" style={{ color: 'var(--coral)' }} />
              <p className="text-xs" style={{ color: 'var(--coral)' }}>{tempPin.emailWarning}</p>
            </div>
          )}
        </div>
      )}

      {error && (
        <p className="text-sm" style={{ color: 'var(--coral)' }}>{error}</p>
      )}

      {!loading && (
        <UserList
          users={users}
          currentUserId={currentUserId}
          callerRole={callerRole}
          onDeactivate={handleDeactivate}
          onReactivate={handleReactivate}
          onResetPin={handleResetPinClick}
          loadingId={loadingId}
        />
      )}

      <InviteUserForm
        open={showInvite}
        onClose={() => setShowInvite(false)}
        onSuccess={handleInviteSuccess}
      />

      {/* Reset PIN — confirmation modal */}
      <Dialog.Root
        open={confirmResetTarget !== null}
        onOpenChange={(open) => { if (!open) setConfirmResetTarget(null) }}
      >
        <Dialog.Portal>
          <Dialog.Overlay
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.6)' }}
          />
          <Dialog.Content
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl p-6 flex flex-col gap-4 outline-none"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
          >
            <Dialog.Title className="text-base font-semibold text-white">
              Reset PIN for {confirmResetTarget?.displayName}?
            </Dialog.Title>
            <Dialog.Description className="text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
              This will generate a new temporary PIN and invalidate their current one. They will be required to set a new PIN on next login.
            </Dialog.Description>
            {resetPinError && (
              <p className="text-sm" style={{ color: 'var(--coral)' }}>{resetPinError}</p>
            )}
            <div className="flex justify-end gap-3 pt-1">
              <button
                onClick={() => setConfirmResetTarget(null)}
                className="rounded-lg px-4 py-2 text-sm font-medium transition-opacity hover:opacity-75"
                style={{ background: 'var(--surface-2)', color: 'rgba(255,255,255,0.6)', border: '1px solid var(--border)' }}
              >
                Cancel
              </button>
              <button
                onClick={handleResetPinConfirm}
                disabled={resetPinLoading}
                className="rounded-lg px-4 py-2 text-sm font-semibold transition-opacity disabled:opacity-40 hover:opacity-85"
                style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
              >
                {resetPinLoading ? 'Resetting…' : 'Reset PIN'}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Reset PIN — reveal modal */}
      <Dialog.Root
        open={pinRevealOpen}
        onOpenChange={(open) => { if (!open) setPinRevealOpen(false) }}
      >
        <Dialog.Portal>
          <Dialog.Overlay
            className="fixed inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.6)' }}
          />
          <Dialog.Content
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl p-6 flex flex-col gap-5 outline-none"
            style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
          >
            <div className="flex items-start justify-between gap-3">
              <Dialog.Title className="text-base font-semibold text-white">
                New Temporary PIN
              </Dialog.Title>
              <Dialog.Close asChild>
                <button
                  className="rounded-md p-1 transition-opacity hover:opacity-60 flex-shrink-0"
                  style={{ color: 'rgba(255,255,255,0.4)' }}
                  aria-label="Close"
                >
                  <X size={14} />
                </button>
              </Dialog.Close>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
                Share this PIN with {pinRevealTarget?.displayName}. It will not be shown again.
              </p>
              <p
                className="text-2xl font-medium tracking-[0.3em] mt-2"
                style={{ fontFamily: 'var(--font-mono)', color: 'var(--primary)' }}
              >
                {revealedPin}
              </p>
            </div>
            {pinRevealTarget && (
              <PinShare pin={revealedPin} recipientName={pinRevealTarget.displayName} />
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Inline toast */}
      {toast && (
        <div
          className="fixed bottom-6 right-6 z-50 rounded-xl px-4 py-3 text-sm font-medium shadow-lg"
          style={{
            background: toast.type === 'success' ? 'rgba(61,219,184,0.15)' : 'rgba(255,80,80,0.15)',
            border: `1px solid ${toast.type === 'success' ? 'rgba(61,219,184,0.3)' : 'rgba(255,80,80,0.3)'}`,
            color: toast.type === 'success' ? 'var(--primary)' : 'var(--coral)',
          }}
        >
          {toast.message}
        </div>
      )}
    </>
  )
}
