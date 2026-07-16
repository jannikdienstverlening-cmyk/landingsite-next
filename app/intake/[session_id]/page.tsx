'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import type { Pakket } from '@/lib/supabase'

const css = `
  .intake-shell{min-height:100vh;background:#f3f7f5;color:#0a2119}.intake-nav{height:72px;display:flex;align-items:center;border-bottom:1px solid #d9e5df;background:#f3f7f5e8;backdrop-filter:blur(16px);position:sticky;top:0;z-index:10}.intake-nav>div{width:min(920px,calc(100% - 36px));margin:auto;display:flex;justify-content:space-between;align-items:center}.intake-logo{font-family:var(--font-syne),sans-serif;font-weight:850;text-decoration:none;color:#0a2119}.intake-logo span{color:#147d59}.secure{font-size:.72rem;color:#5f736b}.intake-wrap{width:min(760px,calc(100% - 32px));margin:auto;padding:64px 0 100px}.intake-head{margin-bottom:40px}.badge{display:inline-flex;padding:7px 11px;border-radius:999px;background:#0a382a;color:#fff;font-size:.7rem;font-weight:800;letter-spacing:.08em;text-transform:uppercase}.step{color:#147d59;font-weight:800;font-size:.76rem;letter-spacing:.12em;text-transform:uppercase;margin:24px 0 10px}.intake-head h1{font-family:var(--font-syne),sans-serif;font-size:clamp(2.3rem,6vw,4.2rem);line-height:1;letter-spacing:-.055em;margin:0 0 18px}.intake-head p{color:#5f736b;max-width:620px}.panel{background:#fff;border:1px solid #d9e5df;border-radius:24px;padding:clamp(22px,5vw,44px);box-shadow:0 24px 80px #133d2f0c}.section-title{font-family:var(--font-syne),sans-serif;font-size:1.35rem;margin:44px 0 20px;padding-top:40px;border-top:1px solid #d9e5df}.section-title:first-child{margin-top:0;padding-top:0;border:0}.field{margin-bottom:20px}.field label{display:block;font-weight:800;font-size:.79rem;margin-bottom:8px}.field label span{color:#147d59}.field input,.field textarea,.field select{width:100%;border:1px solid #cbdad3;border-radius:12px;background:#fbfdfc;color:#0a2119;padding:14px 15px;font:inherit}.field textarea{min-height:112px;resize:vertical}.field input:focus,.field textarea:focus{outline:3px solid #3ac38d2e;border-color:#17845e}.hint{font-size:.76rem;color:#6b7d76;margin:7px 0 0}.pair{display:grid;grid-template-columns:1fr 1fr;gap:16px}.subpanel{padding:20px;border:1px solid #d9e5df;border-radius:16px;background:#f7faf8;margin-bottom:16px}.upload-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}.upload{position:relative;padding:22px;border:1px dashed #a9c1b6;border-radius:16px;background:#f7faf8}.upload strong{display:block;font-size:.86rem}.upload small{display:block;color:#6b7d76;margin:5px 0 12px}.upload input{width:100%;font-size:.78rem}.upload img{width:100%;height:120px;object-fit:contain;background:#fff;border-radius:10px;margin-bottom:12px}.error{padding:14px 16px;border-radius:12px;background:#fff0ef;border:1px solid #f3c7c3;color:#9d2d25;margin-bottom:22px;font-size:.85rem}.submit{width:100%;border:0;border-radius:999px;background:#0b4634;color:#fff;padding:17px 24px;font:inherit;font-weight:850;cursor:pointer;margin-top:30px;box-shadow:0 16px 35px #0b46342b}.submit:hover{background:#147d59;transform:translateY(-1px)}.submit:disabled{opacity:.55;cursor:wait}.loading{min-height:70vh;display:grid;place-items:center;color:#5f736b;text-align:center}.loading-dot{width:42px;height:42px;border:3px solid #d9e5df;border-top-color:#147d59;border-radius:50%;animation:spin .8s linear infinite;margin:0 auto 18px}@keyframes spin{to{transform:rotate(360deg)}}@media(max-width:620px){.pair,.upload-grid{grid-template-columns:1fr}.intake-wrap{padding-top:42px}.secure{display:none}.panel{border-radius:18px}.intake-head h1{font-size:2.7rem}}
`

