'use client'

import type { FormEvent } from 'react'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import type { CommercialPackageId } from '@/config/commercial'
import { trackMarketingEvent, type MarketingEvent } from '@/lib/analytics'

const navigation = [
  ['Werk', '#werk'],
  ['Aanpak', '#aanpak'],
  ['Pakketten', '#pakketten'],
  ['Beheer', '#beheer'],
  ['FAQ', '#faq'],
]

export function MobileNavigation() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <button className="studio-menu" type="button" aria-expanded={open} aria-controls="studio-mobile-nav" onClick={() => setOpen(!open)}>
        <span className="sr-only">Menu {open ? 'sluiten' : 'openen'}</span>
        <span /><span />
      </button>
      <nav className={`studio-mobile-nav${open ? ' is-open' : ''}`} id="studio-mobile-nav" aria-label="Mobiele navigatie">
        {navigation.map(([label, href]) => <Link href={`/${href}`} key={href} onClick={() => setOpen(false)}>{label}</Link>)}
        <Link href="/partner" onClick={() => setOpen(false)}>Partner</Link>
        <Link className="button button--primary" href="/start" onClick={() => setOpen(false)} data-analytics-event="hero_start_click">Start mijn website</Link>
      </nav>
    </>
  )
}

export function AnalyticsLayer() {
  useEffect(() => {
    const seen = new Set<string>()
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        const element = entry.target as HTMLElement
        const event = element.dataset.analyticsView as MarketingEvent | undefined
        if (!event || seen.has(event)) continue
        seen.add(event)
        trackMarketingEvent(event, { section: element.id || 'unknown' })
      }
    }, { threshold: 0.35 })

    document.querySelectorAll<HTMLElement>('[data-analytics-view]').forEach((element) => observer.observe(element))

    function trackClick(click: MouseEvent) {
      const element = (click.target as Element | null)?.closest<HTMLElement>('[data-analytics-event]')
      if (!element) return
      const { analyticsEvent, ...properties } = element.dataset
      if (analyticsEvent) trackMarketingEvent(analyticsEvent as MarketingEvent, properties as Record<string, string>)
    }

    document.addEventListener('click', trackClick)
    return () => {
      observer.disconnect()
      document.removeEventListener('click', trackClick)
    }
  }, [])

  return null
}

export function FAQList({ items }: { items: Array<{ question: string; answer: string }> }) {
  return (
    <div className="studio-faq-list">
      {items.map((item, index) => (
        <details key={item.question} open={index === 0} onToggle={(event) => {
          if (event.currentTarget.open) trackMarketingEvent('faq_open', { question_index: String(index + 1) })
        }}>
          <summary><span>{item.question}</span><span aria-hidden="true">+</span></summary>
          <p>{item.answer}</p>
        </details>
      ))}
    </div>
  )
}

export function CheckoutButton({ packageId, label }: { packageId: CommercialPackageId; label: string }) {
  const [accepted, setAccepted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function checkout() {
    if (!accepted) return setError('Accepteer eerst de zakelijke voorwaarden.')
    setLoading(true)
    setError('')
    trackMarketingEvent('checkout_start', { package: packageId })
    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pakket: packageId, requestId: crypto.randomUUID(), termsAccepted: true }),
      })
      const data = await response.json()
      if (!response.ok || !data.url) throw new Error(data.error || 'De checkout kan nu niet worden geopend.')
      window.location.assign(data.url)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'De checkout kan nu niet worden geopend.')
      setLoading(false)
    }
  }

  return (
    <div className="start-checkout">
      <label className="start-consent">
        <input type="checkbox" checked={accepted} onChange={(event) => setAccepted(event.target.checked)} />
        <span>Ik bestel zakelijk, ga akkoord met de <a href="/algemene-voorwaarden" target="_blank">voorwaarden</a> en heb het <a href="/privacybeleid" target="_blank">privacybeleid</a> gelezen.</span>
      </label>
      <button className="button button--primary button--full" type="button" disabled={!accepted || loading} onClick={checkout}>
        {loading ? 'Veilige checkout openen…' : label}
      </button>
      {error && <p className="form-message form-message--error" role="alert">{error}</p>}
    </div>
  )
}

const emptyContact = {
  naam: '', email: '', bericht: '', website: '',
}

export function ContactForm() {
  const [form, setForm] = useState(emptyContact)
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [error, setError] = useState('')
  const requestId = useRef(crypto.randomUUID())

  function update(key: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('sending')
    setError('')
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, requestId: requestId.current }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Verzenden is niet gelukt.')
      setForm(emptyContact)
      requestId.current = crypto.randomUUID()
      setStatus('success')
      trackMarketingEvent('contact_submit', { form: 'short_question' })
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Verzenden is niet gelukt.')
      setStatus('error')
    }
  }

  return (
    <form className="studio-contact-form" onSubmit={submit}>
      <div className="form-row">
        <label><span>Naam</span><input required minLength={2} autoComplete="name" value={form.naam} onChange={(event) => update('naam', event.target.value)} /></label>
        <label><span>E-mailadres</span><input required type="email" autoComplete="email" value={form.email} onChange={(event) => update('email', event.target.value)} /></label>
      </div>
      <label><span>Korte vraag</span><textarea required minLength={10} maxLength={3000} value={form.bericht} onChange={(event) => update('bericht', event.target.value)} /></label>
      <label className="honeypot" aria-hidden="true">Website<input tabIndex={-1} autoComplete="off" value={form.website} onChange={(event) => update('website', event.target.value)} /></label>
      <button className="button button--primary button--full" disabled={status === 'sending'} type="submit">{status === 'sending' ? 'Vraag versturen…' : 'Vraag versturen'}</button>
      <div aria-live="polite">
        {status === 'success' && <p className="form-message form-message--success">Je aanvraag is ontvangen. Je krijgt persoonlijk antwoord.</p>}
        {status === 'error' && <p className="form-message form-message--error" role="alert">{error}</p>}
      </div>
    </form>
  )
}
