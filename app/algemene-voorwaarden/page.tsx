import type { Metadata } from 'next'
import Link from 'next/link'
import { BUSINESS, BUSINESS_ADDRESS } from '@/lib/business'

export const metadata: Metadata = {
  title: 'Algemene voorwaarden',
  description: 'Voorwaarden voor de zakelijke dienstverlening van Landingsite.nl.',
  alternates: { canonical: '/algemene-voorwaarden' },
}

export default function TermsPage() {
  return (
    <main className="legal-page">
      <div className="container legal-shell">
        <Link href="/" className="legal-back">← Terug naar Landingsite.nl</Link>
        <h1>Algemene voorwaarden</h1>
        <p className="updated">Laatst bijgewerkt: 1 augustus 2026 · uitsluitend zakelijke dienstverlening</p>
        <div className="legal-content">
          <section><h2>1. Onderneming en toepassing</h2><p>{BUSINESS.brandName} wordt aangeboden door {BUSINESS.legalName}, gevestigd aan {BUSINESS_ADDRESS}, {BUSINESS.address.country}. KvK-nummer: {BUSINESS.chamberOfCommerceNumber}. Btw-identificatienummer: {BUSINESS.vatId}. Contact: <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a>. Deze voorwaarden gelden voor onze aanbiedingen en overeenkomsten voor het ontwerpen, publiceren, hosten, onderhouden en ondersteunen van websites en landingspagina’s voor zakelijke klanten.</p></section>
          <section><h2>2. Aanbod en overeenkomst</h2><p>De pakketpagina beschrijft de actuele scope, eenmalige bouwprijs en inbegrepen dienstverlening. Een overeenkomst komt tot stand wanneer de zakelijke klant via checkout betaalt, schriftelijk akkoord geeft op het gekozen pakket of een afzonderlijke offerte accepteert. Kennelijke fouten in prijzen of omschrijvingen binden ons niet.</p></section>
          <section><h2>3. Oplevertermijn</h2><p>De termijn van 48 uur betreft de eerste live preview en start pas wanneer het startgesprek, de benodigde input en eventuele akkoordstappen compleet zijn. Vertraging door ontbrekende informatie, onbereikbaarheid van de klant, overmacht of storing bij een externe dienst verlengt de termijn redelijkerwijs.</p></section>
          <section><h2>4. Verantwoordelijkheid voor input</h2><p>De klant staat in voor de juistheid en rechtmatigheid van teksten, logo’s, foto’s, reviews, persoonsgegevens en andere input. De klant bevestigt daarvoor de nodige rechten en toestemmingen te hebben. Deel geen bijzondere persoonsgegevens of vertrouwelijke informatie die niet nodig is voor de opdracht.</p></section>
          <section><h2>5. AI-ondersteuning</h2><p>We mogen AI gebruiken als hulpmiddel bij conceptcopy, structuur en optimalisatie. AI-output wordt niet ongecontroleerd gepubliceerd; menselijke controle blijft onderdeel van het proces. De klant blijft verantwoordelijk voor feitelijke controle van aangeleverde en gegenereerde inhoud vóór actieve inzet.</p></section>
          <section><h2>6. Pakketten en wijzigingen</h2><p>Starter, Pro en Premium verschillen in omvang, correctierondes, begeleiding en mate van maatwerk. Kleine wijzigingen vallen binnen de afgesproken correctierondes. Nieuwe pagina’s, nieuwe functionaliteit, volledig nieuw ontwerp of extra campagnes kunnen apart worden aangeboden.</p></section>
          <section><h2>7. Betaling en btw</h2><p>Vermelde pakketprijzen zijn eenmalige bouwprijzen exclusief btw, tenzij anders aangegeven. Bij niet-betaling, terugboeking of mislukte betaling mogen we werkzaamheden, support of publicatie opschorten totdat betaling is hersteld.</p></section>
          <section><h2>8. Hosting, onderhoud en domein</h2><p>Managed hosting is optioneel en kost €15 per maand exclusief btw. Hosting wordt alleen na apart akkoord geactiveerd en is maandelijks opzegbaar. De klant blijft eigenaar van de eigen domeinnaam en houdt toegang tot de domeinprovider. We helpen met de juiste domeinkoppeling, maar zijn niet verantwoordelijk voor vertraging of fouten bij registrars, DNS-providers of door de klant beheerde instellingen.</p></section>
          <section><h2>9. Intellectuele eigendom</h2><p>Na betaling mag de klant de specifiek opgeleverde website en copy voor het eigen bedrijf gebruiken. Rechten op onze generieke templates, systemen, workflows, bibliotheken en herbruikbare onderdelen blijven bij Landingsite.nl of de betreffende licentiegever. Open-source onderdelen blijven onder hun eigen licentie vallen.</p></section>
          <section><h2>10. Beschikbaarheid en externe diensten</h2><p>We spannen ons in voor een professionele en bereikbare publicatie. De dienst kan afhankelijk zijn van hostingplatforms, betaalproviders, e-maildiensten, AI-diensten, internet- en DNS-providers. Tijdelijke storing of onderhoud bij deze partijen is geen tekortkoming als we redelijk handelen om de dienstverlening te herstellen.</p></section>
          <section><h2>11. Resultaten en aansprakelijkheid</h2><p>We garanderen geen specifieke omzet, positie in zoekmachines, advertentieresultaten, leads of conversieratio. Voor zover wettelijk toegestaan is onze totale aansprakelijkheid beperkt tot het bedrag dat voor de betreffende opdracht is betaald. We zijn niet aansprakelijk voor indirecte schade, gemiste winst, gevolgschade of schade door onjuiste input, behalve bij opzet of bewuste roekeloosheid.</p></section>
          <section><h2>12. Opzegging en overdracht</h2><p>Een eenmalige opdracht kan na start niet vrijblijvend worden geannuleerd, omdat capaciteit direct wordt gereserveerd. Optionele managed hosting kan maandelijks worden opgezegd. Bij opzegging eindigen onderhoud, support en managed publicatie aan het einde van de betaalde periode, tenzij overdracht of voortzetting apart is afgesproken.</p></section>
          <section><h2>13. Klachten en recht</h2><p>Meld een klacht zo snel mogelijk via <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a>, met een concrete omschrijving. We proberen binnen tien werkdagen inhoudelijk te reageren. Nederlands recht is van toepassing; geschillen worden voorgelegd aan de bevoegde Nederlandse rechter, voor zover de wet dit toestaat.</p></section>
        </div>
      </div>
    </main>
  )
}
