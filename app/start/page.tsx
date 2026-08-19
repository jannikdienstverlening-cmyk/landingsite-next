import type { Metadata } from 'next'
import Link from 'next/link'
import { AnalyticsLayer, CheckoutButton } from '@/components/site-interactions'
import { StudioFooter, StudioHeader } from '@/components/studio-site'
import { activePromotion, amountExcludingVat, amountIncludingVat, commercialConfig, effectiveBuildPrice, effectiveFirstPayment, euro, promotionDiscount, vatFor, type CommercialPackageId } from '@/config/commercial'

export const metadata: Metadata = {
  title: 'Start je website',
  description: 'Kies Starter, Pro of Premium en bekijk de volledige eerste betaling voordat je naar Stripe gaat.',
  alternates: { canonical: 'https://www.landingsite.nl/start' },
  robots: { index: false, follow: true },
}

function packageId(value: string | string[] | undefined): CommercialPackageId | null {
  const candidate = Array.isArray(value) ? value[0] : value
  return candidate && candidate in commercialConfig.packages ? candidate as CommercialPackageId : null
}

export default async function StartPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const params = await searchParams
  const selected = packageId(params.pakket)
  const item = selected ? commercialConfig.packages[selected] : null
  const promotion = activePromotion()
  const promotionApplies = Boolean(selected && promotion)
  const buildPrice = selected ? effectiveBuildPrice(selected) : null
  const initialPayment = selected ? effectiveFirstPayment(selected) : null
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
            <p>{promotion ? `Tot en met ${promotion.displayEndsAt} is Starter gratis gebouwd en krijg je €300 korting op Pro en Premium. Kies een pakket om de volledige betaling en vervolgincasso te bekijken.` : 'Er is nog niets vooraf geselecteerd. Kies een pakket om de bouwprijs, eerste beheermaand, btw en vervolgincasso te bekijken.'}</p>
            {cancelled && <p id="checkout-cancelled" className="form-message form-message--error" role="status" data-analytics-view="checkout_cancel">De checkout is geannuleerd. Er is niets afgeschreven.</p>}
            <nav className="start-package-tabs" aria-label="Kies pakket" data-analytics-view="package_compare">
              {(Object.entries(commercialConfig.packages) as Array<[CommercialPackageId, typeof commercialConfig.packages[CommercialPackageId]]>).map(([id, option]) => {
                const promotionalOption = Boolean(promotion)
                const optionPrice = promotionalOption ? effectiveBuildPrice(id) : option.oneTimePrice
                return <Link className={id === selected ? 'is-active' : ''} aria-current={id === selected ? 'true' : undefined} href={`/start?pakket=${id}`} key={id} data-analytics-event="select_item" data-analytics-package={id}><span>{option.name}{promotionalOption ? ' · zomeractie' : ''}</span><strong>€{optionPrice} bouw</strong></Link>
              })}
            </nav>
            {item ? <div className="start-scope"><h2>{item.name}</h2>{promotionApplies && selected && <p className="start-promotion-note"><strong>Zomeractie:</strong> je krijgt €{promotionDiscount(selected)} korting op de bouwprijs. Je betaalt daarnaast €{commercialConfig.management.monthlyPrice} voor de eerste maand Websitebeheer en bekijkt de eerste versie voordat we hem publiceren.</p>}<p>{item.audience}</p><ul>{item.features.map((feature) => <li key={feature}>{feature}</li>)}</ul></div> : <div className="start-scope start-scope--empty"><h2>Nog geen pakket gekozen</h2><p>Starter is voor één landingspagina, Pro voor maximaal vier kernpagina’s en Premium voor maximaal acht kernpagina’s. Je keuze wordt pas bij de checkout vastgelegd.</p><p><Link href="/kosten-website-laten-maken">Bekijk eerst de volledige prijsvergelijking</Link>.</p></div>}
          </section>

          {item && selected && initialPayment !== null ? (
            <aside className="order-summary" aria-label={`Bestelsamenvatting voor ${item.name}`} data-analytics-view="view_item">
              <p className="overline">Bestelsamenvatting</p>
              <h2>{item.name}</h2>
              <dl>
                <div><dt>{promotionApplies ? 'Bouwprijs zomeractie' : 'Eenmalige bouwprijs'}</dt><dd>{promotionApplies ? <><s>{euro(item.oneTimePrice)}</s> {euro(buildPrice ?? item.oneTimePrice)}</> : euro(buildPrice ?? item.oneTimePrice)}</dd></div>
                <div><dt>Eerste maand beheer</dt><dd>{euro(commercialConfig.management.monthlyPrice)}</dd></div>
                <div className="order-summary__subtotal"><dt>Totaal excl. btw</dt><dd>{euro(amountExcludingVat(initialPayment), 2)}</dd></div>
                <div><dt>Btw inbegrepen (21%)</dt><dd>{euro(vatFor(initialPayment), 2)}</dd></div>
                <div className="order-summary__total"><dt>Vandaag incl. btw</dt><dd>{euro(amountIncludingVat(initialPayment), 2)}</dd></div>
              </dl>
              <div className="order-summary__recurring"><span>Daarna maandelijks</span><strong>€{commercialConfig.management.monthlyPrice} incl. btw</strong><p>De volgende incasso volgt één maand na de eerste betaling. Stripe toont de exacte datum vóór bevestiging.</p></div>
              <ul className="order-summary__facts"><li>Maandelijks opzegbaar aan het einde van de betaalperiode</li><li>Domein blijft van jou</li><li>Intake opent direct na betaling</li><li>Eerste versie binnen 48 uur na complete intake</li>{promotionApplies && <li>Je bekijkt en beoordeelt de preview vóór publicatie</li>}</ul>
              <CheckoutButton packageId={selected} label={promotionApplies ? `Start voor €${initialPayment} via Stripe` : 'Betaal veilig via Stripe'} />
              <p className="order-summary__help">Nog niet zeker? <Link href="/#contact">Stel eerst een vraag</Link>.</p>
            </aside>
          ) : (
            <aside className="order-summary order-summary--empty" aria-label="Bestelsamenvatting">
              <p className="overline">Bestelsamenvatting</p>
              <h2>Kies links een pakket.</h2>
              <p>Daarna zie je hier de complete eerste betaling en het maandbedrag. De server bepaalt de prijs; een bedrag uit de browser wordt nooit vertrouwd.</p>
              <ul className="order-summary__facts"><li>Bouw vanaf €{commercialConfig.packages.starter.oneTimePrice} incl. btw</li><li>Eerste beheermaand direct inbegrepen</li><li>Daarna €{commercialConfig.management.monthlyPrice} per maand incl. btw</li><li>Geen betaalactie zonder gekozen pakket</li></ul>
            </aside>
          )}
        </div>
      </main>
      <StudioFooter />
    </div>
  )
}
