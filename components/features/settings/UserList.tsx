'use client'

import { useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import type { UserRecord, UserRole } from '@/lib/types'
import { isAdminOrAbove, isOwner } from '@/lib/utils'

interface UserListProps {
  users: UserRecord[]
  currentUserId: string
  callerRole: UserRole
  onDeactivate: (userId: string) => Promise<string | undefined>
  onReactivate: (userId: string) => Promise<string | undefined>
  onResetPin: (userId: string) => void
  loadingId: string | null
}

type RowAction = 'none' | 'deactivate' | 'reactivate'

function getRowActions(row: UserRecord, callerRole: UserRole, currentUserId: string): RowAction {
  if (row.id === currentUserId) return 'none'
  if (row.role === 'owner') return 'none'
  if (row.status === 'inactive') return isOwner(callerRole) ? 'reactivate' : 'none'
  if (row.role === 'admin' && !isOwner(callerRole)) return 'none'
  if (isAdminOrAbove(callerRole)) return 'deactivate'
  return 'none'
}

function StatusBadge({ status }: { status: UserRecord['status'] }) {
  const styles: Record<UserRecord['status'], { color: string; background: string; label: string }> = {
    active: { color: 'var(--primary)', background: 'rgba(61,219,184,0.1)', label: 'Active' },
    inactive: { color: 'rgba(255,255,255,0.35)', background: 'var(--surface-2)', label: 'Inactive' },
  }
  const s = styles[status]
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
      style={{ color: s.color, background: s.background }}
    >
      {s.label}
    </span>
  )
}

function RoleBadge({ role }: { role: UserRecord['role'] }) {
  const elevated = role === 'owner' || role === 'admin'
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
      style={{
        color: elevated ? 'var(--accent)' : 'rgba(255,255,255,0.4)',
        background: elevated ? 'rgba(185,157,90,0.1)' : 'var(--surface-2)',
      }}
    >
      {role}
    </span>
  )
}

