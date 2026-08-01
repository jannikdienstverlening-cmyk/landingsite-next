import assert from 'node:assert/strict'
import test from 'node:test'
import { configuredStripePriceId, PAKKETTEN } from '../lib/stripe'

test('Stripe checkout gebruikt de maandelijkse abonnementstarieven', () => {
  assert.equal(PAKKETTEN.starter.naam, 'Starter')
  assert.equal(PAKKETTEN.starter.prijs, 7900)
  assert.equal(PAKKETTEN.starter.prijs_label, '€79')

  assert.equal(PAKKETTEN.pro.naam, 'Groei')
  assert.equal(PAKKETTEN.pro.prijs, 12900)
  assert.equal(PAKKETTEN.pro.prijs_label, '€129')

  assert.equal(PAKKETTEN.premium.naam, 'Premium')
  assert.equal(PAKKETTEN.premium.prijs, 19900)
  assert.equal(PAKKETTEN.premium.prijs_label, '€199')
})

test('Stripe Price ID wordt alleen uit de serverconfiguratie gelezen', () => {
  const previous = process.env.STRIPE_PRICE_STARTER
  process.env.STRIPE_PRICE_STARTER = 'price_testStarter123'
  assert.equal(configuredStripePriceId('starter'), 'price_testStarter123')
  process.env.STRIPE_PRICE_STARTER = 'onveilig'
  assert.throws(() => configuredStripePriceId('starter'))
  if (previous === undefined) delete process.env.STRIPE_PRICE_STARTER
  else process.env.STRIPE_PRICE_STARTER = previous
})
