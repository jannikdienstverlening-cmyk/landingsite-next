import Link from 'next/link'
import { FAQAccordion, PricingButton } from '@/components/home-actions'
import { LaunchCommandVisual } from '@/components/launch-command-visual'

type Package = {
  id: 'starter' | 'pro' | 'premium'
  name: string
  price: string
  tagline: string
  label: string
  highlighted?: boolean
  tier?: string
  features: string[]
}

type FAQ = {
  q: string
  a: string
}

export function Header() {
  return (
    <header className="launch-header">
      <Link href="/" className="launch-logo" aria-label="Landingsite.nl home">
        landing<span>site</span>.nl
      </Link>
      <nav className="launch-nav" aria-label="Hoofdnavigatie">
        <a href="#probleem">Probleem</a>
        <a href="#proces">Proces</a>
        <a href="#showcase">Flow</a>
        <a href="#prijzen">Prijzen</a>
        <a href="#faq">FAQ</a>
      </nav>
      <a href="#prijzen" className="launch-header-cta">
        Start je landingspagina
      </a>
    </header>
  )
}

export function Hero() {
  return (
    <section className="launch-hero" id="top">
      <div className="launch-hero-grid">
        <div className="launch-hero-copy">
          <p className="launch-eyebrow">Voor ondernemers die nú willen schakelen</p>
          <h1 aria-label="Jouw landingspagina. Live in 48 uur.">
            <span>Jouw </span>
            <span className="hero-title-long">landingspagina. </span>
            <span>Live in 48 uur.</span>
          </h1>
          <p>
            Geen bureau. Geen weken wachten. Geen vage offertes. Eén converterende pagina
            voor je campagne, dienst of product.
          </p>
          <div className="launch-actions">
            <a href="#prijzen" className="launch-button launch-button-primary">
              Start vanaf €299
            </a>
            <a href="#prijzen" className="launch-button launch-button-secondary">
              Bekijk pakketten
            </a>
          </div>
          <div className="launch-trust" aria-label="Belangrijkste voordelen">
            {['Vaste prijs', 'Binnen 48 uur', 'Hosting inbegrepen', 'Geld-terug garantie'].map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>
        <LaunchCommandVisual />
      </div>
    </section>
  )
}

export function ProblemSection() {
  const problems = [
    'Advertentieverkeer naar je homepage',
    'Te veel afleiding',
    'Bureauproces duurt te lang',
  ]

  return (
    <section className="launch-section problem-section" id="probleem">
      <div className="launch-container problem-grid">
        <div>
          <p className="launch-kicker">Het lek</p>
          <h2>Je verliest klikken aan een zwakke pagina.</h2>
          <p>
            Een campagne is duur genoeg. Elke klik die landt op een algemene, trage of rommelige
            pagina maakt je advertentiebudget kleiner.
          </p>
        </div>
        <div className="problem-stack">
          {problems.map((problem, index) => (
            <article className="problem-card" key={problem}>
              <span>0{index + 1}</span>
              <strong>{problem}</strong>
            </article>
          ))}
          <article className="focus-card">
            <span>Focus terug</span>
            <strong>Landingsite.nl brengt focus terug: één pagina, één doel, snel live.</strong>
          </article>
        </div>
      </div>
    </section>
  )
}

export function ProcessTimeline() {
  const steps = [
    {
      number: '01',
      title: 'Kies pakket',
      body: 'Selecteer Starter, Pro of Premium en betaal direct veilig online.',
      badge: 'Checkout',
    },
    {
      number: '02',
      title: 'Vul intake in',
      body: 'Geef aanbod, doelgroep, bewijs en contactgegevens door in een korte launch-brief.',
      badge: 'Input',
    },
    {
      number: '03',
      title: 'Pagina live',
      body: 'Je krijgt een live preview, formulier, hosting en instructies voor je domein.',
      badge: 'Launch',
    },
  ]

  return (
    <section className="launch-section process-section" id="proces">
      <div className="launch-container">
        <div className="section-heading-row">
          <p className="launch-kicker">Van intake naar live</p>
          <h2>Een 48-uurs launch-proces zonder ruis.</h2>
        </div>
        <div className="timeline">
          {steps.map((step) => (
            <article className="timeline-step" key={step.number}>
              <div className="timeline-index">{step.number}</div>
              <div>
                <span>{step.badge}</span>
                <h3>{step.title}</h3>
                <p>{step.body}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export function ShowcaseSection() {
  const tabs = ['Leadpagina', 'Actiepagina', 'Dienstpagina', 'Productpagina']

  return (
    <section className="launch-section showcase-section" id="showcase">
      <div className="launch-container showcase-layout">
        <div className="showcase-copy">
          <p className="launch-kicker">Wat je krijgt</p>
          <h2>Geen kale pagina. Een complete conversieflow.</h2>
          <p>
            De pagina krijgt de onderdelen die een campagne nodig heeft: een scherpe hero,
            USP’s, bewijs, CTA’s, formulier en FAQ. Niet als losse blokken, maar als flow.
          </p>
          <div className="showcase-tabs" aria-label="Voorbeelden van pagina-types">
            {tabs.map((tab) => (
              <span key={tab}>{tab}</span>
            ))}
          </div>
        </div>

        <div className="flow-mockup" aria-label="Voorbeeld van een complete conversieflow">
          <div className="flow-panel flow-hero">
            <span>Hero</span>
            <strong>Heldere belofte + CTA</strong>
          </div>
          <div className="flow-panel flow-usps">
            <span>USP’s</span>
            <i />
            <i />
            <i />
          </div>
          <div className="flow-panel flow-form">
            <span>Contactformulier</span>
            <i />
            <i />
          </div>
          <div className="flow-panel flow-reviews">
            <span>Reviews</span>
            <strong>★★★★★</strong>
          </div>
          <div className="flow-panel flow-faq">
            <span>FAQ</span>
            <i />
            <i />
          </div>
          <div className="flow-panel flow-cta">
            <span>CTA</span>
            <strong>Start aanvraag</strong>
          </div>
        </div>
      </div>
    </section>
  )
}

export function BenefitsGrid() {
  const benefits = [
    ['Mobiel perfect', 'Gebouwd voor bezoekers die vanaf advertenties op hun telefoon binnenkomen.'],
    ['Gericht op conversie', 'Elke sectie heeft een duidelijke taak richting aanvraag of contact.'],
    ['Hosting inbegrepen', 'Je pagina wordt live gezet en gekoppeld aan je eigen domein.'],
    ['Vaste prijs', 'Geen uurtje-factuurtje. Je weet vooraf waar je aan toe bent.'],
    ['Leads in je mail', 'Aanvragen komen direct binnen op het door jou gekozen e-mailadres.'],
  ]

  return (
    <section className="launch-section benefits-section">
      <div className="launch-container">
        <div className="section-heading-row">
          <p className="launch-kicker">Waarom Landingsite</p>
          <h2>Gemaakt voor snelheid, focus en vertrouwen.</h2>
        </div>
        <div className="benefits-grid">
          <article className="benefit-card benefit-large">
            <span>Dominant voordeel</span>
            <h3>Live binnen 48 uur</h3>
            <p>
              Snel genoeg voor campagnes die nú moeten draaien, strak genoeg om professioneel te voelen.
            </p>
          </article>
          {benefits.map(([title, body]) => (
            <article className="benefit-card" key={title}>
              <h3>{title}</h3>
              <p>{body}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export function PricingSection({ packages }: { packages: Package[] }) {
  return (
    <section className="launch-section pricing-section-new" id="prijzen">
      <div className="launch-container">
        <div className="section-heading-row pricing-intro">
          <p className="launch-kicker">Pakketten</p>
          <h2>Vaste prijzen voor een snelle launch.</h2>
        </div>
        <div className="pricing-new-grid">
          {packages.map((pakket) => (
            <article
              className={`pricing-new-card${pakket.highlighted ? ' is-featured' : ''}`}
              key={pakket.id}
            >
              <div>
                <span className="pricing-tier">{pakket.tier}</span>
                {pakket.highlighted && <span className="pricing-label">Meest gekozen</span>}
                <h3>{pakket.name}</h3>
                <p>{pakket.tagline}</p>
                <strong>{pakket.price}</strong>
              </div>
              <ul>
                {pakket.features.map((feature) => (
                  <li key={feature}>{feature}</li>
                ))}
              </ul>
              <PricingButton pakket={pakket.id} label={pakket.label} />
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export function ComparisonSection() {
  const rows = [
    ['Weken wachten', '48 uur live'],
    ['Vage offerte', 'Vaste prijs'],
    ['Complete website', 'Eén doel'],
    ['Hoge kosten', 'Vanaf €299'],
  ]

  return (
    <section className="launch-section comparison-section-new">
      <div className="launch-container comparison-new-grid">
        <div>
          <p className="launch-kicker">Vergelijking</p>
          <h2>Een campagnepagina vraagt om een ander proces.</h2>
        </div>
        <div className="comparison-blocks">
          <div className="comparison-col old-way">
            <h3>Traditioneel bureau</h3>
            {rows.map(([old]) => (
              <p key={old}>{old}</p>
            ))}
          </div>
          <div className="comparison-col new-way">
            <h3>Landingsite.nl</h3>
            {rows.map(([, current]) => (
              <p key={current}>{current}</p>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export function FAQSection({ faqs }: { faqs: FAQ[] }) {
  return (
    <section className="launch-section faq-section-new" id="faq">
      <div className="launch-container faq-new-grid">
        <div>
          <p className="launch-kicker">FAQ</p>
          <h2>Vragen voordat je lanceert.</h2>
        </div>
        <FAQAccordion items={faqs} />
      </div>
    </section>
  )
}

export function FinalCTA() {
  return (
    <section className="final-cta">
      <div className="launch-container">
        <p className="launch-kicker">Klaar om live te gaan?</p>
        <h2>Verspil geen klikken aan een pagina die niet converteert.</h2>
        <p>Start vandaag. Binnen 48 uur staat je landingspagina live.</p>
        <a href="#prijzen" className="launch-button launch-button-primary">
          Start je landingspagina
        </a>
      </div>
    </section>
  )
}

export function Footer() {
  return (
    <footer className="launch-footer">
      <div className="launch-container footer-grid">
        <Link href="/" className="launch-logo">
          landing<span>site</span>.nl
        </Link>
        <div>
          <Link href="/algemene-voorwaarden">Algemene voorwaarden</Link>
          <Link href="/privacybeleid">Privacybeleid</Link>
        </div>
      </div>
    </footer>
  )
}
