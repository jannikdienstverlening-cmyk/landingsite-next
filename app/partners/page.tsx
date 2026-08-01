import type { Metadata } from 'next'
import Link from 'next/link'
import { partnerProgramConfig } from '@/config/partner-program'
import { BUSINESS } from '@/lib/business'

export const metadata: Metadata = {
  title: 'Partnerprogramma',
  description: 'Lees hoe je een ondernemer kunt aandragen bij Landingsite.nl.',
  alternates: { canonical: '/partners' },
}

export default function PartnersPage() {
  return (
    <main className="legal-page">
      <div className="container legal-shell">
        <Link href="/" className="legal-back">← Terug naar Landingsite.nl</Link>
        <h1>Partnerprogramma</h1>
        <p className="updated">Voor introducties naar ondernemers die een professionele landingspagina nodig hebben.</p>
        <div className="legal-content">
          <section>
            <h2>Wie mag iemand aandragen?</h2>
            <p>Iedereen die een relevante introductie kan maken, mag een ondernemer aandragen. De introductie moet duidelijk herleidbaar zijn voordat de opdracht start.</p>
          </section>
          <section>
            <h2>Hoe wordt een introductie geregistreerd?</h2>
            <p>Stuur de introductie via <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a> met naam, bedrijf en contactgegevens van de ondernemer. We bevestigen per e-mail of de introductie is geregistreerd.</p>
          </section>
          <section>
            <h2>Wanneer ontstaat recht op vergoeding?</h2>
            <p>Een eventuele vergoeding ontstaat pas nadat de aangebrachte opdracht succesvol is betaald en de wachttijd van {partnerProgramConfig.waitingPeriodDays} dagen is verstreken. Definitieve voorwaarden worden vooraf bevestigd.</p>
          </section>
          <section>
            <h2>Welke bedragen gelden?</h2>
            <p>We tonen op dit moment geen vaste uitbetalingsbedragen. De vergoeding is afhankelijk van het soort introductie, de opdracht en de actuele voorwaarden van het partnerprogramma.</p>
          </section>
          <section>
            <h2>Starten</h2>
            <p>Wil je iemand aandragen of eerst de voorwaarden bespreken? Mail naar <a href={`mailto:${BUSINESS.email}`}>{BUSINESS.email}</a>.</p>
          </section>
        </div>
      </div>
    </main>
  )
}
