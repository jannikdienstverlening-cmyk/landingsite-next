import type { Metadata } from 'next'
import Link from 'next/link'
import { BrowserFrame, MobileProjectFrame } from '@/components/studio-site'
import { PackageStrip, PageProvenance, SeoPage, StartCta } from '@/components/seo-page'
import { commercialConfig, euro } from '@/config/commercial'
import { seoPage } from '@/content/seo-pages'
import { portfolioProjects } from '@/data/portfolio'
import { breadcrumbSchema, seoMetadata, serviceSchema } from '@/lib/seo'

const content = seoPage('/website-laten-maken-zzp')
export const metadata: Metadata = seoMetadata(content)

export default function WebsiteForSoleTraderPage() {
  const example = portfolioProjects[0]
  const schema = { '@graph': [breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Website laten maken voor zzp', path: content.slug }]), serviceSchema('Website laten maken voor zzp', content.description, content.slug)] }
  return (
    <SeoPage breadcrumbs={[{ label: 'Website laten maken voor zzp', href: content.slug }]} schema={schema}>
      <header className="seo-hero">
        <div className="studio-shell seo-hero__grid">
          <div><p className="overline">Voor zelfstandigen en kleine dienstverleners</p><h1>{content.h1}</h1><p className="seo-hero__intro">Je kiest online een pakket, ziet vooraf de eerste betaling en levert je informatie aan via de beveiligde intake. Er is geen verplichte verkoopafspraak. Als iets inhoudelijk niet duidelijk is, nemen we daar gericht contact over op.</p></div>
          <dl className="seo-hero__facts"><div><dt>Starten</dt><dd>Pakket kiezen en veilig betalen</dd></div><div><dt>Aanleveren</dt><dd>Online intake na betaling</dd></div><div><dt>Eerste versie</dt><dd>Binnen 48 uur na complete intake</dd></div></dl>
        </div>
        <div className="studio-shell"><StartCta compact /><PageProvenance updatedAt={content.updatedAt} /></div>
      </header>

      <section className="seo-section seo-light">
        <div className="studio-shell seo-section__split">
          <div className="seo-section__intro"><p className="overline">De noodzakelijke basis</p><h2>Een kleine website moet vooral vragen beantwoorden.</h2><p>Een bezoeker wil weten wat je doet, of het bij zijn situatie past, waarom hij je kan vertrouwen en hoe contact opnemen werkt. Extra pagina’s zijn pas nuttig wanneer ze een eigen onderwerp of zoekvraag bedienen.</p></div>
          <div className="seo-editorial-list">
            <article><h3>Aanbod</h3><p>De dienst, doelgroep en belangrijkste uitkomst staan bovenaan in gewone taal.</p></article>
            <article><h3>Bewijs</h3><p>Echte projecten, ervaring, werkwijze of publiceerbare klantreacties ondersteunen je verhaal.</p></article>
            <article><h3>Praktische informatie</h3><p>Prijsrichting, planning en wat de klant aanlevert worden niet verstopt.</p></article>
            <article><h3>Contact</h3><p>Het formulier sluit aan op de informatie die je nodig hebt om een aanvraag te beoordelen.</p></article>
          </div>
        </div>
      </section>

      <section className="seo-section">
        <div className="studio-shell"><div className="section-heading section-heading--row"><div><p className="overline">Pakketten</p><h2>Kies hoeveel pagina’s en uitwerking je nodig hebt.</h2></div><p>Starter past bij één dienst. Pro biedt maximaal vier kernpagina’s. Premium gaat tot acht kernpagina’s en bevat een uitgebreidere inhoudelijke uitwerking.</p></div><PackageStrip /></div>
      </section>

      <section className="seo-section seo-light">
        <div className="studio-shell seo-section__split">
          <div><p className="overline">Vergelijkbaar project</p><h2>{example.name}</h2><p>{example.description}</p><p>Opgeleverd: {example.result}</p><p><Link href="/werk#ontwikkelbegeleiding-rh" data-analytics-event="case_view" data-analytics-project={example.slug}>Bekijk alle projectdetails</Link></p></div>
          <div className="work-detail__media"><BrowserFrame project={example} /><MobileProjectFrame project={example} /></div>
        </div>
      </section>

      <section className="seo-section">
        <div className="studio-shell seo-section__split">
          <div><p className="overline">Hosting & Websitebeheer</p><h2>Techniek blijft na oplevering geregeld.</h2><p>Voor {euro(commercialConfig.management.monthlyPrice)} per maand beheren we hosting, SSL, back-ups, updates, monitoring en formuliercontrole. Daarbij zit maximaal {commercialConfig.management.includedChangeMinutes} minuten voor een kleine tekst- of beeldwijziging per maand.</p></div>
          <div className="seo-editorial-list"><article><h3>Niet opgespaard</h3><p>Ongebruikte wijzigingstijd vervalt aan het einde van de betaalmaand.</p></article><article><h3>Grotere uitbreiding</h3><p>Nieuwe pagina’s, functies, koppelingen of een redesign worden vooraf apart geprijsd.</p></article><article><h3>Domein</h3><p>Je domeinnaam blijft van jou en je houdt waar mogelijk toegang tot de registrar.</p></article><article><h3>Opzegging</h3><p>Het beheer is maandelijks opzegbaar tegen het einde van de lopende betaalperiode.</p></article></div>
        </div>
        <div className="studio-shell"><p className="section-link"><Link href="/kosten-website-laten-maken">Bekijk de volledige kostenopbouw</Link></p><StartCta compact /></div>
      </section>
    </SeoPage>
  )
}
