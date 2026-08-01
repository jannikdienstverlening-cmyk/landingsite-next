import Image from 'next/image'
import Link from 'next/link'
import { partnerProgramConfig } from '@/config/partner-program'
import { portfolioProjects } from '@/data/portfolio'
import { BUSINESS } from '@/lib/business'
import { ContactForm, FAQAccordion, MobileMenu, PricingButton } from './home-actions'

type Package = {
  id: 'starter' | 'pro' | 'premium'
  name: string
  price: string
  fit: string
  tagline: string
  highlighted?: boolean
  features: string[]
}

type FAQ = { q: string; a: string }

const heroProject = portfolioProjects[0]
const mobilePreviewProject = portfolioProjects[1]

export function Header() {
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link href="#top" className="logo" aria-label="Landingsite.nl home">
          landing<span>site</span><i>.nl</i>
        </Link>
        <nav className="desktop-nav" aria-label="Hoofdnavigatie">
          <a href="#voorbeelden">Voorbeelden</a>
          <a href="#werkwijze">Werkwijze</a>
          <a href="#prijzen">Prijzen</a>
          <a href="#faq">FAQ</a>
        </nav>
        <a className="header-cta" href="#prijzen">
          Kies je abonnement
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
          <p className="eyebrow"><span />Websiteabonnement voor zzp en mkb</p>
          <h1>Klaar met dure websites? Binnen 48 uur jouw eerste versie.</h1>
          <p className="hero-lead">
            Een professionele website vanaf €79 per maand, inclusief hosting, SSL, onderhoud, backups en support. Eén vast bedrag, zonder losse bouwprijs.
          </p>
          <div className="hero-actions">
            <a className="primary-button" href="#prijzen">Bekijk abonnementen</a>
            <a className="secondary-button" href="#voorbeelden">Bekijk recent werk</a>
          </div>
          <p className="hero-microcopy">Maandelijks opzegbaar · Geen losse bouwprijs · Eerste versie na betaling en complete intake</p>
        </div>
        <HeroProjectPreview />
      </div>
    </section>
  )
}

function HeroProjectPreview() {
  return (
    <div className="hero-preview-frame" aria-label="Actuele websitepreview van een door Landingsite gebouwd project">
      <div className="browser-bar browser-bar-static"><span>{heroProject.domain}</span></div>
      <div className="hero-preview-image">
        <Image src={heroProject.image} alt={heroProject.imageAlt} fill priority sizes="(max-width: 900px) 92vw, 560px" />
      </div>
      <div className="hero-preview-caption">
        <strong>{heroProject.name}</strong>
        <span>{heroProject.type}</span>
      </div>
      <div className="hero-mobile-preview" aria-hidden="true">
        <Image src={mobilePreviewProject.image} alt="" fill sizes="128px" />
      </div>
    </div>
  )
}

