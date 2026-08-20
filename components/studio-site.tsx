import Image from 'next/image'
import Link from 'next/link'
import {
  type ActivePromotion,
  commercialConfig,
  amountExcludingVat,
  effectiveBuildPrice,
  effectiveFirstPayment,
  euro,
  orderPriceBreakdown,
  packageFirstPayment,
  promotionDiscount,
  packageSpecs,
  type CommercialPackageId,
} from '@/config/commercial'
import type { PortfolioProject } from '@/data/portfolio'
import { portfolioProjects } from '@/data/portfolio'
import { siteCopy } from '@/content/site'
import { BUSINESS } from '@/lib/business'
import { normalizeWhatsAppNumber } from '@/lib/whatsapp'
import { ContactForm, FAQList, MobileNavigation } from './site-interactions'
import { ConsentSettingsButton } from './consent-manager'
import { Logo } from './logo'
import { SiteChatbot } from './site-chatbot'
import { ProjectTourVideo } from './project-tour-video'

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
  const whatsappNumber = normalizeWhatsAppNumber(process.env.WHATSAPP_NUMBER)

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
            <Link href="/cookiebeleid">Cookiebeleid</Link>
            <Link href="/verwerkersovereenkomst">Verwerkersovereenkomst</Link>
            <Link href="/partner" data-analytics-event="partner_page_view">Partnerprogramma</Link>
          </nav>
          <nav aria-label="Sociale media">
            <strong>Volg</strong>
            <a href={BUSINESS.social.instagram} target="_blank" rel="noopener noreferrer">Instagram</a>
            <a href={BUSINESS.social.linkedin} target="_blank" rel="noopener noreferrer">LinkedIn</a>
            <a href={BUSINESS.social.tiktok} target="_blank" rel="noopener noreferrer">TikTok</a>
            <ConsentSettingsButton />
          </nav>
        </div>
        <div className="studio-shell studio-footer__bottom">
          <span>© {new Date().getFullYear()} Landingsite.nl</span>
          <span>Jannik Dienstverlening · KvK {BUSINESS.chamberOfCommerceNumber}</span>
        </div>
      </footer>
      <SiteChatbot whatsappNumber={whatsappNumber} />
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
  return (
    <section className="studio-hero">
      <div className="studio-shell studio-hero__grid">
        <div className="studio-hero__copy">
          <p className="overline">Websites voor zzp’ers en zakelijke dienstverleners</p>
          <h1>Website laten maken? <span className="studio-hero__accent">Bekijk binnen 48 uur eerst de werkende versie.</span></h1>
          <p className="studio-hero__intro">
            Kies een vast pakket, rond de intake online af en ontvang binnen 48 uur de eerste werkende versie. Geen verplichte belafspraak en geen verrassingen achteraf.
          </p>
          <div className="studio-actions">
            <Link className="button button--primary" href="/start" data-analytics-event="hero_start_click" data-analytics-location="hero">Start mijn website</Link>
            <a className="button button--text" href="#werk" data-analytics-event="hero_work_click">Bekijk live werk <span aria-hidden="true">↘</span></a>
          </div>
          <p className="studio-hero__micro">{promotion ? <>Zomeractie t/m {promotion.displayEndsAt}: Starter €{promotion.buildPrices.starter} bouwkosten · Pro en Premium €{promotionDiscount('pro')} korting · beheer €{commercialConfig.management.monthlyPrice} p/m · bedragen incl. btw</> : <>Bouw vanaf €{commercialConfig.packages.starter.oneTimePrice} · daarna €{commercialConfig.management.monthlyPrice} p/m voor Hosting &amp; Websitebeheer · incl. btw</>}</p>
          <p className="studio-hero__trust">Vaste prijzen · maandelijks opzegbaar · domein blijft van jou · persoonlijk aanspreekpunt</p>
        </div>

        <article className="hero-case" aria-labelledby="hero-case-title">
          <ProjectTourVideo
            src="/videos/ontwikkelbegeleiding-site-tour.webm"
            poster={featured.image}
            title="Korte rondleiding door de live website van Ontwikkelbegeleiding.nl"
          />
          <div className="hero-case__caption">
            <div><span>Opname van de live website</span><h2 id="hero-case-title">{featured.name}</h2><p>{featured.description}</p></div>
            <a href={featured.url} target="_blank" rel="noopener noreferrer" data-analytics-event="case_outbound_click" data-analytics-project={featured.slug}>Open {featured.domain} <span aria-hidden="true">↗</span></a>
          </div>
        </article>
      </div>

      <div className="studio-shell trust-line" role="list" aria-label="Belangrijkste zekerheden">
        <span role="listitem">48 uur na complete intake</span>
        <span role="listitem">Echte live cases</span>
        <span role="listitem">Online starten zonder gesprek</span>
        <span role="listitem">Persoonlijk gebouwd</span>
      </div>
      <div className="studio-shell project-proof" id="werk">
        <div className="project-proof__intro"><p className="overline">Live register</p><h2>Drie websites. Drie verschillende bedrijven. Zelf te openen.</h2></div>
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

export function DecisionSection() {
  const project = portfolioProjects[0]

  return (
    <section className="studio-section studio-case-note">
      <div className="studio-shell case-note">
        <figure>
          <blockquote>Meer rust en houvast voor je kind, thuis én op school.</blockquote>
          <figcaption>
            <span>Openingszin op</span>
            <a href={project.url} target="_blank" rel="noopener noreferrer" data-analytics-event="case_outbound_click" data-analytics-project={project.slug}>{project.domain} ↗</a>
          </figcaption>
        </figure>
        <div className="case-note__explanation">
          <h2>De bezoeker krijgt eerst antwoord.</h2>
          <p>De homepage opent met de situatie van ouders. Daarna volgt pas de uitleg over de begeleiding en de trajecten.</p>
          <p>De kennismakingsknop staat meteen in beeld. Op mobiel blijft dezelfde volgorde overeind, zonder dat belangrijke informatie wordt weggestopt.</p>
          <Link href={`/werk#${project.slug}`} data-analytics-event="case_view" data-analytics-project={project.slug}>Bekijk hoe deze website is opgebouwd <span aria-hidden="true">↘</span></Link>
        </div>
      </div>
    </section>
  )
}

export function ProcessSection({ promotion }: { promotion: ActivePromotion | null }) {
  const process = [
    ['Start', 'Kies je pakket', 'Je ziet vooraf wat inbegrepen is en welk bedrag je bij de start betaalt.'],
    ['Bevestigd', 'Betaal veilig', promotion ? `Je rekent de tijdelijke bouwprijs en €${commercialConfig.management.monthlyPrice} voor de eerste maand beheer samen af.` : 'De bouwprijs en de eerste maand Hosting & Websitebeheer worden samen afgerekend.'],
    ['0 uur', 'Intake compleet', 'De klok start zodra je aanbod, doelgroep, logo, teksten en beschikbare beelden bruikbaar zijn aangeleverd.'],
    ['Binnen 48 uur', 'Eerste versie', 'Je ontvangt een werkende versie om te bekijken. Daarna volgt de correctieronde die bij je pakket hoort.'],
  ]
  return (
    <section className="studio-section studio-process" id="aanpak">
      <div className="studio-shell process-intro"><p>Planning</p><h2>Van betaling naar eerste versie.</h2><p>De termijn begint niet bij je eerste klik, maar zodra betaling en intake compleet zijn.</p></div>
      <div className="studio-shell launch-schedule">
        <ol>{process.map(([time, title, text]) => <li key={time}><span>{time}</span><i aria-hidden="true" /><div><h3>{title}</h3><p>{text}</p></div></li>)}</ol>
        <p className="launch-schedule__after"><strong>Na je feedback</strong> Na akkoord koppelen we je domein en blijft Landingsite de hosting en techniek verzorgen.</p>
      </div>
    </section>
  )
}

export function Pricing({ promotion }: { promotion: ActivePromotion | null }) {
  const entries = Object.entries(commercialConfig.packages) as Array<[CommercialPackageId, typeof commercialConfig.packages[CommercialPackageId]]>
  return (
    <section className="studio-section studio-pricing" id="pakketten" data-analytics-view="view_item_list">
      <div className="studio-shell section-heading section-heading--row">
        <div><p className="overline">Pakketten</p><h2>Eerst bouwen. Daarna zorgen we dat alles blijft werken.</h2></div>
        <p>{promotion ? <>Starter wordt gratis gebouwd; op Pro en Premium krijg je €{promotionDiscount('pro')} korting. De eerste maand Hosting &amp; Websitebeheer van €{commercialConfig.management.monthlyPrice} wordt bij de start afgerekend.</> : <>Je betaalt eenmalig voor de bouw en daarna €{commercialConfig.management.monthlyPrice} per maand voor Hosting &amp; Websitebeheer.</>}</p>
      </div>
      <div className="studio-shell pricing-ledger">
        {entries.map(([id, item], index) => {
          const promotionalPackage = Boolean(promotion)
          const buildPrice = promotionalPackage ? effectiveBuildPrice(id) : item.oneTimePrice
          const firstPayment = promotionalPackage ? effectiveFirstPayment(id) : packageFirstPayment(id)
          const breakdown = orderPriceBreakdown(id)
          const discount = promotionalPackage ? promotionDiscount(id) : 0
          return (
          <article className={`pricing-row${item.recommended ? ' pricing-row--focus' : ''}${promotionalPackage ? ' pricing-row--promotion' : ''}`} key={id}>
            <header className="pricing-row__identity">
              <div><span>{String(index + 1).padStart(2, '0')}</span><h3>{item.name}</h3>{item.recommended && <em>Aanbevolen</em>}</div>
              <p>{item.audience}</p>
            </header>
            <div className={`pricing-row__price${promotionalPackage ? ' pricing-row__price--promotion' : ''}`}>
              {promotionalPackage && <span className="promotion-label">Actie · €{discount} korting · t/m {promotion?.displayEndsAt}</span>}
              <strong>{promotionalPackage && <s>€{item.oneTimePrice}</s>} €{buildPrice}</strong>
              <span>{promotionalPackage ? 'tijdelijke bouwprijs' : 'eenmalige bouwprijs'} · incl. btw</span>
              <small>{euro(amountExcludingVat(buildPrice), 2)} excl. btw</small>
            </div>
            <dl className="pricing-specs">{packageSpecs(id).map((spec) => <div key={spec.label}><dt>{spec.label}</dt><dd>{spec.value}</dd></div>)}</dl>
            <div className="pricing-row__checkout">
              <span>Bouw + eerste maand beheer</span>
              <strong>€{firstPayment}</strong>
              <small>incl. btw bij de start</small>
              <small>{euro(breakdown.total.excludingVat, 2)} excl. + {euro(breakdown.total.vat, 2)} btw</small>
              <small>Daarna €{commercialConfig.management.monthlyPrice} p/m incl. btw</small>
              <Link className={`button ${item.recommended ? 'button--primary' : 'button--outline'} button--full`} href={item.ctaHref} data-analytics-event="select_item" data-analytics-package={id}>Kies {item.name}</Link>
            </div>
            <details className="pricing-row__details">
              <summary>Alles in {item.name}</summary>
              <ul>{item.features.map((feature) => <li key={feature}>{feature}</li>)}</ul>
            </details>
          </article>
        )})}
      </div>
      <div className="studio-shell pricing-after"><strong>{promotion ? 'Bij ieder actiepakket zie je de eerste versie vóór publicatie. Daarna loopt alleen Websitebeheer door.' : `Daarna wordt alleen €${commercialConfig.management.monthlyPrice} per maand voor Hosting & Websitebeheer geïncasseerd.`}</strong><span>€{commercialConfig.management.monthlyPrice} incl. btw ({euro(amountExcludingVat(commercialConfig.management.monthlyPrice), 2)} excl. btw) · maandelijks opzegbaar tegen het einde van de lopende betaalperiode.</span></div>
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
          <div className="management-areas">{management.areas.map((area) => <article key={area.title}><h3>{area.title}</h3><p>{area.description}</p></article>)}</div>
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
        <figure className="studio-founder__portrait">
          <Image
            src="/images/jannik-founder-studio.webp"
            alt="Jannik, oprichter en bouwer van Landingsite.nl"
            fill
            loading="eager"
            unoptimized
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
          <div><Link className="button button--primary" href={promotion ? '/start?pakket=starter' : '/start'} data-analytics-event="hero_start_click" data-analytics-location="closing">Start mijn website</Link><a href="/werk" data-analytics-event="hero_work_click">Bekijk live werk</a><span>{promotion ? `Starter: €${promotion.buildPrices.starter} bouw · start voor €${effectiveFirstPayment('starter')} · incl. btw` : `Vanaf €${commercialConfig.packages.starter.oneTimePrice} eenmalig · daarna €${commercialConfig.management.monthlyPrice} p/m · incl. btw`}</span></div>
        </div>
      </section>
      <section className="studio-section studio-contact" id="contact">
        <div className="studio-shell studio-contact__grid"><div><p className="overline">Eerst een vraag?</p><h2>Stel je vraag rechtstreeks aan Jannik.</h2><p>Voor pakketkeuze en betaling gebruik je de startflow. Met dit korte formulier kun je eerst iets praktisch navragen.</p></div><ContactForm /></div>
      </section>
    </>
  )
}
