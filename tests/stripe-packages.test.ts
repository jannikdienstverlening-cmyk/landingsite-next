import assert from 'node:assert/strict'
import test from 'node:test'
import { PAKKETTEN } from '../lib/stripe'

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
