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

const heroProject = portfolioProjects[0]

export function Header() {
  return (
    <header className="site-header">
      <div className="header-inner">
        <Logo />
        <nav className="desktop-nav" aria-label="Hoofdnavigatie">
          <a href="#voorbeelden">Voorbeelden</a>
          <a href="#werkwijze">Werkwijze</a>
          <a href="#prijzen">Pakketten</a>
          <a href="#websitebeheer">Beheer</a>
          <a href="#faq">Veelgestelde vragen</a>
        </nav>
        <a className="header-cta" href="#contact" data-analytics-event="start_website" data-analytics-location="header">
          Start mijn website
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
          <p className="eyebrow">Webdesign voor zzp en mkb</p>
          <h1>Jouw professionele landingspagina. Eerste versie binnen 48 uur.</h1>
          <p className="hero-lead">Voor ondernemers die snel een dienst, campagne of nieuw idee professioneel willen lanceren.</p>
          <ul className="hero-proof" aria-label="Prijs en persoonlijke service">
            <li>Landingspagina vanaf €{pricingConfig.buildPackages.starter.oneTimePrice} eenmalig</li>
            <li>{pricingConfig.websiteManagement.name} €{pricingConfig.websiteManagement.monthlyPrice} per maand</li>
            <li>Direct contact met degene die jouw website bouwt</li>
          </ul>
          <div className="hero-actions">
            <a className="primary-button" href="#contact" data-analytics-event="start_website" data-analytics-location="hero">Start mijn website</a>
            <a className="secondary-button" href="#voorbeelden" data-analytics-event="view_examples" data-analytics-location="hero">Bekijk voorbeelden</a>
          </div>
        </div>
        <HeroProjectPreview />
      </div>
    </section>
  )
}

