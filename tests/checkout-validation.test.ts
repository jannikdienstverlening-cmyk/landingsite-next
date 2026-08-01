import assert from 'node:assert/strict'
import test from 'node:test'
import { checkoutSchema } from '../lib/validation'

test('checkout vereist pakket, idempotency-id en expliciete voorwaardenacceptatie', () => {
  const valid = checkoutSchema.safeParse({
    pakket: 'pro',
    requestId: '9c8cf9f6-dbf0-4ffc-a09c-5553a95b38ae',
    termsAccepted: true,
  })
  assert.equal(valid.success, true)
  assert.equal(checkoutSchema.safeParse({ pakket: 'pro' }).success, false)
  assert.equal(checkoutSchema.safeParse({
    pakket: 'pro',
    requestId: '9c8cf9f6-dbf0-4ffc-a09c-5553a95b38ae',
    termsAccepted: false,
  }).success, false)
})
