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
  assert.equal(checkoutSchema.safeParse({ pakket: 'pro' }).success, false)
  assert.equal(checkoutSchema.safeParse({
    pakket: 'pro',
    requestId: '9c8cf9f6-dbf0-4ffc-a09c-5553a95b38ae',
    termsAccepted: false,
  }).success, false)
})

test('Websitebeheer-checkout vereist een beveiligde klanttoken en idempotency-id', () => {
  const valid = customerManagementCheckoutSchema.safeParse({
    order_id: '9c8cf9f6-dbf0-4ffc-a09c-5553a95b38ae',
    token: 'v1.customer.' + 'a'.repeat(80),
    requestId: '2417e5fc-5b40-4aa8-8472-f7f6d41ac47d',
  })
  assert.equal(valid.success, true)
  assert.equal(customerManagementCheckoutSchema.safeParse({
    order_id: '9c8cf9f6-dbf0-4ffc-a09c-5553a95b38ae',
    requestId: '2417e5fc-5b40-4aa8-8472-f7f6d41ac47d',
  }).success, false)
})
