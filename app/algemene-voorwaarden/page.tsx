import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Algemene voorwaarden',
  description: 'Algemene voorwaarden van Landingsite.nl.',
  robots: {
    index: true,
    follow: true,
  },
}

export default function AlgemeneVoorwaardenPage() {
  return (
    <main className="legal-page">
      <div className="container legal-shell">
        <Link href="/" className="legal-back">
          Terug naar Landingsite.nl
        </Link>
        <h1>Algemene voorwaarden</h1>
        <p className="updated">Laatst bijgewerkt: 11 mei 2026</p>

        <div className="legal-content">
          <section>
            <h2>1. Dienstverlening</h2>
            <p>
              Landingsite.nl levert landingspagina’s voor ondernemers en bedrijven op basis van
              het gekozen pakket en de informatie die de klant via de intake aanlevert.
            </p>
          </section>

          <section>
            <h2>2. Oplevering</h2>
            <p>
              De genoemde oplevertijd start zodra betaling en intake compleet zijn. Wanneer
              aangeleverde informatie ontbreekt of onduidelijk is, kan de oplevering later plaatsvinden.
            </p>
          </section>

          <section>
            <h2>3. Correcties</h2>
            <p>
              Correctierondes zijn afhankelijk van het gekozen pakket. Correcties gaan over het
              aanpassen van de geleverde pagina binnen de afgesproken scope, niet over een volledig
              nieuw concept of andere dienst.
            </p>
          </section>

          <section>
            <h2>4. Betaling</h2>
            <p>
              Betaling vindt vooraf plaats via de aangeboden betaalmethoden. Na succesvolle betaling
              ontvangt de klant toegang tot de intake.
            </p>
          </section>

          <section>
            <h2>5. Hosting en domein</h2>
            <p>
              Hosting kost €15 per maand, tenzij anders schriftelijk afgesproken. Landingsite.nl
              levert een live pagina en instructies voor domeinkoppeling. De klant is
              verantwoordelijk voor toegang tot de eigen domeinbeheerder en correcte DNS-instellingen.
            </p>
          </section>

          <section>
            <h2>6. Aansprakelijkheid</h2>
            <p>
              Landingsite.nl spant zich in voor een professionele oplevering, maar geeft geen garantie
              op specifieke omzet, leads of advertentieresultaten.
            </p>
          </section>

          <section>
            <h2>7. Contact</h2>
            <p>
              Vragen over deze voorwaarden kun je sturen naar{' '}
              <a href="mailto:info@landingsite.nl">info@landingsite.nl</a>.
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
