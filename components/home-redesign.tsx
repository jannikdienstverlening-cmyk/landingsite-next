import Image from 'next/image'
import Link from 'next/link'
import { BUSINESS } from '@/lib/business'
import { ContactForm, FAQAccordion, MobileMenu } from './home-actions'

type Package = {
  id: 'starter' | 'pro' | 'premium'
  name: string
  price: string
  fit: string
  tagline: string
  label: string
  highlighted?: boolean
  features: string[]
}

type FAQ = { q: string; a: string }

const examples = [
  {
    name: 'WIA Management',
    domain: 'wiamanagement.nl',
    url: 'https://www.wiamanagement.nl/',
    industry: 'B2B leadgeneratie',
    description: 'Een zakelijke website voor werkgevers die snel een passende WIA-specialist zoeken.',
    result: 'Heldere aanvraagroute met focus op vertrouwen en snelle opvolging.',
    image: '/images/portfolio/wiamanagement-screenshot.webp',
    tags: ['B2B', 'Aanvraagflow', 'Responsive'],
  },
  {
    name: 'Ontwikkelbegeleiding.nl',
    domain: 'ontwikkelbegeleiding.nl',
    url: 'https://www.ontwikkelbegeleiding.nl/',
    industry: 'Coaching & begeleiding',
    description: 'Een warme website voor persoonlijke ontwikkeling, begeleiding en aanvragen.',
    result: 'Rustige structuur die ouders en professionals snel naar contact leidt.',
    image: '/images/portfolio/ontwikkelbegeleiding-screenshot.webp',
    tags: ['Coaching', 'Intake', 'Persoonlijk'],
  },
  {
    name: 'AIbouwers.nl',
    domain: 'aibouwers.nl',
    url: 'https://www.aibouwers.nl/',
    industry: 'AI & automatisering',
    description: 'Een scherpe productsite voor ondernemers die AI praktisch willen inzetten.',
    result: 'Eenvoudige propositie met duidelijke proces-CTA en voorbeeldworkflow.',
    image: '/images/portfolio/aibouwers-screenshot.png',
    tags: ['AI', 'Proces', 'Leadpagina'],
  },
]

const trustBadges = ['Binnen 48 uur eerste versie', 'Hosting inbegrepen', 'Onderhoud geregeld', 'AI + menselijke controle']

export function Header() {
  return (
    <header className="site-header">
      <div className="header-inner">
        <Link href="#top" className="logo" aria-label="Landingsite.nl home">
          landing<span>site</span><i>.nl</i>
        </Link>
        <nav className="desktop-nav" aria-label="Hoofdnavigatie">
          <a href="#portfolio">Portfolio</a>
          <a href="#waarom">Waarom</a>
          <a href="#werkwijze">Zo werkt het</a>
          <a href="#prijzen">Pakketten</a>
          <a href="#partner">Partner</a>
          <a href="#faq">FAQ</a>
        </nav>
        <a className="header-cta" href="#contact">
          Plan gratis gesprek <span aria-hidden="true">↗</span>
        </a>
        <MobileMenu />
      </div>
    </header>
  )
}

export function Hero() {
  return (
    <section className="hero" id="top">
      <div className="hero-glow glow-one" />
      <div className="hero-glow glow-two" />
      <div className="shell hero-grid">
        <div className="hero-copy">
          <p className="eyebrow"><span />Premium AI-webbureau voor zzp en mkb</p>
          <h1>Klaar met dure websites? <em>Binnen 48 uur jouw nieuwe website live.</em></h1>
          <p className="hero-lead">
            Professionele websites vanaf €79 per maand. Inclusief hosting, onderhoud,
            beveiliging en onbeperkte AI-ondersteuning.
          </p>
          <div className="hero-actions">
            <a className="primary-button" href="#contact">Plan gratis gesprek <span aria-hidden="true">→</span></a>
            <a className="secondary-button" href="#portfolio">Bekijk voorbeelden</a>
          </div>
          <div className="social-proof-line" aria-label="Steeds meer ondernemers kiezen voor Landingsite">
            <span aria-hidden="true">★★★★★</span>
            <strong>Steeds meer ondernemers kiezen voor Landingsite.</strong>
          </div>
          <div className="hero-proof">
            {trustBadges.map((badge) => <span key={badge}>✓ {badge}</span>)}
          </div>
        </div>
        <HeroScreenshotCarousel />
      </div>
    </section>
  )
}

