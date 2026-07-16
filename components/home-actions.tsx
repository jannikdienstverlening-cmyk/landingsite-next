'use client'

import type { FormEvent } from 'react'
import { useState } from 'react'

export function MobileMenu() {
  const [open, setOpen] = useState(false)
  return <><button className="menu-toggle" type="button" aria-expanded={open} aria-controls="mobile-nav" onClick={() => setOpen(value => !value)}><span className="sr-only">Menu {open ? 'sluiten' : 'openen'}</span><span/><span/></button><nav id="mobile-nav" className={`mobile-nav${open ? ' is-open' : ''}`} aria-label="Mobiele navigatie">{[['Aanpak','#aanpak'],['Werk','#portfolio'],['Pakketten','#prijzen'],['FAQ','#faq'],['Contact','#contact']].map(([label,href])=><a href={href} onClick={()=>setOpen(false)} key={href}>{label}</a>)}</nav></>
}

export function PricingButton({ pakket, label }: { pakket: 'starter'|'pro'|'premium'; label: string }) {
  const [loading,setLoading]=useState(false);const[error,setError]=useState('')
  async function order(){setLoading(true);setError('');try{const response=await fetch('/api/stripe/checkout',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({pakket})});const data=await response.json();if(!response.ok||!data.url)throw new Error(data.error||'Checkout openen lukt nu niet.');window.location.assign(data.url)}catch(caught){setError(caught instanceof Error?caught.message:'Checkout openen lukt nu niet.');setLoading(false)}}
  return <div><button className="price-button" onClick={order} disabled={loading} type="button">{loading?'Veilige checkout openen…':label}<span aria-hidden="true">↗</span></button>{error&&<p className="checkout-error" role="alert">{error}</p>}</div>
}

export function FAQAccordion({items}:{items:Array<{q:string;a:string}>}){
  return <div className="faq-list">{items.map((item,index)=><details key={item.q} open={index===0}><summary><span>{item.q}</span><span aria-hidden="true">+</span></summary><p>{item.a}</p></details>)}</div>
}

export function ContactForm(){
  const[form,setForm]=useState({naam:'',email:'',bedrijf:'',bericht:'',website:''});const[status,setStatus]=useState<'idle'|'sending'|'ok'|'error'>('idle');const[error,setError]=useState('')
  async function submit(event:FormEvent<HTMLFormElement>){event.preventDefault();setStatus('sending');setError('');try{const response=await fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(form)});const data=await response.json();if(!response.ok)throw new Error(data.error||'Verzenden mislukt.');setForm({naam:'',email:'',bedrijf:'',bericht:'',website:''});setStatus('ok')}catch(caught){setError(caught instanceof Error?caught.message:'Verzenden mislukt.');setStatus('error')}}
  function update(key:keyof typeof form,value:string){setForm(current=>({...current,[key]:value}))}
  return <form className="contact-form" onSubmit={submit}><div className="form-pair"><label><span>Naam</span><input required minLength={2} autoComplete="name" value={form.naam} onChange={e=>update('naam',e.target.value)}/></label><label><span>Bedrijf <small>optioneel</small></span><input autoComplete="organization" value={form.bedrijf} onChange={e=>update('bedrijf',e.target.value)}/></label></div><label><span>E-mailadres</span><input required type="email" autoComplete="email" value={form.email} onChange={e=>update('email',e.target.value)}/></label><label><span>Waar wil je mee live?</span><textarea required minLength={10} value={form.bericht} onChange={e=>update('bericht',e.target.value)} placeholder="Vertel kort wat je aanbiedt, voor wie en wanneer je wilt starten."/></label><label className="honeypot" aria-hidden="true">Website<input tabIndex={-1} autoComplete="off" value={form.website} onChange={e=>update('website',e.target.value)}/></label><button className="contact-submit" disabled={status==='sending'} type="submit">{status==='sending'?'Bericht versturen…':'Bespreek mijn landingspagina'}<span aria-hidden="true">→</span></button><p className="form-note">Je hoort binnen één werkdag van ons. Geen verkooppraatje, wel een eerlijk advies.</p>{status==='ok'&&<p className="form-status success" role="status">Gelukt. Je bericht is veilig verzonden.</p>}{status==='error'&&<p className="form-status error" role="alert">{error}</p>}</form>
}
