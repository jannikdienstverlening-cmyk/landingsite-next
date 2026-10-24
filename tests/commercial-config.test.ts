import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { amountExcludingVat, amountIncludingVat, commercialConfig, effectiveBuildPrice, effectiveFirstPayment, packageFirstPayment, vatFor, websiteOffer } from '../config/commercial'
import { expectedStripeCatalog } from '../lib/stripe-catalog'

test('commerciële configuratie bevat de definitieve bedragen', () => {
  assert.equal(commercialConfig.packages.starter.oneTimePrice, 0)
  assert.equal(commercialConfig.packages.pro.oneTimePrice, 0)
  assert.equal(commercialConfig.packages.premium.oneTimePrice, 0)
  assert.equal(commercialConfig.management.monthlyPrice, 79)
  assert.equal(commercialConfig.management.includedChangeMinutes, 20)
  assert.equal(commercialConfig.pricesIncludeVat, true)
  assert.equal(commercialConfig.stripeTaxBehavior, 'inclusive')
})

test('eerste betaling is voor elk pakket alleen de eerste maand', () => {
  for (const id of ['starter', 'pro', 'premium'] as const) {
    assert.equal(packageFirstPayment(id), 79)
    assert.equal(effectiveFirstPayment(id), 79)
    assert.equal(effectiveBuildPrice(id), 0)
  }
})

test('ook na de oude actieperiode blijven eerste en volgende maand 79 inclusief btw', context => {
  context.mock.timers.enable({ apis: ['Date'], now: new Date('2026-10-01T12:00:00Z') })
  for (const date of ['2026-10-01T12:00:00Z', '2026-10-24T12:00:00Z', '2027-01-01T12:00:00Z']) {
    context.mock.timers.setTime(Date.parse(date))
    for (const id of ['starter', 'pro', 'premium'] as const) {
      assert.equal(effectiveBuildPrice(id), 0)
      assert.equal(effectiveFirstPayment(id), 79)
    }
  }
  assert.equal(commercialConfig.management.billingInterval, 'month')
  assert.deepEqual(expectedStripeCatalog.map(entry => ({
    amount: entry.amount, recurring: entry.recurring, key: entry.key,
  })), [{ amount: 79, recurring: true, key: 'management' }])
})

test('abonnementsmodel is vast en niet afhankelijk van een oude actie', () => {
  assert.equal(commercialConfig.model, 'subscription-only')
  assert.equal(commercialConfig.version, '2026-10-11-single-website-offer')
  assert.equal('promotion' in commercialConfig, false)
})

test('er is één actief aanbod met de bestaande aanbevolen omvang', () => {
  assert.equal(websiteOffer.name, 'Website en beheer')
  assert.equal(websiteOffer.ctaHref, '/start')
  assert.equal(websiteOffer.packageId, 'pro')
  assert.equal(websiteOffer.pages, 4)
  assert.equal(websiteOffer.correctionRounds, 2)
  assert.equal(effectiveFirstPayment(websiteOffer.packageId), 79)
})

test('btw zit in de getoonde en af te schrijven bedragen', () => {
  assert.equal(amountIncludingVat(378), 378)
  assert.equal(amountExcludingVat(378), 312.4)
  assert.equal(vatFor(378), 65.6)
  assert.equal(amountIncludingVat(79), 79)
  assert.equal(amountExcludingVat(79), 65.29)
  assert.equal(vatFor(79), 13.71)
})

test('primaire Stripe-checkout gebruikt alleen één abonnementsregel', async () => {
  const source = await readFile(new URL('../app/api/stripe/checkout/route.ts', import.meta.url), 'utf8')
  assert.match(source, /mode:\s*'subscription'/)
  assert.match(source, /const lineItems = \[managementLineItem\(\)\]/)
  assert.doesNotMatch(source, /buildLineItem|configuredBuildPriceId|lineItems\.unshift/)
  assert.match(source, /line_items:\s*lineItems/)
  assert.doesNotMatch(source, /mode:\s*'payment'/)
})

test('frontend en Stripe gebruiken dezelfde centrale configuratie', async () => {
  const stripeSource = await readFile(new URL('../lib/stripe.ts', import.meta.url), 'utf8')
  const homepageSource = await readFile(new URL('../components/studio-site.tsx', import.meta.url), 'utf8')
  assert.match(stripeSource, /commercialConfig\.packages\.starter\.stripePriceEnv/)
  assert.match(stripeSource, /commercialConfig\.management\.stripePriceEnv/)
  assert.match(homepageSource, /commercialConfig\.management\.monthlyPrice/)
  assert.doesNotMatch(homepageSource, /firstPayment:\s*\d+/)
})
