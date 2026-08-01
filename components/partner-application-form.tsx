'use client'

import Link from 'next/link'
import { useState, type FormEvent } from 'react'

const emptyForm = {
  voornaam: '', achternaam: '', email: '', telefoon: '', type: 'particulier' as 'particulier' | 'ondernemer',
  bedrijfsnaam: '', kvkNummer: '', btwNummer: '', termsAccepted: false, privacyAccepted: false, website: '',
}

export function PartnerApplicationForm() {
  const [form, setForm] = useState(emptyForm)
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [key]: value }))
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus('sending')
    setMessage('')
    try {
      const response = await fetch('/api/partners/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, requestId: crypto.randomUUID() }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Aanvraag versturen lukt nu niet.')
      setForm(emptyForm)
      setStatus('success')
      setMessage('Je aanvraag is ontvangen en staat op pending. Na handmatige controle ontvang je bericht; er is nog geen partnercode of uitbetaling geactiveerd.')
    } catch (error) {
      setStatus('error')
      setMessage(error instanceof Error ? error.message : 'Aanvraag versturen lukt nu niet.')
    }
  }

  return (
    <form className="partner-application-form" onSubmit={submit} id="aanmelden">
      <div className="partner-form-head">
        <p className="section-kicker">Aanmelden</p>
        <h2>Partneraanvraag versturen</h2>
        <p>Na ontvangst controleren we de aanvraag handmatig. Een unieke partnercode volgt pas na goedkeuring.</p>
      </div>
      <div className="form-pair">
        <label><span>Voornaam</span><input required minLength={2} autoComplete="given-name" value={form.voornaam} onChange={(event) => update('voornaam', event.target.value)} /></label>
        <label><span>Achternaam</span><input required minLength={2} autoComplete="family-name" value={form.achternaam} onChange={(event) => update('achternaam', event.target.value)} /></label>
      </div>
      <div className="form-pair">
        <label><span>E-mailadres</span><input required type="email" autoComplete="email" value={form.email} onChange={(event) => update('email', event.target.value)} /></label>
        <label><span>Telefoonnummer <small>optioneel</small></span><input type="tel" autoComplete="tel" value={form.telefoon} onChange={(event) => update('telefoon', event.target.value)} /></label>
      </div>
      <fieldset>
        <legend>Type partner</legend>
        <label className="radio-option"><input type="radio" name="partner-type" checked={form.type === 'particulier'} onChange={() => update('type', 'particulier')} /> Particulier</label>
        <label className="radio-option"><input type="radio" name="partner-type" checked={form.type === 'ondernemer'} onChange={() => update('type', 'ondernemer')} /> Ondernemer</label>
      </fieldset>
      {form.type === 'ondernemer' && <div className="business-fields">
        <div className="form-pair">
          <label><span>Bedrijfsnaam</span><input required autoComplete="organization" value={form.bedrijfsnaam} onChange={(event) => update('bedrijfsnaam', event.target.value)} /></label>
          <label><span>KvK-nummer</span><input required inputMode="numeric" pattern="[0-9 ]{8,10}" value={form.kvkNummer} onChange={(event) => update('kvkNummer', event.target.value)} /></label>
        </div>
        <label><span>Btw-nummer <small>optioneel</small></span><input autoComplete="off" value={form.btwNummer} onChange={(event) => update('btwNummer', event.target.value)} /></label>
      </div>}
      <label className="honeypot" aria-hidden="true">Website<input tabIndex={-1} autoComplete="off" value={form.website} onChange={(event) => update('website', event.target.value)} /></label>
      <label className="consent-option"><input required type="checkbox" checked={form.termsAccepted} onChange={(event) => update('termsAccepted', event.target.checked)} /><span>Ik ga akkoord met de <Link href="/partnervoorwaarden" target="_blank" rel="noreferrer">partnervoorwaarden</Link>.</span></label>
      <label className="consent-option"><input required type="checkbox" checked={form.privacyAccepted} onChange={(event) => update('privacyAccepted', event.target.checked)} /><span>Ik heb het <Link href="/privacybeleid" target="_blank" rel="noreferrer">privacybeleid</Link> gelezen.</span></label>
      <button className="primary-button partner-submit" disabled={status === 'sending'} type="submit">{status === 'sending' ? 'Aanvraag versturen...' : 'Partneraanvraag versturen'}</button>
      {message && <p className={`form-status ${status === 'success' ? 'success' : 'error'}`} role={status === 'error' ? 'alert' : 'status'}>{message}</p>}
      <p className="form-note">We vragen geen IBAN bij de openbare aanmelding. Uitbetalingen blijven geblokkeerd tot handmatige verificatie.</p>
    </form>
  )
}
