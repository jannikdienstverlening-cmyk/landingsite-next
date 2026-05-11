import Link from 'next/link'
import { FAQAccordion, PricingButton } from '@/components/home-actions'
import { ConversionFlowVisual } from '@/components/visuals/ConversionFlowVisual'
import { FinalCtaVisual } from '@/components/visuals/FinalCtaVisual'
import { LandingSiteHeroPreview } from '@/components/visuals/LandingSiteHeroPreview'
import { LaunchTimelineVisual } from '@/components/visuals/LaunchTimelineVisual'
import { PortfolioPreviewCard } from '@/components/visuals/PortfolioPreviewCard'
import { PricingLaunchVisual } from '@/components/visuals/PricingLaunchVisual'

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
        <a href="#portfolio">Portfolio</a>
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
            {['Vaste prijs', 'Binnen 48 uur', 'Hosting €15 p/m', 'Geld-terug garantie'].map((item) => (
              <span key={item}>{item}</span>
            ))}
          </div>
        </div>
        <LandingSiteHeroPreview />
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
              <span className="issue-number">{`${String(index + 1).padStart(2, '0')} `}</span>
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
  return (
    <section className="launch-section process-section" id="proces">
      <div className="launch-container">
        <div className="process-layout">
          <div className="section-heading-row">
            <p className="launch-kicker">Van intake naar live</p>
            <h2>Een 48-uurs launch-proces zonder ruis.</h2>
            <p>
              Geen wekenlange afstemming. Je ziet per fase wat er gebeurt, wanneer input nodig is
              en wanneer je pagina klaar is om verkeer te ontvangen.
            </p>
          </div>
          <LaunchTimelineVisual />
        </div>
      </div>
    </section>
  )
}

export function ShowcaseSection() {
  const categories = ['Leadpagina', 'Actiepagina', 'Dienstpagina', 'Productpagina']

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
            {categories.map((category, index) => (
              <span className={index === 0 ? 'is-active' : undefined} key={category}>
                {category}
              </span>
            ))}
          </div>
        </div>
        <ConversionFlowVisual />
      </div>
    </section>
  )
}

export function BenefitsGrid() {
  const benefits = [
    ['Mobiel perfect', 'Gebouwd voor bezoekers die vanaf advertenties op hun telefoon binnenkomen.'],
    ['Gericht op conversie', 'Elke sectie heeft een duidelijke taak richting aanvraag of contact.'],
    ['Hosting €15 per maand', 'Je pagina wordt live gezet en gekoppeld aan je eigen domein voor een vaste maandprijs.'],
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

export function PortfolioSection() {
  const cases = [
    {
      name: 'WIA Management',
      domain: 'wiamanagement.nl',
      url: 'https://www.wiamanagement.nl/',
      label: 'B2B leadgeneratie',
      description:
        'Een zakelijke landingspagina voor werkgevers die snel een passende WIA-specialist zoeken.',
      imageSrc: '/images/portfolio/wiamanagement-screenshot.webp',
      imageAlt: 'Screenshot van de homepage van WIA Management',
      tags: ['Leadpagina', 'B2B', 'Aanvraagflow', 'Rekentool'],
      tone: 'green' as const,
    },
    {
      name: 'Ontwikkelbegeleiding.nl',
      domain: 'ontwikkelbegeleiding.nl',
      url: 'https://www.ontwikkelbegeleiding.nl/',
      label: 'Coaching & begeleiding',
      description:
        'Een heldere pagina voor persoonlijke ontwikkeling, begeleiding en aanvragen.',
      imageSrc: '/images/portfolio/ontwikkelbegeleiding-screenshot.webp',
      imageAlt: 'Screenshot van de homepage van Ontwikkelbegeleiding.nl',
      tags: ['Leadpagina', 'Coaching', 'Intake', 'Persoonlijk'],
      tone: 'blue' as const,
    },
  ]

  return (
    <section className="launch-section portfolio-section" id="portfolio">
      <div className="launch-container">
        <div className="portfolio-heading">
          <p className="launch-kicker">Portfolio</p>
          <h2>Voorbeelden van pagina&apos;s die al live zijn.</h2>
          <p>
            Van B2B leadgeneratie tot coaching en begeleiding: elke pagina krijgt een duidelijk doel.
          </p>
        </div>
        <div className="portfolio-grid">
          {cases.map((item) => (
            <PortfolioPreviewCard key={item.name} {...item} />
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
        <div className="pricing-intro-wrap">
          <div className="section-heading-row pricing-intro">
            <p className="launch-kicker">Pakketten</p>
            <h2>Vaste prijzen voor een snelle launch.</h2>
            <p>
              Kies de route die past bij je campagne. De bouwprijs is vast, hosting loopt helder
              door voor €15 per maand.
            </p>
          </div>
          <PricingLaunchVisual />
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
  const traditional = ['Weken wachten', 'Vage offerte', 'Complete website', 'Hoge kosten']
  const landingsite = ['48 uur live', 'Vaste prijs', 'Eén doel', 'Vanaf €299']

  return (
    <section className="launch-section comparison-section-new" id="vergelijking">
      <div className="launch-container comparison-section-inner">
        <div className="comparison-heading">
          <p className="launch-kicker">Vergelijking</p>
          <h2>
            Een campagne<wbr />
            pagina vraagt om een ander proces.
          </h2>
          <p>Geen weken wachten op een complete website. Eén pagina, één doel, snel live.</p>
        </div>

        <div className="comparison-cards">
          <div className="comparison-col old-way">
            <h3>Traditioneel bureau</h3>
            {traditional.map((item) => (
              <p key={item}>{item}</p>
            ))}
          </div>
          <div className="comparison-col new-way">
            <h3>Landingsite.nl</h3>
            {landingsite.map((item) => (
              <p key={item}>{item}</p>
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
      <div className="launch-container final-cta-grid">
        <div>
          <p className="launch-kicker">Klaar om live te gaan?</p>
          <h2>Verspil geen klikken aan een pagina die niet converteert.</h2>
          <p>Start vandaag. Binnen 48 uur staat je landingspagina live.</p>
          <a href="#prijzen" className="launch-button launch-button-primary">
            Start je landingspagina
          </a>
        </div>
        <FinalCtaVisual />
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
        <div className="footer-links">
          <Link href="/algemene-voorwaarden">Algemene voorwaarden</Link>
          <Link href="/privacybeleid">Privacybeleid</Link>
        </div>
        <p className="footer-credit">
          Website ontwikkeld door{' '}
          <a href="https://landingsite.nl" target="_blank" rel="noreferrer">
            Landingsite.nl
          </a>
        </p>
      </div>
    </footer>
  )
}
