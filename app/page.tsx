'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

const styles = `
  nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; padding: 1.25rem 2rem; display: flex; justify-content: space-between; align-items: center; background: rgba(245,242,235,0.95); backdrop-filter: blur(8px); border-bottom: 1px solid var(--rule); }
  .nav-logo { font-family: var(--font-syne), sans-serif; font-weight: 800; font-size: 1.2rem; letter-spacing: -0.02em; color: var(--ink); text-decoration: none; }
  .nav-logo span { color: var(--accent); }
  .nav-cta { background: var(--ink); color: var(--paper); font-family: var(--font-dm-mono), monospace; font-size: 0.75rem; letter-spacing: 0.06em; text-transform: uppercase; padding: 0.6rem 1.4rem; text-decoration: none; border: none; cursor: pointer; transition: background 0.2s, transform 0.1s; }
  .nav-cta:hover { background: var(--accent); transform: translateY(-1px); }
  #hero { padding: 9rem 0 5rem; text-align: center; }
  .hero-label { font-family: var(--font-dm-mono), monospace; font-size: 0.75rem; letter-spacing: 0.1em; text-transform: uppercase; color: var(--accent); margin-bottom: 1rem; font-weight: 500; }
  h1 { font-family: var(--font-syne), sans-serif; font-weight: 800; font-size: clamp(2.5rem, 6vw, 4.5rem); line-height: 1.05; letter-spacing: -0.03em; max-width: 15ch; margin: 0 auto 1.5rem; }
  h1 em { font-style: italic; font-family: var(--font-instrument), serif; font-weight: 400; color: var(--accent); }
  .hero-sub { font-family: var(--font-dm-mono), monospace; font-size: 1.05rem; max-width: 48ch; margin: 0 auto 2.5rem; color: var(--muted); }
  .cta-primary { display: inline-flex; align-items: center; gap: 0.75rem; background: var(--accent); color: #fff; font-family: var(--font-dm-mono), monospace; font-size: 0.8rem; letter-spacing: 0.06em; text-transform: uppercase; padding: 1.1rem 2.2rem; text-decoration: none; transition: background 0.2s, transform 0.1s; box-shadow: 4px 4px 0 var(--ink); border: none; cursor: pointer; }
  .cta-primary:hover { background: var(--accent-light); transform: translate(-2px,-2px); box-shadow: 6px 6px 0 var(--ink); }
  .hero-image { max-width: 100%; height: auto; margin: 3rem auto; display: block; box-shadow: 0 10px 30px rgba(0,0,0,0.15); border-radius: 12px; }
  section { padding: 5rem 0; border-top: 1px solid var(--rule); }
  .features { display: grid; grid-template-columns: repeat(3, 1fr); gap: 2rem; margin-top: 2rem; }
  @media(max-width: 768px) { .features { grid-template-columns: 1fr; } }
  .feat-box { padding: 2rem; background: var(--surface); border: 1px solid var(--rule); }
  .feat-box h3 { font-family: var(--font-syne), sans-serif; font-size: 1.2rem; margin-bottom: 0.5rem; }
  .feat-box p { font-family: var(--font-dm-mono), monospace; font-size: 0.85rem; color: var(--muted); }
  .sec-title { font-family: var(--font-syne), sans-serif; font-size: 2.5rem; text-align: center; margin-bottom: 1rem; }
  .sec-sub { font-family: var(--font-dm-mono), monospace; text-align: center; color: var(--muted); margin-bottom: 3rem; }
  .price-grid { display: grid; grid-template-columns: repeat(3, 1fr); border: 1px solid var(--rule); margin-top: 1rem; }
  @media(max-width: 900px){ .price-grid { grid-template-columns: 1fr; } }
  .pkg { padding: 2.5rem; border-right: 1px solid var(--rule); display: flex; flex-direction: column; }
  .pkg:last-child { border-right: none; }
  .pkg.hot { background: var(--ink); color: var(--paper); border-color: var(--ink); }
  .pkg-badge { font-size: 0.6rem; letter-spacing: 0.12em; text-transform: uppercase; background: var(--accent); color: #fff; padding: .25rem .6rem; display: inline-block; margin-bottom: 1.25rem; align-self: flex-start; }
  .pkg-name { font-family: var(--font-syne), sans-serif; font-weight: 800; font-size: 1.2rem; margin-bottom: .4rem; }
  .pkg-sub { font-family: var(--font-dm-mono), monospace; font-size: 0.77rem; color: var(--muted); margin-bottom: .5rem; }
  .pkg.hot .pkg-sub { color: #888; }
  .pkg-price { font-family: var(--font-syne), sans-serif; font-weight: 800; font-size: 3rem; letter-spacing: -0.05em; line-height: 1; color: var(--accent); margin: 1rem 0 .25rem; }
  .pkg.hot .pkg-price { color: var(--accent-light); }
  .pkg-freq { font-family: var(--font-dm-mono), monospace; font-size: 0.68rem; color: var(--muted); margin-bottom: 1.5rem; }
  .pkg.hot .pkg-freq { color: #666; }
  .pkg-list { list-style: none; margin-bottom: 2rem; flex-grow: 1; }
  .pkg-list li { font-family: var(--font-dm-mono), monospace; font-size: 0.77rem; padding: .5rem 0; border-bottom: 1px solid var(--rule); display: flex; gap: .6rem; align-items: flex-start; color: var(--muted); }
  .pkg.hot .pkg-list li { border-color: #2a2a2a; color: #aaa; }
  .pkg-list li::before { content: '✓'; color: var(--accent); flex-shrink: 0; font-weight: bold; }
  .pkg.hot .pkg-list li::before { color: var(--accent-light); }
  .pkg-btn { display: block; width: 100%; text-align: center; padding: 1rem; font-family: var(--font-dm-mono), monospace; font-size: 0.75rem; letter-spacing: 0.08em; text-transform: uppercase; text-decoration: none; border: 1px solid var(--ink); color: var(--ink); background: transparent; cursor: pointer; transition: background 0.2s, color 0.2s; }
  .pkg-btn:hover { background: var(--ink); color: var(--paper); }
  .pkg-btn:disabled { opacity: 0.6; cursor: not-allowed; }
  .pkg.hot .pkg-btn { background: var(--accent); border-color: var(--accent); color: #fff; }
  .pkg.hot .pkg-btn:hover { background: var(--accent-light); border-color: var(--accent-light); }
  #seo-content { background: var(--surface); padding: 4rem 0; }
  .seo-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 3rem; }
  @media(max-width: 768px) { .seo-grid { grid-template-columns: 1fr; } }
  .seo-grid h2 { font-family: var(--font-syne), sans-serif; font-size: 1.5rem; margin-bottom: 1rem; letter-spacing: -0.02em; }
  .seo-grid p { font-family: var(--font-dm-mono), monospace; font-size: 0.9rem; color: var(--muted); margin-bottom: 1rem; line-height: 1.7; }
  footer { text-align: center; padding: 2.5rem 2rem; border-top: 1px solid var(--rule); font-family: var(--font-dm-mono), monospace; font-size: 0.75rem; color: var(--muted); }
  .f-links { display: flex; gap: 1.5rem; justify-content: center; margin-top: 0.8rem; }
  .f-links a { color: var(--muted); text-decoration: none; transition: color 0.2s; }
  .f-links a:hover { color: var(--accent); }
`

