import assert from 'node:assert/strict'
import test from 'node:test'
import { calculatePartnerExample, commissionForLevel } from '../lib/partner'

test('5x5-rekenvoorbeeld gebruikt drie betaalde niveaus', () => {
  const example = calculatePartnerExample()
  assert.deepEqual(example.levels.map((level) => level.customers), [5, 25, 125])
  assert.deepEqual(example.levels.map((level) => level.earnings), [100, 125, 250])
  assert.equal(example.totalCustomers, 155)
  assert.equal(example.totalMonthlyEarnings, 475)
})

test('per abonnement worden maximaal drie niveaus beloond', () => {
  assert.equal(commissionForLevel(1), 20)
  assert.equal(commissionForLevel(2), 5)
  assert.equal(commissionForLevel(3), 2)
  assert.equal(commissionForLevel(4), 0)
})
