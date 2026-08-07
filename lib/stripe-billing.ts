import type Stripe from 'stripe'

export function isFullManagementInvoiceLine(
  line: Stripe.InvoiceLineItem,
  managementPriceIds: ReadonlySet<string>,
  expectedAmountCents: number,
) {
  const price = line.pricing?.price_details?.price
  const priceId = typeof price === 'string' ? price : price?.id
  const hasDiscount = Boolean(line.discount_amounts?.some((discount) => discount.amount > 0))

  return Boolean(
    line.parent?.subscription_item_details
    && priceId
    && managementPriceIds.has(priceId)
    && line.amount === expectedAmountCents
    && !hasDiscount,
  )
}
