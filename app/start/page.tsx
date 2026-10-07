import type { Metadata } from 'next'
import Link from 'next/link'
import { AnalyticsLayer, CheckoutButton } from '@/components/site-interactions'
import { StudioFooter, StudioHeader } from '@/components/studio-site'
import { packagePresentation } from '@/content/package-presentation'
import { activePromotion, amountExcludingVat, amountIncludingVat, commercialConfig, effectiveBuildPrice, effectiveFirstPayment, euro, promotionDiscount, vatFor, type CommercialPackageId } from '@/config/commercial'

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
  const promotion = activePromotion()
  const promotionApplies = Boolean(selected && promotion)
  const buildPrice = selected ? effectiveBuildPrice(selected) : null
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
            <p>{promotion ? `Tot en met ${promotion.displayEndsAt} is Starter gratis gebouwd en krijg je €300 korting op Pro en Premium. Kies een pakket om de volledige betaling en vervolgincasso te bekijken.` : item ? 'Dit krijg je, dit betaal je nu en dit kost het daarna per maand. Je kunt je keuze hieronder nog veranderen.' : 'Kies het pakket dat bij je bedrijf past. Je ziet het volledige bedrag voordat je naar de betaling gaat.'}</p>
            {cancelled && <p id="checkout-cancelled" className="form-message form-message--error" role="status" data-analytics-view="checkout_cancel">De checkout is geannuleerd. Er is niets afgeschreven.</p>}
            <nav className="start-package-tabs" aria-label="Kies pakket" data-analytics-view="package_compare">
              {(Object.entries(commercialConfig.packages) as Array<[CommercialPackageId, typeof commercialConfig.packages[CommercialPackageId]]>).map(([id, option]) => {
                const promotionalOption = Boolean(promotion)
                const optionPrice = promotionalOption ? effectiveBuildPrice(id) : option.oneTimePrice
                return <Link className={id === selected ? 'is-active' : ''} aria-current={id === selected ? 'true' : undefined} href={`/start?pakket=${id}`} key={id} data-analytics-event="package_select" data-analytics-package={id}><span>{option.name}{promotionalOption ? ' · zomeractie' : ''}</span><strong>€{optionPrice} bouw</strong></Link>
              })}
            </nav>
            {item && selected ? <div className="start-scope"><h2>Dit krijg je met {item.name}</h2>{promotionApplies && <p className="start-promotion-note"><strong>Zomeractie:</strong> je krijgt €{promotionDiscount(selected)} korting op de bouwprijs. Je betaalt daarnaast €{commercialConfig.management.monthlyPrice} voor de eerste maand Websitebeheer en bekijkt de eerste versie voordat we hem publiceren.</p>}<p>{packagePresentation(selected).audience}</p><dl className="start-simple-specs">{packagePresentation(selected).specs.map(spec => <div key={spec.label}><dt>{spec.label}</dt><dd>{spec.value}</dd></div>)}</dl><details><summary>Alle onderdelen van {item.name}</summary><ul>{item.features.map((feature) => <li key={feature}>{feature}</li>)}</ul></details></div> : <div className="start-scope start-scope--empty"><h2>Wat wil je laten zien?</h2><p>Starter geeft je ruimte voor één aanbod op één pagina. Pro heeft tot {commercialConfig.packages.pro.pages} pagina’s voor je bedrijf en diensten. Met Premium laat je tot {commercialConfig.packages.premium.pages} pagina’s en alle teksten uitwerken.</p><p><Link href="/#pakketten">Vergelijk de pakketten</Link>.</p></div>}
          </section>

          {item && selected && initialPayment !== null ? (
            <aside className="order-summary" aria-label={`Bestelsamenvatting voor ${item.name}`} data-analytics-view="checkout_view">
              <p className="overline">Dit betaal je</p>
              <h2>{item.name}</h2>
              <dl>
                <div><dt>{promotionApplies ? 'Bouwprijs zomeractie' : 'Eenmalige bouwprijs'} (incl. btw)</dt><dd>{promotionApplies ? <><s>{euro(item.oneTimePrice)}</s> {euro(buildPrice ?? item.oneTimePrice)}</> : euro(buildPrice ?? item.oneTimePrice)}</dd></div>
                <div><dt>Eerste maand beheer (incl. btw)</dt><dd>{euro(commercialConfig.management.monthlyPrice)}</dd></div>
                <div className="order-summary__subtotal"><dt>Totaal excl. btw</dt><dd>{euro(amountExcludingVat(initialPayment), 2)}</dd></div>
                <div><dt>Btw inbegrepen (21%)</dt><dd>{euro(vatFor(initialPayment), 2)}</dd></div>
                <div className="order-summary__total"><dt>Vandaag incl. btw</dt><dd>{euro(amountIncludingVat(initialPayment), 2)}</dd></div>
              </dl>
              <div className="order-summary__recurring"><span>Daarna maandelijks</span><strong>€{commercialConfig.management.monthlyPrice} incl. btw</strong><p>De volgende incasso volgt één maand na de eerste betaling. Stripe toont de exacte datum vóór bevestiging.</p></div>
              <ul className="order-summary__facts"><li>Maandelijks opzegbaar aan het einde van de betaalperiode</li><li>Domein blijft van jou</li><li>Intake opent direct na betaling</li><li>Eerste versie binnen 48 uur na complete intake</li>{promotionApplies && <li>Je bekijkt en beoordeelt de preview vóór publicatie</li>}</ul>
              <CheckoutButton key={selected} packageId={selected} label={promotionApplies ? `Start voor €${initialPayment} via Stripe` : 'Betaal veilig via Stripe'} />
              <p className="order-summary__help">Nog niet zeker? <Link href="/#contact">Stel eerst een vraag</Link>.</p>
            </aside>
          ) : (
            <aside className="order-summary order-summary--empty" aria-label="Bestelsamenvatting">
              <p className="overline">Bestelsamenvatting</p>
              <h2>Kies een pakket.</h2>
              <p>Kies je pakket. Hier verschijnt het totaal voor de bouw en de eerste maand beheer, inclusief btw.</p>
              <ul className="order-summary__facts"><li>Bouw vanaf €{commercialConfig.packages.starter.oneTimePrice} incl. btw</li><li>Bij de start betaal je ook de eerste maand beheer</li><li>Daarna €{commercialConfig.management.monthlyPrice} per maand incl. btw</li></ul>
            </aside>
          )}
        </div>
      </main>
      <StudioFooter />
    </div>
  )
}
