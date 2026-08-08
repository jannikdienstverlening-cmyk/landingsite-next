import assert from 'node:assert/strict'
import test from 'node:test'
import { createOrderToken, isSameOriginMutation, passwordMatches, verifyOrderToken } from '../lib/security'
import { contactSchema } from '../lib/validation'
import { createCustomerAssetReference, parseCustomerAssetReference } from '../lib/customer-assets'

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

test('lokale ontwikkeling accepteert localhost en 127.0.0.1 op dezelfde poort', () => {
  process.env.NEXT_PUBLIC_BASE_URL = 'http://localhost:3001'
  assert.equal(isSameOriginMutation(new Request('http://localhost:3001/api/contact', {
    method: 'POST',
    headers: { origin: 'http://127.0.0.1:3001', 'sec-fetch-site': 'same-origin' },
  })), true)
  assert.equal(isSameOriginMutation(new Request('http://localhost:3001/api/contact', {
    method: 'POST',
    headers: { origin: 'http://127.0.0.1:3002', 'sec-fetch-site': 'same-origin' },
  })), false)
})

test('contacthoneypot kan ingevulde spam veilig afvangen', () => {
  const parsed = contactSchema.safeParse({
    requestId: '91f70936-b572-4b35-9044-ce47e87ac099',
    naam: 'Spam Bot',
    email: 'spam@example.com',
    bericht: 'Geautomatiseerd spambericht.',
    website: 'https://spam.example',
  })

  assert.equal(parsed.success, true)
  if (parsed.success) assert.equal(Boolean(parsed.data.website), true)
})

test('kort contactformulier valideert alleen noodzakelijke velden', () => {
  const parsed = contactSchema.safeParse({
    requestId: '91f70936-b572-4b35-9044-ce47e87ac099',
    naam: 'Test Ondernemer',
    email: 'test@example.com',
    bericht: 'Ik wil een professionele landingspagina laten bouwen.',
    website: '',
  })

  assert.equal(parsed.success, true)
  assert.equal(contactSchema.safeParse({
    requestId: '91f70936-b572-4b35-9044-ce47e87ac099',
    naam: 'Test Ondernemer',
    email: 'geen-geldig-adres',
    bericht: 'Ik wil een professionele landingspagina laten bouwen.',
  }).success, false)
})

test('klantassets gebruiken alleen een afgeschermde interne referentie', () => {
  const path = '91f70936-b572-4b35-9044-ce47e87ac099/0123456789abcdef0123456789abcdef.webp'
  const reference = createCustomerAssetReference(path)
  assert.equal(reference, `asset://customer-assets/${path}`)
  assert.equal(parseCustomerAssetReference(reference), path)
  assert.equal(parseCustomerAssetReference('asset://customer-assets/../secret.webp'), null)
})
