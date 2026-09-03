'use client'

import { useState } from 'react'

export default function ChangePinPage() {
  const [pin, setPin] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (!/^\d{6}$/.test(pin)) {
      setError('PIN must be exactly 6 digits.')
      return
    }

    if (pin !== confirm) {
      setError('PINs do not match.')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/change-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      })
      const data = await res.json() as { error?: string }
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong.')
        return
      }
      // Hard navigation, not router.push/refresh: the PIN update just wrote fresh
      // session cookies (pin_set/force_pin_change) onto this fetch's response.
      // A client-side transition can race that write and get bounced right back
      // here by proxy.ts's force_pin_change check. A full page load guarantees
      // the next request to '/' carries the cookies that were just set.
      window.location.href = '/'
      return
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: 'var(--background)' }}
    >
      <div
        className="w-full max-w-sm rounded-2xl p-8"
        style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}
      >
        <div className="mb-6">
          <p
            className="text-xs font-semibold tracking-widest uppercase"
            style={{ color: 'var(--accent)' }}
          >
            Barzini Publishing
          </p>
          <h1 className="mt-2 text-xl font-semibold text-white">Set your PIN</h1>
          <p className="mt-1.5 text-sm" style={{ color: 'rgba(255,255,255,0.45)' }}>
            Choose a 6-digit PIN you&apos;ll use to sign in.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>
              New PIN
            </label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="••••••"
              className="w-full rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-white/20 outline-none"
              style={{
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                fontFamily: 'var(--font-mono)',
                letterSpacing: '0.15em',
                fontSize: '16px',
              }}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Confirm PIN
            </label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={6}
              value={confirm}
              onChange={(e) => setConfirm(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="••••••"
              className="w-full rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-white/20 outline-none"
              style={{
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                fontFamily: 'var(--font-mono)',
                letterSpacing: '0.15em',
                fontSize: '16px',
              }}
            />
          </div>

          {error && (
            <p className="text-sm" style={{ color: 'var(--coral)' }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || pin.length < 6 || confirm.length < 6}
            className="w-full rounded-lg py-2.5 text-sm font-semibold transition-opacity disabled:opacity-40"
            style={{ background: 'var(--primary)', color: 'var(--primary-foreground)' }}
          >
            {loading ? 'Saving…' : 'Set PIN & continue'}
          </button>
        </form>
      </div>
    </div>
  )
}
