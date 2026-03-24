'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import type { Pakket } from '@/lib/supabase'

const styles = `
  body { font-family: var(--font-dm-mono), monospace; }
  .intake-wrap { min-height: 100vh; padding: 5rem 2rem 3rem; max-width: 680px; margin: 0 auto; }
  .intake-header { margin-bottom: 3rem; }
  .intake-label { font-size: 0.7rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--accent); margin-bottom: 0.5rem; }
  .intake-title { font-family: var(--font-syne), sans-serif; font-size: 2rem; font-weight: 800; letter-spacing: -0.03em; margin-bottom: 0.75rem; }
  .intake-sub { font-size: 0.85rem; color: var(--muted); }
  .form-group { margin-bottom: 1.5rem; }
  .form-label { display: block; font-size: 0.75rem; letter-spacing: 0.06em; text-transform: uppercase; margin-bottom: 0.5rem; color: var(--ink); }
  .form-label span { color: var(--accent); }
  .form-input, .form-textarea { width: 100%; background: var(--paper); border: 1px solid var(--rule); padding: 0.9rem 1rem; font-family: var(--font-dm-mono), monospace; font-size: 0.9rem; outline: none; transition: border-color 0.2s; color: var(--ink); }
  .form-input:focus, .form-textarea:focus { border-color: var(--accent); }
  .form-textarea { resize: vertical; min-height: 100px; }
  .form-hint { font-size: 0.72rem; color: var(--muted); margin-top: 0.35rem; }
  .form-section-title { font-family: var(--font-syne), sans-serif; font-size: 1rem; font-weight: 700; margin: 2.5rem 0 1.5rem; padding-top: 2rem; border-top: 1px solid var(--rule); }
  .submit-btn { display: block; width: 100%; text-align: center; padding: 1.2rem; font-family: var(--font-dm-mono), monospace; font-size: 0.85rem; letter-spacing: 0.08em; text-transform: uppercase; background: var(--accent); color: #fff; border: none; cursor: pointer; box-shadow: 4px 4px 0 var(--ink); transition: background 0.2s, transform 0.1s; margin-top: 2rem; }
  .submit-btn:hover { background: var(--accent-light); transform: translate(-2px,-2px); box-shadow: 6px 6px 0 var(--ink); }
  .submit-btn:disabled { opacity: 0.6; cursor: not-allowed; transform: none; box-shadow: 4px 4px 0 var(--ink); }
  .pakket-badge { display: inline-block; background: var(--ink); color: var(--paper); font-size: 0.65rem; letter-spacing: 0.1em; text-transform: uppercase; padding: 0.3rem 0.8rem; margin-bottom: 1rem; }
  .error-box { background: #fee; border: 1px solid #fcc; padding: 1rem; font-size: 0.85rem; color: #c00; margin-bottom: 1.5rem; }
  nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; padding: 1rem 2rem; display: flex; justify-content: space-between; align-items: center; background: rgba(245,242,235,0.95); backdrop-filter: blur(8px); border-bottom: 1px solid var(--rule); }
  .nav-logo { font-family: var(--font-syne), sans-serif; font-weight: 800; font-size: 1.1rem; color: var(--ink); text-decoration: none; }
  .nav-logo span { color: var(--accent); }
`

