import Image from 'next/image'
import Link from 'next/link'
import { commercialConfig, type CommercialPackageId } from '@/config/commercial'
import type { PortfolioProject } from '@/data/portfolio'
import { portfolioProjects } from '@/data/portfolio'
import { siteCopy } from '@/content/site'
import { seoPage } from '@/content/seo-pages'
import { packagePresentation } from '@/content/package-presentation'
import { BUSINESS } from '@/lib/business'
import { ContactForm, FAQList, MobileNavigation } from './site-interactions'
import { Logo } from './logo'
import { SiteChatbot } from './site-chatbot'
import { FounderPortrait } from './founder-portrait'
import { ProjectPreview } from './project-preview'

export type StudioFaq = { question: string; answer: string }

export function StudioHeader({ light = false }: { light?: boolean }) {
  return (
    <header className="studio-header">
      <div className="studio-shell studio-header__inner">
        <Logo variant={light ? 'dark' : 'light'} />
        <nav className="studio-nav" aria-label="Hoofdnavigatie">
          <Link href="/#werk">Werk</Link>
          <Link href="/#pakketten">Pakketten</Link>
          <Link href="/#aanpak">Aanpak</Link>
          <Link href="/#beheer">Beheer</Link>
          <Link href="/#faq">Vragen</Link>
          <Link className="studio-nav__minor" href="/partner">Partner</Link>
          <Link href="/blog">Blog</Link>
        </nav>
        <Link className="button button--primary studio-header__cta" href="/start" data-analytics-event="hero_start_click" data-analytics-location="header">
          {siteCopy.cta.primary}
        </Link>
        <MobileNavigation />
      </div>
    </header>
  )
}

