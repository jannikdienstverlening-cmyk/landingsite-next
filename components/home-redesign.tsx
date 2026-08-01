import Image from 'next/image'
import Link from 'next/link'
import { partnerProgramConfig } from '@/config/partner-program'
import { pricingConfig } from '@/config/pricing'
import { portfolioProjects } from '@/data/portfolio'
import { BUSINESS } from '@/lib/business'
import { PartnerExample } from './partner-program'
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
          <a href="#partner">Partner</a>
          <a href="#faq">FAQ</a>
        </nav>
        <a className="header-cta" href="#prijzen">
          Bekijk pakketten
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
          <p className="eyebrow"><span />Landingspagina voor zzp en mkb</p>
          <h1>Van idee naar landingspagina in 48 uur.</h1>
          <p className="hero-lead">
            Een professionele landingspagina voor je campagne, dienst of product. Vaste bouwprijs vanaf €{pricingConfig.buildPackages.starter.oneTimePrice} en volledig Websitebeheer voor €{pricingConfig.websiteManagement.monthlyPrice} per maand.
          </p>
          <div className="hero-actions">
            <a className="primary-button" href="#prijzen">Bekijk de pakketten</a>
            <a className="secondary-button" href="#voorbeelden">Bekijk recent werk</a>
          </div>
          <p className="hero-microcopy">Eerste versie binnen 48 uur · Bouw vanaf €{pricingConfig.buildPackages.starter.oneTimePrice} · Websitebeheer €{pricingConfig.websiteManagement.monthlyPrice} p/m</p>
        </div>
        <HeroProjectPreview />
      </div>
    </section>
  )
}

