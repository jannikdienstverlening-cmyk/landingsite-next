import type { Metadata } from 'next'
import Link from 'next/link'
import { BUSINESS, BUSINESS_ADDRESS } from '@/lib/business'

export const metadata: Metadata = {
  title: 'Privacybeleid voor klanten en bezoekers',
  description: 'Hoe Landingsite.nl persoonsgegevens van klanten, websitebezoekers en leads verwerkt en beschermt.',
  alternates: { canonical: '/privacybeleid' },
}

export default function PrivacyPage() {
  return (
    <main className="legal-page">
      <div className="container legal-shell">
        <Link href="/" className="legal-back">← Terug naar Landingsite.nl</Link>
        <h1>Privacybeleid</h1>
        <p className="updated">Laatst bijgewerkt: 1 augustus 2026</p>
        <div className="legal-content">
          <section><h2>1. Verantwoordelijke</h2><p>{BUSINESS.legalName}, handelend onder {BUSINESS.brandName}, is verwerkingsverantwoordelijke voor persoonsgegevens die we voor verkoop, administratie en onze eigen dienstverlening verwerken. Adres: {BUSINESS_ADDRESS}, {BUSINESS.address.country}. KvK: {BUSINESS.chamberOfCommerceNumber}. Btw-id: {BUSINESS.vatId}. Vragen of verzoeken kunnen via <Link href={BUSINESS.contactPath}>het contactformulier</Link> worden ingediend.</p></section>
          <section><h2>2. Welke gegevens we verwerken</h2><p>We kunnen naam, bedrijfsnaam, KvK- en btw-nummer, e-mail, telefoon, factuur- en adresgegevens, pakketkeuze, Stripe-klant-, checkout-, abonnement- en factuurreferenties, intake-antwoorden, uploads, correspondentie en technische beveiligingsgegevens verwerken. Voor het partnerprogramma verwerken we daarnaast aanvraagstatus, partnercode, verwijzingen, landingspagina, beperkte UTM-gegevens, gekoppelde klanten, commissieniveau, factuurstatus en controlebeslissingen. Betaalkaart-, bank- en IBAN-gegevens worden niet via het openbare partnerformulier gevraagd.</p></section>
          <section><h2>3. Waarom en op welke grondslag</h2><ul><li><strong>Overeenkomst:</strong> abonnement afsluiten, betaling verwerken, intake aanbieden, website bouwen, hosten, onderhouden en ondersteunen.</li><li><strong>Wettelijke verplichting:</strong> facturatie, belastingadministratie en het behandelen van formele verzoeken.</li><li><strong>Gerechtvaardigd belang:</strong> fraude en misbruik voorkomen, fouten onderzoeken, dienstverlening beveiligen en zakelijke klantrelaties onderhouden.</li><li><strong>Toestemming:</strong> alleen wanneer we daar afzonderlijk om vragen; toestemming kan altijd worden ingetrokken.</li></ul></section>
          <section><h2>4. Betalingen en Websitebeheer</h2><p>Stripe verwerkt de eenmalige bouwbetaling en, pas na afzonderlijke toestemming bij livegang, het Websitebeheer-abonnement. Wij ontvangen technische referenties om betalingen te herkennen, de opdracht te starten, maandfacturen te administreren en mislukte betalingen of opzeggingen af te handelen. Stripe handelt voor een deel als zelfstandige verwerkingsverantwoordelijke; het eigen privacybeleid van Stripe geldt daar ook.</p></section>
          <section><h2>5. Intake, AI en publicatie</h2><p>We gebruiken intakegegevens en aangeleverde content om de website te ontwerpen en te vullen. Voor conceptcopy en structuur kan relevante zakelijke inhoud met Anthropic worden verwerkt. Deel geen bijzondere persoonsgegevens, medische gegevens, burgerservicenummers of vertrouwelijke informatie die niet noodzakelijk is. AI-output wordt binnen ons proces gecontroleerd voordat deze wordt opgeleverd.</p></section>
          <section><h2>6. Leads via websites van klanten</h2><p>Wanneer iemand een formulier invult op een door ons gehoste klantwebsite, is die klant doorgaans verwerkingsverantwoordelijke en verwerken wij de inzending technisch namens die klant. De gegevens worden opgeslagen en doorgestuurd naar het door de klant opgegeven adres. Vragen over zo’n lead moeten in de eerste plaats aan de betreffende klant worden gericht.</p></section>
          <section><h2>7. Dienstverleners en doorgifte</h2><p>We gebruiken Stripe voor betalingen, Supabase voor database en klantassets, Anthropic voor AI-ondersteuning, Netlify voor publicatie, Resend voor e-mail en Vercel voor applicatiehosting en workflows. Zij ontvangen alleen gegevens die voor hun taak nodig zijn. Waar gegevens buiten de Europese Economische Ruimte worden verwerkt, baseren betrokken partijen de doorgifte op een adequaatheidsbesluit, standaardcontractbepalingen of een andere geldige waarborg.</p></section>
          <section><h2>8. Bewaartermijnen</h2><p>Facturen en financiële administratie bewaren we in beginsel zeven jaar. Order- en abonnementsgegevens bewaren we gedurende de klantrelatie en normaal maximaal twee jaar daarna, tenzij een wettelijke plicht of geschil langer bewaren vereist. Intake- en projectbestanden bewaren we zolang dat voor beheer en support nodig is. Contactaanvragen en leads verwijderen of anonimiseren we normaal uiterlijk twaalf maanden na de laatste inhoudelijke behandeling. Beveiligingslogs bewaren we zo kort als praktisch nodig.</p></section>
          <section><h2>9. Beveiliging</h2><p>We gebruiken versleutelde verbindingen, server-side secrets, afgeschermde serviceaccounts, getekende webhooks en statuslinks, strikte invoervalidatie, verzoeklimieten, beveiligde sessiecookies, browserbeveiligingsheaders en beperkte database-toegang. Alleen bevoegde systemen en personen krijgen toegang voor hun taak. Geen digitale dienst is volledig risicoloos; meld een vermoeden van misbruik direct via <Link href={BUSINESS.contactPath}>het contactformulier</Link>.</p></section>
          <section><h2>10. Cookies en referraltracking</h2><p>De publieke website gebruikt geen advertentiecookies, fingerprinting of verborgen trackers. Bij een geldige <code>?ref=</code>-link plaatsen we een beveiligde, strikt beperkte first-party referralcookie voor maximaal 30 dagen. Die registreert de partnercode, eerste bezoekdatum, landingspagina en meegegeven UTM-velden. De cookie kent geen commissie toe; dat gebeurt pas na echte verkoop, actieve Websitebeheer-dienst, betaalde maandfactuur, wachttijd en controle. Het dashboard gebruikt een noodzakelijke sessiecookie en Stripe kan noodzakelijke betaal- en fraudepreventiecookies gebruiken.</p></section>
          <section><h2>11. Rechten</h2><p>Je kunt verzoeken om inzage, correctie, verwijdering, beperking, overdraagbaarheid of bezwaar. We kunnen aanvullende informatie vragen om je identiteit te controleren. Een verzoek kan worden beperkt wanneer een wettelijke bewaarplicht of rechten van anderen dat vereist. Je kunt ook een klacht indienen bij de <a href="https://autoriteitpersoonsgegevens.nl/" target="_blank" rel="noopener noreferrer">Autoriteit Persoonsgegevens</a>.</p></section>
          <section><h2>12. Wijzigingen</h2><p>We passen dit beleid aan wanneer onze dienstverlening of wetgeving verandert. Bij een wezenlijke wijziging voor bestaande klanten informeren we hen wanneer dat redelijkerwijs nodig is.</p></section>
        </div>
      </div>
    </main>
  )
}
