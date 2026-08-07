import assert from 'node:assert/strict'
import test from 'node:test'
import type Stripe from 'stripe'
import { isFullManagementInvoiceLine } from '../lib/stripe-billing'

function line(overrides: Partial<Stripe.InvoiceLineItem> = {}) {
  return {
    amount: 7900,
    parent: { subscription_item_details: { subscription_item: 'si_123', invoice_item: null, proration: false, proration_details: null }, invoice_item_details: null, type: 'subscription_item_details' },
    pricing: { type: 'price_details', price_details: { price: 'price_management', product: 'prod_management' }, unit_amount_decimal: '7900' },
    discount_amounts: [],
    ...overrides,
  } as unknown as Stripe.InvoiceLineItem
}

test('alleen de volledige terugkerende beheerregel telt voor commissie', () => {
  const ids = new Set(['price_management'])
  assert.equal(isFullManagementInvoiceLine(line(), ids, 7900), true)
  assert.equal(isFullManagementInvoiceLine(line({ amount: 29900 }), ids, 7900), false)
  assert.equal(isFullManagementInvoiceLine(line({ discount_amounts: [{ amount: 500, discount: 'di_123' }] }), ids, 7900), false)
  assert.equal(isFullManagementInvoiceLine(line({ parent: null }), ids, 7900), false)
})
