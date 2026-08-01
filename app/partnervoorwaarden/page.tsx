import type { Metadata } from 'next'
import Link from 'next/link'
import { partnerProgramConfig } from '@/config/partner-program'
import { BUSINESS, BUSINESS_ADDRESS } from '@/lib/business'

export const metadata: Metadata = {
  title: 'Partnervoorwaarden',
  description: 'Voorwaarden voor deelname aan het Landingsite Partnerprogramma.',
  alternates: { canonical: '/partnervoorwaarden' },
  robots: { index: true, follow: true },
}

export default function PartnerTermsPage() {
  return <main className="legal-page"><div className="container legal-shell">
    <Link href="/partners" className="legal-back">← Terug naar het partnerprogramma</Link>
    <h1>Partnervoorwaarden</h1>
    <p className="updated">Versie 1 augustus 2026 · rekenvoorbeelden zijn geen inkomensgarantie</p>
    <div className="legal-content">
      <section><h2>1. Organisator en deelname</h2><p>Het programma wordt aangeboden door {BUSINESS.legalName}, handelend onder {BUSINESS.brandName}, gevestigd aan {BUSINESS_ADDRESS}. Deelname is gratis. Er geldt geen aankoopverplichting, startpakket of vergoeding voor het alleen registreren van partners.</p></section>
      <section><h2>2. Aanvraag en goedkeuring</h2><p>Een aanvraag krijgt eerst de status pending. We mogen identiteit, zakelijke gegevens, dubbele aanvragen, eerdere fraude en geschiktheid controleren. Pas na handmatige goedkeuring ontstaat een unieke partnercode. Een aanvraag geeft nog geen recht op commissie.</p></section>
      <section><h2>3. Geldige klant en attributie</h2><p>Een klant moet een echte ondernemer zijn, een bouwpakket afnemen en binnen {partnerProgramConfig.attributionWindowDays} dagen na een geldige verwijzing converteren. De eerste geldige geregistreerde introductie geldt, tenzij aantoonbaar anders is afgesproken. Zelfverwijzingen, misleiding, spam, cookie stuffing en kunstmatige constructies zijn niet toegestaan.</p></section>
      <section><h2>4. Wanneer commissie ontstaat</h2><p>Commissie ontstaat uitsluitend wanneer Websitebeheer actief is, de betreffende maandfactuur volledig is ontvangen, de wachttijd van {partnerProgramConfig.waitingPeriodDays} dagen is verstreken en geen refund, stornering, betalingsgeschil of fraudecontrole openstaat. Een bouwbetaling op zichzelf levert geen terugkerende commissie op.</p></section>
      <section><h2>5. Drie rollende niveaus</h2><p>Niveau 1 ontvangt €{partnerProgramConfig.commissions.level1}, niveau 2 €{partnerProgramConfig.commissions.level2} en niveau 3 €{partnerProgramConfig.commissions.level3} per geldige betaalde maand. Per abonnement wordt maximaal €{partnerProgramConfig.commissions.level1 + partnerProgramConfig.commissions.level2 + partnerProgramConfig.commissions.level3} over drie niveaus uitgekeerd. Voor iedere partner geldt een eigen rollend venster; niveau 4 en verder levert voor die specifieke partner geen commissie op.</p></section>
      <section><h2>6. Correcties en beëindiging</h2><p>Bij opzegging stopt toekomstige commissie zodra het betaalde Websitebeheer eindigt. Bij refund, stornering, dubbele boeking of fraude mogen openstaande en reeds geboekte bedragen worden gecorrigeerd of verrekend. Over een niet-ontvangen betaling bestaat geen aanspraak.</p></section>
      <section><h2>7. Uitbetaling en belasting</h2><p>Beschikbare bedragen worden maandelijks handmatig gecontroleerd. De minimumuitbetaling is €{partnerProgramConfig.minimumPayout}; lagere bedragen schuiven door. Automatische bankuitbetaling is nog niet actief. Partnervergoedingen zijn bruto; de deelnemer is zelf verantwoordelijk voor facturatie, aangifte en eventuele belasting- of btw-verplichtingen.</p></section>
      <section><h2>8. Promotie</h2><p>Partners communiceren eerlijk, gebruiken geen ongeoorloofde merknamen of advertenties en doen geen misleidende verdienstenclaims. Woorden of beelden die snel, eenvoudig of gegarandeerd inkomen suggereren zijn niet toegestaan. Landingsite.nl mag onjuiste promotie laten verwijderen.</p></section>
      <section><h2>9. Rekenvoorbeelden</h2><p>Het 5×5-voorbeeld met €475 per maand is hypothetisch. Het veronderstelt 155 actieve en volledig betaalde Websitebeheer-abonnementen in drie lagen. Het is geen voorspelling, gemiddelde of inkomensgarantie.</p></section>
      <section><h2>10. Privacy en administratie</h2><p>We verwerken partner-, verwijzings-, klant-, factuur- en controlegegevens zoals beschreven in het <Link href="/privacybeleid">privacybeleid</Link>. We gebruiken geen fingerprinting. Administratieve gegevens kunnen worden bewaard zolang dat nodig is voor controle, belasting en geschillen.</p></section>
      <section><h2>11. Wijziging, opschorting en einde</h2><p>We mogen deelname opschorten of beëindigen bij fraude, misleiding, misbruik, reputatieschade of overtreding. We mogen bedragen of voorwaarden voor toekomstige commissies wijzigen met een redelijke aankondiging. Reeds definitief verdiende bedragen blijven verschuldigd, behoudens correcties.</p></section>
      <section><h2>12. Vragen en recht</h2><p>Vragen kunnen naar <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a>. Nederlands recht is van toepassing. Geschillen worden voorgelegd aan de bevoegde Nederlandse rechter, voor zover dwingend recht niet anders bepaalt.</p></section>
    </div>
  </div></main>
}
