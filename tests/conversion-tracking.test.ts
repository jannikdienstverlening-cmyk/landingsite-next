import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { createHash } from 'node:crypto'
import { buildGa4Purchase, buildMetaPurchase, type ConfirmedPurchase } from '../lib/conversion-payloads'

const purchase: ConfirmedPurchase = {
  eventId: 'cs_test_confirmed_purchase',
  packageId: 'pro',
  packageName: 'Pro',
  value: 278,
  currency: 'EUR',
  email: ' KLANT@EXAMPLE.NL ',
  clientId: '123456789.987654321',
  fbp: 'fb.1.1724061600000.123456789',
  fbc: 'fb.1.1724061600000.click-id',
  eventSourceUrl: 'https://www.landingsite.nl/?utm_source=meta',
  eventTime: 1_724_061_600,
}

test('GA4-aankoop gebruikt Stripe-sessie als unieke transactie', () => {
  const payload = buildGa4Purchase(purchase)
  assert.equal(payload?.client_id, purchase.clientId)
  assert.equal(payload?.events[0]?.name, 'purchase')
  assert.equal(payload?.events[0]?.params.transaction_id, purchase.eventId)
  assert.equal(payload?.events[0]?.params.value, purchase.value)
  assert.equal(buildGa4Purchase({ ...purchase, clientId: undefined }), null)
})

test('Meta-aankoop gebruikt dezelfde event-ID en alleen een gehashte e-mail', () => {
  const payload = buildMetaPurchase(purchase)
  assert.equal(payload?.data[0]?.event_id, purchase.eventId)
  assert.equal(payload?.data[0]?.custom_data.value, purchase.value)
  assert.deepEqual(payload?.data[0]?.user_data.em, [createHash('sha256').update('klant@example.nl').digest('hex')])
  assert.doesNotMatch(JSON.stringify(payload), /klant@example\.nl/i)
})

test('purchase is consentgebonden, webhookveilig en browser/server-dedupliceerbaar', async () => {
  const [checkout, webhook, intake, analytics] = await Promise.all([
    readFile(new URL('../app/api/stripe/checkout/route.ts', import.meta.url), 'utf8'),
    readFile(new URL('../app/api/stripe/webhook/route.ts', import.meta.url), 'utf8'),
    readFile(new URL('../app/intake/[session_id]/page.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../lib/analytics.ts', import.meta.url), 'utf8'),
  ])
  assert.match(checkout, /tracking_consent_version/)
  assert.match(webhook, /server_purchase_google_sent/)
  assert.match(webhook, /server_purchase_meta_sent/)
  assert.match(intake, /purchase:\$\{data\.order\.purchase\.eventId\}/)
  assert.match(analytics, /eventID: eventId/)
})
