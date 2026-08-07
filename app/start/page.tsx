import type { Metadata } from 'next'
import Link from 'next/link'
import { AnalyticsLayer, CheckoutButton } from '@/components/site-interactions'
import { StudioFooter, StudioHeader } from '@/components/studio-site'
import { amountIncludingVat, commercialConfig, euro, packageFirstPayment, vatFor, type CommercialPackageId } from '@/config/commercial'

export const metadata: Metadata = {
  title: 'Start je website',
  description: 'Kies Starter, Pro of Premium en bekijk de volledige eerste betaling voordat je naar Stripe gaat.',
  alternates: { canonical: '/start' },
  robots: { index: true, follow: true },
}

function packageId(value: string | string[] | undefined): CommercialPackageId {
  const candidate = Array.isArray(value) ? value[0] : value
  return candidate && candidate in commercialConfig.packages ? candidate as CommercialPackageId : 'pro'
}

export default async function StartPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams
  const selected = packageId(params.pakket)
  const item = commercialConfig.packages[selected]
  const initialExVat = packageFirstPayment(selected)
  const vat = vatFor(initialExVat)
  const total = amountIncludingVat(initialExVat)
  const cancelled = params.status === 'geannuleerd'

  return (
    <div className="studio studio-page">
      <a className="skip-link" href="#main-content">Ga naar de inhoud</a>
      <AnalyticsLayer />
      <StudioHeader />
      <main id="main-content" className="start-page">
        <div className="studio-shell start-page__grid">
          <section className="start-choice">
            <p className="overline">Start mijn website</p>
            <h1>Kies wat we voor je bouwen.</h1>
            <p>De prijs in deze samenvatting komt uit dezelfde serverconfiguratie als Stripe. Je ziet dus vóór betaling wat nu en later wordt afgeschreven.</p>
            {cancelled && <p id="checkout-cancelled" className="form-message form-message--error" role="status" data-analytics-view="checkout_cancel">De checkout is geannuleerd. Er is niets afgeschreven.</p>}
            <nav className="start-package-tabs" aria-label="Kies pakket">
              {(Object.entries(commercialConfig.packages) as Array<[CommercialPackageId, typeof item]>).map(([id, option]) => <Link className={id === selected ? 'is-active' : ''} href={`/start?pakket=${id}`} key={id} data-analytics-event="package_select" data-analytics-package={id}><span>{option.name}</span><strong>€{option.oneTimePrice}</strong></Link>)}
            </nav>
            <div className="start-scope"><h2>{item.name}</h2><p>{item.audience}</p><ul>{item.features.map((feature) => <li key={feature}>{feature}</li>)}</ul></div>
          </section>
          <aside className="order-summary" aria-label={`Bestelsamenvatting voor ${item.name}`}>
            <p className="overline">Bestelsamenvatting</p>
            <h2>{item.name}</h2>
            <dl>
              <div><dt>Eenmalige bouwprijs</dt><dd>{euro(item.oneTimePrice)}</dd></div>
              <div><dt>Eerste maand beheer</dt><dd>{euro(commercialConfig.management.monthlyPrice)}</dd></div>
              <div className="order-summary__subtotal"><dt>Totaal excl. btw</dt><dd>{euro(initialExVat)}</dd></div>
              <div><dt>Btw (21%)</dt><dd>{euro(vat, 2)}</dd></div>
              <div className="order-summary__total"><dt>Vandaag incl. btw</dt><dd>{euro(total, 2)}</dd></div>
            </dl>
            <div className="order-summary__recurring"><span>Daarna maandelijks</span><strong>€{commercialConfig.management.monthlyPrice} excl. btw</strong><p>De volgende incasso volgt één maand na de eerste betaling. Stripe toont de exacte datum vóór bevestiging.</p></div>
            <ul className="order-summary__facts"><li>Maandelijks opzegbaar aan het einde van de betaalperiode</li><li>Domein blijft van jou</li><li>Intake opent direct na betaling</li><li>Eerste versie binnen 48 uur na complete intake</li></ul>
            <CheckoutButton packageId={selected} label={`Betaal veilig via Stripe`} />
            <p className="order-summary__help">Nog niet zeker? <Link href="/#contact" data-analytics-event="contact_form_start">Eerst kort overleggen</Link>.</p>
          </aside>
        </div>
      </main>
      <StudioFooter />
    </div>
  )
}
