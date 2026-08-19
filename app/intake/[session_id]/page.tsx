'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { trackMarketingEvent } from '@/lib/analytics'
import type { Pakket } from '@/lib/supabase'

const css = `
  .intake-shell{min-height:100vh;background:#0a0b0d;color:#fffdf8}.intake-nav{height:68px;display:flex;align-items:center;border-bottom:1px solid #2b2d31;background:#0a0b0df2;position:sticky;top:0;z-index:10}.intake-nav>div{width:min(920px,calc(100% - 36px));margin:auto;display:flex;justify-content:space-between;align-items:center}.intake-logo{font-family:var(--font-syne),sans-serif;font-weight:800;text-decoration:none;color:#fffdf8}.intake-logo span{color:#245cff}.secure{font-size:.72rem;color:#8f908b}.intake-wrap{width:min(780px,calc(100% - 32px));margin:auto;padding:64px 0 110px}.intake-head{margin-bottom:34px}.badge{display:inline-flex;padding:7px 10px;border:1px solid #3a3c41;border-radius:3px;color:#ff6a2a;font-size:.68rem;font-weight:800;text-transform:uppercase}.step{color:#245cff;font:700 .72rem var(--font-dm-mono),monospace;text-transform:uppercase;margin:22px 0 10px}.intake-head h1{font-family:var(--font-syne),sans-serif;font-size:3.8rem;line-height:1;margin:0 0 18px}.intake-head p{color:#aaa9a4;max-width:660px}.progress{display:grid;grid-template-columns:repeat(5,1fr);gap:7px;margin:28px 0 0}.progress span{height:3px;background:#303238}.progress span.is-active{background:#245cff}.panel{background:#f3efe7;color:#121315;border:1px solid #d7d1c7;border-radius:6px;padding:42px}.section-title{font-family:var(--font-syne),sans-serif;font-size:1.45rem;margin:0 0 24px}.field{margin-bottom:20px}.field label{display:block;font-weight:800;font-size:.78rem;margin-bottom:8px}.field label span{color:#245cff}.field input,.field textarea{width:100%;border:1px solid #bdb7ad;border-radius:2px;background:#fffdf8;color:#121315;padding:14px 15px;font:inherit}.field textarea{min-height:116px;resize:vertical}.field input:focus,.field textarea:focus{outline:3px solid #ff6a2a;border-color:#245cff}.hint{font-size:.74rem;color:#6d6b65;margin:7px 0 0}.pair{display:grid;grid-template-columns:1fr 1fr;gap:16px}.subpanel{padding:20px;border:1px solid #d7d1c7;background:#ebe6dc;margin-bottom:16px}.upload-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}.upload{position:relative;padding:22px;border:1px dashed #aaa39a;background:#ebe6dc}.upload strong{display:block;font-size:.86rem}.upload small{display:block;color:#6d6b65;margin:5px 0 12px}.upload input{width:100%;font-size:.78rem}.upload img{width:100%;height:120px;object-fit:contain;background:#fff;border-radius:2px;margin-bottom:12px}.error{padding:14px 16px;border-left:3px solid #c43c2c;background:#fff0ef;color:#8d281d;margin-bottom:22px;font-size:.85rem}.step-actions{display:flex;justify-content:space-between;gap:14px;margin-top:34px}.step-actions button{min-height:52px;border:1px solid #245cff;border-radius:4px;padding:13px 22px;font:inherit;font-weight:850;cursor:pointer}.step-actions .back{background:transparent;color:#121315}.step-actions .next,.step-actions .submit{margin-left:auto;background:#245cff;color:#fff}.step-actions button:hover{transform:translateY(-1px)}.step-actions button:disabled{opacity:.55;cursor:wait}.review{border-top:1px solid #d7d1c7;padding-top:22px;color:#4d4c47}.review strong{color:#121315}.loading{min-height:70vh;display:grid;place-items:center;color:#aaa9a4;text-align:center}.loading-dot{width:42px;height:42px;border:3px solid #303238;border-top-color:#245cff;border-radius:50%;animation:spin .8s linear infinite;margin:0 auto 18px}@keyframes spin{to{transform:rotate(360deg)}}@media(max-width:620px){.pair,.upload-grid{grid-template-columns:1fr}.intake-wrap{padding-top:42px}.secure{display:none}.panel{padding:25px 18px}.intake-head h1{font-size:2.75rem}.step-actions{flex-direction:column-reverse}.step-actions button{width:100%}.step-actions .next,.step-actions .submit{margin-left:0}.progress{gap:4px}}
`