export function PortfolioSection() {
  return (
    <section className="section portfolio" id="voorbeelden">
      <div className="shell">
        <div className="section-head portfolio-head">
          <p className="section-kicker">Recent werk</p>
          <h2>Geen standaardtemplate, maar een website die past bij het doel.</h2>
          <p>Bekijk echte websites die al live zijn. Geen mockups, geen verzonnen resultaten.</p>
        </div>
        <div className="case-grid">
          {portfolioProjects.map((item) => (
            <article className="case-card" key={item.slug}>
              <a className="case-image" href={item.url} target="_blank" rel="noopener noreferrer" aria-label={`Bekijk ${item.name} live`}>
                <div className="browser-bar" aria-hidden="true"><span>{item.domain}</span></div>
                <Image src={item.image} alt={item.imageAlt} fill sizes="(max-width: 900px) 100vw, 560px" />
              </a>
              <div className="case-info">
                <span className="case-label">{item.type}</span>
                <h3>{item.name}</h3>
                <p>{item.description}</p>
                <div className="case-tags">{item.features.map((feature) => <span key={feature}>{feature}</span>)}</div>
                <a className="case-link" href={item.url} target="_blank" rel="noopener noreferrer">Bekijk live website</a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export function EssentialsSection() {
  const included = [
    'Hosting en SSL-beveiliging',
    'Onderhoud en technische updates',
    'Dagelijkse platformbackups',
    'Mobiel geoptimaliseerd ontwerp',
    'Werkend en beveiligd leadformulier',
    'Support en AI-ondersteunde optimalisatie',
  ]
  const steps = [
    ['01', 'Kies je pakket', 'Selecteer het abonnement dat bij je bedrijf past.'],
    ['02', 'Vul de intake in', 'Deel je aanbod, doelgroep en beschikbare beelden.'],
    ['03', 'Wij bouwen', 'We zetten structuur, ontwerp en techniek voor je klaar.'],
    ['04', 'Eerste versie', 'Binnen 48 uur na betaling en complete intake.'],
    ['05', 'Live en onderhouden', 'Na akkoord beheren we hosting en techniek.'],
  ]

  return (
    <section className="section essentials" id="werkwijze">
      <div className="shell">
        <div className="essentials-heading">
          <p className="section-kicker">Wat je krijgt</p>
          <h2>De website én het technische beheer in één abonnement.</h2>
          <p>Geen losse leveranciers of onderhoudsrekening. Wij zorgen dat de basis blijft werken en veilig wordt bijgehouden.</p>
        </div>
        <ul className="checklist service-grid">
          {included.map((item) => <li key={item}><span aria-hidden="true">✓</span>{item}</li>)}
        </ul>
        <div className="process-panel">
          <div className="process-heading"><p className="section-kicker">Zo werkt het</p><h2>Van keuze naar een website die wordt onderhouden.</h2></div>
          <ol className="steps-list">
            {steps.map(([number, title, text]) => (
              <li key={title}>
                <span>{number}</span>
                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  )
}

export function PricingSection({ packages }: { packages: Package[] }) {
  return (
    <section className="section pricing" id="prijzen">
      <div className="shell">
        <div className="pricing-head">
          <p className="section-kicker">Pakketten</p>
          <h2>Eén vast maandbedrag. Geen losse bouwprijs.</h2>
          <p>Alle abonnementen zijn voor onbepaalde tijd, worden maandelijks vooraf geïncasseerd en zijn per maand opzegbaar. Bedragen zijn exclusief btw.</p>
        </div>
        <div className="price-grid">
          {packages.map((item) => (
            <article className={item.highlighted ? 'featured' : ''} key={item.id}>
              {item.highlighted && <span className="popular">Meest gekozen</span>}
              <h3>{item.name}</h3>
              <small>{item.fit}</small>
              <p>{item.tagline}</p>
              <strong>{item.price}<i>p/m excl. btw</i></strong>
              <ul>{item.features.map((feature) => <li key={feature}><span aria-hidden="true">✓</span>{feature}</li>)}</ul>
              <div className="price-action"><PricingButton pakket={item.id} label="Kies dit pakket" /></div>
            </article>
          ))}
        </div>
        <p className="hosting-note">De eerste abonnementsbetaling start de opdracht. De termijn van 48 uur begint zodra ook de intake compleet is. Opzeggen kan per e-mail tegen het einde van de lopende betaalperiode.</p>
      </div>
    </section>
  )
}

export function PartnerProgramSection() {
  if (!partnerProgramConfig.programEnabled) return null

  return (
    <section className="section partner" id="partner">
      <div className="shell partner-card">
        <div>
          <p className="section-kicker">Partnerprogramma</p>
          <h2>Tevreden? Breng een ondernemer aan.</h2>
          <p>
            Ken je iemand die een professionele website zonder technisch gedoe nodig heeft? Draag diegene aan. Na een succesvol gestart abonnement ontvang je een vergoeding volgens de voorwaarden van het partnerprogramma.
          </p>
        </div>
        <div className="partner-details">
          <span>Introductie geregistreerd</span>
          <span>Abonnement eerst actief</span>
          <span>Vergoeding na wachttijd</span>
          <Link className="secondary-button dark" href="/partners">Bekijk het partnerprogramma</Link>
        </div>
      </div>
    </section>
  )
}

export function FAQContactSection({ faqs }: { faqs: FAQ[] }) {
  return (
    <section className="section faq-contact" id="faq">
      <div className="shell faq-contact-grid">
        <div>
          <p className="section-kicker">FAQ</p>
          <h2>Veelgestelde vragen</h2>
          <FAQAccordion items={faqs} />
        </div>
        <div className="contact-section" id="contact">
          <p className="section-kicker">Contact</p>
          <h2>Vertel ons wat je wilt lanceren.</h2>
          <p className="contact-lead">
            Beschrijf kort je aanbod en doel. Je ontvangt binnen één werkdag een eerlijk advies over het passende pakket en de haalbare planning.
          </p>
          <div className="contact-meta">
            <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a>
            <span>Reactie binnen één werkdag</span>
          </div>
          <ContactForm />
        </div>
      </div>
    </section>
  )
}

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="shell footer-top">
        <div>
          <Link href="#top" className="logo inverse">landing<span>site</span><i>.nl</i></Link>
          <p>Professionele websites met hosting en onderhoud in één helder abonnement.</p>
        </div>
        <div>
          <strong>Navigatie</strong>
          <a href="#voorbeelden">Voorbeelden</a>
          <a href="#werkwijze">Werkwijze</a>
          <a href="#prijzen">Prijzen</a>
          <a href="#faq">Veelgestelde vragen</a>
        </div>
        <div>
          <strong>Contact</strong>
          <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a>
          <a href="#contact">Contactformulier</a>
          <Link href="/partners">Partnerprogramma</Link>
        </div>
        <div>
          <strong>Juridisch</strong>
          <Link href="/privacybeleid">Privacy</Link>
          <Link href="/algemene-voorwaarden">Algemene voorwaarden</Link>
        </div>
      </div>
      <div className="shell footer-bottom">
        <span>© {new Date().getFullYear()} {BUSINESS.brandName}</span>
        <span>Website ontwikkeld door <a href="https://landingsite.nl">Landingsite.nl</a></span>
      </div>
    </footer>
  )
}