export default function Home() {
  const [loading, setLoading] = useState<string | null>(null)

  async function bestel(pakket: string) {
    setLoading(pakket)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pakket }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } finally {
      setLoading(null)
    }
  }

  return (
    <>
      <style>{styles}</style>

      <nav>
        <a href="#" className="nav-logo">landing<span>site</span>.nl</a>
        <a href="#pricing" className="nav-cta">Bestel direct</a>
      </nav>

      <section id="hero">
        <div className="container">
          <p className="hero-label">Geen gedoe. Wel resultaat.</p>
          <h1>Een strakke <em>landingspagina</em>. Snel online.</h1>
          <p className="hero-sub">
            Je hebt een idee, campagne of product, maar geen tijd of budget voor een duur webdesign bureau.
            Wij bouwen een professionele, converterende pagina voor je via AI. Vanaf €299,–.
          </p>
          <Image
            src="/image_1.png"
            alt="Showcase van Landingsite.nl landingspagina's op smartphone en desktop"
            width={900}
            height={500}
            className="hero-image"
          />
          <a href="#pricing" className="cta-primary">Bekijk de prijzen</a>
        </div>
      </section>

      <section id="features">
        <div className="container">
          <div className="features">
            <div className="feat-box">
              <h3>⚡ Direct Online</h3>
              <p>Na betaling vul je een intake formulier in. Jouw pagina staat automatisch binnen minuten live — geen wachttijden.</p>
            </div>
            <div className="feat-box">
              <h3>📱 Mobiel Perfect</h3>
              <p>Meer dan 70% van je bezoekers kijkt op een telefoon. Jouw pagina wordt ontworpen om perfect te werken op elk scherm.</p>
            </div>
            <div className="feat-box">
              <h3>🤖 Gemaakt door Claude AI</h3>
              <p>Jouw pagina wordt gegenereerd door Claude, de krachtigste AI van Anthropic. Professionele copy en design in één keer goed.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing">
        <div className="container">
          <h2 className="sec-title">Kies het pakket dat bij je past</h2>
          <p className="sec-sub">Heldere, eenmalige prijzen. Direct online na betaling.</p>

          <div className="price-grid">
            <div className="pkg">
              <div className="pkg-name">Starter</div>
              <p className="pkg-sub">Snel een actiepagina online.</p>
              <div className="pkg-price">€299</div>
              <div className="pkg-freq">Eenmalige investering</div>
              <ul className="pkg-list">
                <li>1 tot 3 secties</li>
                <li>Jij levert tekst & beeld aan</li>
                <li>Mobiel geoptimaliseerd design</li>
                <li>Geïntegreerd contactformulier</li>
                <li>Hosting op jouw domein</li>
              </ul>
              <button onClick={() => bestel('starter')} disabled={!!loading} className="pkg-btn">
                {loading === 'starter' ? 'Laden...' : 'Kies Starter'}
              </button>
            </div>

            <div className="pkg hot">
              <div className="pkg-badge">Meest gekozen</div>
              <div className="pkg-name">Pro</div>
              <p className="pkg-sub">Voor leads, verkoop en conversie.</p>
              <div className="pkg-price">€499</div>
              <div className="pkg-freq">Eenmalige investering</div>
              <ul className="pkg-list">
                <li>Tot 6 uitgebreide secties</li>
                <li>Inclusief FAQ & Reviews sectie</li>
                <li>Koppeling met social media</li>
                <li>Werkgebied & doelgroep focus</li>
                <li>1 correctieronde inbegrepen</li>
              </ul>
              <button onClick={() => bestel('pro')} disabled={!!loading} className="pkg-btn">
                {loading === 'pro' ? 'Laden...' : 'Kies Pro'}
              </button>
            </div>

            <div className="pkg">
              <div className="pkg-name">Premium</div>
              <p className="pkg-sub">Volledig ontzorgd met maatwerk.</p>
              <div className="pkg-price">€899</div>
              <div className="pkg-freq">Eenmalige investering</div>
              <ul className="pkg-list">
                <li>Onbeperkt aantal secties</li>
                <li>Claude schrijft alle teksten</li>
                <li>Aangepast design & sfeer</li>
                <li>Alle tools en pixels koppelen</li>
                <li>3 correctierondes inbegrepen</li>
              </ul>
              <button onClick={() => bestel('premium')} disabled={!!loading} className="pkg-btn">
                {loading === 'premium' ? 'Laden...' : 'Kies Premium'}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section id="seo-content" style={{ background: 'var(--surface)', borderTop: '1px solid var(--rule)' }}>
        <div className="container" style={{ padding: '4rem 2rem' }}>
          <div className="seo-grid">
            <div>
              <h2>Waarom een goedkope landingspagina laten maken?</h2>
              <p>Als ondernemer wil je snel schakelen. Heb je een nieuwe Google Ads campagne, een Facebook actie of een nieuw product? Door een <strong>goedkope landingspagina te laten maken</strong> bij Landingsite.nl, heb je binnen minuten een effectieve bestemmingspagina online staan.</p>
            </div>
            <div>
              <h2>Automatisch gegenereerd door AI</h2>
              <p>Wij werken anders dan traditionele bureaus. Na jouw betaling vul je een intake formulier in. Claude AI genereert vervolgens automatisch jouw volledige landingspagina — inclusief pakkende teksten, professioneel design en een contactformulier.</p>
            </div>
          </div>
        </div>
      </section>

      <footer>
        <p>© 2026 Landingsite.nl — Snelle & betaalbare landingspagina&apos;s via AI.</p>
        <div className="f-links">
          <Link href="/voorwaarden">Algemene Voorwaarden</Link>
          <Link href="/privacy">Privacybeleid</Link>
        </div>
      </footer>
    </>
  )
}
