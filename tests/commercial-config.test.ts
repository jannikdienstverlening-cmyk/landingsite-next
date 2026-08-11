import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { amountExcludingVat, amountIncludingVat, commercialConfig, packageFirstPayment, vatFor } from '../config/commercial'

test('commerciële configuratie bevat de definitieve bedragen', () => {
  assert.equal(commercialConfig.packages.starter.oneTimePrice, 299)
  assert.equal(commercialConfig.packages.pro.oneTimePrice, 499)
  assert.equal(commercialConfig.packages.premium.oneTimePrice, 899)
  assert.equal(commercialConfig.management.monthlyPrice, 79)
  assert.equal(commercialConfig.management.includedChangeMinutes, 20)
  assert.equal(commercialConfig.pricesIncludeVat, true)
  assert.equal(commercialConfig.stripeTaxBehavior, 'inclusive')
})

test('eerste betalingen combineren bouw en eerste beheermaand', () => {
  assert.equal(packageFirstPayment('starter'), 378)
  assert.equal(packageFirstPayment('pro'), 578)
  assert.equal(packageFirstPayment('premium'), 978)
})

test('btw zit in de getoonde en af te schrijven bedragen', () => {
  assert.equal(amountIncludingVat(378), 378)
  assert.equal(amountExcludingVat(378), 312.4)
  assert.equal(vatFor(378), 65.6)
  assert.equal(amountIncludingVat(79), 79)
  assert.equal(vatFor(79), 13.71)
})

test('primaire Stripe-checkout gebruikt subscription mode en twee regels', async () => {
  const source = await readFile(new URL('../app/api/stripe/checkout/route.ts', import.meta.url), 'utf8')
  assert.match(source, /mode:\s*'subscription'/)
  assert.match(source, /line_items:\s*\[buildLineItem\(parsed\.data\.pakket\), managementLineItem\(\)\]/)
  assert.doesNotMatch(source, /mode:\s*'payment'/)
})

test('frontend en Stripe gebruiken dezelfde centrale configuratie', async () => {
  const stripeSource = await readFile(new URL('../lib/stripe.ts', import.meta.url), 'utf8')
  const homepageSource = await readFile(new URL('../components/studio-site.tsx', import.meta.url), 'utf8')
  assert.match(stripeSource, /commercialConfig\.packages\.starter\.stripePriceEnv/)
  assert.match(stripeSource, /commercialConfig\.management\.stripePriceEnv/)
  assert.match(homepageSource, /packageFirstPayment\(id\)/)
  assert.doesNotMatch(homepageSource, /firstPayment:\s*\d+/)
})