function HeroScreenshotCarousel() {
  return (
    <div className="hero-carousel" aria-label="Screenshots van live websites die Landingsite heeft gebouwd">
      <div className="hero-carousel-top">
        <span>Live referenties</span>
        <strong>3 websites</strong>
      </div>
      <div className="hero-carousel-track">
        {examples.map((item, index) => (
          <a href={item.url} target="_blank" rel="noopener noreferrer" className="hero-shot" key={item.name}>
            <div className="browser-bar" aria-hidden="true"><i /><i /><i /><span>{item.domain}</span></div>
            <Image src={item.image} alt={`Screenshot van ${item.name}`} fill priority={index === 0} sizes="(max-width: 900px) 88vw, 420px" />
            <div className="hero-shot-caption">
              <strong>{item.name}</strong>
              <span>{item.industry}</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}

export function PortfolioSection() {
  return (
    <section className="section portfolio" id="portfolio">
      <div className="shell">
        <div className="section-head portfolio-head">
          <p className="section-kicker">Portfolio</p>
          <h2>Bekijk websites die we al gebouwd hebben</h2>
          <p>Van B2B leadgeneratie tot coaching en AI: elke website krijgt een duidelijk doel, echte screenshots en een live voorbeeld.</p>
        </div>
        <div className="case-grid">
          {examples.map((item) => (
            <article className="case-card" key={item.name}>
              <a className="case-image" href={item.url} target="_blank" rel="noopener noreferrer">
                <div className="browser-bar" aria-hidden="true"><i /><i /><i /><span>{item.domain}</span></div>
                <Image src={item.image} alt={`Screenshot van de actuele homepage van ${item.name}`} fill sizes="(max-width: 900px) 100vw, 33vw" />
              </a>
              <div className="case-info">
                <span className="case-label">{item.industry}</span>
                <h3>{item.name}</h3>
                <p>{item.description}</p>
                <div className="case-result"><strong>Resultaat</strong><span>{item.result}</span></div>
                <div className="case-tags">{item.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>
                <a className="case-link" href={item.url} target="_blank" rel="noopener noreferrer">Bekijk live website <span aria-hidden="true">↗</span></a>
              </div>
            </article>
          ))}
        </div>
        <div className="section-cta"><a className="primary-button" href="#contact">Ook zo&apos;n website? Plan gratis gesprek <span aria-hidden="true">→</span></a></div>
      </div>
    </section>
  )
}

export function BenefitsGrid() {
  const items = [
    ['48u', 'Binnen 48 uur eerste versie', 'Je ziet snel een echte website in plaats van wekenlang wachten op concepten.'],
    ['✓', 'Geen technisch gedoe', 'Hosting, beveiliging, onderhoud en updates worden voor je geregeld.'],
    ['AI', 'AI én menselijke controle', 'AI versnelt tekst en optimalisatie; wij houden de kwaliteit en inhoud scherp.'],
    ['∞', 'Altijd uitbreidbaar', 'Start compact en breid later uit met extra pagina’s, funnels of optimalisaties.'],
    ['€', 'Vast maandbedrag', 'Duidelijke pakketten vanaf €79 per maand zonder vage offertes.'],
    ['↗', 'Gemaakt voor groei', 'Duidelijke CTA’s, bewijs en structuur die bezoekers helpen kiezen.'],
  ]

  return (
    <section className="section benefits" id="waarom">
      <div className="shell">
        <div className="section-head">
          <p className="section-kicker">Waarom ondernemers voor Landingsite kiezen</p>
          <h2>Minder zorgen. Meer vertrouwen. Sneller online.</h2>
        </div>
        <div className="feature-grid">
          {items.map(([icon, title, text]) => (
            <article key={title}>
              <span className="feature-icon" aria-hidden="true">{icon}</span>
              <h3>{title}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
        <div className="section-cta"><a className="primary-button" href="#prijzen">Bekijk pakketten <span aria-hidden="true">→</span></a></div>
      </div>
    </section>
  )
}

export function TestimonialsSection() {
  const reviews = [
    {
      logo: 'WIA',
      name: 'WIA Management',
      company: 'B2B leadgeneratie',
      review: 'Zakelijke positionering, duidelijke aanvraagroute en een professionele eerste indruk voor werkgevers.',
    },
    {
      logo: 'OB',
      name: 'Ontwikkelbegeleiding.nl',
      company: 'Coaching & begeleiding',
      review: 'Een warme, toegankelijke website waarin bezoekers snel begrijpen waar begeleiding bij helpt.',
    },
    {
      logo: 'AI',
      name: 'AIbouwers.nl',
      company: 'AI & automatisering',
      review: 'Een heldere productsite met focus op uitleg, vertrouwen en een laagdrempelige procesaanvraag.',
    },
  ]

  return (
    <section className="section testimonials" id="referenties">
      <div className="shell">
        <div className="section-head compact">
          <p className="section-kicker">Referenties</p>
          <h2>Bewijs boven beloftes.</h2>
          <p>Geen verzonnen conversiecijfers. Wel echte websites, zichtbare voorbeelden en een proces dat ondernemers snel vooruit helpt.</p>
        </div>
        <div className="review-grid">
          {reviews.map((item) => (
            <article className="review-card" key={item.name}>
              <div className="review-top">
                <span className="review-logo" aria-hidden="true">{item.logo}</span>
                <div><strong>{item.name}</strong><small>{item.company}</small></div>
              </div>
              <div className="stars" aria-label="5 sterren">★★★★★</div>
              <p>{item.review}</p>
            </article>
          ))}
        </div>
        <div className="section-cta"><a className="secondary-button dark" href="#portfolio">Bekijk live voorbeelden</a></div>
      </div>
    </section>
  )
}

export function PricingSection({ packages }: { packages: Package[] }) {
  return (
    <section className="section pricing" id="prijzen">
      <div className="shell">
        <div className="pricing-head">
          <p className="section-kicker light">Pakketten</p>
          <h2>Een professionele website voor een vast maandbedrag.</h2>
          <p>Geen technische termen. Geen losse onderhoudsfacturen. Jij kiest hoeveel hulp je wilt, wij houden je website gezond.</p>
        </div>
        <div className="price-grid">
          {packages.map((item) => (
            <article className={item.highlighted ? 'featured' : ''} key={item.id}>
              {item.highlighted && <span className="popular">Meest gekozen</span>}
              <small>{item.fit}</small>
              <h3>{item.name}</h3>
              <p>{item.tagline}</p>
              <strong>{item.price}<i>p/m excl. btw</i></strong>
              <ul>{item.features.map((feature) => <li key={feature}><span aria-hidden="true">✓</span>{feature}</li>)}</ul>
              <a className="price-button" href="#contact">{item.label}<span aria-hidden="true">→</span></a>
            </article>
          ))}
        </div>
        <div className="included-strip">
          {['Hosting', 'SSL', 'Updates', 'Backups', 'Onderhoud', 'Support', 'AI optimalisatie'].map((item) => <span key={item}>✓ {item}</span>)}
        </div>
      </div>
    </section>
  )
}

export function ProcessTimeline() {
  const steps = [
    ['01', 'Plan gesprek', 'We bespreken je doel, aanbod en beste pakket.'],
    ['02', 'Wij bouwen jouw website', 'Structuur, tekst, design en techniek komen samen.'],
    ['03', 'Binnen 48 uur eerste versie', 'Je krijgt een echte preview om te bekijken.'],
    ['04', 'Live', 'Na akkoord zetten we je website online.'],
    ['05', 'Wij onderhouden alles', 'Updates, backups, support en AI-optimalisatie blijven geregeld.'],
  ]

  return (
    <section className="section process" id="werkwijze">
      <div className="shell">
        <div className="section-head">
          <p className="section-kicker">Zo werkt het</p>
          <h2>Van gesprek naar live website zonder technisch gedoe.</h2>
        </div>
        <ol className="timeline">
          {steps.map(([number, title, text]) => (
            <li key={title}>
              <span>{number}</span>
              <div className="timeline-illustration" aria-hidden="true"><i /></div>
              <h3>{title}</h3>
              <p>{text}</p>
            </li>
          ))}
        </ol>
        <div className="section-cta"><a className="primary-button" href="#contact">Start met een gratis gesprek <span aria-hidden="true">→</span></a></div>
      </div>
    </section>
  )
}

export function PartnerProgramSection() {
  const rewards = [
    ['Directe klant', '€20 per maand'],
    ['Tweede niveau', '€5 per maand'],
    ['Derde niveau', '€2 per maand'],
  ]

  return (
    <section className="section partner" id="partner">
      <div className="shell partner-grid">
        <div>
          <p className="section-kicker light">Klanten brengen klanten</p>
          <h2>Verdien iedere maand met jouw netwerk</h2>
          <p>Ben je tevreden over jouw website? Breng ondernemers aan en ontvang iedere maand een terugkerende vergoeding zolang jouw aangebrachte klant klant blijft.</p>
          <div className="partner-actions">
            <a className="primary-button" href="#contact">Word Partner <span aria-hidden="true">→</span></a>
            <a className="secondary-button on-dark" href="#faq">Lees meer</a>
          </div>
        </div>
        <div className="partner-visual" aria-label="Partnerprogramma met drie niveaus">
          {['Jij', 'Nieuwe klant', 'Nieuwe klant', 'Nieuwe klant'].map((label, index) => (
            <div className="partner-node" key={`${label}-${index}`}>
              <span>{label}</span>
              {index > 0 && <strong>{rewards[index - 1][1]}</strong>}
            </div>
          ))}
          <div className="reward-list">
            {rewards.map(([label, amount]) => <p key={label}><span>{label}</span><strong>{amount}</strong></p>)}
          </div>
        </div>
      </div>
    </section>
  )
}

export function FAQSection({ faqs }: { faqs: FAQ[] }) {
  return (
    <section className="section faq" id="faq">
      <div className="shell faq-grid">
        <div>
          <p className="section-kicker">Veelgestelde vragen</p>
          <h2>Alles wat je wilt weten voor je start.</h2>
          <p>Staat je vraag er niet tussen? Mail <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a> of plan direct een gratis gesprek.</p>
          <a className="secondary-button dark" href="#contact">Plan gratis gesprek</a>
        </div>
        <FAQAccordion items={faqs} />
      </div>
    </section>
  )
}

export function FinalCTA() {
  return (
    <section className="section contact-section" id="contact">
      <div className="shell contact-grid">
        <div>
          <p className="eyebrow"><span />Klaar voor een website die vertrouwen wekt?</p>
          <h2>Plan gratis een gesprek van 15 minuten.</h2>
          <p className="contact-lead">We kijken eerlijk mee naar je aanbod, doelgroep en timing. Past Landingsite niet, dan zeggen we dat ook.</p>
          <div className="contact-meta">
            <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a>
            <span>Reactie binnen 1 werkdag</span>
            <span>Vanaf €79 per maand</span>
          </div>
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
        <div>
          <Link href="#top" className="logo inverse">landing<span>site</span><i>.nl</i></Link>
          <p>Premium websites voor Nederlandse ondernemers. Live in 48 uur, onderhouden door Landingsite.</p>
        </div>
        <div>
          <strong>Navigatie</strong>
          <a href="#portfolio">Portfolio</a>
          <a href="#partner">Partnerprogramma</a>
          <a href="#referenties">Referenties</a>
          <a href="#faq">Veelgestelde vragen</a>
        </div>
        <div>
          <strong>Contact</strong>
          <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a>
          <a href="#contact">Plan gratis gesprek</a>
          <a href="#prijzen">Pakketten</a>
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
