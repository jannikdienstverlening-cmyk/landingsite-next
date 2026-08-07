'use client'

import type { FormEvent } from 'react'
import { useRef, useState } from 'react'
import { pricingConfig } from '@/config/pricing'
import { trackMarketingEvent } from '@/lib/analytics'

const navItems = [
  ['Projecten', '#voorbeelden'],
  ['Werkwijze', '#werkwijze'],
  ['Pakketten', '#prijzen'],
  ['Beheer', '#websitebeheer'],
  ['Vragen', '#faq'],
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
        <a className="mobile-nav-cta" href="#contact" onClick={() => setOpen(false)} data-analytics-event="start_website" data-analytics-location="mobile_menu">Vertel wat je nodig hebt</a>
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
    trackMarketingEvent('direct_order_checkout', { pakket })
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
      <label className="terms-check">
        <input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} />
        <span>Ik bestel zakelijk, betaal nu alleen de eenmalige bouwprijs, ga akkoord met de <a href="/algemene-voorwaarden" target="_blank" rel="noopener noreferrer">voorwaarden</a> en heb het <a href="/privacybeleid" target="_blank" rel="noopener noreferrer">privacybeleid</a> gelezen. {pricingConfig.websiteManagement.name} wordt pas na livegang apart geactiveerd.</span>
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

const emptyForm = {
  naam: '',
  bedrijf: '',
  email: '',
  telefoon: '',
  bericht: '',
  materiaal: '',
  startdatum: '',
  voorkeur: '',
  website: '',
}

export function ContactForm() {
  const [form, setForm] = useState(emptyForm)
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle')
  const [error, setError] = useState('')
  const started = useRef(false)

  function markStarted() {
    if (started.current) return
    started.current = true
    trackMarketingEvent('form_start', { form: 'website_request' })
  }

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
      setForm(emptyForm)
      setStatus('ok')
      trackMarketingEvent('form_submit_success', { form: 'website_request' })
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Verzenden mislukt.')
      setStatus('error')
    }
  }

  function update(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  return (
    <form className="contact-form" id="website-request-form" onSubmit={submit} onFocusCapture={markStarted}>
      <div className="form-pair">
        <label><span>Naam</span><input required minLength={2} autoComplete="name" value={form.naam} onChange={(event) => update('naam', event.target.value)} /></label>
        <label><span>Bedrijfsnaam <small>optioneel</small></span><input autoComplete="organization" value={form.bedrijf} onChange={(event) => update('bedrijf', event.target.value)} /></label>
      </div>
      <div className="form-pair">
        <label><span>E-mailadres</span><input required type="email" autoComplete="email" value={form.email} onChange={(event) => update('email', event.target.value)} /></label>
        <label><span>Telefoonnummer <small>optioneel</small></span><input type="tel" autoComplete="tel" value={form.telefoon} onChange={(event) => update('telefoon', event.target.value)} /></label>
      </div>
      <label>
        <span>Wat wil je laten bouwen?</span>
        <textarea required minLength={10} value={form.bericht} onChange={(event) => update('bericht', event.target.value)} placeholder="Beschrijf kort je aanbod, doelgroep en het belangrijkste doel van de website." />
      </label>
      <div className="form-pair">
        <label>
          <span>Heb je al teksten en afbeeldingen?</span>
          <select required value={form.materiaal} onChange={(event) => update('materiaal', event.target.value)}>
            <option value="">Maak een keuze</option>
            <option value="ja">Ja, alles is beschikbaar</option>
            <option value="deels">Gedeeltelijk</option>
            <option value="nee">Nog niet</option>
            <option value="onbekend">Ik wil hierover advies</option>
          </select>
        </label>
        <label><span>Gewenste startdatum <small>optioneel</small></span><input type="date" value={form.startdatum} onChange={(event) => update('startdatum', event.target.value)} /></label>
      </div>
      <label>
        <span>Pakketvoorkeur <small>optioneel</small></span>
        <select value={form.voorkeur} onChange={(event) => update('voorkeur', event.target.value)}>
          <option value="">Nog niet zeker</option>
          <option value="starter">Starter · €{pricingConfig.buildPackages.starter.oneTimePrice}</option>
          <option value="pro">Pro · €{pricingConfig.buildPackages.pro.oneTimePrice}</option>
          <option value="premium">Premium · €{pricingConfig.buildPackages.premium.oneTimePrice}</option>
          <option value="advies">Graag eerst advies</option>
        </select>
      </label>
      <label className="honeypot" aria-hidden="true">Website<input tabIndex={-1} autoComplete="off" value={form.website} onChange={(event) => update('website', event.target.value)} /></label>
      <button className="contact-submit" disabled={status === 'sending'} type="submit">
        {status === 'sending' ? 'Aanvraag versturen...' : 'Verstuur mijn aanvraag'}
        <span aria-hidden="true">→</span>
      </button>
      <p className="form-note">Je zit nog nergens aan vast.</p>
      {status === 'ok' && <p className="form-status success" role="status">Gelukt. Je aanvraag is veilig verzonden. Je ontvangt persoonlijk bericht over de volgende stap.</p>}
      {status === 'error' && <p className="form-status error" role="alert">{error}</p>}
    </form>
  )
}
