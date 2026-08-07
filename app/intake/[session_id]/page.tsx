'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import type { Pakket } from '@/lib/supabase'
import { trackMarketingEvent } from '@/lib/analytics'

const css = `
  .intake-shell{min-height:100vh;background:#0a0b0d;color:#fffdf8}.intake-nav{height:68px;display:flex;align-items:center;border-bottom:1px solid #2b2d31;background:#0a0b0df2;position:sticky;top:0;z-index:10}.intake-nav>div{width:min(920px,calc(100% - 36px));margin:auto;display:flex;justify-content:space-between;align-items:center}.intake-logo{font-family:var(--font-syne),sans-serif;font-weight:800;text-decoration:none;color:#fffdf8}.intake-logo span{color:#245cff}.secure{font-size:.72rem;color:#8f908b}.intake-wrap{width:min(780px,calc(100% - 32px));margin:auto;padding:70px 0 110px}.intake-head{margin-bottom:42px}.badge{display:inline-flex;padding:7px 10px;border:1px solid #3a3c41;border-radius:3px;color:#ff6a2a;font-size:.68rem;font-weight:800;text-transform:uppercase}.step{color:#245cff;font:700 .72rem var(--font-dm-mono),monospace;text-transform:uppercase;margin:24px 0 10px}.intake-head h1{font-family:var(--font-syne),sans-serif;font-size:4rem;line-height:1;margin:0 0 18px}.intake-head p{color:#aaa9a4;max-width:660px}.panel{background:#f3efe7;color:#121315;border:1px solid #d7d1c7;border-radius:6px;padding:44px}.section-title{font-family:var(--font-syne),sans-serif;font-size:1.45rem;margin:48px 0 22px;padding-top:38px;border-top:1px solid #d7d1c7}.section-title:first-child{margin-top:0;padding-top:0;border:0}.field{margin-bottom:20px}.field label{display:block;font-weight:800;font-size:.78rem;margin-bottom:8px}.field label span{color:#245cff}.field input,.field textarea,.field select{width:100%;border:1px solid #bdb7ad;border-radius:2px;background:#fffdf8;color:#121315;padding:14px 15px;font:inherit}.field textarea{min-height:116px;resize:vertical}.field input:focus,.field textarea:focus{outline:3px solid #ff6a2a;border-color:#245cff}.hint{font-size:.74rem;color:#6d6b65;margin:7px 0 0}.pair{display:grid;grid-template-columns:1fr 1fr;gap:16px}.subpanel{padding:20px;border:1px solid #d7d1c7;background:#ebe6dc;margin-bottom:16px}.upload-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}.upload{position:relative;padding:22px;border:1px dashed #aaa39a;background:#ebe6dc}.upload strong{display:block;font-size:.86rem}.upload small{display:block;color:#6d6b65;margin:5px 0 12px}.upload input{width:100%;font-size:.78rem}.upload img{width:100%;height:120px;object-fit:contain;background:#fff;border-radius:2px;margin-bottom:12px}.error{padding:14px 16px;border-left:3px solid #c43c2c;background:#fff0ef;color:#8d281d;margin-bottom:22px;font-size:.85rem}.submit{width:100%;min-height:52px;border:0;border-radius:4px;background:#245cff;color:#fff;padding:15px 24px;font:inherit;font-weight:850;cursor:pointer;margin-top:34px}.submit:hover{background:#1745d1;transform:translateY(-1px)}.submit:disabled{opacity:.55;cursor:wait}.loading{min-height:70vh;display:grid;place-items:center;color:#aaa9a4;text-align:center}.loading-dot{width:42px;height:42px;border:3px solid #303238;border-top-color:#245cff;border-radius:50%;animation:spin .8s linear infinite;margin:0 auto 18px}@keyframes spin{to{transform:rotate(360deg)}}@media(max-width:620px){.pair,.upload-grid{grid-template-columns:1fr}.intake-wrap{padding-top:46px}.secure{display:none}.panel{padding:24px 18px}.intake-head h1{font-size:2.8rem}}
`

const initialForm = {
  bedrijfsnaam: '', niche: '', beschrijving: '', primaire_actie: '', usp_1: '', usp_2: '', usp_3: '', contacttelefoon: '', contactemail: '',
  doelgroep: '', concurrenten: '', gewenste_paginas: '', bestaand_domein: '', teksten_status: '', technische_koppelingen: '', werkgebied: '', social_facebook: '', social_instagram: '', social_linkedin: '',
  testimonial_1_naam: '', testimonial_1_tekst: '', testimonial_2_naam: '', testimonial_2_tekst: '',
  faq_1_vraag: '', faq_1_antwoord: '', faq_2_vraag: '', faq_2_antwoord: '', faq_3_vraag: '', faq_3_antwoord: '',
  extra_wensen: '', sfeer: '', logo_url: '', hero_image_url: '',
}
type FormState = typeof initialForm

