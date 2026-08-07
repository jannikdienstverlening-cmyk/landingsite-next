'use client'

import Link from 'next/link'
import { useParams, useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'
import { pricingConfig } from '@/config/pricing'
import { trackMarketingEvent } from '@/lib/analytics'

type Management = {
  management_status: string
  management_started_at: string | null
  management_cancel_at_period_end: boolean
  went_live_at: string | null
  can_activate: boolean
}

const statusLabels: Record<string, string> = {
  pending: 'nog niet klaar voor activatie',
  awaiting_go_live: 'klaar voor activatie',
  active: 'actief',
  payment_failed: 'betaling mislukt',
  past_due: 'betaling achterstallig',
  cancelled: 'opgezegd',
  transferred: 'overgedragen',
}

export default function ManagementPage() {
  const { order_id } = useParams<{ order_id: string }>()
  const search = useSearchParams()
  const token = search.get('token') ?? ''
  const activated = search.get('activated') === '1'
  const [management, setManagement] = useState<Management | null>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [activating, setActivating] = useState(false)
  const [termsAccepted, setTermsAccepted] = useState(false)

  const loadStatus = useCallback(async () => {
    const response = await fetch(`/api/management/status?order_id=${encodeURIComponent(order_id)}&token=${encodeURIComponent(token)}`, { cache: 'no-store' })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Beheerstatus ophalen lukt nu niet.')
    setManagement(data.management)
  }, [order_id, token])

  useEffect(() => {
    let active = true
    loadStatus()
      .catch((caught) => { if (active) setError(caught instanceof Error ? caught.message : 'Beheerstatus ophalen lukt nu niet.') })
      .finally(() => { if (active) setLoading(false) })
    return () => { active = false }
  }, [loadStatus])

  async function startManagement() {
    setActivating(true)
    setError('')
    try {
      const response = await fetch('/api/management/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id, token, requestId: crypto.randomUUID(), termsAccepted }),
      })
      const data = await response.json()
      if (!response.ok || !data.url) throw new Error(data.error || 'Abonnementscheckout openen lukt nu niet.')
      window.location.assign(data.url)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Abonnementscheckout openen lukt nu niet.')
      setActivating(false)
    }
  }

  async function openPortal() {
    trackMarketingEvent('customer_portal_open', { source: 'management_page' })
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id, token }),
      })
      const data = await response.json()
      if (!response.ok || !data.url) throw new Error(data.error || 'Klantportaal openen lukt nu niet.')
      window.location.assign(data.url)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Klantportaal openen lukt nu niet.')
      setLoading(false)
    }
  }

  const isActive = Boolean(management?.management_started_at)
  const statusLabel = management ? statusLabels[management.management_status] ?? management.management_status : ''

  return (
    <main className="legal-page management-customer-page">
      <div className="container legal-shell">
        <Link href="/" className="legal-back">← Naar Landingsite.nl</Link>
        <h1>Hosting &amp; Websitebeheer</h1>
        <p className="updated">Beveiligde klantpagina</p>
        <div className="legal-content">
          {activated && (
            <p className="management-success" role="status">
              Bedankt. Stripe verwerkt je aanmelding; de status wordt automatisch bijgewerkt zodra de betaling is bevestigd.
            </p>
          )}

          <section>
            <h2>Status</h2>
            {loading && <p>Status veilig controleren...</p>}
            {management && (
              <p>
                Websitebeheer staat op <strong>{statusLabel}</strong>
                {management.management_cancel_at_period_end ? ' en eindigt na de lopende betaalperiode' : ''}.
              </p>
            )}
            {error && <p className="form-status error" role="alert">{error}</p>}
          </section>

          {management?.can_activate && !isActive && (
            <section className="management-activation">
              <p className="management-eyebrow">Historische bestelling</p>
              <h2>Activeer Hosting &amp; Websitebeheer</h2>
              <div className="management-activation-price">
                <strong>€{pricingConfig.websiteManagement.monthlyPrice}</strong>
                <span>per maand · exclusief btw</span>
              </div>
              <p>Deze bestelling is gedaan vóór de gecombineerde checkout. Je bouwprijs is al betaald; via de knop hieronder activeer je het maandelijkse beheer.</p>
              <label className="management-consent-check">
                <input type="checkbox" checked={termsAccepted} onChange={(event) => setTermsAccepted(event.target.checked)} />
                <span>Ik ga akkoord met de <Link href="/algemene-voorwaarden" target="_blank" rel="noopener noreferrer">algemene voorwaarden</Link> en heb het <Link href="/privacybeleid" target="_blank" rel="noopener noreferrer">privacybeleid</Link> gelezen.</span>
              </label>
              <button className="primary-button" type="button" disabled={activating || !termsAccepted} onClick={startManagement}>
                {activating ? 'Stripe-checkout openen...' : 'Websitebeheer activeren'}
              </button>
              <p className="management-consent">Het abonnement start na jouw bevestiging in Stripe en wordt daarna maandelijks afgeschreven. Opzeggen kan tegen het einde van de lopende maand.</p>
            </section>
          )}

          {!loading && !management?.can_activate && !isActive && (
            <section>
              <h2>Nog niet beschikbaar</h2>
              <p>De abonnementscheckout verschijnt hier zodra de website is goedgekeurd en de livegang door Landingsite.nl is bevestigd.</p>
            </section>
          )}

          {isActive && (
            <section>
              <h2>Betaling of opzegging beheren</h2>
              <p>In het beveiligde Stripe-klantportaal kun je betaalgegevens bijwerken, facturen bekijken of Websitebeheer opzeggen tegen het einde van de lopende betaalperiode.</p>
              <button className="primary-button" type="button" disabled={loading} onClick={openPortal}>Open beveiligd klantportaal</button>
            </section>
          )}

          <section>
            <h2>Na opzegging</h2>
            <p>Na de betaalde periode stoppen hosting, technisch beheer, kleine wijzigingen en toekomstige partnercommissies die aan dit abonnement zijn gekoppeld. Voor overdracht stemmen we de praktische stappen met je af.</p>
          </section>
        </div>
      </div>
    </main>
  )
}
