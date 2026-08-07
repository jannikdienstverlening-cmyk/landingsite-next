import Image from 'next/image'
import Link from 'next/link'
import { pricingConfig } from '@/config/pricing'
import { portfolioProjects } from '@/data/portfolio'
import { BUSINESS } from '@/lib/business'
import { ContactForm, FAQAccordion, MobileMenu, PricingButton } from './home-actions'
import { Logo } from './logo'

type Package = {
  id: 'starter' | 'pro' | 'premium'
  name: string
  price: number
  fit: string
  highlighted?: boolean
  features: string[]
}

type FAQ = { q: string; a: string }

const heroProject = portfolioProjects[1]

export function Header() {
  return (
    <header className="site-header">
      <div className="header-inner">
        <Logo />
        <nav className="desktop-nav" aria-label="Hoofdnavigatie">
          <a href="#voorbeelden">Projecten</a>
          <a href="#werkwijze">Werkwijze</a>
          <a href="#prijzen">Pakketten</a>
          <a href="#websitebeheer">Beheer</a>
          <a href="#faq">Vragen</a>
        </nav>
        <a className="header-cta" href="#contact" data-analytics-event="start_website" data-analytics-location="header">
          Vertel wat je nodig hebt
        </a>
        <MobileMenu />
      </div>
    </header>
  )
}

