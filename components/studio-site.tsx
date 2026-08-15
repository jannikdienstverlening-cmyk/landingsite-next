import Image from 'next/image'
import Link from 'next/link'
import {
  type ActivePromotion,
  commercialConfig,
  effectiveBuildPrice,
  effectiveFirstPayment,
  packageFirstPayment,
  promotionDiscount,
  packageSpecs,
  type CommercialPackageId,
} from '@/config/commercial'
import type { PortfolioProject } from '@/data/portfolio'
import { portfolioProjects } from '@/data/portfolio'
import { siteCopy } from '@/content/site'
import { seoPage } from '@/content/seo-pages'
import { BUSINESS } from '@/lib/business'
import { ContactForm, FAQList, MobileNavigation } from './site-interactions'
import { Logo } from './logo'
import { SiteChatbot } from './site-chatbot'

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
            <p>Websites en landingspagina’s voor Nederlandse zzp’ers en mkb-dienstverleners.</p>
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

export function BrowserFrame({ project, priority = false }: { project: PortfolioProject; priority?: boolean }) {
  return (
    <div className="browser-frame">
      <div className="browser-frame__bar" aria-hidden="true"><i /><i /><i /><span>{project.domain}</span></div>
      <div className="browser-frame__image">
        <Image
          src={project.image}
          alt={project.imageAlt}
          fill
          sizes="(max-width: 760px) 94vw, 64vw"
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

export function StudioHero({ promotion }: { promotion: ActivePromotion | null }) {
  const featured = portfolioProjects[0]
  const additionalProjects = portfolioProjects.slice(1)
  const homepage = seoPage('/')
  return (
    <section className="studio-hero">
      {promotion && <div className="studio-promotion" role="region" aria-label="Tijdelijke zomeractie">
        <div className="studio-shell studio-promotion__inner">
          <strong>Zomeractie · t/m {promotion.displayEndsAt}</strong>
          <span>Eerst je ontwerp bekijken · Starter gratis gebouwd · €300 korting op Pro en Premium.</span>
          <Link href="#pakketten" data-analytics-event="promotion_select">Bekijk alle actieprijzen <span aria-hidden="true">→</span></Link>
        </div>
      </div>}
      <div className="studio-shell studio-hero__grid">
        <div className="studio-hero__copy">
          <p className="overline">{promotion ? `Zomeractie tot en met ${promotion.displayEndsAt}` : 'Websites voor zzp en mkb'}</p>
          <h1>{promotion ? <>Eerst zien wat we bouwen. <span className="studio-hero__accent">Daarna pas live.</span></> : homepage.h1}</h1>
          <p className="studio-hero__intro">
            {promotion
              ? <>Tijdens de zomeractie bouwen we Starter zonder bouwkosten. Je start met Hosting &amp; Websitebeheer voor €{commercialConfig.management.monthlyPrice} per maand. Na betaling en een complete intake ontvang je binnen 48 uur de eerste werkende versie. Jij beoordeelt die versie voordat we publiceren.</>
              : <>Wil je een website laten maken voor je bedrijf? Landingsite bouwt websites en landingspagina’s waarop bezoekers snel begrijpen wat je aanbiedt en hoe ze contact opnemen. Je ontvangt de eerste werkende versie binnen 48 uur na betaling en een complete intake.</>}
          </p>
          <div className="studio-actions">
            <Link className="button button--primary" href={promotion ? '/start?pakket=starter' : '/start'} data-analytics-event={promotion ? 'promotion_select' : 'hero_start_click'} data-analytics-location="hero">Start mijn website</Link>
            <a className="button button--text" href="#werk" data-analytics-event="hero_work_click">Bekijk live werk <span aria-hidden="true">↘</span></a>
          </div>
          {promotion && <div className="studio-promo-offer" aria-label="Actieprijs Starter">
            <div className="studio-promo-offer__price">
              <span><s>€{commercialConfig.packages.starter.oneTimePrice}</s> bouwkosten</span>
              <strong>€{promotion.buildPrices.starter}</strong>
            </div>
            <div className="studio-promo-offer__terms">
              <strong>Eerste versie bekijken voor €{commercialConfig.management.monthlyPrice} incl. btw</strong>
              <span>Niets gaat live voordat jij de eerste versie hebt beoordeeld</span>
              <span>Daarna €{commercialConfig.management.monthlyPrice} p/m · maandelijks opzegbaar</span>
              <span>Actie geldig t/m {promotion.displayEndsAt}</span>
            </div>
          </div>}
          <p className="studio-hero__micro">{promotion ? <>Inbegrepen: één landingspagina · maximaal zeven secties · formulier · mobiel ontwerp · één correctieronde</> : <>Bouw vanaf €{commercialConfig.packages.starter.oneTimePrice} · daarna €{commercialConfig.management.monthlyPrice} p/m voor Hosting &amp; Websitebeheer · incl. btw</>}</p>
          <p className="studio-hero__trust">{promotion ? 'Je bekijkt de eerste versie vóór publicatie · domein blijft van jou · beheer maandelijks opzegbaar' : 'Vaste prijzen · domein blijft van jou · maandelijks opzegbaar beheer'}</p>
        </div>

        <article className="hero-case" aria-labelledby="hero-case-title">
          <a className="hero-case__desktop" href={featured.url} target="_blank" rel="noopener noreferrer" data-analytics-event="case_outbound_click" data-analytics-project={featured.slug}>
            <BrowserFrame project={featured} priority />
          </a>
          <div className="hero-case__mobile" aria-hidden="true"><MobileProjectFrame project={featured} priority /></div>
          <div className="hero-case__caption">
            <div><span>Actuele hoofdcase</span><h2 id="hero-case-title">{featured.name}</h2></div>
            <ul>{featured.features.slice(0, 3).map((feature) => <li key={feature}>{feature}</li>)}</ul>
            <a href={featured.url} target="_blank" rel="noopener noreferrer" data-analytics-event="case_outbound_click" data-analytics-project={featured.slug}>Open {featured.domain} <span aria-hidden="true">↗</span></a>
          </div>
        </article>
      </div>

      <div className="studio-shell trust-line" role="list" aria-label="Belangrijkste zekerheden">
        <span role="listitem">Eerste versie binnen 48 uur*</span>
        <span role="listitem">Transparante vaste prijzen</span>
        <span role="listitem">Mobiel ontworpen</span>
        <span role="listitem">Direct persoonlijk contact</span>
      </div>
      <div className="studio-shell project-proof" id="werk">
        <div className="project-proof__intro"><p className="overline">Meer gebouwd werk</p><h2>Nog twee websites die daadwerkelijk online staan.</h2></div>
        <div className="project-proof__list">
          {additionalProjects.map((project, index) => (
            <a href={project.url} target="_blank" rel="noopener noreferrer" key={project.slug} data-analytics-event="case_outbound_click" data-analytics-project={project.slug}>
              <span>{String(index + 2).padStart(2, '0')}</span>
              <Image src={project.image} alt="" width={128} height={80} sizes="128px" loading="lazy" />
              <span className={`project-proof__name${project.name.length > 20 ? ' project-proof__name--long' : ''}`}>
                <strong>{project.name}</strong>
                <small>{project.industry}</small>
              </span>
              <i aria-hidden="true">↗</i>
            </a>
          ))}
        </div>
        <Link href="/werk" className="project-proof__all" data-analytics-event="case_view">Bekijk de cases met screenshots en toelichting</Link>
      </div>
    </section>
  )
}

export function ProblemSection() {
  const observations = [
    ['Het is niet direct duidelijk wat je verkoopt.', 'Bezoekers moeten zoeken naar je aanbod, doelgroep en de reden om verder te lezen. Daardoor ontstaat twijfel voordat je verhaal op gang komt.'],
    ['Je bewijs staat te laat of ontbreekt.', 'Werk, uitleg en concrete details moeten zichtbaar zijn op het moment dat iemand je geloofwaardigheid beoordeelt.'],
    ['Contact opnemen vraagt te veel moeite.', 'Een onduidelijke vervolgstap of een te lang formulier maakt interesse onnodig zwaar.'],
  ]
  return (
    <section className="studio-section studio-problem">
      <div className="studio-shell studio-problem__grid">
        <div><p className="overline">Waar bezoekers afhaken</p><h2>Waarom veel websites weinig opleveren.</h2></div>
        <div className="problem-observations">
          {observations.map(([title, text]) => <article key={title}><h3>{title}</h3><p>{text}</p></article>)}
        </div>
      </div>
    </section>
  )
}

export function DeliveryAndProcess({ promotion }: { promotion: ActivePromotion | null }) {
  const delivery = [
    ['Aanbod en structuur', 'We brengen terug wat je verkoopt, voor wie het bedoeld is en welke volgorde bezoekers nodig hebben.'],
    ['Tekst en ontwerp', 'De inhoud wordt aangescherpt en vormgegeven voor mobiel, tablet en desktop.'],
    ['Formulier en basis-SEO', 'Je krijgt een werkende aanvraagroute, metadata en een technische basiscontrole.'],
    ['Livegang en beheer', 'We helpen met de domeinkoppeling en blijven daarna verantwoordelijk voor hosting en techniek.'],
  ]
  const process = [
    ['01', 'Kies je pakket', 'Je ziet vooraf wat is inbegrepen en wat je bij de start betaalt.'],
    ['02', 'Betaal veilig', promotion ? 'Voor Starter betaal je tijdens de actie alleen de eerste maand Hosting & Websitebeheer van €79.' : 'De bouwprijs en de eerste maand Hosting & Websitebeheer worden samen afgerekend.'],
    ['03', 'Vul de intake in', 'Je levert je aanbod, doelgroep, logo, teksten en beschikbare beelden aan. De termijn start zodra de intake compleet is.'],
    ['04', 'Bekijk de eerste versie', 'Binnen 48 uur ontvang je de eerste werkende versie. Daarna verwerken we de correctieronde die bij je pakket hoort.'],
  ]
  return (
    <>
      <section className="studio-section studio-delivery">
        <div className="studio-shell studio-delivery__grid">
          <div><p className="overline">Wat je ontvangt</p><h2>Van positionering tot een werkend formulier.</h2><p>De onderdelen worden als één website gebouwd, niet als een verzameling losse toevoegingen.</p></div>
          <div className="delivery-list">{delivery.map(([title, text]) => <article key={title}><h3>{title}</h3><p>{text}</p></article>)}</div>
        </div>
      </section>
      <section className="studio-section studio-process" id="aanpak">
        <div className="studio-shell section-heading section-heading--row"><div><p className="overline">Werkwijze</p><h2>Van pakketkeuze naar eerste versie.</h2></div><p>Na akkoord koppelen we je domein en blijft Landingsite de website technisch beheren.</p></div>
        <ol className="process-steps studio-shell">{process.map(([number, title, text]) => <li key={number}><span>{number}</span><h3>{title}</h3><p>{text}</p></li>)}</ol>
      </section>
    </>
  )
}

export function Pricing({ promotion }: { promotion: ActivePromotion | null }) {
  const entries = Object.entries(commercialConfig.packages) as Array<[CommercialPackageId, typeof commercialConfig.packages[CommercialPackageId]]>
  return (
    <section className="studio-section studio-pricing" id="pakketten" data-analytics-view="pricing_view">
      <div className="studio-shell section-heading section-heading--row">
        <div><p className="overline">Pakketten</p><h2>Eerst bouwen. Daarna zorgen we dat alles blijft werken.</h2></div>
        <p>{promotion ? <>Starter wordt gratis gebouwd; op Pro en Premium krijg je €300 korting. De eerste maand Hosting &amp; Websitebeheer van €{commercialConfig.management.monthlyPrice} wordt bij de start afgerekend.</> : <>Je betaalt eenmalig voor de bouw en daarna €{commercialConfig.management.monthlyPrice} per maand voor Hosting &amp; Websitebeheer.</>}</p>
      </div>
      <div className="studio-shell pricing-grid">
        {entries.map(([id, item]) => {
          const promotionalPackage = Boolean(promotion)
          const buildPrice = promotionalPackage ? effectiveBuildPrice(id) : item.oneTimePrice
          const firstPayment = promotionalPackage ? effectiveFirstPayment(id) : packageFirstPayment(id)
          const discount = promotionalPackage ? promotionDiscount(id) : 0
          return (
          <article className={`pricing-option${item.recommended ? ' pricing-option--focus' : ''}${promotionalPackage ? ' pricing-option--promotion' : ''}`} key={id}>
            <header>
              <div>{item.recommended && <span>Aanbevolen</span>}<h3>{item.name}</h3></div>
              <p>{item.audience}</p>
            </header>
            <div className={`pricing-option__price${promotionalPackage ? ' pricing-option__price--promotion' : ''}`}>
              {promotionalPackage && <span className="promotion-label">Zomeractie · €{discount} korting · t/m {promotion?.displayEndsAt}</span>}
              <strong>{promotionalPackage && <s>€{item.oneTimePrice}</s>} €{buildPrice}</strong>
              <span>{promotionalPackage ? 'tijdelijke actieprijs · incl. btw' : 'eenmalige bouwprijs · incl. btw'}</span>
            </div>
            <div className="pricing-option__today">
              <span>+ €{commercialConfig.management.monthlyPrice} eerste maand beheer</span>
              <strong>Eerste betaling: €{firstPayment} incl. btw</strong>
              <small>Daarna €{commercialConfig.management.monthlyPrice} p/m incl. btw</small>
            </div>
            <dl className="pricing-specs">{packageSpecs(id).map((spec) => <div key={spec.label}><dt>{spec.label}</dt><dd>{spec.value}</dd></div>)}</dl>
            <ul>{item.features.map((feature) => <li key={feature}>{feature}</li>)}</ul>
            <Link className={`button ${item.recommended ? 'button--primary' : 'button--outline'} button--full`} href={item.ctaHref} data-analytics-event="package_select" data-analytics-package={id}>Kies {item.name}</Link>
          </article>
        )})}
      </div>
      <div className="studio-shell pricing-after"><strong>{promotion ? 'Bij ieder actiepakket zie je de eerste versie vóór publicatie. Daarna loopt alleen Websitebeheer door.' : `Daarna wordt alleen €${commercialConfig.management.monthlyPrice} per maand voor Hosting & Websitebeheer geïncasseerd.`}</strong><span>€{commercialConfig.management.monthlyPrice} inclusief btw · maandelijks opzegbaar tegen het einde van de lopende betaalperiode.</span></div>
    </section>
  )
}

export function ManagementSection() {
  const management = commercialConfig.management
  return (
    <section className="studio-section studio-management" id="beheer">
      <div className="studio-shell studio-management__grid">
        <div>
          <p className="overline">Hosting & Websitebeheer</p>
          <h2>Ook na oplevering blijft iemand verantwoordelijk.</h2>
          <p>Na oplevering hoef je niet zelf uit te zoeken waar de website draait, wie updates uitvoert of waarom een formulier niet meer aankomt.</p>
          <div className="management-price"><strong>€{management.monthlyPrice}</strong><span>per maand · incl. btw</span></div>
        </div>
        <div className="management-details">
          <ul>{management.features.map((feature) => <li key={feature}>{feature}</li>)}</ul>
          <dl>
            <div><dt>Ongebruikte tijd</dt><dd>Wordt niet opgespaard of overgedragen</dd></div>
            <div><dt>Opzegging</dt><dd>Maandelijks, aan het einde van de betaalperiode</dd></div>
            <div><dt>Domein</dt><dd>Blijft eigendom van jou</dd></div>
          </dl>
          <p className="management-note">Nieuwe pagina’s, functies, koppelingen, uitgebreide copy of een redesign vallen niet onder de maandelijkse wijzigingstijd. Grotere uitbreidingen prijzen we vooraf.</p>
        </div>
      </div>
    </section>
  )
}

export function FounderSection() {
  return (
    <section className="studio-section studio-founder" aria-labelledby="founder-title">
      <div className="studio-shell studio-founder__grid">
        <figure className="studio-founder__portrait">
          <Image
            src="/images/jannik-founder-studio.webp"
            alt="Jannik, oprichter en bouwer van Landingsite.nl"
            fill
            sizes="(max-width: 520px) 44vw, (max-width: 820px) 220px, 310px"
          />
          <figcaption>Jannik · oprichter en bouwer</figcaption>
        </figure>
        <div className="studio-founder__copy">
          <p className="overline">Eén aanspreekpunt</p>
          <h2 id="founder-title">Je spreekt met degene die je website bouwt.</h2>
          <p>Ik ben Jannik, oprichter van Landingsite.nl. Ik breng je aanbod terug tot een heldere website, bouw de pagina’s en controleer de aanvraagroute voordat je de eerste versie ontvangt.</p>
          <p>Geen overdracht via een accountmanager. Van intake tot livegang en beheer heb je rechtstreeks contact met mij.</p>
          <dl className="studio-founder__facts">
            <div><dt>Intake</dt><dd>Rechtstreeks besproken</dd></div>
            <div><dt>Bouw</dt><dd>Eén aanspreekpunt</dd></div>
            <div><dt>Na livegang</dt><dd>Beheer blijft geregeld</dd></div>
          </dl>
          <div className="studio-founder__actions">
            <Link className="button button--primary" href="/start" data-analytics-event="hero_start_click" data-analytics-location="founder">Start mijn website</Link>
            <Link href="/over-landingsite">Meer over Landingsite.nl <span aria-hidden="true">→</span></Link>
          </div>
        </div>
      </div>
    </section>
  )
}

export function FAQAndClose({ faqs, promotion }: { faqs: StudioFaq[]; promotion: ActivePromotion | null }) {
  return (
    <>
      <section className="studio-section studio-faq" id="faq">
        <div className="studio-shell studio-faq__grid"><div><p className="overline">Voor je begint</p><h2>Praktische antwoorden over planning, betaling en beheer.</h2></div><FAQList items={faqs} /></div>
      </section>
      <section className="studio-section studio-close">
        <div className="studio-shell studio-close__inner">
          <div><p className="overline">Klaar om te starten?</p><h2>Zet je website eindelijk goed neer.</h2><p>Kies je pakket, rond de betaling af en vul de intake in. Binnen 48 uur ontvang je de eerste werkende versie.</p></div>
          <div><Link className="button button--primary" href={promotion ? '/start?pakket=starter' : '/start'} data-analytics-event="hero_start_click" data-analytics-location="closing">Start mijn website</Link><a href="/werk" data-analytics-event="hero_work_click">Bekijk live werk</a><span>{promotion ? 'Starter: €0 bouw · start voor €79 · incl. btw' : 'Vanaf €299 eenmalig · daarna €79 p/m · incl. btw'}</span></div>
        </div>
      </section>
      <section className="studio-section studio-contact" id="contact">
        <div className="studio-shell studio-contact__grid"><div><p className="overline">Eerst een vraag?</p><h2>Stel je vraag rechtstreeks aan Jannik.</h2><p>Voor pakketkeuze en betaling gebruik je de startflow. Met dit korte formulier kun je eerst iets praktisch navragen.</p></div><ContactForm /></div>
      </section>
    </>
  )
}
