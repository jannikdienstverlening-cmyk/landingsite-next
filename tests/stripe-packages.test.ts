import assert from 'node:assert/strict'
import test from 'node:test'
import { PAKKETTEN } from '../lib/stripe'

test('Stripe checkout gebruikt de vaste eenmalige pakketprijzen', () => {
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
