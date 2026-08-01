'use client'

import type { FormEvent } from 'react'
import { useState } from 'react'
import { pricingConfig } from '@/config/pricing'

const navItems = [
  ['Voorbeelden', '#voorbeelden'],
  ['Werkwijze', '#werkwijze'],
  ['Prijzen', '#prijzen'],
  ['Websitebeheer', '#websitebeheer'],
  ['Partner', '#partner'],
  ['FAQ', '#faq'],
  ['Contact', '#contact'],
]

export function MobileMenu() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button className="menu-toggle" type="button" aria-expanded={open} aria-controls="mobile-nav" onClick={() => setOpen((value) => !value)}>
        <span className="sr-only">Menu {open ? 'sluiten' : 'openen'}</span>
        <span />
        <span />
      </button>
      <nav id="mobile-nav" className={`mobile-nav${open ? ' is-open' : ''}`} aria-label="Mobiele navigatie">
        {navItems.map(([label, href]) => <a href={href} onClick={() => setOpen(false)} key={href}>{label}</a>)}
      </nav>
    </>
  )
}

export function PricingButton({ pakket, label }: { pakket: 'starter' | 'pro' | 'premium'; label: string }) {
  const [loading, setLoading] = useState(false)
  const [accepted, setAccepted] = useState(false)
  const [error, setError] = useState('')

  async function order() {
    if (!accepted) {
      setError('Accepteer eerst de zakelijke voorwaarden.')
      return
    }
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pakket, requestId: crypto.randomUUID(), termsAccepted: true }),
      })
      const data = await response.json()
      if (!response.ok || !data.url) throw new Error(data.error || 'Checkout openen lukt nu niet.')
      window.location.assign(data.url)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Checkout openen lukt nu niet.')
      setLoading(false)
    }
  }

  return (
    <div className="checkout-action">
      <div className="checkout-summary" aria-label="Prijsopbouw">
        <span>{pricingConfig.buildPackages[pakket].name} landingspagina <strong>€{pricingConfig.buildPackages[pakket].oneTimePrice} eenmalig</strong></span>
        <span>Websitebeheer <strong>€{pricingConfig.websiteManagement.monthlyPrice} per maand vanaf livegang</strong></span>
      </div>
      <label className="terms-check">
        <input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} />
        <span>Ik bestel zakelijk, betaal nu alleen de eenmalige bouwprijs, ga akkoord met de <a href="/algemene-voorwaarden" target="_blank" rel="noopener noreferrer">voorwaarden</a> en heb het <a href="/privacybeleid" target="_blank" rel="noopener noreferrer">privacybeleid</a> gelezen. Websitebeheer wordt pas na livegang via een aparte abonnementslink geactiveerd.</span>
      </label>
      <button className="price-button" onClick={order} disabled={loading || !accepted} type="button">
        {loading ? 'Veilige checkout openen...' : label}
        <span aria-hidden="true">↗</span>
      </button>
      {error && <p className="checkout-error" role="alert">{error}</p>}
    </div>
  )
}

export function FAQAccordion({ items }: { items: Array<{ q: string; a: string }> }) {
  return (
    <div className="faq-list">
      {items.map((item, index) => (
        <details key={item.q} open={index === 0}>
          <summary><span>{item.q}</span><span aria-hidden="true">+</span></summary>
          <p>{item.a}</p>
        </details>
      ))}
    </div>
  )
}

export function ContactForm() {
  const [form, setForm] = useState({ naam: '', email: '', bedrijf: '', bericht: '', website: '' })
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle')
  const [error, setError] = useState('')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('sending')
    setError('')
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Verzenden mislukt.')
      setForm({ naam: '', email: '', bedrijf: '', bericht: '', website: '' })
      setStatus('ok')
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Verzenden mislukt.')
      setStatus('error')
    }
  }

  function update(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  return (
    <form className="contact-form" onSubmit={submit}>
      <div className="form-pair">
        <label><span>Naam</span><input required minLength={2} autoComplete="name" value={form.naam} onChange={(event) => update('naam', event.target.value)} /></label>
        <label><span>Bedrijf <small>optioneel</small></span><input autoComplete="organization" value={form.bedrijf} onChange={(event) => update('bedrijf', event.target.value)} /></label>
      </div>
      <label><span>E-mailadres</span><input required type="email" autoComplete="email" value={form.email} onChange={(event) => update('email', event.target.value)} /></label>
      <label>
        <span>Wat wil je lanceren?</span>
        <textarea required minLength={10} value={form.bericht} onChange={(event) => update('bericht', event.target.value)} placeholder="Beschrijf kort je aanbod, doel en wanneer je wilt starten." />
      </label>
      <label className="honeypot" aria-hidden="true">Website<input tabIndex={-1} autoComplete="off" value={form.website} onChange={(event) => update('website', event.target.value)} /></label>
      <button className="contact-submit" disabled={status === 'sending'} type="submit">
        {status === 'sending' ? 'Bericht versturen...' : 'Bespreek mijn landingspagina'}
        <span aria-hidden="true">→</span>
      </button>
      <p className="form-note">Reactie binnen één werkdag. Geen verplichtingen.</p>
      {status === 'ok' && <p className="form-status success" role="status">Gelukt. Je bericht is veilig verzonden.</p>}
      {status === 'error' && <p className="form-status error" role="alert">{error}</p>}
    </form>
  )
}

export function StickyMobileCTA() {
  return <a className="mobile-sticky-cta" href="#prijzen">Start mijn landingspagina</a>
}