const initialForm = {
  bedrijfsnaam: '', niche: '', beschrijving: '', primaire_actie: '', usp_1: '', usp_2: '', usp_3: '', contacttelefoon: '', contactemail: '',
  doelgroep: '', concurrenten: '', gewenste_paginas: '', bestaand_domein: '', teksten_status: '', technische_koppelingen: '', werkgebied: '', social_facebook: '', social_instagram: '', social_linkedin: '',
  testimonial_1_naam: '', testimonial_1_tekst: '', testimonial_2_naam: '', testimonial_2_tekst: '',
  faq_1_vraag: '', faq_1_antwoord: '', faq_2_vraag: '', faq_2_antwoord: '', faq_3_vraag: '', faq_3_antwoord: '',
  extra_wensen: '', sfeer: '', logo_url: '', hero_image_url: '',
}
type FormState = typeof initialForm
type AssetKey = 'logo_url' | 'hero_image_url'

function Field({ id, label, required, hint, value, onChange, textarea, type = 'text', placeholder }: {
  id: keyof FormState; label: string; required?: boolean; hint?: string; value: string; onChange: (value: string) => void; textarea?: boolean; type?: string; placeholder?: string
}) {
  return <div className="field"><label htmlFor={id}>{label} {required && <span aria-hidden="true">*</span>}</label>{textarea
    ? <textarea id={id} value={value} onChange={event => onChange(event.target.value)} required={required} placeholder={placeholder} />
    : <input id={id} type={type} value={value} onChange={event => onChange(event.target.value)} required={required} placeholder={placeholder} />}{hint && <p className="hint">{hint}</p>}</div>
}

const stepTitles = ['Bedrijf en aanbod', 'Doelgroep en bewijs', 'Pagina-inhoud', 'Beeld en merk', 'Controle en versturen']