export function StudioFooter() {
  return (
    <>
      <footer className="studio-footer">
        <div className="studio-shell studio-footer__grid">
          <div className="studio-footer__brand">
            <Logo />
            <p>Websites voor zelfstandigen en kleine bedrijven. Gebouwd en beheerd door Jannik.</p>
          </div>
          <nav aria-label="Footer navigatie">
            <strong>Bekijk</strong>
            <Link href="/werk">Werk</Link>
            <Link href="/landingspagina-laten-maken">Landingspagina</Link>
            <Link href="/website-laten-maken-zzp">Voor zzp</Link>
            <Link href="/kosten-website-laten-maken">Kosten</Link>
            <Link href="/over-landingsite">Over</Link>
            <Link href="/#aanpak">Aanpak</Link>
            <Link href="/#pakketten">Pakketten</Link>
            <Link href="/#beheer">Beheer</Link>
          </nav>
          <nav aria-label="Voorwaarden en contact">
            <strong>Praktisch</strong>
            <Link href="/#contact">Eerst een vraag?</Link>
            <Link href="/algemene-voorwaarden">Algemene voorwaarden</Link>
            <Link href="/privacybeleid">Privacybeleid</Link>
            <Link href="/verwerkersovereenkomst">Verwerkersovereenkomst</Link>
            <Link href="/partner" data-analytics-event="partner_page_view">Partnerprogramma</Link>
          </nav>
          <nav aria-label="Sociale media">
            <strong>Volg</strong>
            <a href={BUSINESS.social.instagram} target="_blank" rel="noopener noreferrer">Instagram</a>
            <a href={BUSINESS.social.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
            <a href={BUSINESS.social.tiktok} target="_blank" rel="noopener noreferrer">TikTok</a>
          </nav>
        </div>
        <div className="studio-shell studio-footer__bottom">
          <span>© {new Date().getFullYear()} Landingsite.nl</span>
          <span>Jannik Dienstverlening · KvK {BUSINESS.chamberOfCommerceNumber}</span>
        </div>
      </footer>
      <SiteChatbot />
    </>
  )
}

export function BrowserFrame({ project, priority = false, sizes = '(max-width: 760px) 94vw, 64vw' }: { project: PortfolioProject; priority?: boolean; sizes?: string }) {
  return (
    <div className="browser-frame">
      <div className="browser-frame__bar" aria-hidden="true"><i /><i /><i /><span>{project.domain}</span></div>
      <div className="browser-frame__image">
        <Image
          src={project.image}
          alt={project.imageAlt}
          fill
          sizes={sizes}
          preload={priority}
          loading={priority ? "eager" : "lazy"}
        />
      </div>
    </div>
  )
}

export function MobileProjectFrame({ project, priority = false }: { project: PortfolioProject; priority?: boolean }) {
  return (
    <div className="mobile-project-frame">
      <div className="mobile-project-frame__speaker" aria-hidden="true" />
      <div className="mobile-project-frame__image">
        <Image
          src={project.mobileImage}
          alt={project.mobileImageAlt}
          fill
          sizes="(max-width: 760px) 90vw, 260px"
          preload={priority}
          loading={priority ? "eager" : "lazy"}
        />
      </div>
    </div>
  )
}

export function StudioHero() {
  const additionalProjects = portfolioProjects.slice(1)
  const homepage = seoPage('/')
  return (
    <section className="studio-hero">
      <div className="studio-shell studio-hero__grid">
        <div className="studio-hero__copy">
          <p className="overline">Websites voor zzp’ers en kleine bedrijven</p>
          <h1>{homepage.h1}</h1>
        </div>
        <div className="studio-hero__offer">
          <p className="studio-hero__intro">
            Wij maken een website die laat zien wat je doet en hoe klanten je bereiken. Jannik bouwt hem en verzorgt de hosting, updates en kleine wijzigingen.
          </p>
          <p className="studio-hero__micro"><strong>€{commercialConfig.management.monthlyPrice} per maand</strong> inclusief btw. Websitebouw, hosting en beheer inbegrepen. Geen eenmalige bouwkosten.</p>
          <div className="studio-actions">
            <Link className="button button--primary" href="/start" data-analytics-event="hero_start_click" data-analytics-location="hero">Start mijn website</Link>
            <a className="button button--text" href="#werk" data-analytics-event="hero_work_click">Bekijk live werk</a>
          </div>
          <p className="studio-hero__trust">Eerst bekijken. Pas online na jouw akkoord.</p>
        </div>
      </div>
      <div className="studio-projects" id="werk">
        <div className="studio-shell">
          <div className="showcase-heading"><p>Deze websites staan al online.</p><Link href="/werk" data-analytics-event="case_view">Bekijk het werk</Link></div>
          <ProjectPreview projects={portfolioProjects} />
          <noscript><div className="project-proof">Ook gebouwd: {additionalProjects.map(project => <a href={project.url} target="_blank" rel="noopener noreferrer" key={project.slug}>{project.name}</a>)}</div></noscript>
        </div>
      </div>
      <div className="studio-shell trust-line" role="list" aria-label="Belangrijkste zekerheden">
        <span role="listitem">Eerste versie binnen {commercialConfig.firstVersion.hours} uur na betaling en complete intake</span>
        <span role="listitem">Je domeinnaam blijft van jou</span>
        <span role="listitem">Beheer maandelijks opzegbaar</span>
      </div>
    </section>
  )
}

export function ProcessSection() {
  const process = [
    ['1', 'Vertel over je bedrijf', 'Kies je pakket en betaal. Daarna vul je een vragenlijst in en stuur je je logo, teksten en foto’s mee.'],
    ['2', 'Bekijk de eerste versie', `Binnen ${commercialConfig.firstVersion.hours} uur na betaling en een complete intake krijg je een werkende website om te bekijken. Je stuurt je aanpassingen in één keer door, per ronde.`],
    ['3', 'Geef akkoord', 'Tevreden? Na jouw akkoord koppelen we je domein en zetten we de website online. Ik blijf de hosting en het beheer verzorgen.'],
  ]
  return (
      <section className="studio-section studio-process" id="aanpak">
        <div className="studio-shell section-heading"><h2>Zo staat je website straks online.</h2><p>Je hoeft niets van techniek te weten.</p></div>
        <ol className="process-steps studio-shell">{process.map(([number, title, text]) => <li key={number}><span>{number}</span><h3>{title}</h3><p>{text}</p></li>)}</ol>
      </section>
  )
}

export function Pricing() {
  const entries = Object.entries(commercialConfig.packages) as Array<[CommercialPackageId, typeof commercialConfig.packages[CommercialPackageId]]>
  return (
    <section className="studio-section studio-pricing" id="pakketten" data-analytics-view="pricing_view">
      <div className="studio-shell section-heading section-heading--row">
        <div><p className="overline">Website en beheer bij één persoon</p><h2>Eén maandbedrag. Kies wat bij je bedrijf past.</h2></div>
        <p>Een enkele pagina of meer ruimte voor je diensten? De bouw is inbegrepen. Je betaalt de eerste maand bij de start en daarna hetzelfde bedrag per maand.</p>
      </div>
      <div className="studio-shell subscription-offer">
        <div><strong>€{commercialConfig.management.monthlyPrice}</strong><span>per maand, inclusief btw</span></div>
        <p>Ontwerp, bouw, contactformulier, hosting en beheer.<br />Geen eenmalige bouwkosten. Maandelijks opzegbaar.</p>
      </div>
      <div className="studio-shell pricing-grid">
        {entries.map(([id, item]) => {
          const presentation = packagePresentation(id)
          return (
          <article className={`pricing-option${item.recommended ? ' pricing-option--focus' : ''}`} key={id}>
            <header>
              <div>{item.recommended && <span>Aanbevolen</span>}<h3>{item.name}</h3></div>
              <p>{presentation.audience}</p>
            </header>
            <dl className="pricing-specs">{presentation.specs.map((spec) => <div key={spec.label}><dt>{spec.label}</dt><dd>{spec.value}</dd></div>)}</dl>
            <details className="pricing-option__details">
              <summary>Alles in {item.name}<span aria-hidden="true">+</span></summary>
              <ul>{item.features.map((feature) => <li key={feature}>{feature}</li>)}</ul>
            </details>
            <Link className={`button ${item.recommended ? 'button--primary' : 'button--outline'} button--full`} href={item.ctaHref} data-analytics-event="package_select" data-analytics-package={id}>Kies {item.name}</Link>
          </article>
        )})}
      </div>
      <div className="studio-shell pricing-after"><p>Je geeft je feedback in één keer door, per aanpassingsronde. De eerste versie volgt binnen {commercialConfig.firstVersion.hours} uur na betaling en een complete intake. We zetten je website pas online na jouw akkoord.</p><p>Dezelfde maandprijs voor elk pakket. Webshops, grote migraties en nieuwe functies zijn niet inbegrepen. Extra werk wordt vooraf apart afgesproken.</p></div>
    </section>
  )
}

export function ManagementSection() {
  const management = commercialConfig.management
  return (
    <section className="studio-section studio-management" id="beheer">
      <div className="studio-shell studio-management__grid">
        <div>
          <p className="overline">Hosting &amp; Websitebeheer</p>
          <h2>Ook daarna kun je bij mij terecht.</h2>
          <p>Een foto vervangen of een formulier dat niet aankomt? Mail me. Je hoeft niet zelf uit te zoeken hoe je website werkt.</p>
          <div className="management-price"><strong>€{management.monthlyPrice}</strong><span>per maand · incl. btw</span></div>
        </div>
        <div className="management-details">
          <div className="management-services">
            <div><h3>Je website blijft bereikbaar</h3><p>Hosting, een beveiligde verbinding (SSL) en controle van je website en contactformulier.</p></div>
            <div><h3>De techniek blijft bijgewerkt</h3><p>Technische en beveiligingsupdates, back-ups en herstel bij problemen.</p></div>
            <div><h3>Een kleine wijziging? Mail me.</h3><p>E-mailondersteuning en maximaal {management.includedChangeMinutes} minuten per maand om een tekst of afbeelding aan te passen.</p></div>
          </div>
          <dl>
            <div><dt>Ongebruikte tijd</dt><dd>Wordt niet opgespaard of overgedragen</dd></div>
            <div><dt>Opzegging</dt><dd>Maandelijks, aan het einde van de betaalperiode</dd></div>
            <div><dt>Domein</dt><dd>Blijft eigendom van jou</dd></div>
          </dl>
          <p className="management-note">Nieuwe pagina’s, functies, koppelingen, uitgebreide teksten of een nieuw ontwerp vallen niet onder deze minuten. Voor groter werk krijg je vooraf een aparte prijs.</p>
        </div>
      </div>
    </section>
  )
}

export function FounderSection() {
  return (
    <section className="studio-section studio-founder" id="over" aria-labelledby="founder-title">
      <div className="studio-shell studio-founder__grid">
        <FounderPortrait />
        <div className="studio-founder__copy">
          <h2 id="founder-title">Hi, ik ben Jannik.</h2>
          <p>De persoon die je website bouwt, leest ook je berichten. Dat ben ik. Ik help je vertellen wat je doet, bouw de pagina’s en test het formulier voordat je de eerste versie krijgt.</p>
          <p>Je kunt bij mij terecht van je eerste vraag tot een wijziging nadat je website online staat.</p>
          <div className="studio-founder__actions">
            <Link className="button button--primary" href="/start" data-analytics-event="hero_start_click" data-analytics-location="founder">Start mijn website</Link>
            <Link href="/over-landingsite">Meer over mij</Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export function FAQAndClose({ faqs }: { faqs: StudioFaq[] }) {
  return (
    <>
      <section className="studio-section studio-faq" id="faq">
        <div className="studio-shell studio-faq__grid"><div><h2>Handig om te weten.</h2><p>Over de prijs, de eerste versie en wat er daarna gebeurt.</p><a href="#contact">Stel je vraag aan Jannik</a></div><FAQList items={faqs} /></div>
      </section>
      <section className="studio-section studio-close">
        <div className="studio-shell studio-close__inner">
          <div><h2>Maak ruimte voor je nieuwe website.</h2><p>Je kiest het pakket. Ik zorg voor de bouw. Binnen {commercialConfig.firstVersion.hours} uur na betaling en een complete intake kun je de eerste versie bekijken.</p></div>
          <div><Link className="button button--primary" href="/start" data-analytics-event="hero_start_click" data-analytics-location="closing">Start mijn website</Link><a href="/werk" data-analytics-event="hero_work_click">Bekijk live werk</a><span>€{commercialConfig.management.monthlyPrice} per maand · incl. btw · bouw inbegrepen</span></div>
        </div>
      </section>
      <section className="studio-section studio-contact" id="contact">
        <div className="studio-shell studio-contact__grid"><div><h2>Eerst iets vragen?</h2><p>Over je pakket, een bestaande website of een extra pagina. Jannik leest je bericht.</p></div><ContactForm /></div>
      </section>
    </>
  )
}
