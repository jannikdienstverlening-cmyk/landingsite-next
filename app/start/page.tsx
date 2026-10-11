import type { Metadata } from 'next'
import Link from 'next/link'
import { AnalyticsLayer, CheckoutButton } from '@/components/site-interactions'
import { StudioFooter, StudioHeader } from '@/components/studio-site'
import { packagePresentation } from '@/content/package-presentation'
import { amountExcludingVat, amountIncludingVat, commercialConfig, effectiveFirstPayment, euro, vatFor, type CommercialPackageId } from '@/config/commercial'

export const metadata: Metadata = {
  title: 'Start je website',
  description: 'Kies Starter, Pro of Premium en bekijk de volledige eerste betaling voordat je naar Stripe gaat.',
  alternates: { canonical: 'https://www.landingsite.nl/start' },
  robots: { index: false, follow: true },
}

function packageId(value: string | string[] | undefined): CommercialPackageId | null {
  const candidate = Array.isArray(value) ? value[0] : value
  return candidate && Object.hasOwn(commercialConfig.packages, candidate) ? candidate as CommercialPackageId : null
}

export default async function StartPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams
  const selected = packageId(params.pakket)
  const item = selected ? commercialConfig.packages[selected] : null
  const initialPayment = selected ? effectiveFirstPayment(selected) : null
  const cancelled = params.status === 'geannuleerd'

  return (
    <div className="studio studio-page studio--sales">
      <a className="skip-link" href="#main-content">Ga naar de inhoud</a>
      <AnalyticsLayer />
      <StudioHeader light />
      <main id="main-content" className="start-page">
        <div className="studio-shell start-page__grid">
          <section className="start-choice">
            <p className="overline">Start mijn website</p>
            <h1>{item ? `Dit wordt jouw ${item.name}-website.` : 'Welk pakket past bij jou?'}</h1>
            <p>Je website wordt gebouwd en beheerd voor €{commercialConfig.management.monthlyPrice} per maand inclusief btw. Geen eenmalige bouwkosten. Kies hoeveel ruimte je nodig hebt voor je bedrijf.</p>
            {cancelled && <p id="checkout-cancelled" className="form-message form-message--error" role="status" data-analytics-view="checkout_cancel">De checkout is geannuleerd. Er is niets afgeschreven.</p>}
            <nav className="start-package-tabs" aria-label="Kies pakket" data-analytics-view="package_compare">
              {(Object.entries(commercialConfig.packages) as Array<[CommercialPackageId, typeof commercialConfig.packages[CommercialPackageId]]>).map(([id, option]) => {
                return <Link className={id === selected ? 'is-active' : ''} aria-current={id === selected ? 'true' : undefined} href={`/start?pakket=${id}`} key={id} data-analytics-event="package_select" data-analytics-package={id}><span>{option.name}</span><strong>{option.pages === 1 ? 'Eén pagina' : `Tot ${option.pages} pagina’s`}</strong></Link>
              })}
            </nav>
            {item && selected ? <div className="start-scope"><h2>Dit krijg je met {item.name}</h2><p>{packagePresentation(selected).audience}</p><dl className="start-simple-specs">{packagePresentation(selected).specs.map(spec => <div key={spec.label}><dt>{spec.label}</dt><dd>{spec.value}</dd></div>)}</dl><details><summary>Alle onderdelen van {item.name}</summary><ul>{item.features.map((feature) => <li key={feature}>{feature}</li>)}</ul></details></div> : <div className="start-scope start-scope--empty"><h2>Wat wil je laten zien?</h2><p>Starter geeft je ruimte voor één aanbod op één pagina. Pro heeft tot {commercialConfig.packages.pro.pages} pagina’s voor je bedrijf en diensten. Met Premium laat je tot {commercialConfig.packages.premium.pages} pagina’s en alle teksten uitwerken. Het maandbedrag is voor elk pakket gelijk.</p><p><Link href="/#pakketten">Vergelijk de pakketten</Link>.</p></div>}
          </section>

          {item && selected && initialPayment !== null ? (
            <aside className="order-summary" aria-label={`Bestelsamenvatting voor ${item.name}`} data-analytics-view="checkout_view">
              <p className="overline">Dit betaal je</p>
              <h2>{item.name}</h2>
              <dl>
                <div><dt>Websitebouw</dt><dd>Inbegrepen</dd></div>
                <div><dt>Eerste maand website en beheer (incl. btw)</dt><dd>{euro(commercialConfig.management.monthlyPrice)}</dd></div>
                <div className="order-summary__subtotal"><dt>Totaal excl. btw</dt><dd>{euro(amountExcludingVat(initialPayment), 2)}</dd></div>
                <div><dt>Btw inbegrepen (21%)</dt><dd>{euro(vatFor(initialPayment), 2)}</dd></div>
                <div className="order-summary__total"><dt>Vandaag incl. btw</dt><dd>{euro(amountIncludingVat(initialPayment), 2)}</dd></div>
              </dl>
              <div className="order-summary__recurring"><span>Daarna maandelijks</span><strong>€{commercialConfig.management.monthlyPrice} incl. btw</strong><p>De volgende incasso volgt één maand na de eerste betaling. Stripe toont de exacte datum vóór bevestiging.</p></div>
              <ul className="order-summary__facts"><li>Geen eenmalige bouwkosten</li><li>Maandelijks opzegbaar aan het einde van de betaalperiode</li><li>Domein blijft van jou</li><li>Intake opent direct na betaling</li><li>Eerste versie binnen 48 uur na betaling en complete intake</li><li>Pas online na jouw akkoord</li></ul>
              <CheckoutButton key={selected} packageId={selected} label={`Start voor €${initialPayment} via Stripe`} />
              <p className="order-summary__help">Nog niet zeker? <Link href="/#contact">Stel eerst een vraag</Link>.</p>
            </aside>
          ) : (
            <aside className="order-summary order-summary--empty" aria-label="Bestelsamenvatting">
              <p className="overline">Bestelsamenvatting</p>
              <h2>Kies een pakket.</h2>
              <p>Je kiest de omvang van je website, niet een ander tarief. Hier verschijnt de eerste maandbetaling met de btw-splitsing.</p>
              <ul className="order-summary__facts"><li>€{commercialConfig.management.monthlyPrice} per maand incl. btw</li><li>Websitebouw inbegrepen</li><li>Bij de start betaal je alleen de eerste maand</li></ul>
            </aside>
          )}
        </div>
      </main>
      <StudioFooter />
    </div>
  )
}
