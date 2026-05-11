import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacybeleid',
  description: 'Privacybeleid van Landingsite.nl.',
  robots: {
    index: true,
    follow: true,
  },
}

export default function PrivacybeleidPage() {
  return (
    <main className="legal-page">
      <div className="container legal-shell">
        <Link href="/" className="legal-back">
          Terug naar Landingsite.nl
        </Link>
        <h1>Privacybeleid</h1>
        <p className="updated">Laatst bijgewerkt: 9 mei 2026</p>

        <div className="legal-content">
          <section>
            <h2>1. Welke gegevens we verwerken</h2>
            <p>
              We verwerken gegevens die je zelf invult, zoals naam, e-mailadres, bedrijfsinformatie,
              pakketkeuze, intake-antwoorden en berichten via het contactformulier.
            </p>
          </section>

          <section>
            <h2>2. Waarom we gegevens gebruiken</h2>
            <ul>
              <li>Om je bestelling en betaling te verwerken.</li>
              <li>Om je landingspagina te genereren, leveren en ondersteunen.</li>
              <li>Om contact met je op te nemen over je aanvraag of bestelling.</li>
              <li>Om wettelijke administratie te kunnen voeren.</li>
            </ul>
          </section>

          <section>
            <h2>3. Betalingen en leveranciers</h2>
            <p>
              Betalingen lopen via Stripe. Voor hosting, e-mail en pagina-generatie kunnen we
              betrouwbare externe diensten gebruiken. Zij verwerken gegevens alleen voor zover dat
              nodig is voor de dienst.
            </p>
          </section>

          <section>
            <h2>4. Bewaartermijn</h2>
            <p>
              We bewaren gegevens niet langer dan nodig is voor levering, support, administratie en
              wettelijke verplichtingen.
            </p>
          </section>

          <section>
            <h2>5. Jouw rechten</h2>
            <p>
              Je kunt vragen om inzage, correctie of verwijdering van je persoonsgegevens. Stuur je
              verzoek naar <a href="mailto:info@landingsite.nl">info@landingsite.nl</a>.
            </p>
          </section>

          <section>
            <h2>6. Beveiliging</h2>
            <p>
              We nemen passende technische en organisatorische maatregelen om persoonsgegevens te
              beschermen tegen ongeoorloofde toegang, verlies of misbruik.
            </p>
          </section>
        </div>
      </div>
    </main>
  )
}
