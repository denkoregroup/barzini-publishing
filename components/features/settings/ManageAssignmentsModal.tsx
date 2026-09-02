'use client'

import { useEffect, useState } from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import type { Artist, UserRecord } from '@/lib/types'

interface ManageAssignmentsModalProps {
  target: UserRecord | null
  artists: Artist[]
  onClose: () => void
  onSave: (userId: string, managedArtistIds: string[]) => Promise<string | undefined>
}

export default function ManageAssignmentsModal({ target, artists, onClose, onSave }: ManageAssignmentsModalProps) {
  const [selected, setSelected] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setSelected(target?.managedArtistIds ?? [])
    setError(null)
  }, [target])

  function toggle(id: string) {
    setSelected((prev) => (prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]))
  }

  async function handleSave() {
    if (!target) return
    setSaving(true)
    setError(null)
    const err = await onSave(target.id, selected)
    setSaving(false)
    if (err) setError(err)
  }

  return (
    <Dialog.Root open={target !== null} onOpenChange={(open) => { if (!open) onClose() }}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40" style={{ background: 'rgba(0,0,0,0.6)' }} />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 z-50 w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-2xl p-6 flex flex-col gap-4 outline-none"
          style={{ background: 'var(--surface)', border: '1px solid var(--border)', boxShadow: '0 8px 32px rgba(0,0,0,0.5)' }}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <Dialog.Title className="text-base font-semibold text-white">
                Artist assignments
              </Dialog.Title>
              <Dialog.Description className="mt-1 text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
                {target?.displayName} will only see royalty and reporting data for the artists selected below.
              </Dialog.Description>
            </div>
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

          <div
            className="flex flex-col gap-1 max-h-56 overflow-y-auto rounded-lg p-2"
            style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
          >
            {artists.length === 0 && (
              <p className="text-xs px-2 py-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
                No artists found.
              </p>
            )}
            {artists.map((artist) => (
              <label
                key={artist.id}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm text-white cursor-pointer hover:bg-white/5"
              >
                <input
                  type="checkbox"
                  checked={selected.includes(artist.id)}
                  onChange={() => toggle(artist.id)}
                />
                {artist.name}
              </label>
            ))}
          </div>

          {error && (
            <p className="text-sm" style={{ color: 'var(--coral)' }}>{error}</p>
          )}

          <div className="flex justify-end gap-3 pt-1">
            <button
              onClick={onClose}
              className="rounded-lg px-4 py-2 text-sm font-medium transition-opacity hover:opacity-75"
              style={{ background: 'var(--surface-2)', color: 'rgba(255,255,255,0.6)', border: '1px solid var(--border)' }}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="rounded-lg px-4 py-2 text-sm font-semibold transition-opacity disabled:opacity-40 hover:opacity-85"
              style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
            >
              {saving ? 'Saving…' : 'Save assignments'}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
