'use client'

import { useEffect, useState } from 'react'

const CONSENT_VERSION = 'referral-30d-v1'

export function ReferralCapture() {
  const [code, setCode] = useState('')
  const [visible, setVisible] = useState(false)
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  useEffect(() => {
    const url = new URL(window.location.href)
    const referralCode = url.searchParams.get('ref')
    if (!referralCode) return
    setCode(referralCode)

    void fetch('/api/referrals/capture', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code: referralCode,
        landingPath: `${url.pathname}${url.search}`,
        utmSource: url.searchParams.get('utm_source') ?? '',
        utmMedium: url.searchParams.get('utm_medium') ?? '',
        utmCampaign: url.searchParams.get('utm_campaign') ?? '',
        persistence: 'session',
        consentVersion: '',
      }),
      keepalive: true,
    }).then(async (response) => {
      const data = await response.json().catch(() => null)
      if (response.ok && data?.accepted) setVisible(true)
    }).catch(() => undefined)
  }, [])

  async function remember() {
    if (!code) return
    setStatus('saving')
    const url = new URL(window.location.href)
    try {
      const response = await fetch('/api/referrals/capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          landingPath: `${url.pathname}${url.search}`,
          utmSource: url.searchParams.get('utm_source') ?? '',
          utmMedium: url.searchParams.get('utm_medium') ?? '',
          utmCampaign: url.searchParams.get('utm_campaign') ?? '',
          persistence: 'persistent',
          consentVersion: CONSENT_VERSION,
        }),
      })
      if (!response.ok) throw new Error('Opslaan mislukt')
      setStatus('saved')
      window.setTimeout(() => setVisible(false), 1_200)
    } catch {
      setStatus('error')
    }
  }

  if (!visible) return null

  return (
    <aside className="referral-consent" aria-label="Partnerlink voorkeur">
      <strong>Partnerlink ontvangen</strong>
      <p>Voor dit bezoek is de verwijzing actief. Wil je deze partnerlink 30 dagen onthouden?</p>
      <div>
        <button type="button" className="button button--primary" disabled={status === 'saving'} onClick={remember}>
          {status === 'saving' ? 'Opslaan...' : status === 'saved' ? 'Opgeslagen' : '30 dagen onthouden'}
        </button>
        <button type="button" className="referral-consent__session" onClick={() => setVisible(false)}>Alleen dit bezoek</button>
      </div>
      {status === 'error' && <p role="alert">De voorkeur kon niet worden opgeslagen. De verwijzing blijft alleen voor dit bezoek actief.</p>}
    </aside>
  )
}
