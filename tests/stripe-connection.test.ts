import assert from 'node:assert/strict'
import test from 'node:test'
import { normalizeStripeSecretKey, safePaymentError } from '../lib/stripe'

test('Stripe credentials ignore surrounding whitespace without altering the key', () => {
  for (const key of ['sk_live_example123', 'rk_live_example123', 'sk_test_example123']) {
    assert.equal(normalizeStripeSecretKey(` \r\n${key}\r\n `), key)
  }
})

test('invalid or embedded header characters are rejected without leaking secrets', () => {
  for (const key of [undefined, '', 'sk_live_example\r\nInjectedHeader', 'pk_live_example', 'sk_live_example\\n']) {
    assert.throws(() => normalizeStripeSecretKey(key), /ongeldig formaat/)
  }
})

test('payment logging never includes provider payloads, credentials or customers', () => {
  const error = { type: 'StripeInvalidRequestError', code: 'parameter_invalid', message: 'private@example.com', raw: { headers: { authorization: 'sk_live_private' } }, customer: 'cus_private' }
  assert.deepEqual(safePaymentError(error), { type: 'StripeInvalidRequestError', code: 'parameter_invalid' })
  assert.deepEqual(safePaymentError({ code: 'private@example.com', type: 'private' }), { code: 'payment_error', type: 'Error' })
})