const initialForm = {
  bedrijfsnaam: '', niche: '', beschrijving: '', usp_1: '', usp_2: '', usp_3: '', contacttelefoon: '', contactemail: '',
  doelgroep: '', werkgebied: '', social_facebook: '', social_instagram: '', social_linkedin: '',
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
        if (data.order.status === 'pending') throw new Error('Je betaling wordt nog verwerkt. Ververs over een minuut of mail info@landingsite.nl.')
        if (data.order.status === 'generating' || data.order.status === 'completed') {
          const statusResponse = await fetch('/api/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ session_id }) })
          const statusData = await statusResponse.json()
          if (statusData.status_token) router.replace(`/genereren/${data.order.id}?token=${encodeURIComponent(statusData.status_token)}`)
          return
        }
        if (data.order.status !== 'paid') throw new Error('Deze order vraagt aandacht. Mail info@landingsite.nl met je betaalreferentie.')
        setPakket(data.order.pakket as Pakket)
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
      router.push(`/genereren/${intakeData.order_id}?token=${encodeURIComponent(data.status_token)}`)
    } catch (caught) { setError(caught instanceof Error ? caught.message : 'Er ging iets mis.'); setSubmitting(false) }
  }

  if (loading) return <><style>{css}</style><div className="intake-shell"><div className="loading"><div><div className="loading-dot"/><p>Betaling veilig controleren…</p></div></div></div></>

  const field = (id: keyof FormState, label: string, options: Partial<React.ComponentProps<typeof Field>> = {}) => <Field id={id} label={label} value={form[id]} onChange={value => set(id, value)} {...options}/>

  return <><style>{css}</style><div className="intake-shell">
    <nav className="intake-nav"><div><Link href="/" className="intake-logo">landing<span>site</span>.nl</Link><span className="secure">Beveiligde intake · concept wordt bewaard</span></div></nav>
    <main className="intake-wrap"><header className="intake-head"><span className="badge">{pakket} pakket</span><p className="step">Stap 2 van 2</p><h1>Geef je pagina een vliegende start.</h1><p>De kwaliteit van je input bepaalt de kwaliteit van je pagina. Schrijf concreet; wij maken er een overtuigend geheel van.</p></header>
      {error && <div className="error" role="alert">{error}</div>}
      <form className="panel" onSubmit={submit}>
        <h2 className="section-title">De basis</h2>
        {field('bedrijfsnaam','Bedrijfsnaam',{required:true,placeholder:'Bijv. Studio Noord'})}
        {field('niche','Branche of specialisme',{required:true,placeholder:'Bijv. interieurontwerp voor horeca'})}
        {field('beschrijving','Wat bied je aan?',{required:true,textarea:true,placeholder:'Beschrijf je aanbod, voor wie het is en wat het oplevert. Minimaal 30 tekens.',hint:'We gebruiken je informatie als bron en verzinnen geen resultaten of keurmerken.'})}
        <h2 className="section-title">Waarom jij?</h2>
        {field('usp_1','Sterk punt 1',{required:true,placeholder:'Bijv. Eén vast aanspreekpunt'})}
        <div className="pair">{field('usp_2','Sterk punt 2',{placeholder:'Bijv. Offerte binnen 24 uur'})}{field('usp_3','Sterk punt 3',{placeholder:'Bijv. 12 jaar vakervaring'})}</div>
        <h2 className="section-title">Beeld en merk</h2>
        <div className="upload-grid"><div className="upload">{form.logo_url && <Image src={form.logo_url} alt="Logo preview" width={520} height={240} unoptimized/>}<strong>Logo</strong><small>Transparante PNG of WebP werkt het best.</small><input aria-label="Logo uploaden" type="file" accept="image/jpeg,image/png,image/webp" disabled={Boolean(uploading)} onChange={e => upload('logo_url',e.target.files?.[0])}/>{uploading==='logo_url'&&<p className="hint">Uploaden…</p>}</div><div className="upload">{form.hero_image_url && <Image src={form.hero_image_url} alt="Hoofdbeeld preview" width={520} height={240} unoptimized/>}<strong>Hoofdbeeld</strong><small>Liggende foto, maximaal 5 MB.</small><input aria-label="Hoofdbeeld uploaden" type="file" accept="image/jpeg,image/png,image/webp" disabled={Boolean(uploading)} onChange={e => upload('hero_image_url',e.target.files?.[0])}/>{uploading==='hero_image_url'&&<p className="hint">Uploaden…</p>}</div></div>
        <h2 className="section-title">Contact op je pagina</h2>
        <div className="pair">{field('contactemail','E-mailadres',{required:true,type:'email',placeholder:'contact@bedrijf.nl',hint:'Nieuwe aanvragen komen hier binnen.'})}{field('contacttelefoon','Telefoonnummer',{type:'tel',placeholder:'06 12 34 56 78'})}</div>
        {(pakket==='pro'||pakket==='premium')&&<><h2 className="section-title">Doelgroep en bereik</h2><div className="pair">{field('doelgroep','Doelgroep',{placeholder:'Bijv. MKB in Noord-Holland'})}{field('werkgebied','Werkgebied',{placeholder:'Bijv. Amsterdam en omgeving'})}</div><h2 className="section-title">Echte klantreacties</h2>{[1,2].map(n=><div className="subpanel" key={n}><div className="pair">{field(`testimonial_${n}_naam` as keyof FormState,`Naam klant ${n}`)}{field(`testimonial_${n}_tekst` as keyof FormState,`Reactie ${n}`,{textarea:true})}</div></div>)}<h2 className="section-title">Veelgestelde vragen</h2>{[1,2,3].map(n=><div className="subpanel" key={n}>{field(`faq_${n}_vraag` as keyof FormState,`Vraag ${n}`)}{field(`faq_${n}_antwoord` as keyof FormState,`Antwoord ${n}`,{textarea:true})}</div>)}<h2 className="section-title">Socials</h2>{field('social_instagram','Instagram URL',{type:'url',placeholder:'https://…'})}{field('social_linkedin','LinkedIn URL',{type:'url',placeholder:'https://…'})}{field('social_facebook','Facebook URL',{type:'url',placeholder:'https://…'})}</>}
        {pakket==='premium'&&<><h2 className="section-title">Premium briefing</h2>{field('sfeer','Gewenste sfeer',{placeholder:'Bijv. warm, premium en rustig'})}{field('extra_wensen','Extra wensen',{textarea:true,placeholder:'Vertel alles wat voor positionering, toon en inhoud belangrijk is.'})}</>}
        <button className="submit" type="submit" disabled={submitting||Boolean(uploading)}>{submitting?'Je pagina wordt veilig gestart…':'Maak mijn eerste versie'}</button>
      </form>
    </main></div></>
}
