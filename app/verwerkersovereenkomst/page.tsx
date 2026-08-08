import type { Metadata } from 'next'
import Link from 'next/link'
import { BUSINESS, BUSINESS_ADDRESS } from '@/lib/business'

export const metadata: Metadata = {
  title: 'Verwerkersovereenkomst',
  description: 'Afspraken over persoonsgegevens binnen Hosting & Websitebeheer.',
  robots: { index: false, follow: true },
}

const subprocessors = [
  ['Vercel', 'Applicatiehosting en serverfuncties'],
  ['Supabase', 'Database en afgeschermde bestandsopslag'],
  ['Resend', 'Transactionele e-mail'],
  ['Netlify', 'Hosting van opgeleverde klantwebsites waar van toepassing'],
]

export default function ProcessorAgreementPage() {
  return (
    <main className="legal-page">
      <div className="container legal-shell">
        <Link href="/" className="legal-back">Terug naar Landingsite.nl</Link>
        <h1>Verwerkersovereenkomst</h1>
        <p className="updated">Versie 8 augustus 2026</p>
        <div className="legal-content">
          <section><h2>1. Partijen en toepasselijkheid</h2><p>Deze verwerkersovereenkomst geldt tussen de zakelijke klant als verwerkingsverantwoordelijke en {BUSINESS.legalName}, handelend onder {BUSINESS.brandName}, gevestigd aan {BUSINESS_ADDRESS}, als verwerker. Zij geldt zodra Landingsite.nl binnen actief Hosting &amp; Websitebeheer persoonsgegevens verwerkt die bezoekers via de website van de klant insturen.</p></section>
          <section><h2>2. Onderwerp en duur</h2><p>De verwerking bestaat uit het ontvangen, opslaan, technisch doorsturen, beveiligen, herstellen en verwijderen van websiteformuliergegevens. De verwerking duurt zolang Hosting &amp; Websitebeheer actief is en daarna alleen zolang bewaring noodzakelijk is voor overdracht, beveiliging of een wettelijke verplichting.</p></section>
          <section><h2>3. Gegevens en betrokkenen</h2><p>Het kan gaan om naam, zakelijke contactgegevens, formulierinhoud, technische loggegevens en andere gegevens die de klant bewust in het formulier laat opnemen. Betrokkenen zijn bezoekers, prospects en klanten van de klant. Bijzondere persoonsgegevens, BSN, medische gegevens en betaalgegevens mogen niet via een standaardformulier worden gevraagd zonder voorafgaande schriftelijke afspraken en passende extra maatregelen.</p></section>
          <section><h2>4. Instructies en doelen</h2><p>Landingsite.nl verwerkt de gegevens uitsluitend volgens gedocumenteerde instructies van de klant, voor het werkend houden van de website en het afleveren van aanvragen. Als een instructie volgens ons strijdig is met privacywetgeving, melden we dat voordat we haar uitvoeren. De klant bepaalt doelen, grondslagen, formulierinhoud, ontvangers en bewaartermijnen.</p></section>
          <section><h2>5. Vertrouwelijkheid en beveiliging</h2><p>Toegang is beperkt tot personen en systemen die deze voor hun taak nodig hebben. We gebruiken versleutelde verbindingen, afgeschermde serviceaccounts, private opslag, invoervalidatie, verzoeklimieten, beveiligingsheaders, back-ups en logging van relevante beheerhandelingen.</p></section>
          <section><h2>6. Subverwerkers</h2><p>De klant geeft algemene toestemming voor onderstaande categorieen subverwerkers. We blijven verantwoordelijk voor passende verwerkersafspraken en informeren bestaande klanten vooraf wanneer een wezenlijke nieuwe subverwerker wordt toegevoegd.</p><ul>{subprocessors.map(([name, purpose]) => <li key={name}><strong>{name}:</strong> {purpose}.</li>)}</ul></section>
          <section><h2>7. Doorgifte buiten de EER</h2><p>Wanneer een leverancier gegevens buiten de Europese Economische Ruimte verwerkt, gebruiken we een geldig doorgiftemechanisme en beoordelen we aanvullende beveiligingsmaatregelen waar dat nodig is.</p></section>
          <section><h2>8. Rechten, toezicht en incidenten</h2><p>We helpen de klant redelijkerwijs bij verzoeken van betrokkenen, beveiligingsbeoordelingen en vragen van toezichthouders. Een inbreuk in verband met persoonsgegevens melden we zonder onredelijke vertraging nadat deze is vastgesteld, met de informatie die op dat moment beschikbaar is.</p></section>
          <section><h2>9. Verwijderen, teruggeven en back-ups</h2><p>Na einde van de dienstverlening verwijderen of geven we persoonsgegevens terug volgens de instructie van de klant, behalve wanneer een wettelijke plicht langere bewaring vereist. Gegevens kunnen nog tijdelijk in beveiligde back-ups staan en worden daar volgens de normale rotatie verwijderd.</p></section>
          <section><h2>10. Controle en informatie</h2><p>We verstrekken op redelijk verzoek informatie die nodig is om naleving aan te tonen. Een audit wordt vooraf afgestemd, beschermt gegevens van andere klanten en veroorzaakt geen onredelijke verstoring. Kosten zijn voor de klant, tenzij de audit een wezenlijke tekortkoming van Landingsite.nl aantoont.</p></section>
          <section><h2>11. Voorrang en contact</h2><p>Bij tegenstrijdigheid over bezoekersgegevens gaat deze verwerkersovereenkomst voor op de algemene voorwaarden. Voor overige onderwerpen blijven de <Link href="/algemene-voorwaarden">algemene voorwaarden</Link> en het <Link href="/privacybeleid">privacybeleid</Link> gelden. Vragen of instructies kunnen via <Link href={BUSINESS.contactPath}>het contactformulier</Link> worden ingediend.</p></section>
        </div>
      </div>
    </main>
  )
}

