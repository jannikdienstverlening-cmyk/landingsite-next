import assert from 'node:assert/strict'
import test from 'node:test'
import { checkoutSchema, customerManagementCheckoutSchema } from '../lib/validation'

test('checkout vereist pakket, idempotency-id en expliciete voorwaardenacceptatie', () => {
  const valid = checkoutSchema.safeParse({
    pakket: 'pro',
    requestId: '9c8cf9f6-dbf0-4ffc-a09c-5553a95b38ae',
    termsAccepted: true,
  })
  assert.equal(valid.success, true)
  assert.equal(checkoutSchema.safeParse({
    pakket: 'starter',
    requestId: '9c8cf9f6-dbf0-4ffc-a09c-5553a95b38ae',
    termsAccepted: true,
    attribution: {
      consentVersion: 'consent-v2',
      analyticsConsent: true,
      marketingConsent: false,
      landing_page: '/?utm_source=google',
      first_visit_at: '2026-08-19T10:00:00.000Z',
      utm_source: 'google',
      ga_client_id: '123456789.987654321',
    },
  }).success, true)
  assert.equal(checkoutSchema.safeParse({
    pakket: 'starter',
    requestId: '9c8cf9f6-dbf0-4ffc-a09c-5553a95b38ae',
    termsAccepted: true,
    attribution: { consentVersion: 'consent-v2', analyticsConsent: true, marketingConsent: true, landing_page: 'https://malicious.test/' },
  }).success, false)
  assert.equal(checkoutSchema.safeParse({ pakket: 'pro' }).success, false)
  assert.equal(checkoutSchema.safeParse({
    pakket: 'pro',
    requestId: '9c8cf9f6-dbf0-4ffc-a09c-5553a95b38ae',
    termsAccepted: false,
  }).success, false)
})

test('Websitebeheer-checkout vereist klanttoken, idempotency-id en voorwaardenacceptatie', () => {
  const valid = customerManagementCheckoutSchema.safeParse({
    order_id: '9c8cf9f6-dbf0-4ffc-a09c-5553a95b38ae',
    token: 'v1.customer.' + 'a'.repeat(80),
    requestId: '2417e5fc-5b40-4aa8-8472-f7f6d41ac47d',
    termsAccepted: true,
  })
  assert.equal(valid.success, true)
  assert.equal(customerManagementCheckoutSchema.safeParse({
    order_id: '9c8cf9f6-dbf0-4ffc-a09c-5553a95b38ae',
    requestId: '2417e5fc-5b40-4aa8-8472-f7f6d41ac47d',
    termsAccepted: true,
  }).success, false)
  assert.equal(customerManagementCheckoutSchema.safeParse({
    order_id: '9c8cf9f6-dbf0-4ffc-a09c-5553a95b38ae',
    token: 'v1.customer.' + 'a'.repeat(80),
    requestId: '2417e5fc-5b40-4aa8-8472-f7f6d41ac47d',
    termsAccepted: false,
  }).success, false)
})
