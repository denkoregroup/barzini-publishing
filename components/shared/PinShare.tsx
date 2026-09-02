'use client'

import { useState } from 'react'
import { Share2 } from 'lucide-react'

interface PinShareProps {
  pin: string
  recipientName: string
}

export default function PinShare({ pin, recipientName }: PinShareProps) {
  const [copied, setCopied] = useState(false)

  const shareText =
    `Hi ${recipientName}, your temporary PIN for Barzini Publishing is: ${pin}. You will be prompted to set a new PIN after logging in.`

  async function handleShare() {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'Barzini Publishing — Temporary PIN',
          text: shareText,
        })
      } catch {
        // user cancelled or share failed silently
      }
      return
    }
    try {
      await navigator.clipboard.writeText(shareText)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard unavailable
    }
  }

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-opacity hover:opacity-80"
      style={{ border: '1px solid #3ddbb8', color: '#3ddbb8', background: 'transparent' }}
    >
      <Share2 size={14} />
      <span>{copied ? 'Copied' : 'Share PIN'}</span>
    </button>
  )
}
