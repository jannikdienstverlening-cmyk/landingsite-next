import type { Metadata } from 'next'
import Link from 'next/link'
import { ConsentSettingsButton } from '@/components/consent-manager'
import { consentConfig } from '@/config/consent'

export const metadata: Metadata = {
  title: 'Cookiebeleid | Landingsite.nl',
  description: 'Uitleg over noodzakelijke opslag, analytics, marketingmeting en het wijzigen van cookievoorkeuren op Landingsite.nl.',
  alternates: { canonical: '/cookiebeleid' },
  robots: { index: false, follow: true },
}

export default function CookiePolicyPage() {
  return (
    <main className="legal-page">
      <div className="container legal-shell">
        <Link href="/" className="legal-back">← Terug naar Landingsite.nl</Link>
        <h1>Cookiebeleid</h1>
        <p className="updated">Laatst bijgewerkt: 19 augustus 2026</p>
        <div className="legal-content">
          <section><h2>1. Standaard alleen noodzakelijk</h2><p>Noodzakelijke opslag ondersteunt beveiliging, formulieren, de startflow en betaling. Deze functies kunnen niet via de cookiekeuze worden uitgeschakeld.</p></section>
          <section><h2>2. Analyse</h2><p>Analyse helpt te begrijpen welke pagina’s en stappen worden gebruikt. Externe analyse staat standaard uit en wordt alleen geladen na toestemming én wanneer de integratie technisch is geactiveerd.</p></section>
          <section><h2>3. Marketing</h2><p>Marketingtoestemming kan worden gebruikt om campagnebezoek en betaalde conversies van Google of Meta te meten. De site plaatst deze tags niet vóór toestemming. Vrije formulierinhoud, intakegegevens, uploads en betaalgegevens worden niet voor deze meting verzonden.</p></section>
          <section><h2>4. Voorkeuren</h2><p>Voorkeursopslag onthoudt alleen niet-essentiële keuzes. Deze categorie staat standaard uit.</p></section>
          <section><h2>5. Bewaartermijn en wijzigen</h2><p>De toestemmingskeuze wordt maximaal {consentConfig.analytics.maxAgeDays} dagen bewaard. Je kunt de keuze hieronder of via de footer opnieuw openen. Intrekken heeft geen terugwerkende kracht.</p><ConsentSettingsButton /></section>
          <section><h2>6. Meer informatie</h2><p>Lees in het <Link href="/privacybeleid">privacybeleid</Link> welke leveranciers actief kunnen zijn, waarom gegevens worden verwerkt en welke rechten je hebt.</p></section>
        </div>
      </div>
    </main>
  )
}