function HeroProjectPreview() {
  return (
    <figure className="hero-preview-frame">
      <div className="hero-preview-topline">
        <span>Recent project</span>
        <span>{heroProject.domain}</span>
      </div>
      <a
        className="hero-preview-image"
        href={heroProject.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Bekijk ${heroProject.name} live`}
      >
        <Image src={heroProject.image} alt={heroProject.imageAlt} fill preload sizes="(max-width: 900px) 92vw, 560px" />
      </a>
      <figcaption className="hero-preview-caption">
        <div>
          <span>Live website</span>
          <strong>{heroProject.name}</strong>
        </div>
        <div>
          <span>{heroProject.type}</span>
          <a href={heroProject.url} target="_blank" rel="noopener noreferrer">Bekijk project <span aria-hidden="true">↗</span></a>
        </div>
      </figcaption>
    </figure>
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
          {portfolioProjects.map((item, index) => (
            <article className="case-card" key={item.slug}>
              <a className="case-image" href={item.url} target="_blank" rel="noopener noreferrer" aria-label={`Bekijk ${item.name} live`}>
                <Image src={item.image} alt={item.imageAlt} fill sizes="(max-width: 900px) 100vw, 560px" />
              </a>
              <div className="case-info">
                <div className="case-meta">
                  <span className="case-label">{item.type}</span>
                  <span>{String(index + 1).padStart(2, '0')} / {item.domain}</span>
                </div>
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
    'Een duidelijke pagina met één conversiedoel',
    'Responsive ontwerp voor mobiel en desktop',
    'Beveiligd contact- of aanvraagformulier',
    'Basis zoekmachine-optimalisatie',
    'Persoonlijke afstemming en oplevering',
  ]
  const steps = [
    ['01', 'Kies je pakket', 'Selecteer Starter, Pro of Premium.'],
    ['02', 'Vul de intake in', 'Deel je aanbod, doelgroep en beschikbare beelden.'],
    ['03', 'Wij bouwen', 'We zetten structuur, ontwerp en techniek voor je klaar.'],
    ['04', 'Eerste versie', 'Binnen 48 uur na bouwbetaling en complete intake.'],
    ['05', 'Goedkeuring en livegang', 'Na akkoord koppelen we je domein en start eventueel Websitebeheer.'],
  ]

  return (
    <section className="section essentials" id="werkwijze">
      <div className="shell">
        <div className="essentials-heading">
          <p className="section-kicker">Wat je krijgt</p>
          <h2>Een gerichte landingspagina, professioneel gebouwd.</h2>
          <p>Je betaalt één duidelijke bouwprijs. Na oplevering kan Landingsite.nl het technische beheer volledig overnemen.</p>
        </div>
        <ul className="checklist service-grid">
          {included.map((item) => <li key={item}><span aria-hidden="true">✓</span>{item}</li>)}
        </ul>
        <div className="process-panel">
          <div className="process-heading"><p className="section-kicker">Zo werkt het</p><h2>Van keuze naar een landingspagina die klaar is voor livegang.</h2></div>
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
          <h2>Een vaste bouwprijs. Websitebeheer start pas na livegang.</h2>
          <p>Je betaalt de bouw eenmalig. Websitebeheer kost daarna €{pricingConfig.websiteManagement.monthlyPrice} per maand exclusief btw en wordt pas geactiveerd nadat je website is goedgekeurd en live gaat.</p>
        </div>
        <div className="price-grid">
          {packages.map((item) => (
            <article className={item.highlighted ? 'featured' : ''} key={item.id}>
              {item.highlighted && <span className="popular">Meest gekozen</span>}
              <h3>{item.name}</h3>
              <small>{item.fit}</small>
              <p>{item.tagline}</p>
              <strong>{item.price}<i>eenmalig excl. btw</i></strong>
              <p className="management-price-line">+ €{pricingConfig.websiteManagement.monthlyPrice} per maand Websitebeheer vanaf livegang</p>
              <ul>{item.features.map((feature) => <li key={feature}><span aria-hidden="true">✓</span>{feature}</li>)}</ul>
              <div className="price-action"><PricingButton pakket={item.id} label="Kies dit pakket" /></div>
            </article>
          ))}
        </div>
        <p className="hosting-note">Eenmalige bouwprijs + €{pricingConfig.websiteManagement.monthlyPrice} per maand Websitebeheer vanaf de livegang. De checkout voor de bouw schrijft nog geen maandbedrag af.</p>
      </div>
    </section>
  )
}

export function WebsiteManagementSection() {
  const management = pricingConfig.websiteManagement
  const included = [
    'Managed hosting',
    'SSL-certificaat',
    'Back-ups',
    'Beveiligings- en technische updates',
    'Controle van formulieren en essentiële functies',
    'Monitoring van bereikbaarheid',
    'Kleine tekst- en beeldwijzigingen',
    'Persoonlijke ondersteuning bij problemen',
    'Hulp bij de domeinkoppeling',
    'Maandelijkse technische controle',
  ]
  const steps = [
    ['01', 'Website wordt gebouwd', 'Je kiest Starter, Pro of Premium en betaalt de eenmalige bouwprijs.'],
    ['02', 'Website gaat live', 'Na goedkeuring koppelen we je domein en activeren we de website.'],
    ['03', 'Beheer start', `Vanaf de livegang start Websitebeheer voor €${management.monthlyPrice} per maand exclusief btw.`],
  ]

  return (
    <section className="section website-management" id="websitebeheer">
      <div className="shell management-layout">
        <div className="management-copy">
          <p className="section-kicker">Na de oplevering</p>
          <h2>Wij houden je website online, veilig en actueel.</h2>
          <p>Na de bouw kun je de website door Landingsite.nl laten hosten en beheren. Voor €{management.monthlyPrice} per maand hoef je niet zelf achter updates, beveiliging, back-ups of kleine wijzigingen aan.</p>
          <div className="management-price"><strong>€{management.monthlyPrice}</strong><span>per maand<br />exclusief btw</span></div>
          <ul className="management-checklist">{included.map((item) => <li key={item}><span aria-hidden="true">✓</span>{item}</li>)}</ul>
          <div className="management-scope">
            <p>Kleine wijzigingen zijn aanpassingen binnen de bestaande website, zoals een tekst wijzigen, een foto vervangen, openingstijden aanpassen of een knop veranderen. Nieuwe pagina’s, volledige nieuwe ontwerpen, uitgebreide functionaliteiten en grote tekstprojecten vallen hier niet onder en worden vooraf apart geoffreerd.</p>
            <strong>Maximaal {management.includedChangeMinutes} minuten kleine wijzigingen per kalendermaand. Niet-gebruikte tijd wordt niet meegenomen.</strong>
          </div>
        </div>
        <div className="management-steps">
          <p className="section-kicker">Hoe het werkt</p>
          <ol>{steps.map(([number, title, text]) => <li key={number}><span>{number}</span><div><h3>{title}</h3><p>{text}</p></div></li>)}</ol>
          <p className="management-summary">Eenmalige bouwprijs + €{management.monthlyPrice} per maand Websitebeheer vanaf de livegang.</p>
        </div>
      </div>
    </section>
  )
}

export function PartnerProgramSection() {
  if (!partnerProgramConfig.enabled) return null

  return (
    <section className="section partner" id="partner">
      <div className="shell partner-home">
        <div className="partner-intro">
          <div>
            <p className="section-kicker">Landingsite Partnerprogramma</p>
            <h2>Tevreden over je website? Verdien mee met je netwerk.</h2>
            <p>Breng een ondernemer aan die een website en actief Websitebeheer bij Landingsite.nl afneemt. Zolang het abonnement actief en betaald blijft, ontvang je iedere maand een vergoeding.</p>
          </div>
          <div className="commission-levels">
            {[
              ['Niveau 1', 'Direct door jou aangebracht', partnerProgramConfig.commissions.level1],
              ['Niveau 2', 'Aangebracht door jouw directe klant', partnerProgramConfig.commissions.level2],
              ['Niveau 3', 'Aangebracht door de klant daaronder', partnerProgramConfig.commissions.level3],
            ].map(([level, description, amount]) => <article key={level}><span>{level}</span><p>{description}</p><strong>€{amount}<small>per maand</small></strong></article>)}
          </div>
          <div className="commission-notes">
            <p>Per Websitebeheer-abonnement wordt maximaal over drie niveaus commissie uitgekeerd. Het netwerk kan verder doorgroeien, maar voor iedere partner tellen alleen de eerste drie niveaus onder die partner.</p>
            <p>Er wordt geen vergoeding betaald voor het alleen aanmelden of werven van partners. De vergoeding ontstaat uitsluitend uit echte, actieve en betaalde Websitebeheer-abonnementen.</p>
          </div>
        </div>
        <PartnerExample compact />
        <div className="partner-home-cta">
          <p>Deelname is gratis. Commissie ontstaat pas na een betaalde maandfactuur en de wachttijd; refunds, storneringen en opzeggingen worden gecorrigeerd.</p>
          <Link className="primary-button" href="/partners">Bekijk het partnerprogramma</Link>
          <Link className="secondary-button" href="/partnervoorwaarden">Bekijk alle partnervoorwaarden</Link>
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
          <a href="#websitebeheer">Websitebeheer</a>
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
          <Link href="/partnervoorwaarden">Partnervoorwaarden</Link>
        </div>
      </div>
      <div className="shell footer-bottom">
        <span>© {new Date().getFullYear()} {BUSINESS.brandName}</span>
        <span>Website ontwikkeld door <a href="https://landingsite.nl">Landingsite.nl</a></span>
      </div>
    </footer>
  )
}
