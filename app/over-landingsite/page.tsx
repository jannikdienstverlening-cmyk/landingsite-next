import type { Metadata } from 'next'
import Link from 'next/link'
import { PageProvenance, SeoPage, StartCta } from '@/components/seo-page'
import { verifiedClaims } from '@/config/verified-claims'
import { seoPage } from '@/content/seo-pages'
import { BUSINESS, BUSINESS_ADDRESS } from '@/lib/business'
import { breadcrumbSchema, seoMetadata } from '@/lib/seo'

const content = seoPage('/over-landingsite')
export const metadata: Metadata = seoMetadata(content)

export default function AboutLandingsitePage() {
  const schema = {
    '@graph': [
      breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Over Landingsite.nl', path: content.slug }]),
      {
        '@type': 'Organization', '@id': `${BUSINESS.website}/#organization`, name: BUSINESS.brandName, legalName: BUSINESS.legalName,
        url: BUSINESS.website, taxID: BUSINESS.chamberOfCommerceNumber,
        address: { '@type': 'PostalAddress', streetAddress: BUSINESS.address.street, postalCode: BUSINESS.address.postalCode, addressLocality: BUSINESS.address.city, addressCountry: BUSINESS.address.countryCode },
        sameAs: Object.values(BUSINESS.social),
      },
    ],
  }
  return (
    <SeoPage breadcrumbs={[{ label: 'Over Landingsite.nl', href: content.slug }]} schema={schema}>
      <header className="seo-hero"><div className="studio-shell seo-hero__grid"><div><p className="overline">Jannik · Landingsite.nl</p><h1>{content.h1}</h1><p className="seo-hero__intro">Ik ben Jannik, oprichter van Landingsite.nl. Van pakketkeuze tot oplevering heb je contact met degene die de structuur, teksten en technische bouw uitvoert. Er is geen overdracht via een accountmanager.</p></div><dl className="seo-hero__facts"><div><dt>Onderneming</dt><dd>{BUSINESS.legalName}</dd></div><div><dt>KvK</dt><dd>{BUSINESS.chamberOfCommerceNumber}</dd></div><div><dt>Vestiging</dt><dd>{BUSINESS.address.city}</dd></div></dl></div><div className="studio-shell"><PageProvenance updatedAt={content.updatedAt} /></div></header>

      <section className="seo-section seo-light"><div className="studio-shell seo-trust-grid"><div><p className="overline">Waarom vaste pakketten</p><h2>De belangrijkste keuzes worden vooraf afgebakend.</h2><p>Een vaste prijs werkt alleen wanneer omvang, formulieren, copy en correctierondes duidelijk zijn. Daarom beschrijft ieder pakket wat wordt gebouwd en wat aanvullend werk is.</p><p>De korte doorlooptijd komt niet doordat controle wordt overgeslagen. Een vaste intake en herbruikbare technische basis voorkomen onnodige wachttijd. De planning begint pas wanneer betaling en bruikbare input compleet zijn.</p></div><dl className="seo-company-facts"><div><dt>Handelsnaam</dt><dd>{BUSINESS.brandName}</dd></div><div><dt>Juridische naam</dt><dd>{BUSINESS.legalName}</dd></div><div><dt>Adres</dt><dd>{BUSINESS_ADDRESS}</dd></div><div><dt>KvK</dt><dd>{BUSINESS.chamberOfCommerceNumber}</dd></div><div><dt>Website</dt><dd><a href={BUSINESS.website}>{BUSINESS.website}</a></dd></div></dl></div></section>

      <section className="seo-section"><div className="studio-shell seo-section__split"><div className="seo-section__intro"><p className="overline">Voor oplevering</p><h2>Wat altijd wordt gecontroleerd.</h2><p>Software en automatisering helpen bij uitwerking en technische herhaling. De uiteindelijke pagina wordt inhoudelijk en technisch beoordeeld voordat je de eerste versie ontvangt.</p></div><div className="seo-editorial-list"><article><h3>Inhoud</h3><p>Aanbod, doelgroep, call-to-action en feitelijke bedrijfsinformatie worden langs de intake gelegd.</p></article><article><h3>Weergave</h3><p>De pagina wordt gecontroleerd op mobiel, tablet en desktop, inclusief navigatie en formulieren.</p></article><article><h3>Techniek</h3><p>Metadata, headingstructuur, links, beveiligde verbinding en essentiële formulierwerking worden nagelopen.</p></article><article><h3>Grenzen</h3><p>Landingsite.nl garandeert geen omzet, leads, conversiepercentage of positie in zoekmachines.</p></article></div></div></section>

      <section className="seo-section seo-light"><div className="studio-shell seo-section__split"><div><p className="overline">Privacy en verantwoordelijkheid</p><h2>Je gegevens worden gebruikt voor je aanvraag en opdracht.</h2><p>Contactgegevens, betaling, intake en uploads worden verwerkt voor de bouw en het beheer van je website. De gebruikte leveranciers, bewaartermijnen en beveiligingsmaatregelen staan in het privacybeleid.</p><p><Link href="/privacybeleid">Lees het privacybeleid</Link> · <Link href="/algemene-voorwaarden">Bekijk de zakelijke voorwaarden</Link></p></div><div><p className="overline">Praktische vraag</p><h2>Geen verplichte verkoopafspraak.</h2><p>Je kunt zelfstandig een pakket kiezen en betalen. Heb je eerst een inhoudelijke vraag, dan gebruik je het korte contactformulier op de homepage.</p><p><Link href="/#contact">Stel eerst een vraag</Link> of bekijk <Link href="/werk">websites die al live staan</Link>.</p></div></div><div className="studio-shell"><StartCta compact /></div></section>
      {!verifiedClaims.publicReviews.publish && <p className="sr-only">Er worden geen reviews gepubliceerd zolang publicatie en herkomst niet zijn geverifieerd.</p>}
    </SeoPage>
  )
}