export default function IntakePage() {
  const { session_id } = useParams<{ session_id: string }>()
  const router = useRouter()

  const [orderId, setOrderId] = useState<string | null>(null)
  const [pakket, setPakket] = useState<Pakket>('starter')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState({
    bedrijfsnaam: '',
    niche: '',
    beschrijving: '',
    usp_1: '',
    usp_2: '',
    usp_3: '',
    contacttelefoon: '',
    contactemail: '',
    // Pro+
    doelgroep: '',
    werkgebied: '',
    social_facebook: '',
    social_instagram: '',
    social_linkedin: '',
    testimonial_1_naam: '',
    testimonial_1_tekst: '',
    testimonial_2_naam: '',
    testimonial_2_tekst: '',
    faq_1_vraag: '',
    faq_1_antwoord: '',
    faq_2_vraag: '',
    faq_2_antwoord: '',
    faq_3_vraag: '',
    faq_3_antwoord: '',
    // Premium+
    extra_wensen: '',
    sfeer: '',
  })

  useEffect(() => {
    let attempts = 0
    const MAX_ATTEMPTS = 12 // 12 x 2.5s = 30 seconden

    async function laadOrder() {
      const { data, error } = await supabase
        .from('orders')
        .select('id, pakket, status')
        .eq('stripe_session_id', session_id)
        .single()

      if (error || !data) {
        setError('Order niet gevonden. Heb je al betaald?')
        setLoading(false)
        return
      }

      if (data.status === 'completed') {
        router.push('/bedankt')
        return
      }

      // Wacht op Stripe webhook als betaling nog pending is
      if (data.status === 'pending') {
        attempts++
        if (attempts < MAX_ATTEMPTS) {
          setTimeout(laadOrder, 2500)
          return
        }
        setError('Betaling kon niet worden bevestigd. Neem contact op via info@landingsite.nl met je orderreferentie.')
        setLoading(false)
        return
      }

      setOrderId(data.id)
      setPakket(data.pakket as Pakket)
      setLoading(false)
    }
    laadOrder()
  }, [session_id, router])

  function set(key: string, val: string) {
    setForm(f => ({ ...f, [key]: val }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!orderId) return
    setSubmitting(true)
    setError('')

    const extraFields: Record<string, unknown> = {
      contacttelefoon: form.contacttelefoon,
      contactemail: form.contactemail,
    }

    if (pakket === 'pro' || pakket === 'premium') {
      extraFields.doelgroep = form.doelgroep
      extraFields.werkgebied = form.werkgebied
      extraFields.social_facebook = form.social_facebook
      extraFields.social_instagram = form.social_instagram
      extraFields.social_linkedin = form.social_linkedin
      extraFields.testimonials = [
        form.testimonial_1_naam ? { naam: form.testimonial_1_naam, tekst: form.testimonial_1_tekst } : null,
        form.testimonial_2_naam ? { naam: form.testimonial_2_naam, tekst: form.testimonial_2_tekst } : null,
      ].filter(Boolean)
      extraFields.faq = [
        form.faq_1_vraag ? { vraag: form.faq_1_vraag, antwoord: form.faq_1_antwoord } : null,
        form.faq_2_vraag ? { vraag: form.faq_2_vraag, antwoord: form.faq_2_antwoord } : null,
        form.faq_3_vraag ? { vraag: form.faq_3_vraag, antwoord: form.faq_3_antwoord } : null,
      ].filter(Boolean)
    }

    if (pakket === 'premium') {
      extraFields.extra_wensen = form.extra_wensen
      extraFields.sfeer = form.sfeer
    }

    // Sla intake op
    const { error: intakeErr } = await supabase.from('intake_forms').insert({
      order_id: orderId,
      bedrijfsnaam: form.bedrijfsnaam,
      niche: form.niche,
      beschrijving: form.beschrijving,
      usp_1: form.usp_1,
      usp_2: form.usp_2,
      usp_3: form.usp_3,
      extra_fields: extraFields,
    })

    if (intakeErr) {
      setError('Opslaan mislukt: ' + intakeErr.message)
      setSubmitting(false)
      return
    }

    // Start generatie
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order_id: orderId }),
    })
    const data = await res.json()

    if (!res.ok) {
      setError('Generatie mislukt: ' + data.error)
      setSubmitting(false)
      return
    }

    router.push(`/genereren/${orderId}`)
  }

  if (loading) {
    return (
      <>
        <style>{styles}</style>
        <nav><a href="/" className="nav-logo">landing<span>site</span>.nl</a></nav>
        <div className="intake-wrap">
          <p style={{ color: 'var(--muted)', fontFamily: 'var(--font-dm-mono)' }}>Betaling controleren...</p>
        </div>
      </>
    )
  }

  return (
    <>
      <style>{styles}</style>
      <nav><a href="/" className="nav-logo">landing<span>site</span>.nl</a></nav>

      <div className="intake-wrap">
        <div className="intake-header">
          <div className="pakket-badge">{pakket} pakket</div>
          <p className="intake-label">Stap 2 van 2</p>
          <h1 className="intake-title">Vertel ons over je bedrijf</h1>
          <p className="intake-sub">Vul onderstaande gegevens in. Claude genereert vervolgens automatisch jouw landingspagina.</p>
        </div>

        {error && <div className="error-box">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Bedrijfsnaam <span>*</span></label>
            <input className="form-input" value={form.bedrijfsnaam} onChange={e => set('bedrijfsnaam', e.target.value)} required placeholder="bijv. Loodgieter Janssen" />
          </div>

          <div className="form-group">
            <label className="form-label">Branche / niche <span>*</span></label>
            <input className="form-input" value={form.niche} onChange={e => set('niche', e.target.value)} required placeholder="bijv. Loodgietersbedrijf, Personal Trainer, Coach..." />
          </div>

          <div className="form-group">
            <label className="form-label">Wat bied je aan? <span>*</span></label>
            <textarea className="form-textarea" value={form.beschrijving} onChange={e => set('beschrijving', e.target.value)} required placeholder="Beschrijf je dienst of product in 2-3 zinnen." />
          </div>

          <div className="form-section-title">Jouw sterke punten (USPs)</div>

          {(['usp_1', 'usp_2', 'usp_3'] as const).map((key, i) => (
            <div className="form-group" key={key}>
              <label className="form-label">USP {i + 1} {i === 0 && <span>*</span>}</label>
              <input className="form-input" value={form[key]} onChange={e => set(key, e.target.value)} required={i === 0} placeholder={['bijv. Binnen 24 uur ter plaatse', 'bijv. 15 jaar ervaring', 'bijv. Gratis offerte op maat'][i]} />
            </div>
          ))}

          <div className="form-section-title">Contactgegevens voor op de pagina</div>

          <div className="form-group">
            <label className="form-label">Telefoonnummer</label>
            <input className="form-input" value={form.contacttelefoon} onChange={e => set('contacttelefoon', e.target.value)} placeholder="bijv. 06-12345678" />
          </div>

          <div className="form-group">
            <label className="form-label">E-mailadres voor contactformulier <span>*</span></label>
            <input className="form-input" type="email" value={form.contactemail} onChange={e => set('contactemail', e.target.value)} required placeholder="jouw@email.nl" />
            <p className="form-hint">Aanvragen van bezoekers komen hier naartoe.</p>
          </div>

          {(pakket === 'pro' || pakket === 'premium') && (
            <>
              <div className="form-section-title">Pro — Doelgroep & werkgebied</div>

              <div className="form-group">
                <label className="form-label">Doelgroep</label>
                <input className="form-input" value={form.doelgroep} onChange={e => set('doelgroep', e.target.value)} placeholder="bijv. Particulieren in Noord-Holland, ZZP'ers..." />
              </div>

              <div className="form-group">
                <label className="form-label">Werkgebied</label>
                <input className="form-input" value={form.werkgebied} onChange={e => set('werkgebied', e.target.value)} placeholder="bijv. Amsterdam en omgeving, heel Nederland..." />
              </div>

              <div className="form-section-title">Reviews / testimonials (optioneel)</div>

              {[1, 2].map(n => (
                <div key={n} style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--surface)', border: '1px solid var(--rule)' }}>
                  <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                    <label className="form-label">Review {n} — Naam</label>
                    <input className="form-input" value={form[`testimonial_${n}_naam` as keyof typeof form]} onChange={e => set(`testimonial_${n}_naam`, e.target.value)} placeholder="bijv. Jan de Vries" />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Review {n} — Tekst</label>
                    <textarea className="form-textarea" style={{ minHeight: '70px' }} value={form[`testimonial_${n}_tekst` as keyof typeof form]} onChange={e => set(`testimonial_${n}_tekst`, e.target.value)} placeholder="bijv. Super snelle service, echt aanrader!" />
                  </div>
                </div>
              ))}

              <div className="form-section-title">FAQ (optioneel)</div>

              {[1, 2, 3].map(n => (
                <div key={n} style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--surface)', border: '1px solid var(--rule)' }}>
                  <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                    <label className="form-label">Vraag {n}</label>
                    <input className="form-input" value={form[`faq_${n}_vraag` as keyof typeof form]} onChange={e => set(`faq_${n}_vraag`, e.target.value)} placeholder="bijv. Hoe snel kom je langs?" />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Antwoord {n}</label>
                    <textarea className="form-textarea" style={{ minHeight: '70px' }} value={form[`faq_${n}_antwoord` as keyof typeof form]} onChange={e => set(`faq_${n}_antwoord`, e.target.value)} placeholder="bijv. Wij streven ernaar binnen 24 uur ter plaatse te zijn." />
                  </div>
                </div>
              ))}

              <div className="form-section-title">Social media (optioneel)</div>

              {[
                { key: 'social_facebook', label: 'Facebook URL' },
                { key: 'social_instagram', label: 'Instagram URL' },
                { key: 'social_linkedin', label: 'LinkedIn URL' },
              ].map(({ key, label }) => (
                <div className="form-group" key={key}>
                  <label className="form-label">{label}</label>
                  <input className="form-input" value={form[key as keyof typeof form]} onChange={e => set(key, e.target.value)} placeholder="https://..." />
                </div>
              ))}
            </>
          )}

          {pakket === 'premium' && (
            <>
              <div className="form-section-title">Premium — Extra wensen</div>

              <div className="form-group">
                <label className="form-label">Gewenste sfeer / stijl</label>
                <input className="form-input" value={form.sfeer} onChange={e => set('sfeer', e.target.value)} placeholder="bijv. Professioneel & betrouwbaar, Energiek & modern..." />
              </div>

              <div className="form-group">
                <label className="form-label">Extra wensen of informatie</label>
                <textarea className="form-textarea" value={form.extra_wensen} onChange={e => set('extra_wensen', e.target.value)} placeholder="Alles wat Claude moet weten bij het schrijven van jouw teksten..." />
                <p className="form-hint">Claude gebruikt dit om alle teksten op maat te schrijven.</p>
              </div>
            </>
          )}

          <button type="submit" disabled={submitting} className="submit-btn">
            {submitting ? '⏳ Pagina wordt gegenereerd...' : '🚀 Genereer mijn landingspagina'}
          </button>
        </form>
      </div>
    </>
  )
}
