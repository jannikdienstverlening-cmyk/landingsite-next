import Image from 'next/image'
import Link from 'next/link'
import { commercialConfig, packageFirstPayment, type CommercialPackageId } from '@/config/commercial'
import { portfolioProjects, type PortfolioProject } from '@/data/portfolio'
import { BUSINESS } from '@/lib/business'
import { ContactForm, FAQList, MobileNavigation } from './site-interactions'
import { Logo } from './logo'

export type StudioFaq = { question: string; answer: string }

export function StudioHeader() {
  return (
    <header className="studio-header">
      <div className="studio-shell studio-header__inner">
        <Logo />
        <nav className="studio-nav" aria-label="Hoofdnavigatie">
          <Link href="/#werk">Werk</Link>
          <Link href="/#aanpak">Aanpak</Link>
          <Link href="/#pakketten">Pakketten</Link>
          <Link href="/#beheer">Beheer</Link>
          <Link href="/#faq">FAQ</Link>
          <Link className="studio-nav__minor" href="/partner">Partner</Link>
        </nav>
        <Link className="button button--primary studio-header__cta" href="/start" data-analytics-event="hero_start_click" data-analytics-location="header">Start mijn website</Link>
        <MobileNavigation />
      </div>
    </header>
  )
}

export function StudioFooter() {
  return (
    <footer className="studio-footer">
      <div className="studio-shell studio-footer__grid">
        <div className="studio-footer__brand">
          <Logo />
          <p>Websites en landingspagina’s voor Nederlandse zzp’ers en mkb-dienstverleners.</p>
        </div>
        <nav aria-label="Footer navigatie">
          <strong>Bekijk</strong>
          <Link href="/werk">Werk</Link>
          <Link href="/#aanpak">Aanpak</Link>
          <Link href="/#pakketten">Pakketten</Link>
          <Link href="/#beheer">Beheer</Link>
        </nav>
        <nav aria-label="Voorwaarden en contact">
          <strong>Praktisch</strong>
          <Link href="/#contact">Eerst overleggen</Link>
          <Link href="/algemene-voorwaarden">Algemene voorwaarden</Link>
          <Link href="/privacybeleid">Privacybeleid</Link>
          <Link href="/partner" data-analytics-event="partner_page_view">Partnerprogramma</Link>
        </nav>
        <nav aria-label="Sociale media">
          <strong>Volg</strong>
          <a href={BUSINESS.social.instagram} target="_blank" rel="noopener noreferrer">Instagram</a>
          <a href={BUSINESS.social.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
        </nav>
      </div>
      <div className="studio-shell studio-footer__bottom">
        <span>© {new Date().getFullYear()} Landingsite.nl</span>
        <span>Jannik Dienstverlening · KvK {BUSINESS.chamberOfCommerceNumber}</span>
      </div>
    </footer>
  )
}

function BrowserFrame({ project, priority = false }: { project: PortfolioProject; priority?: boolean }) {
  return (
    <div className="browser-frame">
      <div className="browser-frame__bar" aria-hidden="true"><i /><i /><i /><span>{project.domain}</span></div>
      <div className="browser-frame__image">
        <Image src={project.image} alt={project.imageAlt} fill sizes="(max-width: 760px) 92vw, 58vw" loading={priority ? 'eager' : 'lazy'} fetchPriority={priority ? 'high' : 'auto'} />
      </div>
    </div>
  )
}

export function StudioHero() {
  const project = portfolioProjects[0]
  return (
    <section className="studio-hero">
      <div className="studio-shell studio-hero__copy">
        <p className="overline">Websites voor Nederlandse ondernemers</p>
        <h1>Je website moet niet alleen goed staan. Hij moet aanvragen opleveren.</h1>
        <p className="studio-hero__intro">Landingsite bouwt overtuigende websites en landingspagina’s voor zzp en mkb. De eerste werkende versie volgt binnen 48 uur na betaling en een complete intake. Daarna regelen wij hosting, techniek en kleine wijzigingen.</p>
        <div className="studio-actions">
          <Link className="button button--primary" href="/start" data-analytics-event="hero_start_click" data-analytics-location="hero">Start mijn website</Link>
          <a className="button button--text" href="#werk" data-analytics-event="hero_work_click">Bekijk live werk <span aria-hidden="true">↘</span></a>
        </div>
        <p className="studio-hero__micro">Bouw vanaf €{commercialConfig.packages.starter.oneTimePrice} · beheer €{commercialConfig.management.monthlyPrice} p/m · domein blijft van jou</p>
      </div>
      <div className="studio-shell studio-hero__project">
        <a href={project.url} target="_blank" rel="noopener noreferrer" data-analytics-event="portfolio_case_open" data-analytics-project={project.slug} aria-label={`Bekijk ${project.name} live`}>
          <BrowserFrame project={project} priority />
        </a>
        <div className="studio-hero__caption">
          <span>Hoofdreferentie · {project.industry}</span>
          <strong>{project.name}</strong>
          <p>Een rustige website met een directe route naar een kennismaking.</p>
          <a href={project.url} target="_blank" rel="noopener noreferrer">Bekijk live website ↗</a>
        </div>
      </div>
      <div className="studio-shell trust-line" aria-label="Belangrijkste zekerheden">
        <span>Eerste versie binnen 48 uur*</span>
        <span>Vaste bouwprijzen</span>
        <span>Mobiel ontworpen</span>
        <span>Maandelijks opzegbaar beheer</span>
      </div>
    </section>
  )
}

export function WorkProof() {
  const projects = portfolioProjects.slice(1, 3)
  return (
    <section className="studio-section studio-work" id="werk">
      <div className="studio-shell section-heading section-heading--row">
        <div><p className="overline">Gebouwd. Opgeleverd. Live.</p><h2>Geen concepttemplates. Echte websites.</h2></div>
        <p>Open de projecten zelf en bekijk hoe een ingewikkeld aanbod wordt teruggebracht naar een duidelijke bezoekersroute.</p>
      </div>
      <div className="studio-shell project-list">
        {projects.map((project, index) => (
          <article className="project-case" key={project.slug}>
            <div className="project-case__number">0{index + 2}</div>
            <a href={project.url} target="_blank" rel="noopener noreferrer" data-analytics-event="portfolio_case_open" data-analytics-project={project.slug}><BrowserFrame project={project} /></a>
            <div className="project-case__copy">
              <span>{project.industry}</span>
              <h3>{project.name}</h3>
              <p><strong>Vraag</strong>{project.problem}</p>
              <p><strong>Gebouwd</strong>{project.result}</p>
              <a href={project.url} target="_blank" rel="noopener noreferrer">Bekijk live website ↗</a>
            </div>
          </article>
        ))}
      </div>
      <div className="studio-shell section-link"><Link href="/werk">Bekijk alle projectdetails →</Link></div>
    </section>
  )
}

export function ProblemAndFlow() {
  return (
    <>
      <section className="studio-section studio-problem">
        <div className="studio-shell studio-problem__grid">
          <div><p className="overline">Waar het vaak misgaat</p><h2>Een mooie site zonder richting blijft een digitaal visitekaartje.</h2></div>
          <ol>
            <li><span>01</span><div><h3>Het aanbod is niet meteen duidelijk</h3><p>Een bezoeker moet zoeken naar wat je doet, voor wie het bedoeld is en waarom het relevant is.</p></div></li>
            <li><span>02</span><div><h3>Bewijs komt pas na de twijfel</h3><p>Projecten, werkwijze en prijs staan te ver weg van het moment waarop iemand beslist om verder te kijken.</p></div></li>
            <li><span>03</span><div><h3>Contact voelt als een grote stap</h3><p>Een lang formulier of onduidelijke vervolgstap laat geïnteresseerde bezoekers afhaken.</p></div></li>
          </ol>
        </div>
      </section>
      <section className="studio-section studio-flow" id="aanpak">
        <div className="studio-shell section-heading"><p className="overline">Conversieaanpak</p><h2>Zo bouwen we een logische route naar actie.</h2></div>
        <ol className="flow-line studio-shell">
          <li><span>01</span><h3>Duidelijkheid</h3><p>In enkele seconden is helder wat je verkoopt en voor wie.</p></li>
          <li><span>02</span><h3>Herkenning</h3><p>Situaties en vragen sluiten aan op de behoefte van je bezoeker.</p></li>
          <li><span>03</span><h3>Bewijs</h3><p>Echte projecten en concrete informatie verschijnen vóór twijfel groeit.</p></li>
          <li><span>04</span><h3>Zekerheid</h3><p>Prijs, aanpak, planning en voorwaarden staan vooraf vast.</p></li>
          <li><span>05</span><h3>Aanvraag</h3><p>Het formulier vraagt alleen wat nodig is voor de volgende stap.</p></li>
        </ol>
      </section>
    </>
  )
}

export function DeliveryAndProcess() {
  const delivery = ['Positionering en paginastructuur', 'Ontwerp en responsive bouw', 'Werkend aanvraagformulier', 'Title, meta description en SEO-basis', 'Domeinkoppeling en technische controle', 'Hosting en onderhoud na oplevering']
  const process = [
    ['01', 'Kies het pakket', 'Vergelijk Starter, Pro en Premium en kies hoeveel wij van je overnemen.'],
    ['02', 'Betaal veilig', 'De eenmalige bouwprijs en de eerste maand beheer worden samen afgerekend via Stripe.'],
    ['03', 'Vul de intake in', 'Je levert aanbod, doelgroep, voorkeuren, logo en beschikbare beelden aan. Dan start de termijn.'],
    ['04', 'Bekijk de eerste versie', 'Binnen 48 uur ontvang je de eerste werkende versie. Daarna verwerken we de correctieronde van je pakket.'],
  ]
  return (
    <>
      <section className="studio-section studio-delivery">
        <div className="studio-shell studio-delivery__grid">
          <div><p className="overline">Wat je ontvangt</p><h2>Geen losse homepage. Een werkende verkooproute.</h2><p>Ontwerp, bouw, formulier, techniek en beheer komen bij één partij samen.</p></div>
          <ul>{delivery.map((item, index) => <li key={item}><span>0{index + 1}</span>{item}</li>)}</ul>
        </div>
      </section>
      <section className="studio-section studio-process">
        <div className="studio-shell section-heading section-heading--row"><div><p className="overline">Werkwijze</p><h2>Van keuze naar eerste versie in vier stappen.</h2></div><p>De 48 uur starten na succesvolle betaling en zodra de intake compleet en bruikbaar is.</p></div>
        <ol className="process-steps studio-shell">{process.map(([number, title, text]) => <li key={number}><span>{number}</span><h3>{title}</h3><p>{text}</p></li>)}</ol>
      </section>
    </>
  )
}

export function Pricing() {
  const entries = Object.entries(commercialConfig.packages) as Array<[CommercialPackageId, typeof commercialConfig.packages[CommercialPackageId]]>
  return (
    <section className="studio-section studio-pricing" id="pakketten" data-analytics-view="package_view">
      <div className="studio-shell section-heading section-heading--row">
        <div><p className="overline">Pakketten</p><h2>Eerst bouwen. Daarna blijven we zorgen dat alles werkt.</h2></div>
        <p>Je betaalt eenmalig voor de bouw en daarna €{commercialConfig.management.monthlyPrice} per maand voor hosting en websitebeheer.</p>
      </div>
      <div className="studio-shell pricing-grid">
        {entries.map(([id, item]) => (
          <article className={`pricing-option${id === 'pro' ? ' pricing-option--focus' : ''}`} key={id}>
            <header>
              <div><span>{id === 'pro' ? 'Aanbevolen keuze' : `0${entries.findIndex(([key]) => key === id) + 1}`}</span><h3>{item.name}</h3></div>
              <p>{item.audience}</p>
            </header>
            <div className="pricing-option__price"><strong>€{item.oneTimePrice}</strong><span>eenmalig · excl. btw</span></div>
            <div className="pricing-option__today"><span>Vandaag bij start</span><strong>€{packageFirstPayment(id)} excl. btw</strong><small>inclusief eerste maand beheer</small></div>
            <ul>{item.features.map((feature) => <li key={feature}>{feature}</li>)}</ul>
            <Link className={`button ${id === 'pro' ? 'button--primary' : 'button--outline'} button--full`} href={`/start?pakket=${id}`} data-analytics-event="package_select" data-analytics-package={id}>Kies {item.name}</Link>
          </article>
        ))}
      </div>
      <div className="studio-shell pricing-after"><strong>Daarna wordt alleen €{commercialConfig.management.monthlyPrice} per maand voor Hosting & Websitebeheer geïncasseerd.</strong><span>Exclusief btw · maandelijks opzegbaar tegen het einde van de lopende betaalperiode.</span></div>
    </section>
  )
}

export function ManagementAndComparison() {
  const management = commercialConfig.management
  return (
    <>
      <section className="studio-section studio-management" id="beheer">
        <div className="studio-shell studio-management__grid">
          <div><p className="overline">Hosting & Websitebeheer</p><h2>Gebouwd is niet hetzelfde als geregeld.</h2><p>Na oplevering hoef je niet zelf uit te zoeken waar de website draait, wie updates uitvoert of waarom een formulier niet meer aankomt.</p><div className="management-price"><strong>€{management.monthlyPrice}</strong><span>per maand · excl. btw</span></div></div>
          <div className="management-details">
            <p>Wij beheren hosting, SSL, back-ups, beveiligingsupdates, technische updates, monitoring en controle van het aanvraagformulier.</p>
            <dl>
              <div><dt>Kleine wijzigingen</dt><dd>Maximaal {management.includedChangeMinutes} minuten per maand</dd></div>
              <div><dt>Ongebruikte tijd</dt><dd>Wordt niet opgespaard</dd></div>
              <div><dt>Opzegging</dt><dd>Maandelijks, aan het einde van de betaalperiode</dd></div>
              <div><dt>Domein</dt><dd>Blijft eigendom van jou</dd></div>
            </dl>
            <p className="management-note">Nieuwe pagina’s, functies of een redesign vallen niet onder de maandelijkse wijzigingstijd. Grotere uitbreidingen prijzen we vooraf.</p>
          </div>
        </div>
      </section>
      <section className="studio-section studio-comparison">
        <div className="studio-shell studio-comparison__grid">
          <div><p className="overline">De praktische keuze</p><h2>Los opleveren of samen verantwoordelijk blijven.</h2></div>
          <div className="comparison-table" role="table" aria-label="Vergelijking traditioneel los project en Landingsite">
            <div role="row"><span role="columnheader">Los project</span><strong role="columnheader">Landingsite</strong></div>
            <div role="row"><span role="cell">Prijs na offerte</span><strong role="cell">Vooraf vaste bouwprijs</strong></div>
            <div role="row"><span role="cell">Planning per project</span><strong role="cell">Eerste versie binnen 48 uur na complete intake</strong></div>
            <div role="row"><span role="cell">Hosting zelf regelen</span><strong role="cell">Hosting en onderhoud bij één partij</strong></div>
            <div role="row"><span role="cell">Wijzigingen los factureren</span><strong role="cell">20 minuten kleine wijziging per maand inbegrepen</strong></div>
          </div>
        </div>
      </section>
    </>
  )
}

export function FAQAndClose({ faqs }: { faqs: StudioFaq[] }) {
  return (
    <>
      <section className="studio-section studio-faq" id="faq">
        <div className="studio-shell studio-faq__grid"><div><p className="overline">Voor je begint</p><h2>Heldere antwoorden. Geen verrassingen bij checkout.</h2></div><FAQList items={faqs} /></div>
      </section>
      <section className="studio-section studio-close">
        <div className="studio-shell studio-close__inner"><div><p className="overline">Klaar om te starten?</p><h2>Van idee naar een website die werkt.</h2><p>Kies je pakket, rond de betaling af en vul daarna de intake in. Binnen 48 uur ontvang je de eerste werkende versie.</p></div><div><Link className="button button--primary" href="/start" data-analytics-event="hero_start_click" data-analytics-location="closing">Start mijn website</Link><a href="#contact">Eerst kort overleggen</a><span>Vanaf €299 eenmalig · daarna €79 p/m · excl. btw</span></div></div>
      </section>
      <section className="studio-section studio-contact" id="contact">
        <div className="studio-shell studio-contact__grid"><div><p className="overline">Eerst overleggen</p><h2>Vertel kort wat je wilt laten bouwen.</h2><p>Je ontvangt duidelijk advies over het pakket dat past. Je hoeft nog niets te betalen.</p></div><ContactForm /></div>
      </section>
    </>
  )
}
