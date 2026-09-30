import Image from 'next/image'
import Link from 'next/link'
import {
  type ActivePromotion,
  amountExcludingVat,
  commercialConfig,
  euro,
  packageFirstPayment,
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
import { FounderPortrait } from './founder-portrait'

export type StudioFaq = { question: string; answer: string }

export function StudioHeader() {
  return (
    <header className="studio-header">
      <div className="studio-shell studio-header__inner">
        <Logo />
        <nav className="studio-nav" aria-label="Hoofdnavigatie">
          <Link href="/#werk">Werk</Link>
          <Link href="/#pakketten">Pakketten</Link>
          <Link href="/#aanpak">Aanpak</Link>
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
          <p className="overline">Websites voor zzp en mkb</p>
          <h1>{promotion ? <>Eerst zien wat we bouwen. <span className="studio-hero__accent">Daarna pas live.</span></> : homepage.h1}</h1>
          <p className="studio-hero__intro">
            {promotion
              ? <>Een website voor je bedrijf, door Jannik gebouwd. Binnen {commercialConfig.firstVersion.hours} uur na betaling en een complete intake krijg je de eerste werkende versie. Jij kijkt mee en geeft akkoord voor de livegang.</>
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
              <strong>Start voor €{commercialConfig.management.monthlyPrice} incl. btw</strong>
              <span>De eerste maand Hosting &amp; Websitebeheer is inbegrepen</span>
              <span>Daarna €{commercialConfig.management.monthlyPrice} p/m incl. btw · maandelijks opzegbaar</span>
              <span>Actie geldig t/m {promotion.displayEndsAt}</span>
            </div>
          </div>}
          <p className="studio-hero__micro">{promotion ? <>Starter: één landingspagina met formulier en één correctieronde.</> : <>Bouw vanaf €{commercialConfig.packages.starter.oneTimePrice} · daarna €{commercialConfig.management.monthlyPrice} p/m voor Hosting &amp; Websitebeheer · incl. btw</>}</p>
          <p className="studio-hero__trust">{promotion ? 'Je bekijkt de eerste versie vóór publicatie · domein blijft van jou · beheer maandelijks opzegbaar' : 'Vaste prijzen · domein blijft van jou · maandelijks opzegbaar beheer'}</p>
        </div>

        <article className="hero-case" aria-labelledby="hero-case-title">
          <a className="hero-case__desktop" href={featured.url} target="_blank" rel="noopener noreferrer" data-analytics-event="case_outbound_click" data-analytics-project={featured.slug}>
            <BrowserFrame project={featured} priority sizes="(max-width: 820px) calc(100vw - 28px), (max-width: 1080px) calc(100vw - 64px), 640px" />
          </a>
          <div className="hero-case__mobile" aria-hidden="true"><MobileProjectFrame project={featured} /></div>
          <div className="hero-case__caption">
            <div><span>Actuele hoofdcase</span><h2 id="hero-case-title">{featured.name}</h2></div>
            <ul>{featured.features.slice(0, 3).map((feature) => <li key={feature}>{feature}</li>)}</ul>
            <a href={featured.url} target="_blank" rel="noopener noreferrer" data-analytics-event="case_outbound_click" data-analytics-project={featured.slug}>Open {featured.domain} <span aria-hidden="true">↗</span></a>
          </div>
        </article>
      </div>

      <div className="studio-shell trust-line" role="list" aria-label="Belangrijkste zekerheden">
        <span role="listitem">{commercialConfig.firstVersion.hours} uur na betaling en complete intake</span>
        <span role="listitem">Transparante vaste prijzen</span>
        <span role="listitem">Mobiel ontworpen</span>
        <span role="listitem">Direct persoonlijk contact</span>
      </div>
      <div className="studio-shell project-proof" id="werk">
        <div className="project-proof__intro"><h2>Ook door Landingsite gebouwd.</h2><Link href="/werk" data-analytics-event="case_view">Bekijk alle cases <span aria-hidden="true">↗</span></Link></div>
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
      </div>
    </section>
  )
}

export function ProcessSection() {
  const process = [
    ['1', 'Kies en lever aan', 'Je kiest je pakket en betaalt via Stripe. Daarna stuur je je diensten, teksten, logo en foto’s via de intake.'],
    ['2', 'Bekijk je website', `Binnen ${commercialConfig.firstVersion.hours} uur na betaling en een complete intake krijg je de eerste werkende versie. Je geeft je aanpassingen door; het aantal correctierondes staat bij je pakket.`],
    ['3', 'Geef akkoord', 'Pas na jouw akkoord koppelen we je domein. Daarna blijven we hosting, updates en kleine wijzigingen verzorgen.'],
  ]
  return (
      <section className="studio-section studio-process" id="aanpak">
        <div className="studio-shell section-heading"><h2>Jij vertelt. Jannik bouwt.</h2></div>
        <ol className="process-steps studio-shell">{process.map(([number, title, text]) => <li key={number}><span>{number}</span><h3>{title}</h3><p>{text}</p></li>)}</ol>
      </section>
  )
}

export function Pricing({ promotion }: { promotion: ActivePromotion | null }) {
  const entries = Object.entries(commercialConfig.packages) as Array<[CommercialPackageId, typeof commercialConfig.packages[CommercialPackageId]]>
  return (
    <section className="studio-section studio-pricing" id="pakketten" data-analytics-view="pricing_view">
      <div className="studio-shell section-heading section-heading--row">
        <div><p className="overline">Pakketten</p><h2>Wat heb je nodig?</h2></div>
        <p>{promotion ? <>Starter wordt gratis gebouwd; op Pro en Premium krijg je €300 korting. De eerste maand Hosting &amp; Websitebeheer van €{commercialConfig.management.monthlyPrice} wordt bij de start afgerekend.</> : <>Je betaalt eenmalig voor de bouw en daarna €{commercialConfig.management.monthlyPrice} per maand voor Hosting &amp; Websitebeheer.</>}</p>
      </div>
      <div className="studio-shell pricing-grid">
        {entries.map(([id, item]) => {
          const promotionalPackage = Boolean(promotion)
          const buildPrice = promotion ? promotion.buildPrices[id] : item.oneTimePrice
          const firstPayment = promotion ? buildPrice + commercialConfig.management.monthlyPrice : packageFirstPayment(id)
          const discount = item.oneTimePrice - buildPrice
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
              <small>{euro(amountExcludingVat(firstPayment), 2)} excl. btw</small>
              <small>Daarna €{commercialConfig.management.monthlyPrice} p/m incl. btw</small>
            </div>
            <dl className="pricing-specs">{packageSpecs(id).map((spec) => <div key={spec.label}><dt>{spec.label}</dt><dd>{spec.value}</dd></div>)}</dl>
            <details className="pricing-option__details">
              <summary>Alles in {item.name}<span aria-hidden="true">+</span></summary>
              <ul>{item.features.map((feature) => <li key={feature}>{feature}</li>)}</ul>
            </details>
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
          <h2>Je website blijft in beheer.</h2>
          <p>Een tekst aanpassen of een formulier dat niet aankomt? Je mailt Jannik. Hosting, updates en back-ups blijven geregeld voor het vaste maandbedrag.</p>
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
    <section className="studio-section studio-founder" id="over" aria-labelledby="founder-title">
      <div className="studio-shell studio-founder__grid">
        <FounderPortrait />
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
        <div className="studio-shell studio-faq__grid"><div><h2>Nog een vraag?</h2><p>Over betalen, de eerste versie of het beheer.</p><a href="#contact">Stel je vraag aan Jannik <span aria-hidden="true">↗</span></a></div><FAQList items={faqs} /></div>
      </section>
      <section className="studio-section studio-close">
        <div className="studio-shell studio-close__inner">
          <div><p className="overline">Klaar om te starten?</p><h2>Zet je website eindelijk goed neer.</h2><p>Kies je pakket, rond de betaling af en vul de intake in. Binnen 48 uur ontvang je de eerste werkende versie.</p></div>
          <div><Link className="button button--primary" href={promotion ? '/start?pakket=starter' : '/start'} data-analytics-event="hero_start_click" data-analytics-location="closing">Start mijn website</Link><a href="/werk" data-analytics-event="hero_work_click">Bekijk live werk</a><span>{promotion ? `Starter: €${promotion.buildPrices.starter} bouw · start voor €${commercialConfig.management.monthlyPrice} · incl. btw` : `Vanaf €${commercialConfig.packages.starter.oneTimePrice} eenmalig · daarna €${commercialConfig.management.monthlyPrice} p/m · incl. btw`}</span></div>
        </div>
      </section>
      <section className="studio-section studio-contact" id="contact">
        <div className="studio-shell studio-contact__grid"><div><p className="overline">Eerst een vraag?</p><h2>Stel je vraag rechtstreeks aan Jannik.</h2><p>Voor pakketkeuze en betaling gebruik je de startflow. Met dit korte formulier kun je eerst iets praktisch navragen.</p></div><ContactForm /></div>
      </section>
    </>
  )
}
