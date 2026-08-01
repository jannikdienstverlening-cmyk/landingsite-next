import assert from 'node:assert/strict'
import test from 'node:test'
import { createOrderToken, isSameOriginMutation, passwordMatches, verifyOrderToken } from '../lib/security'

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

test('muterende browserroutes accepteren alleen dezelfde origin', () => {
  process.env.NEXT_PUBLIC_BASE_URL = 'https://landingsite.nl'
  assert.equal(isSameOriginMutation(new Request('https://landingsite.nl/api/contact', {
    method: 'POST',
    headers: { origin: 'https://landingsite.nl', 'sec-fetch-site': 'same-origin' },
  })), true)
  assert.equal(isSameOriginMutation(new Request('https://landingsite.nl/api/contact', {
    method: 'POST',
    headers: { origin: 'https://aanvaller.example', 'sec-fetch-site': 'cross-site' },
  })), false)
  assert.equal(isSameOriginMutation(new Request('https://landingsite.nl/api/contact', { method: 'POST' })), false)
})
