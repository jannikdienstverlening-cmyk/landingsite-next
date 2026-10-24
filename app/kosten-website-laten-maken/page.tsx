import type { Metadata } from 'next'
import Link from 'next/link'
import { PageProvenance, SeoPage, StartCta } from '@/components/seo-page'
import { amountExcludingVat, commercialConfig, euro, packageFirstPayment, websiteOffer, vatFor } from '@/config/commercial'
import { seoPage } from '@/content/seo-pages'
import { breadcrumbSchema, seoMetadata, serviceSchema } from '@/lib/seo'

const content = seoPage('/kosten-website-laten-maken')
export const metadata: Metadata = seoMetadata(content)
const entries = [[websiteOffer.packageId, websiteOffer]] as const

export default function WebsiteCostsPage() {
  const schema = { '@graph': [breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Kosten website laten maken', path: content.slug }]), serviceSchema('Kosten van een website laten maken', content.description, content.slug)] }
  return (
    <SeoPage breadcrumbs={[{ label: 'Kosten website laten maken', href: content.slug }]} schema={schema}>
      <header className="seo-hero">
        <div className="studio-shell seo-hero__grid">
          <div><p className="overline">Eén maandbedrag</p><h1>{content.h1}</h1><p className="seo-hero__intro">Je betaalt {euro(commercialConfig.management.monthlyPrice)} per maand inclusief btw. De bouw, hosting en het beheer zijn inbegrepen. Bij de start betaal je alleen de eerste maand. Er zijn geen eenmalige bouwkosten.</p></div>
          <dl className="seo-hero__facts"><div><dt>Bouw</dt><dd>Inbegrepen</dd></div><div><dt>Website en beheer</dt><dd>{euro(commercialConfig.management.monthlyPrice)} per maand</dd></div><div><dt>Opzegging</dt><dd>Per einde van de betaalperiode</dd></div></dl>
        </div>
        <div className="studio-shell"><StartCta compact /><PageProvenance updatedAt={content.updatedAt} /></div>
      </header>

      <section className="seo-section seo-light" data-analytics-view="pricing_view">
        <div className="studio-shell"><div className="section-heading"><p className="overline">Volledige berekening</p><h2>Wat betaal je bij de start en daarna?</h2><p>Stripe toont vóór bevestiging de factuurgegevens en het terugkerende bedrag. Onderstaande bedragen komen uit dezelfde centrale configuratie als de checkout.</p></div>
          <div className="seo-price-table-wrap"><table className="seo-price-table"><caption className="sr-only">Eerste maandbetaling, inbegrepen btw en maandbedrag voor website en beheer</caption><thead><tr><th scope="col">Aanbod</th><th scope="col">Bouw</th><th scope="col">Eerste betaling incl. btw</th><th scope="col">Waarvan btw</th><th scope="col">Excl. btw</th><th scope="col">Daarna</th></tr></thead><tbody>{entries.map(([id, item]) => { const initial = packageFirstPayment(id); return <tr key={id}><th scope="row">{item.name}</th><td data-label="Bouw">Inbegrepen</td><td data-label="Eerste betaling incl. btw"><strong>{euro(initial)}</strong></td><td data-label="Waarvan btw">{euro(vatFor(initial), 2)}</td><td data-label="Excl. btw">{euro(amountExcludingVat(initial), 2)}</td><td data-label="Daarna">{euro(commercialConfig.management.monthlyPrice)} p/m incl. btw</td></tr> })}</tbody></table></div>
        </div>
      </section>

      <section className="seo-section">
        <div className="studio-shell seo-section__split">
          <div className="seo-section__intro"><p className="overline">Dit zit erbij</p><h2>Eén aanbod voor je bedrijf.</h2><p>Websitebouw, hosting en beheer vallen onder hetzelfde maandbedrag. Er zijn geen verschillende pakketten om uit te kiezen.</p></div>
          <div className="seo-editorial-list"><article><h3>{websiteOffer.name}</h3><p>Maximaal {websiteOffer.pages} kernpagina’s, teksten op basis van de intake, een contactformulier en {websiteOffer.correctionRounds} gebundelde aanpassingsrondes.</p></article></div>
        </div>
      </section>

      <section className="seo-section seo-light">
        <div className="studio-shell seo-decision">
          <div><h2>In het maandbedrag</h2><ul>{commercialConfig.management.features.map((feature) => <li key={feature}>{feature}</li>)}</ul><p>Niet-gebruikte wijzigingstijd wordt niet meegenomen naar een volgende maand.</p></div>
          <div><h2>Mogelijke extra kosten</h2><ul><li>Domeinregistratie wanneer je die nog niet zelf hebt</li><li>Betaalde externe software, lettertypen of beeldmateriaal na voorafgaand akkoord</li><li>Nieuwe pagina’s, functies, koppelingen of uitgebreide aanvullende copy</li><li>Webshops, ledenomgevingen, meertaligheid, fotografie en grote migraties</li></ul><p>Grotere uitbreidingen worden vooraf apart geprijsd. We publiceren geen verzonnen gemiddelde marktprijzen.</p></div>
        </div>
      </section>

      <section className="seo-section">
        <div className="studio-shell seo-section__split"><div><p className="overline">Zelf aanleveren</p><h2>Goede input voorkomt extra werk.</h2><p>Je intake bevat je aanbod, doelgroep, feitelijke bedrijfsinformatie, logo en beschikbare beelden. Materiaal moet door jou rechtmatig gebruikt mogen worden.</p></div><div className="seo-editorial-list"><article><h3>Je teksten</h3><p>Ik werk je teksten uit op basis van de intake voor maximaal {websiteOffer.pages} kernpagina’s. Je controleert de inhoud en geeft je aanpassingen gebundeld door.</p></article><article><h3>Je beelden</h3><p>Lever je logo en beschikbare foto’s aan. Fotografie en betaalde externe beelden zijn niet inbegrepen.</p></article></div></div>
        <div className="studio-shell"><p className="section-link">Lees ook <Link href="/landingspagina-laten-maken">wat een landingspagina bevat</Link> en <Link href="/website-laten-maken-zzp">wat een zzp-website nodig heeft</Link>.</p><StartCta compact /></div>
      </section>
    </SeoPage>
  )
}
