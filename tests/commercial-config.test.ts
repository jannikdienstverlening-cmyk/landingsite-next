import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { commercialConfig, packageFirstPayment } from '../config/commercial'

test('commerciële configuratie bevat de definitieve bedragen', () => {
  assert.equal(commercialConfig.packages.starter.oneTimePrice, 299)
  assert.equal(commercialConfig.packages.pro.oneTimePrice, 499)
  assert.equal(commercialConfig.packages.premium.oneTimePrice, 899)
  assert.equal(commercialConfig.management.monthlyPrice, 79)
  assert.equal(commercialConfig.management.includedChangeMinutes, 20)
})

test('eerste betalingen combineren bouw en eerste beheermaand', () => {
  assert.equal(packageFirstPayment('starter'), 378)
  assert.equal(packageFirstPayment('pro'), 578)
  assert.equal(packageFirstPayment('premium'), 978)
})

test('primaire Stripe-checkout gebruikt subscription mode en twee regels', async () => {
  const source = await readFile(new URL('../app/api/stripe/checkout/route.ts', import.meta.url), 'utf8')
  assert.match(source, /mode:\s*'subscription'/)
  assert.match(source, /line_items:\s*\[buildLineItem\(parsed\.data\.pakket\), managementLineItem\(\)\]/)
  assert.doesNotMatch(source, /mode:\s*'payment'/)
})
