'use client'

import { useState } from 'react'
import Sheet from '@/components/ui/Sheet'
import type { Artist, UserRole } from '@/lib/types'

interface InviteUserFormProps {
  open: boolean
  onClose: () => void
  onSuccess: (tempPin: string, displayName: string, emailWarning?: string) => void
  artists: Artist[]
}

export default function InviteUserForm({ open, onClose, onSuccess, artists }: InviteUserFormProps) {
  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<UserRole>('user')
  const [managedArtistIds, setManagedArtistIds] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  function toggleArtist(id: string) {
    setManagedArtistIds((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (role === 'manager' && managedArtistIds.length === 0) {
      setError('Select at least one artist for this manager to oversee.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/admin/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          displayName,
          email,
          role,
          managedArtistIds: role === 'manager' ? managedArtistIds : undefined,
        }),
      })
      const data = await res.json() as { error?: string; tempPin?: string; emailWarning?: string }
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong.')
        return
      }
      setDisplayName('')
      setEmail('')
      setRole('user')
      setManagedArtistIds([])
      onSuccess(data.tempPin!, displayName, data.emailWarning)
    } finally {
      setLoading(false)
    }
  }

  const inputStyle = {
    background: 'var(--surface-2)',
    border: '1px solid var(--border)',
    fontSize: '16px',
  }

  return (
    <Sheet open={open} onClose={onClose} title="Invite user">
      <form onSubmit={handleSubmit} className="flex flex-col gap-5 pt-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Full name
          </label>
          <input
            type="text"
            required
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="e.g. Alex Brooks"
            className="w-full rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-white/20 outline-none"
            style={inputStyle}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Email address
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@example.com"
            className="w-full rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-white/20 outline-none"
            style={inputStyle}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>
            Role
          </label>
          <select
            value={role}
            onChange={(e) => {
              const next = e.target.value as UserRole
              setRole(next)
              if (next !== 'manager') setManagedArtistIds([])
            }}
            className="w-full rounded-lg px-4 py-2.5 text-sm text-white outline-none appearance-none"
            style={inputStyle}
          >
            <option value="user">User</option>
            <option value="manager">Manager</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        {role === 'manager' && (
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Assigned artists (oversight scope)
            </label>
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>
              This manager will only see royalty and reporting data for the artists selected below.
            </p>
            <div
              className="flex flex-col gap-1 max-h-48 overflow-y-auto rounded-lg p-2"
              style={inputStyle}
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
                    checked={managedArtistIds.includes(artist.id)}
                    onChange={() => toggleArtist(artist.id)}
                  />
                  {artist.name}
                </label>
              ))}
            </div>
          </div>
        )}

        {error && (
          <p className="text-sm" style={{ color: 'var(--coral)' }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg py-2.5 text-sm font-semibold transition-opacity disabled:opacity-40"
          style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
        >
          {loading ? 'Sending invite…' : 'Send invite'}
        </button>
      </form>
    </Sheet>
  )
}
