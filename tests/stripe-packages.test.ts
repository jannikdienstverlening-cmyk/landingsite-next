import assert from 'node:assert/strict'
import test from 'node:test'
import {
  configuredBuildPriceId,
  configuredManagementPriceId,
  PAKKETTEN,
  STRIPE_BUILD_PAYMENT_METHODS,
  STRIPE_CHECKOUT_BRAND,
  STRIPE_MANAGEMENT_PAYMENT_METHODS,
  stripeCheckoutBranding,
  stripePaymentMethods,
} from '../lib/stripe'

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

test('Stripe Checkout gebruikt de Landingsite-huisstijl en alleen een publiek merkicoon', () => {
  const liveBranding = stripeCheckoutBranding('https://www.landingsite.nl/')
  assert.equal(liveBranding.background_color, STRIPE_CHECKOUT_BRAND.backgroundColor)
  assert.equal(liveBranding.button_color, STRIPE_CHECKOUT_BRAND.buttonColor)
  assert.equal(liveBranding.display_name, 'Landingsite.nl')
  assert.equal(liveBranding.font_family, 'inter')
  assert.deepEqual(liveBranding.icon, {
    type: 'url',
    url: 'https://www.landingsite.nl/images/stripe-icon.png',
  })

  assert.equal(stripeCheckoutBranding('http://localhost:3000').icon, undefined)
})

test('Stripe Checkout geeft iDEAL voorrang en beperkt afleidende betaalmethoden', () => {
  assert.deepEqual(stripePaymentMethods(STRIPE_BUILD_PAYMENT_METHODS), ['ideal', 'card'])
  assert.deepEqual(stripePaymentMethods(STRIPE_MANAGEMENT_PAYMENT_METHODS), ['ideal', 'card', 'sepa_debit'])
  assert.equal(STRIPE_BUILD_PAYMENT_METHODS.includes('ideal'), true)
  assert.equal(STRIPE_BUILD_PAYMENT_METHODS.includes('eps' as never), false)
  assert.equal(STRIPE_BUILD_PAYMENT_METHODS.includes('amazon_pay' as never), false)
})
