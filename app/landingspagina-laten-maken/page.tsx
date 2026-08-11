import type { Metadata } from 'next'
import Link from 'next/link'
import { BrowserFrame } from '@/components/studio-site'
import { FAQList } from '@/components/site-interactions'
import { PackageStrip, PageProvenance, SeoPage, StartCta } from '@/components/seo-page'
import { commercialConfig, euro, packageFirstPayment } from '@/config/commercial'
import { seoPage } from '@/content/seo-pages'
import { portfolioProjects } from '@/data/portfolio'
import { breadcrumbSchema, seoMetadata, serviceSchema } from '@/lib/seo'

const content = seoPage('/landingspagina-laten-maken')
const starter = commercialConfig.packages.starter

export const metadata: Metadata = seoMetadata(content)

const faqs = [
  { question: 'Wat is het verschil tussen een landing page en een website?', answer: 'Een landingspagina stuurt bezoekers naar één hoofdactie op één pagina. Een website verdeelt informatie over meerdere pagina’s en is geschikter wanneer je meerdere diensten, doelgroepen of uitgebreide bedrijfsinformatie hebt.' },
  { question: 'Kan de pagina worden gebruikt voor Google Ads?', answer: 'Ja, mits de inhoud en advertentie op elkaar aansluiten. We bouwen de pagina en het formulier; advertentiebeheer en een garantie op resultaten zijn niet inbegrepen.' },
  { question: 'Wat moet ik zelf aanleveren?', answer: 'Minimaal je aanbod, doelgroep, contactgegevens, logo, beschikbare beelden en feitelijk juiste informatie. In Starter scherpen we aangeleverde teksten aan binnen de afgesproken omvang.' },
  { question: 'Wanneer ontvang ik de eerste versie?', answer: 'Binnen 48 uur nadat de betaling is bevestigd en de intake compleet en bruikbaar is. Feedback, correcties en de domeinkoppeling kunnen daarna extra tijd vragen.' },
]

export default function LandingPageServicePage() {
  const example = portfolioProjects[1]
  const schema = {
    '@graph': [
      breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Landingspagina laten maken', path: content.slug }]),
      serviceSchema('Landingspagina laten maken', content.description, content.slug),
    ],
  }

  return (
    <SeoPage breadcrumbs={[{ label: 'Landingspagina laten maken', href: content.slug }]} schema={schema}>
      <header className="seo-hero">
        <div className="studio-shell seo-hero__grid">
          <div><p className="overline">Eén pagina · één hoofdactie</p><h1>{content.h1}</h1><p className="seo-hero__intro">Een landingspagina laat bezoekers zonder omwegen zien wat je aanbiedt, voor wie het bedoeld is en hoe ze reageren. Je krijgt indexeerbare HTML, een mobiele uitwerking en een formulier dat vóór oplevering wordt gecontroleerd.</p></div>
          <dl className="seo-hero__facts"><div><dt>Bouwprijs</dt><dd>{euro(starter.oneTimePrice)} incl. btw</dd></div><div><dt>Eerste betaling</dt><dd>{euro(packageFirstPayment('starter'))} incl. btw</dd></div><div><dt>Daarna</dt><dd>{euro(commercialConfig.management.monthlyPrice)} p/m incl. btw</dd></div></dl>
        </div>
        <div className="studio-shell"><StartCta compact /><PageProvenance updatedAt={content.updatedAt} /></div>
      </header>

      <section className="seo-section seo-light">
        <div className="studio-shell seo-decision">
          <div><h2>Wanneer één pagina genoeg is</h2><p>Een landingspagina past bij één dienst, campagne, inschrijving of concreet aanbod.</p><ul><li>Je wilt één primaire aanvraagroute.</li><li>Bezoekers komen met een duidelijke verwachting binnen.</li><li>De noodzakelijke uitleg past op één logisch opgebouwde pagina.</li></ul></div>
          <div><h2>Wanneer je meer nodig hebt</h2><p>Kies een compacte website wanneer bezoekers meerdere diensten moeten vergelijken of wanneer afzonderlijke pagina’s nodig zijn voor uitleg en vindbaarheid.</p><ul><li>Je hebt meerdere duidelijke diensten.</li><li>Portfolio, werkwijze en achtergrond vragen meer ruimte.</li><li>Meerdere zoekintenties verdienen een eigen pagina.</li></ul><p><Link href="/website-laten-maken-zzp">Lees wat een zzp-website minimaal nodig heeft</Link>.</p></div>
        </div>
      </section>

      <section className="seo-section">
        <div className="studio-shell seo-section__split">
          <div className="seo-section__intro"><p className="overline">Starter</p><h2>Dit wordt voor {euro(starter.oneTimePrice)} gebouwd.</h2><p>Starter bestaat uit maximaal zeven inhoudelijke secties. De precieze volgorde volgt uit je aanbod en de vragen die een bezoeker vóór contact moet beantwoorden.</p></div>
          <div className="seo-editorial-list">
            <article><h3>Aanbod en doelgroep</h3><p>De hero benoemt direct de dienst, de bedoelde klant en de volgende stap.</p></article>
            <article><h3>Uitleg en bewijs</h3><p>Voordelen, werkwijze, echte reviews of projecten en veelgestelde vragen krijgen een logische plek. Alleen aangeleverd en controleerbaar bewijs wordt gebruikt.</p></article>
            <article><h3>Formulier</h3><p>Eén contact- of leadformulier vraagt alleen informatie die nodig is om de aanvraag op te volgen.</p></article>
            <article><h3>Technische basis</h3><p>Mobiele weergave, title, meta description, headingstructuur en formulierwerking worden gecontroleerd.</p></article>
            <article><h3>Correctie</h3><p>Starter bevat één gebundelde correctieronde binnen de afgesproken paginaopbouw.</p></article>
          </div>
        </div>
      </section>

      <section className="seo-section seo-light">
        <div className="studio-shell seo-section__split">
          <div><p className="overline">Echt project</p><h2>Een duidelijke intake begint met begrijpelijke informatie.</h2><p>Bij {example.name} is een complex onderwerp teruggebracht tot herkenbare vragen, een uitlegbare route en een concrete vervolgstap. We claimen geen niet-gemeten bedrijfsresultaten.</p><p><Link href="/werk#wia-management" data-analytics-event="case_view" data-analytics-project={example.slug}>Bekijk de uitgewerkte case</Link></p></div>
          <BrowserFrame project={example} />
        </div>
      </section>

      <section className="seo-section">
        <div className="studio-shell"><div className="section-heading"><p className="overline">Ook andere omvang nodig?</p><h2>Vergelijk de drie bouwpakketten.</h2><p>Een landingspage is meestal Starter. Bij meerdere kernpagina’s, uitgebreidere teksten of meer formulieren past Pro of Premium beter.</p></div><PackageStrip /></div>
      </section>

      <section className="seo-section">
        <div className="studio-shell"><div className="section-heading"><p className="overline">Veel gevraagd</p><h2>Praktische antwoorden over een landingspagina.</h2></div><FAQList items={faqs} /><StartCta compact /></div>
      </section>
    </SeoPage>
  )
}
