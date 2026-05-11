'use client'

import { useState } from 'react'
import type { FormEvent } from 'react'

export function PricingButton({
  pakket,
  label,
}: {
  pakket: 'starter' | 'pro' | 'premium'
  label: string
}) {
  const [loading, setLoading] = useState(false)

  async function bestel() {
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pakket }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      className={`button button-primary button-full${loading ? ' is-loading' : ''}`}
      onClick={bestel}
      disabled={loading}
      type="button"
    >
      {loading ? 'Checkout openen...' : label}
    </button>
  )
}

export function FAQAccordion({
  items,
}: {
  items: Array<{ q: string; a: string }>
}) {
  const [openFaq, setOpenFaq] = useState<number | null>(0)

  return (
    <div className="faq-list">
      {items.map((item, index) => {
        const isOpen = openFaq === index

        return (
          <div className="faq-item" key={item.q}>
            <button
              className="faq-question"
              onClick={() => setOpenFaq(isOpen ? null : index)}
              aria-expanded={isOpen}
              type="button"
            >
              <span>{item.q}</span>
              <span className="faq-indicator" aria-hidden="true">
                {isOpen ? '−' : '+'}
              </span>
            </button>
            <div className={`faq-answer${isOpen ? ' is-open' : ''}`} aria-hidden={!isOpen}>
              <p>{item.a}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export function ContactForm() {
  const [form, setForm] = useState({ naam: '', email: '', bericht: '' })
  const [status, setStatus] = useState<'idle' | 'sending' | 'ok' | 'error'>('idle')
  const [error, setError] = useState('')

  async function verstuurContact(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('sending')
    setError('')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Verzenden mislukt.')
        setStatus('error')
        return
      }

      setForm({ naam: '', email: '', bericht: '' })
      setStatus('ok')
    } catch {
      setError('Verbindingsfout. Probeer het later opnieuw.')
      setStatus('error')
    }
  }

  return (
    <form className="contact-form" onSubmit={verstuurContact}>
      <label>
        <span>Naam</span>
        <input
          type="text"
          required
          value={form.naam}
          onChange={(event) => setForm((current) => ({ ...current, naam: event.target.value }))}
          autoComplete="name"
        />
      </label>
      <label>
        <span>E-mailadres</span>
        <input
          type="email"
          required
          value={form.email}
          onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          autoComplete="email"
        />
      </label>
      <label>
        <span>Waar wil je over schakelen?</span>
        <textarea
          required
          value={form.bericht}
          onChange={(event) => setForm((current) => ({ ...current, bericht: event.target.value }))}
        />
      </label>
      <button
        type="submit"
        className={`button button-primary${status === 'sending' ? ' is-loading' : ''}`}
        disabled={status === 'sending'}
      >
        {status === 'sending' ? 'Versturen...' : 'Stuur bericht'}
      </button>
      {status === 'ok' && (
        <p className="form-status is-success">Bericht verzonden. We reageren binnen 1 werkdag.</p>
      )}
      {status === 'error' && <p className="form-status is-error">{error}</p>}
    </form>
  )
}
