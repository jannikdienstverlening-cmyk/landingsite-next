import type { Metadata } from 'next'
import Link from 'next/link'
import { PageProvenance, SeoPage, StartCta } from '@/components/seo-page'
import { amountIncludingVat, commercialConfig, euro, packageFirstPayment, type CommercialPackageId, vatFor } from '@/config/commercial'
import { seoPage } from '@/content/seo-pages'
import { breadcrumbSchema, seoMetadata, serviceSchema } from '@/lib/seo'

const content = seoPage('/kosten-website-laten-maken')
export const metadata: Metadata = seoMetadata(content)
const entries = Object.entries(commercialConfig.packages) as Array<[CommercialPackageId, typeof commercialConfig.packages[CommercialPackageId]]>

export default function WebsiteCostsPage() {
  const schema = { '@graph': [breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Kosten website laten maken', path: content.slug }]), serviceSchema('Kosten van een website laten maken', content.description, content.slug)] }
  return (
    <SeoPage breadcrumbs={[{ label: 'Kosten website laten maken', href: content.slug }]} schema={schema}>
      <header className="seo-hero">
        <div className="studio-shell seo-hero__grid">
          <div><p className="overline">Prijsopbouw zonder verrassingen</p><h1>{content.h1}</h1><p className="seo-hero__intro">Je betaalt één keer voor de bouw en daarna maandelijks voor Hosting & Websitebeheer. De eerste beheermaand wordt samen met de bouwprijs afgerekend. Alle bedragen op deze pagina zijn exclusief btw.</p></div>
          <dl className="seo-hero__facts"><div><dt>Bouw</dt><dd>Vanaf {euro(commercialConfig.packages.starter.oneTimePrice)} eenmalig</dd></div><div><dt>Beheer</dt><dd>{euro(commercialConfig.management.monthlyPrice)} per maand</dd></div><div><dt>Opzegging</dt><dd>Per einde van de betaalperiode</dd></div></dl>
        </div>
        <div className="studio-shell"><StartCta compact /><PageProvenance updatedAt={content.updatedAt} /></div>
      </header>

      <section className="seo-section seo-light" data-analytics-view="pricing_view">
        <div className="studio-shell"><div className="section-heading"><p className="overline">Volledige berekening</p><h2>Wat betaal je bij de start en daarna?</h2><p>Stripe toont vóór bevestiging de factuurgegevens en het terugkerende bedrag. Onderstaande bedragen komen uit dezelfde centrale configuratie als de checkout.</p></div>
          <div className="seo-price-table-wrap"><table className="seo-price-table"><caption className="sr-only">Bouwprijs, eerste beheermaand, btw en maandbedrag per pakket</caption><thead><tr><th scope="col">Pakket</th><th scope="col">Bouw</th><th scope="col">Eerste maand beheer</th><th scope="col">Eerste betaling excl. btw</th><th scope="col">Btw</th><th scope="col">Vandaag incl. btw</th><th scope="col">Daarna</th></tr></thead><tbody>{entries.map(([id, item]) => { const initial = packageFirstPayment(id); return <tr key={id}><th scope="row">{item.name}</th><td data-label="Bouw">{euro(item.oneTimePrice)}</td><td data-label="Eerste maand beheer">{euro(commercialConfig.management.monthlyPrice)}</td><td data-label="Eerste betaling excl. btw"><strong>{euro(initial)}</strong></td><td data-label="Btw">{euro(vatFor(initial), 2)}</td><td data-label="Vandaag incl. btw">{euro(amountIncludingVat(initial), 2)}</td><td data-label="Daarna">{euro(commercialConfig.management.monthlyPrice)} p/m excl. btw</td></tr> })}</tbody></table></div>
        </div>
      </section>

      <section className="seo-section">
        <div className="studio-shell seo-section__split">
          <div className="seo-section__intro"><p className="overline">Waar het verschil zit</p><h2>De pakketprijs volgt uit omvang en uitwerking.</h2><p>De keuze gaat niet alleen over het aantal pagina’s. Ook de hoeveelheid copy, formulierlogica en correctierondes verschilt.</p></div>
          <div className="seo-editorial-list">{entries.map(([id, item]) => <article key={id}><h3>{item.name} · {euro(item.oneTimePrice)}</h3><p>{item.pages === 1 ? 'Eén landingspagina' : `Maximaal ${item.pages} kernpagina’s`}, {item.copyScope.toLocaleLowerCase('nl-NL')}, {item.formScope.toLocaleLowerCase('nl-NL')} en {item.correctionRounds} gebundelde correctieronde{item.correctionRounds === 1 ? '' : 's'}.</p></article>)}</div>
        </div>
      </section>

      <section className="seo-section seo-light">
        <div className="studio-shell seo-decision">
          <div><h2>In het maandbedrag</h2><ul>{commercialConfig.management.features.map((feature) => <li key={feature}>{feature}</li>)}</ul><p>Niet-gebruikte wijzigingstijd wordt niet meegenomen naar een volgende maand.</p></div>
          <div><h2>Mogelijke extra kosten</h2><ul><li>Domeinregistratie wanneer je die nog niet zelf hebt</li><li>Betaalde externe software, lettertypen of beeldmateriaal na voorafgaand akkoord</li><li>Nieuwe pagina’s, functies, koppelingen of uitgebreide aanvullende copy</li><li>Webshops, ledenomgevingen, meertaligheid, fotografie en grote migraties</li></ul><p>Grotere uitbreidingen worden vooraf apart geprijsd. We publiceren geen verzonnen gemiddelde marktprijzen.</p></div>
        </div>
      </section>

      <section className="seo-section">
        <div className="studio-shell seo-section__split"><div><p className="overline">Zelf aanleveren</p><h2>Goede input voorkomt extra werk.</h2><p>Je intake bevat je aanbod, doelgroep, feitelijke bedrijfsinformatie, logo en beschikbare beelden. De hoeveelheid tekstuitwerking verschilt per pakket. Materiaal moet door jou rechtmatig gebruikt mogen worden.</p></div><div className="seo-editorial-list"><article><h3>Starter</h3><p>Je levert basisteksten aan; die worden binnen de afgesproken pagina aangescherpt.</p></article><article><h3>Pro</h3><p>Teksten worden op basis van de intake uitgewerkt voor maximaal vier kernpagina’s.</p></article><article><h3>Premium</h3><p>Volledige websitecopy wordt binnen de afgesproken omvang uitgewerkt voor maximaal acht kernpagina’s.</p></article></div></div>
        <div className="studio-shell"><p className="section-link">Lees ook <Link href="/landingspagina-laten-maken">wat één landingspagina bevat</Link> en <Link href="/website-laten-maken-zzp">welk pakket bij een zzp-website past</Link>.</p><StartCta compact /></div>
      </section>
    </SeoPage>
  )
}
