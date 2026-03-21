'use client'

import { useState } from 'react'
import Link from 'next/link'

const STYLES = `
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  html { scroll-behavior: smooth; }

  body {
    background: var(--paper);
    color: var(--ink);
    font-family: var(--font-dm-mono), monospace;
    line-height: 1.6;
  }

  .container {
    max-width: 1000px;
    margin: 0 auto;
    padding: 0 2rem;
  }

  /* NAV */
  .nav {
    position: sticky;
    top: 0;
    z-index: 100;
    background: rgba(245, 242, 235, 0.88);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border-bottom: 1px solid var(--rule);
  }

  .nav-inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 2rem;
    max-width: 1000px;
    margin: 0 auto;
  }

  .nav-logo {
    font-family: var(--font-syne), sans-serif;
    font-weight: 800;
    font-size: 1.2rem;
    text-decoration: none;
    color: var(--ink);
    letter-spacing: -0.02em;
  }

  .nav-links {
    display: flex;
    gap: 2rem;
    list-style: none;
    align-items: center;
  }

  .nav-links a {
    font-family: var(--font-dm-mono), monospace;
    font-size: 0.78rem;
    text-decoration: none;
    color: var(--muted);
    letter-spacing: 0.06em;
    text-transform: uppercase;
    transition: color 0.2s;
  }

  .nav-links a:hover { color: var(--ink); }
  .nav-links .btn-primary { color: #fff; }
  .nav-links .btn-primary:hover { color: #fff; }

  /* BUTTONS */
  .btn-primary {
    background: var(--accent);
    color: #fff;
    border: none;
    padding: 0.7rem 1.5rem;
    font-family: var(--font-dm-mono), monospace;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    cursor: pointer;
    text-decoration: none;
    display: inline-block;
    box-shadow: 4px 4px 0 var(--ink);
    transition: transform 0.15s, box-shadow 0.15s;
    font-weight: 600;
    line-height: 1.4;
  }

  .btn-primary:hover {
    transform: translate(-2px, -2px);
    box-shadow: 6px 6px 0 var(--ink);
  }

  .btn-outline {
    background: transparent;
    color: var(--accent);
    border: 2px solid var(--accent);
    padding: 0.65rem 1.4rem;
    font-family: var(--font-dm-mono), monospace;
    font-size: 0.75rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    cursor: pointer;
    text-decoration: none;
    display: inline-block;
    transition: transform 0.15s, box-shadow 0.15s;
    font-weight: 600;
    line-height: 1.4;
  }

  .btn-outline:hover {
    transform: translate(-2px, -2px);
    box-shadow: 4px 4px 0 var(--accent);
  }

  .btn-full {
    width: 100%;
    text-align: center;
  }

  .btn-loading {
    opacity: 0.65;
    cursor: not-allowed;
    pointer-events: none;
  }

  /* SECTION LABEL */
  .section-label {
    font-size: 0.7rem;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    color: var(--accent);
    margin-bottom: 0.5rem;
    font-family: var(--font-dm-mono), monospace;
    font-weight: 600;
  }

  .section-title {
    font-family: var(--font-syne), sans-serif;
    font-weight: 800;
    font-size: 2.5rem;
    letter-spacing: -0.03em;
    line-height: 1.1;
    color: var(--ink);
  }

  .section-subtitle {
    color: var(--muted);
    margin-top: 0.75rem;
    font-size: 0.92rem;
    max-width: 560px;
    line-height: 1.65;
  }

  /* HERO */
  .hero {
    padding: 5rem 0 3rem;
    text-align: center;
  }

  .hero-inner {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .hero-text {
    max-width: 700px;
  }

  .hero-h1 {
    font-family: var(--font-syne), sans-serif;
    font-weight: 800;
    font-size: clamp(2.8rem, 5.5vw, 4.5rem);
    letter-spacing: -0.04em;
    line-height: 1.05;
    color: var(--ink);
    margin-bottom: 1.25rem;
  }

  .hero-h1 em {
    font-family: var(--font-instrument), serif;
    font-style: italic;
    color: var(--accent);
    font-weight: 400;
  }

  .hero-sub {
    color: var(--muted);
    font-size: 0.88rem;
    line-height: 1.75;
    margin-bottom: 2rem;
  }

  .hero-ctas {
    display: flex;
    gap: 1rem;
    flex-wrap: wrap;
    margin-bottom: 1.5rem;
    align-items: center;
  }

  .hero-trust {
    font-size: 0.7rem;
    color: var(--muted);
    letter-spacing: 0.04em;
    font-family: var(--font-dm-mono), monospace;
  }

  .hero-image {
    width: 100%;
    max-width: 900px;
    margin-top: 3rem;
  }

  .hero-image img {
    width: 100%;
    border-radius: 8px;
    box-shadow: 0 12px 40px rgba(0,0,0,0.15);
    display: block;
  }

  /* PROBLEEM */
  .probleem {
    padding: 5rem 0;
    background: var(--surface);
    border-top: 1px solid var(--rule);
    border-bottom: 1px solid var(--rule);
  }

  .probleem-header {
    margin-bottom: 3rem;
  }

  .problem-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
    margin-bottom: 2.5rem;
  }

  .problem-card {
    background: var(--paper);
    border: 1px solid var(--rule);
    border-left: 3px solid var(--rule);
    padding: 1.5rem;
  }

  .problem-icon {
    font-size: 0.9rem;
    color: #c0392b;
    margin-bottom: 0.5rem;
    font-weight: 700;
  }

  .problem-title {
    font-family: var(--font-syne), sans-serif;
    font-weight: 700;
    font-size: 0.92rem;
    margin-bottom: 0.4rem;
  }

  .problem-desc {
    font-size: 0.8rem;
    color: var(--muted);
    line-height: 1.65;
  }

  .probleem-end {
    font-family: var(--font-syne), sans-serif;
    font-weight: 700;
    font-size: 1.05rem;
    color: var(--accent);
  }

  /* HOW IT WORKS */
  .how {
    padding: 5rem 0;
  }

  .how-header {
    margin-bottom: 3.5rem;
  }

  .steps {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 2rem;
  }

  .step-number {
    font-family: var(--font-syne), sans-serif;
    font-weight: 800;
    font-size: 4rem;
    color: var(--accent);
    opacity: 0.25;
    line-height: 1;
    margin-bottom: 0.5rem;
  }

  .step-title {
    font-family: var(--font-syne), sans-serif;
    font-weight: 700;
    font-size: 1rem;
    margin-bottom: 0.5rem;
  }

  .step-desc {
    font-size: 0.82rem;
    color: var(--muted);
    line-height: 1.65;
  }

  /* USPs */
  .usps {
    padding: 5rem 0;
    background: var(--surface);
    border-top: 1px solid var(--rule);
    border-bottom: 1px solid var(--rule);
  }

  .usps-header {
    margin-bottom: 3rem;
  }

  .usps-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 1.5rem;
  }

  .usp-card {
    background: var(--paper);
    border: 1px solid var(--rule);
    padding: 2rem;
  }

  .usp-emoji {
    font-size: 1.5rem;
    margin-bottom: 0.75rem;
    display: block;
  }

  .usp-title {
    font-family: var(--font-syne), sans-serif;
    font-weight: 700;
    font-size: 0.92rem;
    margin-bottom: 0.4rem;
  }

  .usp-desc {
    font-size: 0.8rem;
    color: var(--muted);
    line-height: 1.6;
  }

  /* VOOR WIE */
  .voorwie {
    padding: 5rem 0;
  }

  .voorwie-header {
    margin-bottom: 3rem;
  }

  .persona-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 1.25rem;
  }

  .persona-tile {
    background: var(--surface);
    border: 1px solid var(--rule);
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.35rem;
  }

  .persona-emoji {
    font-size: 1.3rem;
  }

  .persona-title {
    font-family: var(--font-syne), sans-serif;
    font-weight: 700;
    font-size: 0.92rem;
  }

  .persona-desc {
    font-size: 0.78rem;
    color: var(--muted);
    line-height: 1.5;
  }

  /* PRICING */
  .pricing {
    padding: 5rem 0;
    background: var(--surface);
    border-top: 1px solid var(--rule);
    border-bottom: 1px solid var(--rule);
  }

  .pricing-header {
    margin-bottom: 0.5rem;
  }

  .pricing-oneline {
    font-size: 0.8rem;
    color: var(--muted);
    margin-bottom: 3rem;
    font-family: var(--font-dm-mono), monospace;
  }

  .pricing-grid {
    display: grid;
    grid-template-columns: 1fr 1fr 1fr;
    gap: 1.5rem;
    align-items: start;
  }

  .pricing-card {
    background: var(--paper);
    border: 1px solid var(--rule);
    padding: 2rem;
  }

  .pricing-card.hot {
    background: var(--ink);
    color: #fff;
    border-color: var(--ink);
  }

  .pricing-badge {
    display: inline-block;
    background: var(--accent);
    color: #fff;
    font-size: 0.62rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    padding: 0.22rem 0.6rem;
    font-family: var(--font-dm-mono), monospace;
    font-weight: 700;
    margin-bottom: 1rem;
  }

  .pricing-name {
    font-family: var(--font-syne), sans-serif;
    font-weight: 800;
    font-size: 1.25rem;
    margin-bottom: 0.25rem;
  }

  .pricing-tagline {
    font-size: 0.76rem;
    color: var(--muted);
    margin-bottom: 1.25rem;
    font-family: var(--font-dm-mono), monospace;
  }

  .pricing-card.hot .pricing-tagline { color: #888; }

  .pricing-price {
    font-family: var(--font-syne), sans-serif;
    font-weight: 800;
    font-size: 2.5rem;
    letter-spacing: -0.03em;
    margin-bottom: 1.5rem;
    color: var(--accent);
  }

  .pricing-card.hot .pricing-price { color: var(--accent-light); }

  .pricing-features {
    list-style: none;
    margin-bottom: 2rem;
    display: flex;
    flex-direction: column;
    gap: 0.55rem;
  }

  .pricing-features li {
    font-size: 0.8rem;
    display: flex;
    gap: 0.5rem;
    align-items: flex-start;
    line-height: 1.45;
    color: var(--muted);
  }

  .pricing-card.hot .pricing-features li { color: #999; }

  .pricing-features li::before {
    content: '✓';
    color: var(--accent);
    font-weight: 700;
    flex-shrink: 0;
  }

  .pricing-card.hot .pricing-features li::before { color: var(--accent-light); }

  /* WAAROM */
  .waarom {
    padding: 5rem 0;
  }

  .waarom-header {
    margin-bottom: 3rem;
  }

  .comparison {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1.5rem;
  }

  .comparison-col {
    border: 1px solid var(--rule);
    overflow: hidden;
  }

  .comparison-col-header {
    padding: 1rem 1.5rem;
    font-family: var(--font-syne), sans-serif;
    font-weight: 700;
    font-size: 0.85rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    border-bottom: 1px solid var(--rule);
  }

  .comparison-col-header.bad {
    background: #eae7e0;
    color: var(--muted);
  }

  .comparison-col-header.good {
    background: var(--accent);
    color: #fff;
  }

  .comparison-list {
    list-style: none;
    padding: 1.25rem 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 0.65rem;
    background: var(--surface);
  }

  .comparison-col.good-col .comparison-list {
    background: var(--paper);
  }

  .comparison-list li {
    font-size: 0.82rem;
    display: flex;
    gap: 0.5rem;
    align-items: flex-start;
    line-height: 1.45;
    color: var(--muted);
  }

  .comparison-col.good-col .comparison-list li { color: var(--ink); }

  .comp-icon { flex-shrink: 0; }
  .comp-icon.good { color: var(--accent); }

  /* FAQ */
  .faq {
    padding: 5rem 0;
    background: var(--surface);
    border-top: 1px solid var(--rule);
    border-bottom: 1px solid var(--rule);
  }

  .faq-header {
    margin-bottom: 3rem;
  }

  .faq-list {
    display: flex;
    flex-direction: column;
  }

  .faq-item {
    border-bottom: 1px solid var(--rule);
  }

  .faq-question {
    width: 100%;
    background: none;
    border: none;
    text-align: left;
    padding: 1.25rem 0;
    cursor: pointer;
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 1rem;
    font-family: var(--font-syne), sans-serif;
    font-weight: 700;
    font-size: 0.92rem;
    color: var(--ink);
    transition: color 0.2s;
  }

  .faq-question:hover { color: var(--accent); }

  .faq-chevron {
    flex-shrink: 0;
    width: 20px;
    height: 20px;
    border: 1.5px solid var(--rule);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: transform 0.25s, border-color 0.2s, color 0.2s;
    font-size: 0.55rem;
    color: var(--muted);
    line-height: 1;
  }

  .faq-chevron.open {
    transform: rotate(180deg);
    border-color: var(--accent);
    color: var(--accent);
  }

  .faq-answer {
    overflow: hidden;
    max-height: 0;
    transition: max-height 0.3s ease;
  }

  .faq-answer.open { max-height: 320px; }

  .faq-answer-inner {
    padding-bottom: 1.25rem;
    font-size: 0.84rem;
    color: var(--muted);
    line-height: 1.75;
  }

  /* END CTA */
  .endcta {
    padding: 6rem 0;
    background: var(--ink);
    text-align: center;
  }

  .endcta-title {
    font-family: var(--font-syne), sans-serif;
    font-weight: 800;
    font-size: clamp(1.8rem, 4vw, 3rem);
    letter-spacing: -0.03em;
    margin-bottom: 1rem;
    color: #fff;
    line-height: 1.1;
  }

  .endcta-sub {
    color: var(--muted);
    font-size: 0.86rem;
    margin-bottom: 2.5rem;
    max-width: 520px;
    margin-left: auto;
    margin-right: auto;
    line-height: 1.7;
  }

  .endcta-trust {
    margin-top: 1.5rem;
    font-size: 0.7rem;
    color: #444;
    letter-spacing: 0.04em;
  }

  /* FOOTER */
  .footer {
    padding: 3rem 0 2rem;
    border-top: 1px solid var(--rule);
  }

  .footer-inner {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    gap: 2rem;
    flex-wrap: wrap;
    margin-bottom: 2rem;
  }

  .footer-logo {
    font-family: var(--font-syne), sans-serif;
    font-weight: 800;
    font-size: 1rem;
    color: var(--ink);
    text-decoration: none;
    display: block;
    margin-bottom: 0.4rem;
    letter-spacing: -0.02em;
  }

  .footer-tagline {
    font-size: 0.76rem;
    color: var(--muted);
    max-width: 260px;
    line-height: 1.6;
  }

  .footer-links {
    display: flex;
    gap: 1.5rem;
    list-style: none;
    align-items: center;
    flex-wrap: wrap;
  }

  .footer-links a {
    font-size: 0.76rem;
    color: var(--muted);
    text-decoration: none;
    transition: color 0.2s;
  }

  .footer-links a:hover { color: var(--ink); }

  .footer-copy {
    font-size: 0.7rem;
    color: var(--muted);
    padding-top: 1.25rem;
    border-top: 1px solid var(--rule);
    text-align: center;
  }

  /* RESPONSIVE */
  @media (max-width: 768px) {
    .nav-links { display: none; }

    .hero { padding: 3.5rem 0 2rem; }
    .hero-h1 { font-size: 2.4rem; }

    .problem-grid { grid-template-columns: 1fr; }
    .steps { grid-template-columns: 1fr; }
    .usps-grid { grid-template-columns: 1fr 1fr; }
    .persona-grid { grid-template-columns: 1fr 1fr; }
    .pricing-grid { grid-template-columns: 1fr; }
    .comparison { grid-template-columns: 1fr; }

    .section-title { font-size: 2rem; }

    .footer-inner { flex-direction: column; }
  }

  @media (max-width: 480px) {
    .usps-grid { grid-template-columns: 1fr; }
    .persona-grid { grid-template-columns: 1fr; }
    .hero-ctas { flex-direction: column; align-items: flex-start; }
  }
`