function HeroProjectPreview() {
  return (
    <figure className="hero-project" aria-label={`Voorbeeld van ${heroProject.name}`}>
      <div className="hero-project-browser">
        <div className="browser-toolbar" aria-hidden="true">
          <span><i /><i /><i /></span>
          <strong>{heroProject.domain}</strong>
        </div>
        <a
          className="hero-project-image"
          href={heroProject.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Bekijk de website van ${heroProject.name}`}
          data-analytics-event="project_click"
          data-analytics-project={heroProject.slug}
        >
          <Image src={heroProject.image} alt={heroProject.imageAlt} fill preload sizes="(max-width: 900px) 94vw, 540px" />
        </a>
      </div>
      <div className="hero-project-mobile" aria-hidden="true">
        <Image src={heroProject.image} alt="" fill sizes="150px" />
      </div>
      <figcaption>
        <span>Recent opgeleverd</span>
        <strong>{heroProject.name}</strong>
      </figcaption>
    </figure>
  )
}

export function TrustBar() {
  const items = [
    'Eerste versie binnen 48 uur',
    'Transparante vaste prijzen',
    'Mobielvriendelijk gebouwd',
    'Direct persoonlijk contact',
  ]

  return (
    <aside className="trust-bar" aria-label="Waarom kiezen voor Landingsite.nl">
      <div className="shell">
        {items.map((item) => <span key={item}><i aria-hidden="true">✓</i>{item}</span>)}
      </div>
    </aside>
  )
}

export function BenefitsSection() {
  const benefits = [
    ['01', 'Ontwerp dat bij je bedrijf past', 'Geen generieke invulpagina, maar een visuele stijl die aansluit op je aanbod en doelgroep.'],
    ['02', 'Goed op ieder scherm', 'De pagina wordt gecontroleerd voor mobiel, tablet en desktop.'],
    ['03', 'Gericht op contact of verkoop', 'Een duidelijke volgorde zonder onnodige afleiding voor je bezoeker.'],
    ['04', 'Een werkend aanvraagformulier', 'Bezoekers kunnen direct contact opnemen of een aanvraag versturen.'],
    ['05', 'Een solide SEO-basis', 'Duidelijke paginatitel, beschrijving, headingstructuur en technische indexeerbaarheid.'],
    ['06', 'Begeleiding bij livegang', 'We helpen met de domeinkoppeling en controleren de belangrijkste functies voor publicatie.'],
  ]

  return (
    <section className="section benefits" id="wat-je-krijgt">
      <div className="shell">
        <div className="section-head compact">
          <p className="section-kicker">Wat je krijgt</p>
          <h2>Alles wat nodig is om professioneel te lanceren.</h2>
          <p>Concreet gebouwd rond één doel: zorgen dat de juiste bezoeker begrijpt wat je aanbiedt en de volgende stap zet.</p>
        </div>
        <div className="benefits-grid">
          {benefits.map(([number, title, text]) => (
            <article key={number}>
              <span>{number}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export function ProcessSection() {
  const steps = [
    ['01', 'Vertel wat je nodig hebt', 'Vul de korte intake in of stel eerst je vraag. We bepalen samen het doel en passende pakket.'],
    ['02', 'Wij bouwen de eerste versie', 'We werken de structuur, inhoud en uitstraling uit op basis van je aanbod en doelgroep.'],
    ['03', 'Feedback en livegang', 'Na de inbegrepen correctieronde(s) koppelen we je domein en zetten we de website live.'],
  ]

  return (
    <section className="section process" id="werkwijze">
      <div className="shell process-layout">
        <div className="process-intro">
          <p className="section-kicker">Werkwijze</p>
          <h2>Van intake naar live in drie overzichtelijke stappen.</h2>
          <a className="text-link" href="#contact" data-analytics-event="start_website" data-analytics-location="process">Start mijn website <span aria-hidden="true">→</span></a>
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
        <div className="section-head pricing-head">
          <p className="section-kicker">Pakketten</p>
          <h2>Een duidelijke omvang en een vaste bouwprijs.</h2>
          <p>Alle bouwprijzen zijn eenmalig en exclusief btw. Websitebeheer wordt pas na je akkoord en de livegang afzonderlijk geactiveerd.</p>
        </div>
        <div className="price-grid">
          {packages.map((item) => (
            <article className={item.highlighted ? 'featured' : ''} key={item.id}>
              {item.highlighted && <span className="popular">Meest gekozen</span>}
              <div className="package-heading">
                <h3>{item.name}</h3>
                <p>{item.fit}</p>
              </div>
              <div className="package-price">
                <strong>€{item.price}</strong>
                <span>eenmalig · excl. btw</span>
              </div>
              <div className="package-management">
                <strong>+ €{pricingConfig.websiteManagement.monthlyPrice} per maand</strong>
                <span>{pricingConfig.websiteManagement.name} vanaf livegang</span>
              </div>
              <ul>{item.features.map((feature) => <li key={feature}><span aria-hidden="true">✓</span>{feature}</li>)}</ul>
              <div className="package-actions">
                <a className="primary-button" href="#contact" data-analytics-event="start_website" data-analytics-location={`package_${item.id}`}>Start mijn website</a>
                <details className="direct-order">
                  <summary data-analytics-event="direct_order_open" data-analytics-package={item.id}>Direct bestellen</summary>
                  <PricingButton pakket={item.id} label="Naar veilige betaling" />
                </details>
              </div>
            </article>
          ))}
        </div>
        <div className="pricing-help">
          <p><strong>Twijfel je welk pakket past?</strong> Start de intake. Je zit nog nergens aan vast.</p>
          <a href="#contact" data-analytics-event="consultation_click" data-analytics-location="pricing">Eerst kort overleggen <span aria-hidden="true">→</span></a>
        </div>
      </div>
    </section>
  )
}

export function WebsiteManagementSection() {
  const management = pricingConfig.websiteManagement
  const included = [
    'Professionele hosting en SSL',
    'Automatische back-ups',
    'Beveiligings- en software-updates',
    'Technische monitoring',
    'Ondersteuning bij storingen',
    `${management.includedChangeMinutes} minuten kleine wijzigingen per maand`,
  ]

  return (
    <section className="section website-management" id="websitebeheer">
      <div className="shell management-layout">
        <div className="management-copy">
          <p className="section-kicker">Na de livegang</p>
          <h2>{management.name}</h2>
          <p className="management-lead">Geen losse technische zorgen nadat jouw website live staat. Dit is meer dan alleen hosting: wij houden je website veilig, werkend en actueel.</p>
          <ul>{included.map((item) => <li key={item}><span aria-hidden="true">✓</span>{item}</li>)}</ul>
          <a className="text-link" href="#contact" data-analytics-event="start_website" data-analytics-location="management">Start mijn website <span aria-hidden="true">→</span></a>
        </div>
        <aside className="management-card" aria-label={`${management.name}, €${management.monthlyPrice} per maand`}>
          <span>Websitebeheer Compleet</span>
          <strong>€{management.monthlyPrice}</strong>
          <p>per maand · excl. btw<br />vanaf livegang</p>
          <div className="management-limit">
            <strong>{management.includedChangeMinutes} minuten inbegrepen</strong>
            <p>Voor kleine aanpassingen binnen de bestaande website, zoals tekst, een foto, openingstijden of een knop.</p>
          </div>
          <dl>
            <div><dt>Ongebruikte minuten</dt><dd>Vervallen na de kalendermaand</dd></div>
            <div><dt>Grotere aanpassingen</dt><dd>Altijd vooraf apart geoffreerd</dd></div>
            <div><dt>Opzeggen</dt><dd>Tegen het einde van de lopende betaalperiode</dd></div>
          </dl>
        </aside>
      </div>
    </section>
  )
}

export function AboutJannikSection() {
  return (
    <section className="section about-jannik" id="over-jannik">
      <div className="shell about-jannik-layout">
        <div className="about-jannik-visual">
          {/* TODO: vervang deze illustratie door een professionele portretfoto zodra die beschikbaar is. */}
          <Image
            className="about-jannik-portrait"
            src="/images/jannik-cartoon.webp"
            alt="Illustratie van Jannik, oprichter en webdesigner van Landingsite.nl"
            width={960}
            height={1442}
            sizes="(max-width: 700px) 140px, 210px"
          />
        </div>
        <div className="about-jannik-copy">
          <p className="section-kicker">Persoonlijk contact</p>
          <h2>Rechtstreeks contact met degene die jouw website bouwt.</h2>
          <p>Ik ben Jannik, oprichter van Landingsite.nl. Ik combineer webdesign, conversie en slimme AI-tools om professionele websites sneller en betaalbaarder te bouwen.</p>
          <p>Geen accountmanager of lange overdrachten. Je hebt rechtstreeks contact met mij, van intake tot livegang.</p>
        </div>
      </div>
    </section>
  )
}

export function SocialProofSection() {
  return (
    <section className="social-proof" aria-labelledby="social-proof-title">
      <div className="shell social-proof-inner">
        <div>
          <p className="section-kicker">Ervaringen</p>
          <h2 id="social-proof-title">Echte klantreacties volgen binnenkort.</h2>
        </div>
        {/* TODO: voeg uitsluitend geverifieerde klantreviews toe, met expliciete toestemming voor naam en bedrijfsvermelding. */}
        <p>Hier komen binnenkort ervaringen van klanten. Tot die tijd laten de live projecten hierboven precies zien wat er daadwerkelijk is gebouwd.</p>
      </div>
    </section>
  )
}

export function FAQSection({ faqs }: { faqs: FAQ[] }) {
  return (
    <section className="section faq" id="faq">
      <div className="shell faq-layout">
        <div className="faq-intro">
          <p className="section-kicker">Veelgestelde vragen</p>
          <h2>Duidelijkheid voordat je begint.</h2>
          <p>Staat je vraag er niet tussen? Gebruik het formulier; je zit nog nergens aan vast.</p>
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
          <p className="section-kicker">Start je aanvraag</p>
          <h2>Vertel kort wat je wilt laten bouwen.</h2>
          <p>Vul de intake in. Je ontvangt daarna een duidelijk voorstel of advies over het passende pakket.</p>
          <ul>
            <li><span aria-hidden="true">✓</span>Persoonlijk antwoord</li>
            <li><span aria-hidden="true">✓</span>Duidelijke vervolgstap</li>
            <li><span aria-hidden="true">✓</span>Je zit nog nergens aan vast</li>
          </ul>
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
          <p>Professionele landingspagina’s en kleine bedrijfswebsites voor zzp en mkb.</p>
        </div>
        <nav aria-label="Footer navigatie">
          <strong>Navigatie</strong>
          <a href="#voorbeelden">Voorbeelden</a>
          <a href="#werkwijze">Werkwijze</a>
          <a href="#prijzen">Pakketten</a>
          <a href="#websitebeheer">Beheer</a>
          <a href="#faq">Veelgestelde vragen</a>
        </nav>
        <div>
          <strong>Contact en voorwaarden</strong>
          <a href="#contact">Start mijn website</a>
          <Link href="/privacybeleid">Privacybeleid</Link>
          <Link href="/algemene-voorwaarden">Algemene voorwaarden</Link>
        </div>
      </div>
      <div className="shell partner-reference">
        <span>Tevreden klanten kunnen deelnemen aan ons partnerprogramma.</span>
        <Link href="/partner" data-analytics-event="partner_click">Bekijk het partnerprogramma</Link>
      </div>
      <div className="shell footer-bottom">
        <span>© {new Date().getFullYear()} {BUSINESS.brandName}</span>
        <span>Website ontwikkeld door <a href="https://landingsite.nl">Landingsite.nl</a></span>
      </div>
    </footer>
  )
}
