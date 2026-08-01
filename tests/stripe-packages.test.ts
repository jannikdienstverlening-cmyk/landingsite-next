import assert from 'node:assert/strict'
import test from 'node:test'
import { configuredBuildPriceId, configuredManagementPriceId, PAKKETTEN } from '../lib/stripe'

test('Stripe checkout gebruikt de eenmalige bouwprijzen', () => {
  assert.equal(PAKKETTEN.starter.naam, 'Starter')
  assert.equal(PAKKETTEN.starter.prijs, 29900)
  assert.equal(PAKKETTEN.starter.prijs_label, '€299')

  assert.equal(PAKKETTEN.pro.naam, 'Pro')
  assert.equal(PAKKETTEN.pro.prijs, 49900)
  assert.equal(PAKKETTEN.pro.prijs_label, '€499')

  assert.equal(PAKKETTEN.premium.naam, 'Premium')
  assert.equal(PAKKETTEN.premium.prijs, 89900)
  assert.equal(PAKKETTEN.premium.prijs_label, '€899')
})

test('Stripe Price ID wordt alleen uit de serverconfiguratie gelezen', () => {
  const previousBuild = process.env.STRIPE_BUILD_PRICE_STARTER
  const previousManagement = process.env.STRIPE_PRICE_WEBSITE_MANAGEMENT
  process.env.STRIPE_BUILD_PRICE_STARTER = 'price_testStarter123'
  process.env.STRIPE_PRICE_WEBSITE_MANAGEMENT = 'price_testManagement123'
  assert.equal(configuredBuildPriceId('starter'), 'price_testStarter123')
  assert.equal(configuredManagementPriceId(), 'price_testManagement123')
  process.env.STRIPE_BUILD_PRICE_STARTER = 'onveilig'
  assert.throws(() => configuredBuildPriceId('starter'))
  if (previousBuild === undefined) delete process.env.STRIPE_BUILD_PRICE_STARTER
  else process.env.STRIPE_BUILD_PRICE_STARTER = previousBuild
  if (previousManagement === undefined) delete process.env.STRIPE_PRICE_WEBSITE_MANAGEMENT
  else process.env.STRIPE_PRICE_WEBSITE_MANAGEMENT = previousManagement
})