function DeactivateModal({
  user,
  open,
  onOpenChange,
  onConfirm,
  loading,
}: {
  user: UserRecord
  open: boolean
  onOpenChange: (v: boolean) => void
  onConfirm: () => void
  loading: boolean
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay
          className="fixed inset-0 z-40"
          style={{ background: 'rgba(0,0,0,0.6)' }}
        />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl p-6 outline-none"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
        >
          <Dialog.Title className="text-base font-semibold text-white">
            Deactivate {user.displayName}?
          </Dialog.Title>
          <Dialog.Description className="mt-2 text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
            They will lose access to the app immediately. Only an owner can reactivate this account.
          </Dialog.Description>
          <div className="mt-5 flex justify-end gap-3">
            <Dialog.Close asChild>
              <button
                className="rounded-lg px-4 py-2 text-sm font-medium transition-opacity hover:opacity-80"
                style={{ background: 'var(--surface-2)', color: 'rgba(255,255,255,0.7)', border: '1px solid var(--border)' }}
              >
                Cancel
              </button>
            </Dialog.Close>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="rounded-lg px-4 py-2 text-sm font-semibold transition-opacity disabled:opacity-40"
              style={{ background: 'var(--coral)', color: '#fff' }}
            >
              {loading ? 'Working…' : 'Deactivate'}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}

function RowActions({
  user,
  callerRole,
  currentUserId,
  onDeactivate,
  onReactivate,
  onResetPin,
  loadingId,
  size,
}: {
  user: UserRecord
  callerRole: UserRole
  currentUserId: string
  onDeactivate: (id: string) => Promise<string | undefined>
  onReactivate: (id: string) => Promise<string | undefined>
  onResetPin: (id: string) => void
  loadingId: string | null
  size: 'sm' | 'xs'
}) {
  const [rowError, setRowError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const action = getRowActions(user, callerRole, currentUserId)
  const showResetPin = isOwner(callerRole) && user.id !== currentUserId && user.role !== 'owner'

  if (action === 'none' && !showResetPin) return null

  const px = size === 'sm' ? 'px-3 py-1.5' : 'px-3 py-1'

  async function handleDeactivateConfirm() {
    setRowError(null)
    const err = await onDeactivate(user.id)
    if (err) setRowError(err)
    setModalOpen(false)
  }

  async function handleReactivate() {
    setRowError(null)
    const err = await onReactivate(user.id)
    if (err) setRowError(err)
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-2 flex-wrap">
        {action === 'deactivate' && (
          <>
            <button
              onClick={() => setModalOpen(true)}
              disabled={loadingId === user.id}
              className={`rounded-lg ${px} text-xs font-medium transition-opacity disabled:opacity-40`}
              style={{ background: 'var(--coral-dim)', color: 'var(--coral)' }}
            >
              Deactivate
            </button>
            <DeactivateModal
              user={user}
              open={modalOpen}
              onOpenChange={setModalOpen}
              onConfirm={handleDeactivateConfirm}
              loading={loadingId === user.id}
            />
          </>
        )}
        {action === 'reactivate' && (
          <button
            onClick={handleReactivate}
            disabled={loadingId === user.id}
            className={`rounded-lg ${px} text-xs font-medium transition-opacity disabled:opacity-40`}
            style={{ background: 'var(--surface-2)', color: 'rgba(255,255,255,0.6)', border: '1px solid var(--border)' }}
          >
            {loadingId === user.id ? 'Working…' : 'Reactivate'}
          </button>
        )}
        {showResetPin && (
          <button
            onClick={() => onResetPin(user.id)}
            disabled={loadingId === user.id}
            className={`rounded-lg ${px} text-xs font-medium transition-opacity disabled:opacity-40`}
            style={{ border: '1px solid var(--primary)', color: 'var(--primary)', background: 'transparent' }}
          >
            Reset PIN
          </button>
        )}
      </div>
      {rowError && (
        <p className="text-[11px]" style={{ color: 'var(--coral)' }}>{rowError}</p>
      )}
    </div>
  )
}

export default function UserList({ users, currentUserId, callerRole, onDeactivate, onReactivate, onResetPin, loadingId }: UserListProps) {
  const [showInactive, setShowInactive] = useState(false)

  const displayedUsers = showInactive ? users : users.filter((u) => u.status !== 'inactive')
  const inactiveCount = users.filter((u) => u.status === 'inactive').length

  if (users.length === 0) {
    return (
      <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
        No users found.
      </p>
    )
  }

  return (
    <>
      {inactiveCount > 0 && (
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowInactive((v) => !v)}
            className="text-xs transition-opacity hover:opacity-80"
            style={{ color: 'rgba(255,255,255,0.4)' }}
          >
            {showInactive ? 'Hide inactive' : `Show inactive (${inactiveCount})`}
          </button>
        </div>
      )}

      {/* Mobile cards */}
      <div className="flex flex-col gap-3 md:hidden">
        {displayedUsers.map((u) => (
          <div
            key={u.id}
            className={`rounded-xl p-4 flex flex-col gap-3 ${u.status === 'inactive' ? 'opacity-50' : ''}`}
            style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className={`text-sm font-medium text-white truncate ${u.status === 'inactive' ? 'italic' : ''}`}>
                  {u.displayName}
                </p>
                <p className="text-xs truncate mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  {u.email}
                </p>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <RoleBadge role={u.role} />
                <StatusBadge status={u.status} />
              </div>
            </div>
            <RowActions
              user={u}
              callerRole={callerRole}
              currentUserId={currentUserId}
              onDeactivate={onDeactivate}
              onReactivate={onReactivate}
              onResetPin={onResetPin}
              loadingId={loadingId}
              size="sm"
            />
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div
        className="hidden md:block rounded-xl overflow-hidden"
        style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}
      >
        <table className="w-full text-sm">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border)' }}>
              {['Name', 'Email', 'Role', 'Status', 'Last sign in', ''].map((h) => (
                <th
                  key={h}
                  className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-widest"
                  style={{ color: 'rgba(255,255,255,0.35)' }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {displayedUsers.map((u, i) => (
              <tr
                key={u.id}
                className={u.status === 'inactive' ? 'opacity-50' : ''}
                style={{ borderTop: i > 0 ? '1px solid var(--border)' : undefined }}
              >
                <td className={`px-4 py-3 text-white font-medium whitespace-nowrap ${u.status === 'inactive' ? 'italic' : ''}`}>
                  {u.displayName}
                </td>
                <td className="px-4 py-3 whitespace-nowrap" style={{ color: 'rgba(255,255,255,0.55)' }}>
                  {u.email}
                </td>
                <td className="px-4 py-3">
                  <RoleBadge role={u.role} />
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={u.status} />
                </td>
                <td className="px-4 py-3 whitespace-nowrap" style={{ color: 'rgba(255,255,255,0.4)', fontFamily: 'var(--font-mono)', fontSize: '12px' }}>
                  {u.lastSignInAt ? new Date(u.lastSignInAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                </td>
                <td className="px-4 py-3">
                  <div className="flex justify-end">
                    <RowActions
                      user={u}
                      callerRole={callerRole}
                      currentUserId={currentUserId}
                      onDeactivate={onDeactivate}
                      onReactivate={onReactivate}
                      onResetPin={onResetPin}
                      loadingId={loadingId}
                      size="xs"
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