function Field({ id, label, required, hint, value, onChange, textarea, type = 'text', placeholder }: {
  id: keyof FormState; label: string; required?: boolean; hint?: string; value: string; onChange: (value: string) => void; textarea?: boolean; type?: string; placeholder?: string
}) {
  return <div className="field"><label htmlFor={id}>{label} {required && <span aria-hidden="true">*</span>}</label>{textarea
    ? <textarea id={id} value={value} onChange={event => onChange(event.target.value)} required={required} placeholder={placeholder} />
    : <input id={id} type={type} value={value} onChange={event => onChange(event.target.value)} required={required} placeholder={placeholder} />}{hint && <p className="hint">{hint}</p>}</div>
}

export default function IntakePage() {
  const { session_id } = useParams<{ session_id: string }>()
  const router = useRouter()
  const [pakket, setPakket] = useState<Pakket>('starter')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [uploading, setUploading] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [form, setForm] = useState<FormState>(initialForm)

  useEffect(() => {
    const saved = window.sessionStorage.getItem(`intake:${session_id}`)
    if (saved) try { setForm({ ...initialForm, ...JSON.parse(saved) }) } catch { /* negeer beschadigde conceptdata */ }
    let cancelled = false
    let attempts = 0
    async function loadOrder() {
      try {
        const response = await fetch(`/api/order?session_id=${encodeURIComponent(session_id)}`, { cache: 'no-store' })
        const data = await response.json()
        if (cancelled) return
        if (!response.ok || !data.order) throw new Error('Order niet gevonden. Controleer de link in je betaalbevestiging.')
        if (data.order.status === 'pending' && attempts++ < 15) return window.setTimeout(loadOrder, 2_000)
        if (data.order.status === 'pending') throw new Error('Je betaling wordt nog verwerkt. Ververs de pagina over een minuut of gebruik het contactformulier.')
        if (data.order.status === 'generating' || data.order.status === 'completed') {
          const statusResponse = await fetch('/api/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ session_id }) })
          const statusData = await statusResponse.json()
          if (statusData.status_token) router.replace(`/genereren/${data.order.id}?token=${encodeURIComponent(statusData.status_token)}`)
          return
        }
        if (data.order.status !== 'paid') throw new Error('Deze order vraagt aandacht. Gebruik het contactformulier en vermeld je betaalreferentie.')
        setPakket(data.order.pakket as Pakket)
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

  async function upload(key: 'logo_url' | 'hero_image_url', file: File | undefined) {
    if (!file) return
    setUploading(key); setError('')
    const body = new FormData(); body.set('session_id', session_id); body.set('file', file)
    try {
      const response = await fetch('/api/intake/upload', { method: 'POST', body })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Uploaden mislukt.')
      set(key, data.url)
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Uploaden mislukt.') } finally { setUploading(null) }
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault(); setSubmitting(true); setError('')
    try {
      const intakeResponse = await fetch('/api/intake', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ session_id, form }) })
      const intakeData = await intakeResponse.json()
      if (!intakeResponse.ok) throw new Error(intakeData.error || 'Intake opslaan mislukt.')
      const response = await fetch('/api/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ session_id }) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Generatie starten mislukt.')
      window.sessionStorage.removeItem(`intake:${session_id}`)
      trackMarketingEvent('intake_complete', { package: pakket })
      router.push(`/genereren/${intakeData.order_id}?token=${encodeURIComponent(data.status_token)}`)
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Er ging iets mis.'); setSubmitting(false) }
  }

  if (loading) return <><style>{css}</style><div className="intake-shell"><div className="loading"><div><div className="loading-dot"/><p>Betaling veilig controleren…</p></div></div></div></>

  const field = (id: keyof FormState, label: string, options: Partial<React.ComponentProps<typeof Field>> = {}) => <Field id={id} label={label} value={form[id]} onChange={value => set(id, value)} {...options}/>

  return <><style>{css}</style><div className="intake-shell">
    <nav className="intake-nav"><div><Link href="/" className="intake-logo">landing<span>site</span>.nl</Link><span className="secure">Beveiligde intake · concept wordt bewaard</span></div></nav>
    <main className="intake-wrap"><header className="intake-head"><span className="badge">{pakket} pakket</span><p className="step">Na betaling · intake</p><h1>Vertel wat de website moet doen.</h1><p>Schrijf concreet en deel alleen informatie die voor de website nodig is. Je concept wordt in deze browser bewaard tot je verzendt.</p></header>
      {error && <div className="error" role="alert">{error}</div>}
      <form className="panel" onSubmit={submit}>
        <h2 className="section-title">De basis</h2>
        {field('bedrijfsnaam','Bedrijfsnaam',{required:true,placeholder:'Bijv. Studio Noord'})}
        {field('niche','Branche of specialisme',{required:true,placeholder:'Bijv. interieurontwerp voor horeca'})}
        {field('beschrijving','Wat bied je aan?',{required:true,textarea:true,placeholder:'Beschrijf je aanbod, voor wie het is en wat het oplevert. Minimaal 30 tekens.',hint:'We gebruiken je informatie als bron en verzinnen geen resultaten of keurmerken.'})}
        {field('doelgroep','Wie wil je bereiken?',{required:true,textarea:true,placeholder:'Beschrijf de klanten, situaties of vragen waarop de website moet aansluiten.'})}
        {field('primaire_actie','Wat moet een bezoeker vooral doen?',{required:true,placeholder:'Bijv. een kennismaking plannen of een offerte aanvragen'})}
        <h2 className="section-title">Waarom jij?</h2>
        {field('usp_1','Sterk punt 1',{required:true,placeholder:'Bijv. Eén vast aanspreekpunt'})}
        <div className="pair">{field('usp_2','Sterk punt 2',{placeholder:'Bijv. Offerte binnen 24 uur'})}{field('usp_3','Sterk punt 3',{placeholder:'Bijv. 12 jaar vakervaring'})}</div>
        <h2 className="section-title">Inhoud en bestaande situatie</h2>
        {field('concurrenten','Voorbeelden of concurrenten',{textarea:true,placeholder:'Deel URLs en leg kort uit wat je wel of niet aanspreekt.'})}
        <div className="pair">{field('bestaand_domein','Bestaand domein',{placeholder:'bijv. mijnbedrijf.nl'})}{field('werkgebied','Werkgebied',{placeholder:'Bijv. Veenendaal of heel Nederland'})}</div>
        {field('teksten_status','Welke teksten zijn al beschikbaar?',{textarea:true,placeholder:'Noem bestaande pagina’s, brochures of losse teksten die als bron mogen dienen.'})}
        {(pakket==='pro'||pakket==='premium')&&field('gewenste_paginas','Gewenste kernpagina’s',{textarea:true,placeholder:'Bijv. Home, Diensten, Over ons en Contact.'})}
        <h2 className="section-title">Beeld en merk</h2>
        <div className="upload-grid"><div className="upload">{form.logo_url && <Image src={form.logo_url} alt="Logo preview" width={520} height={240} unoptimized/>}<strong>Logo</strong><small>Transparante PNG of WebP werkt het best.</small><input aria-label="Logo uploaden" type="file" accept="image/jpeg,image/png,image/webp" disabled={Boolean(uploading)} onChange={e => upload('logo_url',e.target.files?.[0])}/>{uploading==='logo_url'&&<p className="hint">Uploaden…</p>}</div><div className="upload">{form.hero_image_url && <Image src={form.hero_image_url} alt="Hoofdbeeld preview" width={520} height={240} unoptimized/>}<strong>Hoofdbeeld</strong><small>Liggende foto, maximaal 5 MB.</small><input aria-label="Hoofdbeeld uploaden" type="file" accept="image/jpeg,image/png,image/webp" disabled={Boolean(uploading)} onChange={e => upload('hero_image_url',e.target.files?.[0])}/>{uploading==='hero_image_url'&&<p className="hint">Uploaden…</p>}</div></div>
        <h2 className="section-title">Contact op je pagina</h2>
        <div className="pair">{field('contactemail','E-mailadres',{required:true,type:'email',placeholder:'contact@bedrijf.nl',hint:'Nieuwe aanvragen komen hier binnen.'})}{field('contacttelefoon','Telefoonnummer',{type:'tel',placeholder:'06 12 34 56 78'})}</div>
        {(pakket==='pro'||pakket==='premium')&&<><h2 className="section-title">Echte klantreacties</h2>{[1,2].map(n=><div className="subpanel" key={n}><div className="pair">{field(`testimonial_${n}_naam` as keyof FormState,`Naam klant ${n}`)}{field(`testimonial_${n}_tekst` as keyof FormState,`Letterlijke reactie ${n}`,{textarea:true,hint:'Vul alleen een review in waarvoor je toestemming hebt om die te publiceren.'})}</div></div>)}<h2 className="section-title">Veelgestelde vragen</h2>{[1,2,3].map(n=><div className="subpanel" key={n}>{field(`faq_${n}_vraag` as keyof FormState,`Vraag ${n}`)}{field(`faq_${n}_antwoord` as keyof FormState,`Antwoord ${n}`,{textarea:true})}</div>)}</>}
        <h2 className="section-title">Sociale links</h2>{field('social_instagram','Instagram URL',{type:'url',placeholder:'https://…'})}{field('social_linkedin','LinkedIn URL',{type:'url',placeholder:'https://…'})}{field('social_facebook','Facebook URL',{type:'url',placeholder:'https://…'})}
        {pakket==='premium'&&<><h2 className="section-title">Premium briefing</h2>{field('sfeer','Gewenste visuele richting',{placeholder:'Bijv. redactioneel, technisch of warm en rustig'})}{field('technische_koppelingen','Benodigde koppelingen',{textarea:true,placeholder:'Bijv. agenda, CRM, nieuwsbrief of bestaand formulier.'})}{field('extra_wensen','Extra wensen',{textarea:true,placeholder:'Vertel wat voor positionering, toon en bezoekersroute belangrijk is.'})}</>}
        <button className="submit" type="submit" disabled={submitting||Boolean(uploading)}>{submitting?'Je pagina wordt veilig gestart…':'Maak mijn eerste versie'}</button>
      </form>
    </main></div></>
}