export function Hero() {
  return (
    <section className="hero" id="top">
      <div className="shell hero-grid">
        <div className="hero-copy">
          <h1>Een landingspagina die meteen duidelijk maakt waarom klanten voor jou moeten kiezen.</h1>
          <p className="hero-lead">Ik ontwerp en bouw de eerste versie binnen 48 uur. Vanaf €{pricingConfig.buildPackages.starter.oneTimePrice}, met rechtstreeks contact en zonder eindeloos bureautraject.</p>
          <div className="hero-actions">
            <a className="primary-button" href="#contact" data-analytics-event="start_website" data-analytics-location="hero">Vertel wat je nodig hebt</a>
            <a className="secondary-button" href="#voorbeelden" data-analytics-event="view_examples" data-analytics-location="hero">Bekijk projecten</a>
          </div>
          <p className="hero-proofline">
            <span>Vanaf €{pricingConfig.buildPackages.starter.oneTimePrice}</span>
            <span>Eerste versie binnen 48 uur na complete intake</span>
            <span>{pricingConfig.websiteManagement.name} €{pricingConfig.websiteManagement.monthlyPrice} p/m</span>
          </p>
        </div>

        <figure className="hero-project">
          <a
            className="hero-project-image"
            href={heroProject.url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Bekijk de website van ${heroProject.name}`}
            data-analytics-event="project_click"
            data-analytics-project={heroProject.slug}
          >
            <Image src={heroProject.image} alt={heroProject.imageAlt} fill preload sizes="(max-width: 900px) 94vw, 570px" />
          </a>
          <figcaption><strong>{heroProject.name}</strong><span>{heroProject.type}</span></figcaption>
        </figure>
      </div>
    </section>
  )
}

export function BenefitsSection() {
  const benefits = [
    ['01', 'Een pagina met één duidelijk doel', 'Ik zet je aanbod en de gewenste vervolgstap in een logische volgorde.'],
    ['02', 'Ontwerp voor mobiel en desktop', 'De pagina wordt op verschillende schermformaten opgebouwd en gecontroleerd.'],
    ['03', 'Een werkend aanvraagformulier', 'Bezoekers kunnen zonder omweg contact opnemen of een aanvraag versturen.'],
    ['04', 'Basis voor vindbaarheid en delen', 'Paginatitel, beschrijving en deelafbeelding worden netjes ingericht.'],
    ['05', 'Begeleiding tot de livegang', 'Ik help met de domeinkoppeling en controleer de belangrijkste functies voor publicatie.'],
  ]

  return (
    <section className="section benefits" id="wat-je-krijgt">
      <div className="shell benefits-layout">
        <div className="benefits-intro">
          <h2>Wat er bij de bouw in zit.</h2>
          <p>Geen lange lijst met technische termen. Dit zijn de onderdelen die je nodig hebt om de pagina te kunnen gebruiken.</p>
        </div>
        <ol className="benefits-list">
          {benefits.map(([number, title, text]) => (
            <li key={number}>
              <span>{number}</span>
              <div><h3>{title}</h3><p>{text}</p></div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

export function ProcessSection() {
  const steps = [
    ['1', 'We bespreken wat de pagina moet doen', 'Je deelt je aanbod, doelgroep en beschikbare content.'],
    ['2', 'Ik ontwerp en bouw de eerste versie', 'Na een complete intake en betaling ontvang je de eerste versie binnen 48 uur.'],
    ['3', 'We scherpen aan en gaan live', 'Na de afgesproken correcties wordt je domein gekoppeld.'],
  ]

  return (
    <section className="section process" id="werkwijze">
      <div className="shell">
        <div className="process-heading">
          <h2>Zo komt je pagina tot stand.</h2>
          <p>Je weet vooraf wie wat doet en wanneer je de eerste versie kunt verwachten.</p>
        </div>
        <ol className="process-list">
          {steps.map(([number, title, text]) => (
            <li key={number}>
              <span>{number}</span>
              <div><h3>{title}</h3><p>{text}</p></div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

export function PricingSection({ packages }: { packages: Package[] }) {
  return (
    <section className="section pricing" id="prijzen">
      <div className="shell">
        <div className="pricing-head">
          <p className="section-kicker">Prijzen</p>
          <h2>Kies de omvang die bij je vraag past.</h2>
          <p>De bouwprijs betaal je één keer. {pricingConfig.websiteManagement.name} wordt pas na je akkoord en de livegang apart geactiveerd.</p>
        </div>
        <div className="price-grid">
          {packages.map((item) => (
            <article className={item.highlighted ? 'featured' : ''} key={item.id} aria-label={`${item.name}, €${item.price} exclusief btw`}>
              <div className="package-heading">
                {item.highlighted && <span className="popular">Meest gekozen</span>}
                <h3>{item.name}</h3>
                <p>{item.fit}</p>
              </div>
              <div className="package-price">
                <strong>€{item.price}</strong>
                <span>eenmalig, excl. btw</span>
              </div>
              <p className="package-management">{pricingConfig.websiteManagement.name}: €{pricingConfig.websiteManagement.monthlyPrice} p/m vanaf livegang</p>
              <ul>{item.features.map((feature) => <li key={feature}>{feature}</li>)}</ul>
              <div className="package-actions">
                <a className="primary-button" href="#contact" data-analytics-event="start_website" data-analytics-location={`package_${item.id}`}>Eerst bespreken</a>
                <details className="direct-order">
                  <summary data-analytics-event="direct_order_open" data-analytics-package={item.id}>Direct bestellen</summary>
                  <PricingButton pakket={item.id} label="Naar veilige betaling" />
                </details>
              </div>
            </article>
          ))}
        </div>
        <p className="pricing-help">Twijfel je over de omvang? Beschrijf je idee in de intake. Je zit nog nergens aan vast.</p>
      </div>
    </section>
  )
}

export function WebsiteManagementSection() {
  const management = pricingConfig.websiteManagement
  const included = [
    'Hosting en SSL',
    'Back-ups en software-updates',
    'Technische monitoring',
    'Controle van formulieren',
    'Ondersteuning bij problemen',
    `Maximaal ${management.includedChangeMinutes} minuten kleine wijzigingen per maand`,
  ]

  return (
    <section className="section website-management" id="websitebeheer">
      <div className="shell management-layout">
        <div className="management-copy">
          <p className="section-kicker">Websitebeheer</p>
          <h2>{management.name}</h2>
          <p className="management-price">€{management.monthlyPrice} per maand <span>excl. btw</span></p>
          <p>Dit is meer dan hosting. Ik houd je website technisch bij, controleer belangrijke functies en help met kleine aanpassingen.</p>
          <p className="management-start">Het beheer begint pas bij de livegang en na je aparte akkoord op het abonnement.</p>
          <a href="#contact" data-analytics-event="start_website" data-analytics-location="management">Bespreek je website <span aria-hidden="true">→</span></a>
        </div>
        <div className="management-included">
          {included.map((item) => <p key={item}>{item}</p>)}
          <small>Ongebruikte wijzigingstijd vervalt na de kalendermaand. Grotere aanpassingen worden vooraf apart geoffreerd. Opzeggen kan tegen het einde van de lopende betaalperiode.</small>
        </div>
      </div>
    </section>
  )
}

export function AboutJannikSection() {
  return (
    <section className="section about-jannik" id="over-jannik">
      <div className="shell about-jannik-layout">
        <div className="about-jannik-name" aria-label="Jannik, oprichter en webdesigner">
          <span>Jannik</span>
          <p>Oprichter, ontwerper en bouwer</p>
        </div>
        <div className="about-jannik-copy">
          <h2>Je hebt rechtstreeks contact met mij.</h2>
          <p>Ik ben Jannik. Je bespreekt je website met dezelfde persoon die hem ontwerpt en bouwt. Geen accountmanager, geen overdracht en geen weken wachten op een kleine beslissing.</p>
          <p>AI gebruik ik achter de schermen om sneller te werken. De strategie, teksten, ontwerpkeuzes en afwerking blijven mensenwerk.</p>
        </div>
      </div>
    </section>
  )
}

export function FAQSection({ faqs }: { faqs: FAQ[] }) {
  return (
    <section className="section faq" id="faq">
      <div className="shell faq-layout">
        <div className="faq-intro">
          <h2>Vragen voordat je begint.</h2>
          <p>Staat je vraag er niet tussen? Zet hem in het formulier. Ik reageer persoonlijk.</p>
        </div>
        <FAQAccordion items={faqs} />
      </div>
    </section>
  )
}

export function ContactSection() {
  return (
    <section className="section contact-section" id="contact">
      <div className="shell contact-layout">
        <div className="contact-copy">
          <h2>Vertel kort wat je wilt laten bouwen.</h2>
          <p>Je hoeft nog niet precies te weten welk pakket past. Beschrijf je idee, dan laat ik weten wat logisch is.</p>
        </div>
        <ContactForm />
      </div>
    </section>
  )
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="shell footer-top">
        <div className="footer-brand">
          <Logo variant="light" />
          <p>Landingspagina’s en kleine bedrijfswebsites voor zzp en mkb.</p>
        </div>
        <nav aria-label="Footer navigatie">
          <strong>Navigatie</strong>
          <a href="#voorbeelden">Projecten</a>
          <a href="#werkwijze">Werkwijze</a>
          <a href="#prijzen">Pakketten</a>
          <a href="#websitebeheer">Beheer</a>
        </nav>
        <div>
          <strong>Contact en voorwaarden</strong>
          <a href="#contact">Vertel wat je nodig hebt</a>
          <Link href="/privacybeleid">Privacybeleid</Link>
          <Link href="/algemene-voorwaarden">Algemene voorwaarden</Link>
          <div className="footer-socials" aria-label="Sociale media">
            <a href={BUSINESS.social.instagram} target="_blank" rel="noopener noreferrer" data-analytics-event="social_click" data-analytics-platform="instagram">Instagram</a>
            <a href={BUSINESS.social.linkedin} target="_blank" rel="noopener noreferrer" data-analytics-event="social_click" data-analytics-platform="linkedin">LinkedIn</a>
          </div>
        </div>
      </div>
      <div className="shell partner-reference">
        <Link href="/partner" data-analytics-event="partner_click">Bekijk het partnerprogramma</Link>
      </div>
      <div className="shell footer-bottom">
        <span>© {new Date().getFullYear()} {BUSINESS.brandName}</span>
        <span>Website ontwikkeld door <a href="https://landingsite.nl">Landingsite.nl</a></span>
      </div>
    </footer>
  )
}
