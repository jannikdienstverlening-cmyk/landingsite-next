'use client'

import { useEffect } from 'react'

export function ReferralCapture() {
  useEffect(() => {
    const url = new URL(window.location.href)
    const code = url.searchParams.get('ref')
    if (!code) return

    void fetch('/api/referrals/capture', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        code,
        landingPath: `${url.pathname}${url.search}`,
        utmSource: url.searchParams.get('utm_source') ?? '',
        utmMedium: url.searchParams.get('utm_medium') ?? '',
        utmCampaign: url.searchParams.get('utm_campaign') ?? '',
      }),
      keepalive: true,
    }).catch(() => undefined)
  }, [])

  return null
}
