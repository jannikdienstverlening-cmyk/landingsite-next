import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { AnalyticsLayer, CheckoutButton } from '@/components/site-interactions'
import { StudioFooter, StudioHeader } from '@/components/studio-site'
import { amountExcludingVat, amountIncludingVat, commercialConfig, effectiveFirstPayment, euro, vatFor, websiteOffer } from '@/config/commercial'

export const metadata: Metadata = {
  title: 'Start je website',
  description: `Je website inclusief bouw, hosting en beheer voor €${commercialConfig.management.monthlyPrice} per maand inclusief btw. Bekijk je eerste maandbetaling voordat je naar Stripe gaat.`,
  alternates: { canonical: 'https://www.landingsite.nl/start' },
  robots: { index: false, follow: true },
}

export default async function StartPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams
  const cancelled = params.status === 'geannuleerd'
  if (params.pakket !== undefined) redirect(cancelled ? '/start?status=geannuleerd' : '/start')
  const initialPayment = effectiveFirstPayment(websiteOffer.packageId)

  return (
    <div className="studio studio-page studio--sales">
      <a className="skip-link" href="#main-content">Ga naar de inhoud</a>
      <AnalyticsLayer />
      <StudioHeader light />
      <main id="main-content" className="start-page">
        <div className="studio-shell start-page__grid">
          <section className="start-choice">
            <p className="overline">Start mijn website</p>
            <h1>Dit wordt jouw nieuwe website.</h1>
            <p>Voor €{commercialConfig.management.monthlyPrice} per maand inclusief btw bouw ik je website en verzorg ik de hosting en het beheer. Je betaalt geen eenmalige bouwkosten en hoeft geen pakket te kiezen.</p>
            {cancelled && <p id="checkout-cancelled" className="form-message form-message--error" role="status" data-analytics-view="checkout_cancel">De checkout is geannuleerd. Er is niets afgeschreven.</p>}
            <div className="start-scope"><h2>Dit zit erbij</h2><dl className="start-simple-specs">
              <div><dt>Pagina’s</dt><dd>Tot {websiteOffer.pages} pagina’s voor je bedrijf, diensten en contact</dd></div>
              <div><dt>Teksten</dt><dd>Uitgewerkt met de informatie uit je intake</dd></div>
              <div><dt>Ontwerp en techniek</dt><dd>Mobiel ontwerp, contactformulier en SEO-basis</dd></div>
              <div><dt>Aanpassingen</dt><dd>{websiteOffer.correctionRounds} gebundelde aanpassingsrondes vóór oplevering</dd></div>
              <div><dt>Na oplevering</dt><dd>Hosting, updates, back-ups, formuliercontrole en {commercialConfig.management.includedChangeMinutes} minuten kleine wijzigingen per maand</dd></div>
            </dl><p>Na betaling vul je de intake over je bedrijf in. Binnen {commercialConfig.firstVersion.hours} uur na betaling en een complete intake krijg je de eerste werkende versie. Pas na jouw akkoord gaat de website online.</p><p>Extra pagina’s, functies, webshops en grote migraties vallen buiten dit aanbod. Extra werk spreken we vooraf apart af. Ongebruikte wijzigingstijd wordt niet opgespaard.</p></div>
          </section>

            <aside className="order-summary" aria-label="Bestelsamenvatting voor je website" data-analytics-view="checkout_view">
              <p className="overline">Dit betaal je</p>
              <h2>{websiteOffer.name}</h2>
              <dl>
                <div><dt>Websitebouw</dt><dd>Inbegrepen</dd></div>
                <div><dt>Eerste maand website en beheer (incl. btw)</dt><dd>{euro(commercialConfig.management.monthlyPrice)}</dd></div>
                <div className="order-summary__subtotal"><dt>Totaal excl. btw</dt><dd>{euro(amountExcludingVat(initialPayment), 2)}</dd></div>
                <div><dt>Btw inbegrepen (21%)</dt><dd>{euro(vatFor(initialPayment), 2)}</dd></div>
                <div className="order-summary__total"><dt>Vandaag incl. btw</dt><dd>{euro(amountIncludingVat(initialPayment), 2)}</dd></div>
              </dl>
              <div className="order-summary__recurring"><span>Daarna maandelijks</span><strong>€{commercialConfig.management.monthlyPrice} incl. btw</strong><p>De volgende incasso volgt één maand na de eerste betaling. Stripe toont de exacte datum vóór bevestiging.</p></div>
              <ul className="order-summary__facts"><li>Geen eenmalige bouwkosten</li><li>Maandelijks opzegbaar aan het einde van de betaalperiode</li><li>Domein blijft van jou</li><li>Intake opent direct na betaling</li><li>Eerste versie binnen 48 uur na betaling en complete intake</li><li>Pas online na jouw akkoord</li></ul>
              <p className="order-summary__rights" data-testid="website-rights-note">Je eigen teksten, foto’s en logo blijven van jou. Je gebruikt onze code en ons ontwerp binnen het abonnement. Later zelfstandig verder? Afkoop kan op aanvraag, met een aparte prijsafspraak. <Link href="/algemene-voorwaarden#website-rechten" target="_blank" rel="noopener noreferrer">Meer over eigendom en overdracht</Link>.</p>
              <CheckoutButton packageId={websiteOffer.packageId} label={`Start voor €${initialPayment} via Stripe`} />
              <p className="order-summary__help">Nog niet zeker? <Link href="/#contact">Stel eerst een vraag</Link>.</p>
            </aside>
        </div>
      </main>
      <StudioFooter />
    </div>
  )
}