const faqs = [
  {
    q: 'Hoe snel is mijn pagina live?',
    a: 'Na betaling en het invullen van het intake formulier staat jouw pagina binnen 48 uur live. In de meeste gevallen gaat het zelfs sneller.',
  },
  {
    q: 'Kan ik de pagina achteraf aanpassen?',
    a: 'Ja. Afhankelijk van je pakket zijn correctierondes inbegrepen. Starter heeft geen correctieronde, Pro heeft er 1, Premium heeft er 3.',
  },
  {
    q: 'Wat heb ik nodig om te beginnen?',
    a: "Alleen je bedrijfsgegevens, een beschrijving van je dienst of product en bij voorkeur een e-mailadres voor het contactformulier. Foto's zijn optioneel.",
  },
  {
    q: 'Wordt de pagina ook gehost?',
    a: 'Ja. Jouw pagina wordt gehost op een snel en veilig platform. Wij leveren de pagina op jouw eigen domein. Je krijgt DNS-instructies zodat je hem zelf kunt koppelen.',
  },
  {
    q: 'Kan ik mijn eigen domein gebruiken?',
    a: 'Absoluut. Na oplevering ontvang je eenvoudige DNS-instructies zodat je pagina draait op jouw eigen domein zoals www.jouwbedrijf.nl.',
  },
  {
    q: 'Wat als ik niet tevreden ben?',
    a: 'We bieden een geld-terug garantie als de pagina niet voldoet aan de afgesproken specificaties. Kwaliteit staat voorop.',
  },
]

