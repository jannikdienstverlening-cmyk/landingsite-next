import assert from 'node:assert/strict'
import test from 'node:test'
import { createOrderToken, isSameOriginMutation, passwordMatches, verifyOrderToken } from '../lib/security'
import { contactSchema } from '../lib/validation'

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
    naam: 'Spam Bot',
    email: 'spam@example.com',
    bedrijf: '',
    telefoon: '',
    bericht: 'Geautomatiseerd spambericht.',
    materiaal: 'onbekend',
    startdatum: '',
    voorkeur: '',
    website: 'https://spam.example',
  })

  assert.equal(parsed.success, true)
  if (parsed.success) assert.equal(Boolean(parsed.data.website), true)
})

test('websiteaanvraag valideert materiaal en optionele projectvoorkeuren', () => {
  const parsed = contactSchema.safeParse({
    naam: 'Test Ondernemer',
    email: 'test@example.com',
    bedrijf: 'Testbedrijf',
    telefoon: '06 12345678',
    bericht: 'Ik wil een professionele landingspagina laten bouwen.',
    materiaal: 'deels',
    startdatum: '2026-09-01',
    voorkeur: 'pro',
    website: '',
  })

  assert.equal(parsed.success, true)
  assert.equal(contactSchema.safeParse({
    naam: 'Test Ondernemer',
    email: 'test@example.com',
    bericht: 'Ik wil een professionele landingspagina laten bouwen.',
    materiaal: 'misschien',
  }).success, false)
})
