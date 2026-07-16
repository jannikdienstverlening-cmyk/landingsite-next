import assert from 'node:assert/strict'
import test from 'node:test'
import { createOrderToken, passwordMatches, verifyOrderToken } from '../lib/security'

process.env.ORDER_TOKEN_SECRET = 'test-order-secret-that-is-long-enough'
process.env.ADMIN_PASSWORD = 'correct horse battery staple'

test('ordertokens zijn getekend en aan één order gebonden', () => {
  const token = createOrderToken('order-123')
  assert.equal(verifyOrderToken(token, 'order-123'), true)
  assert.equal(verifyOrderToken(token, 'order-456'), false)
  assert.equal(verifyOrderToken(`${token}x`, 'order-123'), false)
})

test('adminwachtwoord wordt exact en timing-safe vergeleken', () => {
  assert.equal(passwordMatches('correct horse battery staple'), true)
  assert.equal(passwordMatches('correct horse battery stapl'), false)
})
