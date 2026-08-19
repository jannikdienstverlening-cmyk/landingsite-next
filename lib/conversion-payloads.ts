import { createHash } from 'node:crypto'

export type ConfirmedPurchase = {
  eventId: string
  packageId: string
  packageName: string
  value: number
  currency: 'EUR'
  email?: string
  clientId?: string
  fbp?: string
  fbc?: string
  eventSourceUrl: string
  eventTime: number
}

export function buildGa4Purchase(input: ConfirmedPurchase) {
  if (!input.clientId) return null
  return {
    client_id: input.clientId,
    timestamp_micros: input.eventTime * 1_000_000,
    events: [{
      name: 'purchase',
      params: {
        transaction_id: input.eventId,
        currency: input.currency,
        value: input.value,
        items: [{ item_id: input.packageId, item_name: input.packageName, price: input.value, quantity: 1 }],
      },
    }],
  }
}

export function buildMetaPurchase(input: ConfirmedPurchase) {
  const normalizedEmail = input.email?.trim().toLowerCase()
  const userData = {
    ...(normalizedEmail ? { em: [createHash('sha256').update(normalizedEmail).digest('hex')] } : {}),
    ...(input.fbp ? { fbp: input.fbp } : {}),
    ...(input.fbc ? { fbc: input.fbc } : {}),
  }
  if (!Object.keys(userData).length) return null

  return {
    data: [{
      event_name: 'Purchase',
      event_time: input.eventTime,
      event_id: input.eventId,
      action_source: 'website',
      event_source_url: input.eventSourceUrl,
      user_data: userData,
      custom_data: {
        currency: input.currency,
        value: input.value,
        content_ids: [input.packageId],
        content_name: input.packageName,
        content_type: 'product',
      },
    }],
  }
}
