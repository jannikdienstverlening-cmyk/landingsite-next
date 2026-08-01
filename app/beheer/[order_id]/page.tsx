'use client'

import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'

type Management = { management_status: string; management_started_at: string | null; management_cancel_at_period_end: boolean; went_live_at: string | null }

export default function ManagementPage() {
  const { order_id } = useParams<{ order_id: string }>()
  const search = useSearchParams()
  const token = search.get('token') ?? ''
  const [management, setManagement] = useState<Management | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    fetch(`/api/management/status?order_id=${encodeURIComponent(order_id)}&token=${encodeURIComponent(token)}`, { cache: 'no-store' })
      .then(async (response) => ({ response, data: await response.json() }))
      .then(({ response, data }) => { if (!active) return; if (!response.ok) throw new Error(data.error); setManagement(data.management) })
      .catch((caught) => { if (active) setError(caught instanceof Error ? caught.message : 'Beheerstatus ophalen lukt nu niet.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [order_id, token])

  async function openPortal() {
    setLoading(true); setError('')
    try {
      const response = await fetch('/api/stripe/portal', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ order_id, token }) })
      const data = await response.json()
      if (!response.ok || !data.url) throw new Error(data.error || 'Klantportaal openen lukt nu niet.')
      window.location.assign(data.url)
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Klantportaal openen lukt nu niet.'); setLoading(false) }
  }

  return <main className="legal-page"><div className="container legal-shell"><Link href="/" className="legal-back">← Naar Landingsite.nl</Link><h1>Websitebeheer</h1><p className="updated">Beveiligde klantpagina</p><div className="legal-content"><section><h2>Status</h2>{loading && <p>Status veilig controleren...</p>}{management && <p>Websitebeheer staat op <strong>{management.management_status}</strong>{management.management_cancel_at_period_end ? ' en eindigt na de lopende betaalperiode' : ''}.</p>}{error && <p className="form-status error" role="alert">{error}</p>}</section><section><h2>Betaling of opzegging beheren</h2><p>In het beveiligde Stripe-klantportaal kun je betaalgegevens bijwerken, facturen bekijken of Websitebeheer opzeggen tegen het einde van de lopende betaalperiode.</p><button className="primary-button" type="button" disabled={loading || !management?.management_started_at} onClick={openPortal}>Open beveiligd klantportaal</button></section><section><h2>Na opzegging</h2><p>Na de betaalde periode stoppen hosting, technisch beheer, kleine wijzigingen en toekomstige partnercommissies die aan dit abonnement zijn gekoppeld. Voor overdracht stemmen we de praktische stappen met je af.</p></section></div></div></main>
}
