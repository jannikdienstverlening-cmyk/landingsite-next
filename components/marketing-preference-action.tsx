'use client'

import { useState } from 'react'

export function MarketingPreferenceAction({ token, action }: { token: string; action: 'confirm' | 'unsubscribe' }) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const label = action === 'confirm' ? 'Bevestig mijn e-mailadres' : 'Meld mij af'

  async function submit() {
    setStatus('loading')
    const response = await fetch(`/api/marketing/${action}`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ token }),
    })
    const data = await response.json().catch(() => ({})) as { error?: string }
    if (!response.ok) {
      setMessage(data.error ?? 'Deze voorkeur kon niet worden opgeslagen.')
      setStatus('error')
      return
    }
    setMessage(action === 'confirm' ? 'Je e-mailadres is bevestigd.' : 'Je bent afgemeld voor marketingberichten.')
    setStatus('success')
  }

  return <div className="preference-action">
    {status !== 'success' && <button className="primary-button" type="button" onClick={submit} disabled={status === 'loading'}>{status === 'loading' ? 'Bezig…' : label}</button>}
    {message && <p role="status" aria-live="polite">{message}</p>}
  </div>
}