export default function Home() {
  const [loading, setLoading] = useState<string | null>(null)
  const [openFaq, setOpenFaq] = useState<number | null>(null)

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
      <style>{STYLES}</style>

      {/* ── NAV ── */}
      <nav className="nav">
        <div className="nav-inner">
          <a href="/" className="nav-logo">
            landing<span style={{ color: 'var(--accent)' }}>site</span>.nl
          </a>
          <ul className="nav-links">
            <li><a href="#how">Hoe het werkt</a></li>
            <li><a href="#pricing">Prijzen</a></li>
            <li><a href="#faq">FAQ</a></li>
            <li>
              <a href="#pricing" className="btn-primary">Bestel direct</a>
            </li>
          </ul>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="hero">
        <div className="container">
          <div className="hero-inner">
            <div className="hero-text">
              <p className="section-label">Voor zzp&apos;ers en kleine bedrijven</p>
              <h1 className="hero-h1">
                Jouw landingspagina.<br />Live in <em>48 uur.</em>
              </h1>
              <p className="hero-sub">
                Geen bureau. Geen weken wachten. Geen vage offertes. Een professionele, converterende pagina voor jouw campagne of product. Vaste prijs. Direct resultaat.
              </p>
              <div className="hero-ctas" style={{ justifyContent: 'center' }}>
                <a href="#pricing" className="btn-primary">Kies je pakket →</a>
                <a href="#how" className="btn-outline">Hoe werkt het?</a>
              </div>
              <p className="hero-trust">✓ Vaste prijs · ✓ Binnen 48 uur · ✓ Hosting inbegrepen · ✓ Geld-terug garantie</p>
            </div>
            <div className="hero-image">
              <img src="/image_1.png" alt="Voorbeeld landingspagina gemaakt door Landingsite.nl" />
            </div>
          </div>
        </div>
      </section>

      {/* ── PROBLEEM ── */}
      <section className="probleem">
        <div className="container">
          <div className="probleem-header">
            <p className="section-label">Herken je dit?</p>
            <h2 className="section-title">Herken je dit?</h2>
            <p className="section-subtitle">Als ondernemer wil je snel schakelen. Maar je loopt vast.</p>
          </div>
          <div className="problem-grid">
            {[
              {
                title: 'Geen landingspagina voor je campagne',
                desc: 'Je stuurt advertentieverkeer naar je homepage. Die is te druk, te afgeleid, te algemeen.',
              },
              {
                title: 'Bureau is te duur én te traag',
                desc: 'Drie offertes, zes weken wachten, en dan €3.000+ rekening. Voor één pagina.',
              },
              {
                title: 'Zelf bouwen kost te veel tijd',
                desc: 'Websitebuilders beloven veel, maar het resultaat ziet er nooit echt professioneel uit.',
              },
              {
                title: 'Geen focus op conversie',
                desc: 'Een mooie pagina die niet converteert is weggegooid geld.',
              },
            ].map((item, i) => (
              <div className="problem-card" key={i}>
                <p className="problem-icon">✗</p>
                <p className="problem-title">{item.title}</p>
                <p className="problem-desc">{item.desc}</p>
              </div>
            ))}
          </div>
          <p className="probleem-end">Wij lossen dit op. Snel, betaalbaar en professioneel.</p>
        </div>
      </section>

      {/* ── HOE HET WERKT ── */}
      <section className="how" id="how">
        <div className="container">
          <div className="how-header">
            <p className="section-label">Zo werkt het</p>
            <h2 className="section-title">Zo werkt het</h2>
            <p className="section-subtitle">Van niets naar een live landingspagina in 3 stappen.</p>
          </div>
          <div className="steps">
            {[
              {
                n: '01',
                title: 'Kies je pakket',
                desc: 'Kies Starter, Pro of Premium. Betaal direct online via iDEAL of creditcard. Geen gedoe.',
              },
              {
                n: '02',
                title: 'Vul het intake in',
                desc: 'Beantwoord een paar korte vragen over je bedrijf, dienst en doelgroep. Duurt 5 minuten.',
              },
              {
                n: '03',
                title: 'Jouw pagina is live',
                desc: 'Onze AI genereert direct jouw professionele landingspagina. Je krijgt de URL per mail inclusief DNS-instructies.',
              },
            ].map((step, i) => (
              <div key={i}>
                <div className="step-number">{step.n}</div>
                <p className="step-title">{step.title}</p>
                <p className="step-desc">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── USPs ── */}
      <section className="usps">
        <div className="container">
          <div className="usps-header">
            <p className="section-label">Waarom Landingsite</p>
            <h2 className="section-title">Alles wat je nodig hebt. Niets wat je niet nodig hebt.</h2>
          </div>
          <div className="usps-grid">
            {[
              { emoji: '⚡', title: 'Razendsnel', desc: 'Live binnen 48 uur na betaling. Geen wachttijden, geen planningsgesprekken.' },
              { emoji: '📱', title: 'Mobiel perfect', desc: 'Meer dan 70% van je bezoekers kijkt op telefoon. Jouw pagina werkt op elk scherm.' },
              { emoji: '💰', title: 'Vaste prijs', desc: 'Geen uurtarieven, geen verrassingen. Je weet vooraf precies wat je betaalt.' },
              { emoji: '🎯', title: 'Gericht op conversie', desc: 'Eén pagina, één doel. Dat converteert tot 3x beter dan een generieke website.' },
              { emoji: '🌐', title: 'Hosting inbegrepen', desc: 'Je pagina staat live op jouw eigen domein. Geen extra hostingkosten.' },
              { emoji: '✉️', title: 'Leads direct in je mail', desc: 'Het contactformulier stuurt aanvragen direct naar jouw inbox.' },
            ].map((usp, i) => (
              <div className="usp-card" key={i}>
                <span className="usp-emoji">{usp.emoji}</span>
                <p className="usp-title">{usp.title}</p>
                <p className="usp-desc">{usp.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── VOOR WIE ── */}
      <section className="voorwie">
        <div className="container">
          <div className="voorwie-header">
            <p className="section-label">Voor wie</p>
            <h2 className="section-title">Gemaakt voor ondernemers die direct willen schakelen</h2>
          </div>
          <div className="persona-grid">
            {[
              { emoji: '🏠', title: "Zzp'ers", desc: 'Die snel online willen met een nieuwe dienst of actie' },
              { emoji: '📣', title: 'Marketeers', desc: 'Die een dedicated landingspagina nodig hebben voor hun campagne' },
              { emoji: '💼', title: 'Coaches & trainers', desc: 'Die cliënten willen trekken met een professionele online aanwezigheid' },
              { emoji: '🛒', title: 'Webshops', desc: 'Die een aparte actiepagina willen voor een product of aanbieding' },
              { emoji: '🔨', title: 'Vakmannen', desc: 'Die lokaal gevonden willen worden met een converterende pagina' },
              { emoji: '🚀', title: 'Startups', desc: 'Die snel willen testen of een idee werkt zonder grote investering' },
            ].map((p, i) => (
              <div className="persona-tile" key={i}>
                <span className="persona-emoji">{p.emoji}</span>
                <p className="persona-title">{p.title}</p>
                <p className="persona-desc">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section className="pricing" id="pricing">
        <div className="container">
          <div className="pricing-header">
            <p className="section-label">Pakketten</p>
            <h2 className="section-title">Duidelijke pakketten. Vaste prijzen.</h2>
          </div>
          <p className="pricing-oneline">Eenmalig. Geen abonnement. Geen verborgen kosten.</p>
          <div className="pricing-grid">

            {/* Starter */}
            <div className="pricing-card">
              <p className="pricing-name">Starter</p>
              <p className="pricing-tagline">Snel een actiepagina online</p>
              <p className="pricing-price">€299</p>
              <ul className="pricing-features">
                <li>1 tot 3 secties</li>
                <li>Jij levert tekst &amp; beeld aan</li>
                <li>Mobiel geoptimaliseerd design</li>
                <li>Contactformulier inbegrepen</li>
                <li>Hosting op jouw domein</li>
              </ul>
              <button
                className={`btn-primary btn-full${loading === 'starter' ? ' btn-loading' : ''}`}
                onClick={() => bestel('starter')}
                disabled={loading === 'starter'}
              >
                {loading === 'starter' ? 'Laden…' : 'Kies Starter'}
              </button>
            </div>

            {/* Pro */}
            <div className="pricing-card hot">
              <p className="pricing-badge">Meest gekozen</p>
              <p className="pricing-name">Pro</p>
              <p className="pricing-tagline">Voor leads, verkoop en conversie</p>
              <p className="pricing-price">€499</p>
              <ul className="pricing-features">
                <li>Tot 6 uitgebreide secties</li>
                <li>Inclusief FAQ &amp; Reviews sectie</li>
                <li>Koppeling met social media</li>
                <li>Werkgebied &amp; doelgroep focus</li>
                <li>1 correctieronde inbegrepen</li>
              </ul>
              <button
                className={`btn-primary btn-full${loading === 'pro' ? ' btn-loading' : ''}`}
                onClick={() => bestel('pro')}
                disabled={loading === 'pro'}
              >
                {loading === 'pro' ? 'Laden…' : 'Kies Pro'}
              </button>
            </div>

            {/* Premium */}
            <div className="pricing-card">
              <p className="pricing-name">Premium</p>
              <p className="pricing-tagline">Volledig ontzorgd</p>
              <p className="pricing-price">€899</p>
              <ul className="pricing-features">
                <li>Onbeperkt secties</li>
                <li>AI schrijft alle teksten voor je</li>
                <li>Aangepast design &amp; sfeer</li>
                <li>Alle tools &amp; pixels koppelen</li>
                <li>3 correctierondes inbegrepen</li>
              </ul>
              <button
                className={`btn-primary btn-full${loading === 'premium' ? ' btn-loading' : ''}`}
                onClick={() => bestel('premium')}
                disabled={loading === 'premium'}
              >
                {loading === 'premium' ? 'Laden…' : 'Kies Premium'}
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* ── WAAROM ── */}
      <section className="waarom">
        <div className="container">
          <div className="waarom-header">
            <p className="section-label">Waarom</p>
            <h2 className="section-title">Waarom een landingspagina en geen complete website?</h2>
          </div>
          <div className="comparison">
            <div className="comparison-col">
              <div className="comparison-col-header bad">Complete website</div>
              <ul className="comparison-list">
                <li><span className="comp-icon">✗</span> Weken aan ontwikkeling</li>
                <li><span className="comp-icon">✗</span> Duizenden euro&apos;s</li>
                <li><span className="comp-icon">✗</span> Vele pagina&apos;s</li>
                <li><span className="comp-icon">✗</span> Veel afleiding</li>
                <li><span className="comp-icon">✗</span> Generiek en breed</li>
              </ul>
            </div>
            <div className="comparison-col good-col">
              <div className="comparison-col-header good">Landingspagina</div>
              <ul className="comparison-list">
                <li><span className="comp-icon good">✓</span> 48 uur</li>
                <li><span className="comp-icon good">✓</span> Vaste prijs vanaf €299</li>
                <li><span className="comp-icon good">✓</span> 1 pagina, 1 doel</li>
                <li><span className="comp-icon good">✓</span> Maximale focus</li>
                <li><span className="comp-icon good">✓</span> Tot 3x hogere conversie</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="faq" id="faq">
        <div className="container">
          <div className="faq-header">
            <p className="section-label">FAQ</p>
            <h2 className="section-title">Veelgestelde vragen</h2>
          </div>
          <div className="faq-list">
            {faqs.map((item, i) => (
              <div className="faq-item" key={i}>
                <button
                  className="faq-question"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  aria-expanded={openFaq === i}
                >
                  <span>{item.q}</span>
                  <span className={`faq-chevron${openFaq === i ? ' open' : ''}`}>▾</span>
                </button>
                <div className={`faq-answer${openFaq === i ? ' open' : ''}`} aria-hidden={openFaq !== i}>
                  <p className="faq-answer-inner">{item.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── END CTA ── */}
      <section className="endcta">
        <div className="container">
          <h2 className="endcta-title">Klaar om meer te halen uit jouw campagne?</h2>
          <p className="endcta-sub">
            Jouw concurrenten adverteren al. Zorg dat jij de klik niet verspilt aan een pagina die niet converteert.
          </p>
          <a href="#pricing" className="btn-primary">Start nu — kies je pakket</a>
          <p className="endcta-trust">✓ Betaal via iDEAL · ✓ Binnen 48 uur live · ✓ Geld-terug garantie</p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="footer">
        <div className="container">
          <div className="footer-inner">
            <div>
              <a href="/" className="footer-logo">
                landing<span style={{ color: 'var(--accent)' }}>site</span>.nl
              </a>
              <p className="footer-tagline">
                Snelle &amp; betaalbare landingspagina&apos;s voor Nederlandse ondernemers.
              </p>
            </div>
            <ul className="footer-links">
              <li><Link href="/algemene-voorwaarden">Algemene Voorwaarden</Link></li>
              <li><Link href="/privacybeleid">Privacybeleid</Link></li>
            </ul>
          </div>
          <p className="footer-copy">© 2026 Landingsite.nl</p>
        </div>
      </footer>
    </>
  )
}