export default function IntakePage() {
  const { session_id } = useParams<{ session_id: string }>()
  const router = useRouter()
  const [pakket, setPakket] = useState<Pakket>('starter')
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState<AssetKey | null>(null)
  const [error, setError] = useState('')
  const [form, setForm] = useState<FormState>(initialForm)
  const [previews, setPreviews] = useState<Record<AssetKey, string>>({ logo_url: '', hero_image_url: '' })

  useEffect(() => {
    const saved = window.sessionStorage.getItem(`intake:${session_id}`)
    if (saved) try { setForm({ ...initialForm, ...JSON.parse(saved) }) } catch { /* beschadigde conceptdata negeren */ }
    let cancelled = false
    let attempts = 0
    async function loadOrder() {
      try {
        const response = await fetch(`/api/order?session_id=${encodeURIComponent(session_id)}`, { cache: 'no-store' })
        const data = await response.json()
        if (cancelled) return
        if (!response.ok || !data.order) throw new Error('Order niet gevonden. Controleer de link in je betaalbevestiging.')
        if (data.order.status === 'pending' && attempts++ < 15) return window.setTimeout(loadOrder, 2_000)
        if (data.order.status === 'pending') throw new Error('Je betaling wordt nog verwerkt. Ververs de pagina over een minuut.')
        if (data.order.status === 'generating' || data.order.status === 'completed') {
          const statusResponse = await fetch('/api/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ session_id }) })
          const statusData = await statusResponse.json()
          if (statusData.status_token) router.replace(`/genereren/${data.order.id}?token=${encodeURIComponent(statusData.status_token)}`)
          return
        }
        if (data.order.status !== 'paid') throw new Error('Deze order vraagt aandacht. Gebruik het contactformulier en vermeld je betaalreferentie.')
        setPakket(data.order.pakket as Pakket)
        if (data.order.purchase?.eventId && Number.isFinite(data.order.purchase.value)) {
          const purchaseKey = `purchase:${data.order.purchase.eventId}`
          if (!window.sessionStorage.getItem(purchaseKey)) {
            trackMarketingEvent('purchase', {
              package: data.order.pakket as string,
              event_id: data.order.purchase.eventId,
              transaction_id: data.order.purchase.eventId,
              value: String(data.order.purchase.value),
              currency: data.order.purchase.currency,
            })
            window.sessionStorage.setItem(purchaseKey, 'sent')
          }
        }
        trackMarketingEvent('checkout_complete', { package: data.order.pakket as string })
        trackMarketingEvent('intake_start', { package: data.order.pakket as string })
        setLoading(false)
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : 'Order controleren mislukt.')
        setLoading(false)
      }
    }
    loadOrder()
    return () => { cancelled = true }
  }, [router, session_id])

  function set(key: keyof FormState, value: string) {
    setForm(current => {
      const next = { ...current, [key]: value }
      window.sessionStorage.setItem(`intake:${session_id}`, JSON.stringify(next))
      return next
    })
  }

  function nextStep() {
    const currentPanel = document.querySelector<HTMLFormElement>('#intake-form')
    if (!currentPanel?.reportValidity()) return
    trackMarketingEvent('intake_step_complete', { package: pakket, step: String(step + 1) })
    setStep(current => Math.min(4, current + 1))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function upload(key: AssetKey, file: File | undefined) {
    if (!file) return
    setUploading(key)
    setError('')
    const body = new FormData()
    body.set('session_id', session_id)
    body.set('file', file)
    try {
      const response = await fetch('/api/intake/upload', { method: 'POST', body })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Uploaden mislukt.')
      set(key, data.assetRef)
      setPreviews(current => ({ ...current, [key]: data.previewUrl }))
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Uploaden mislukt.')
    } finally {
      setUploading(null)
    }
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault()
    setSubmitting(true)
    setError('')
    try {
      const intakeResponse = await fetch('/api/intake', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ session_id, form }) })
      const intakeData = await intakeResponse.json()
      if (!intakeResponse.ok) throw new Error(intakeData.error || 'Intake opslaan mislukt.')
      const response = await fetch('/api/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ session_id }) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Generatie starten mislukt.')
      window.sessionStorage.removeItem(`intake:${session_id}`)
      trackMarketingEvent('intake_step_complete', { package: pakket, step: '5' })
      trackMarketingEvent('intake_complete', { package: pakket })
      router.push(`/genereren/${intakeData.order_id}?token=${encodeURIComponent(data.status_token)}`)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Er ging iets mis.')
      setSubmitting(false)
    }
  }

  if (loading) return <><style>{css}</style><div className="intake-shell"><div className="loading"><div><div className="loading-dot" /><p>Betaling veilig controleren…</p></div></div></div></>

  const field = (id: keyof FormState, label: string, options: Partial<React.ComponentProps<typeof Field>> = {}) => <Field id={id} label={label} value={form[id]} onChange={value => set(id, value)} {...options} />
  const richPackage = pakket === 'pro' || pakket === 'premium'

  return <><style>{css}</style><div className="intake-shell">
    <nav className="intake-nav"><div><Link href="/" className="intake-logo">landing<span>site</span>.nl</Link><span className="secure">Beveiligde intake · concept wordt bewaard</span></div></nav>
    <main className="intake-wrap">
      <header className="intake-head"><span className="badge">{pakket} pakket</span><p className="step">Stap {step + 1} van 5 · {stepTitles[step]}</p><h1>Vertel wat de website moet doen.</h1><p>Je ziet alleen de vragen die we voor jouw pakket nodig hebben. Je concept blijft in deze browser bewaard.</p><div className="progress" aria-label={`Voortgang: stap ${step + 1} van 5`}>{stepTitles.map((title, index) => <span className={index <= step ? 'is-active' : ''} key={title} />)}</div></header>
      {error && <div className="error" role="alert">{error}</div>}
      <form className="panel" id="intake-form" onSubmit={submit}>
        {step === 0 && <><h2 className="section-title">Bedrijf en aanbod</h2>{field('bedrijfsnaam', 'Bedrijfsnaam', { required: true })}{field('niche', 'Branche of specialisme', { required: true })}{field('beschrijving', 'Wat bied je aan?', { required: true, textarea: true, hint: 'Beschrijf je aanbod, voor wie het is en wat het oplevert. We verzinnen geen resultaten of keurmerken.' })}{field('primaire_actie', 'Wat moet een bezoeker vooral doen?', { required: true, placeholder: 'Bijv. een kennismaking plannen' })}</>}
        {step === 1 && <><h2 className="section-title">Doelgroep en bewijs</h2>{field('doelgroep', 'Wie wil je bereiken?', { required: true, textarea: true })}{field('usp_1', 'Belangrijkste onderscheid', { required: true })}<div className="pair">{field('usp_2', 'Sterk punt 2')}{field('usp_3', 'Sterk punt 3')}</div>{field('concurrenten', 'Voorbeelden of concurrenten', { textarea: true, hint: 'Deel URLs en benoem wat je wel of niet aanspreekt.' })}{field('werkgebied', 'Werkgebied', { placeholder: 'Bijv. Veenendaal of heel Nederland' })}</>}
        {step === 2 && <><h2 className="section-title">Pagina-inhoud</h2><div className="pair">{field('bestaand_domein', 'Bestaand domein')}{field('contactemail', 'E-mailadres voor aanvragen', { required: true, type: 'email' })}</div>{field('contacttelefoon', 'Telefoonnummer', { type: 'tel' })}{field('teksten_status', 'Welke teksten zijn al beschikbaar?', { textarea: true })}{richPackage && field('gewenste_paginas', 'Gewenste kernpagina’s', { textarea: true, placeholder: 'Bijv. Home, Diensten, Over ons en Contact' })}{richPackage && <><h3>Echte klantreacties</h3>{[1, 2].map(number => <div className="subpanel" key={number}>{field(`testimonial_${number}_naam` as keyof FormState, `Naam klant ${number}`)}{field(`testimonial_${number}_tekst` as keyof FormState, `Letterlijke reactie ${number}`, { textarea: true, hint: 'Vul alleen een review in waarvoor je toestemming hebt.' })}</div>)}</>}</>}
        {step === 3 && <><h2 className="section-title">Beeld en merk</h2><div className="upload-grid">{(['logo_url', 'hero_image_url'] as AssetKey[]).map(key => <div className="upload" key={key}>{previews[key] && <Image src={previews[key]} alt={key === 'logo_url' ? 'Logo preview' : 'Hoofdbeeld preview'} width={520} height={240} unoptimized />}{form[key] && !previews[key] && <p className="hint">Bestand is veilig opgeslagen.</p>}<strong>{key === 'logo_url' ? 'Logo' : 'Hoofdbeeld'}</strong><small>JPG, PNG of WebP, maximaal 5 MB.</small><input aria-label={`${key === 'logo_url' ? 'Logo' : 'Hoofdbeeld'} uploaden`} type="file" accept="image/jpeg,image/png,image/webp" disabled={Boolean(uploading)} onChange={event => upload(key, event.target.files?.[0])} />{uploading === key && <p className="hint">Uploaden…</p>}</div>)}</div>{pakket === 'premium' && field('sfeer', 'Gewenste visuele richting')}{field('social_instagram', 'Instagram URL', { type: 'url' })}{field('social_linkedin', 'LinkedIn URL', { type: 'url' })}{field('social_facebook', 'Facebook URL', { type: 'url' })}</>}
        {step === 4 && <><h2 className="section-title">Controle en versturen</h2><p className="review"><strong>{form.bedrijfsnaam}</strong><br />{form.niche}<br /><br />Primaire actie: {form.primaire_actie}<br />Aanvragen naar: {form.contactemail}</p>{richPackage && <><h3>Veelgestelde vragen voor de website</h3>{[1, 2, 3].map(number => <div className="subpanel" key={number}>{field(`faq_${number}_vraag` as keyof FormState, `Vraag ${number}`)}{field(`faq_${number}_antwoord` as keyof FormState, `Antwoord ${number}`, { textarea: true })}</div>)}</>}{pakket === 'premium' && <>{field('technische_koppelingen', 'Technische koppelingen', { textarea: true })}{field('extra_wensen', 'Extra wensen', { textarea: true })}</>}</>}
        <div className="step-actions">{step > 0 && <button className="back" type="button" onClick={() => setStep(current => current - 1)}>Vorige stap</button>}{step < 4 ? <button className="next" type="button" onClick={nextStep}>Volgende stap</button> : <button className="submit" type="submit" disabled={submitting || Boolean(uploading)}>{submitting ? 'Eerste versie starten…' : 'Intake versturen'}</button>}</div>
      </form>
    </main>
  </div></>
}
