import { KvkClient } from './client'
import type { KvkMutationSignal } from './types'

type UnknownRecord = Record<string, unknown>
const record = (value: unknown): UnknownRecord => value && typeof value === 'object' && !Array.isArray(value) ? value as UnknownRecord : {}
const text = (value: unknown) => typeof value === 'string' ? value : null

function arrayFrom(value: unknown, keys: string[]) {
  if (Array.isArray(value)) return value
  const source = record(value)
  for (const key of keys) if (Array.isArray(source[key])) return source[key] as unknown[]
  return []
}

function subscriptionIdFrom(value: unknown) {
  const source = record(value)
  return text(source.abonnementId) ?? text(source.id) ?? text(source.technischAbonnementId)
}

export async function pullKvkMutations(input: { from?: string; until?: string }, client = new KvkClient()) {
  let subscriptionId = process.env.KVK_MUTATION_SUBSCRIPTION_ID ?? ''
  if (!subscriptionId) {
    const subscriptions = await client.listMutationSubscriptions()
    const first = arrayFrom(subscriptions, ['abonnementen', 'items', 'resultaten'])[0] ?? subscriptions
    subscriptionId = subscriptionIdFrom(first) ?? ''
  }
  if (!subscriptionId) throw new Error('Geen technisch KVK Mutatieservice-abonnement gevonden.')

  const listing = await client.getMutationSubscription(subscriptionId, input.from, input.until)
  const summaries = arrayFrom(listing, ['signalen', 'items', 'resultaten'])
  const signals: KvkMutationSignal[] = []
  for (const summaryValue of summaries) {
    const summary = record(summaryValue)
    const signalId = text(summary.signaalId) ?? text(summary.id)
    if (!signalId) continue
    const detailValue = await client.getMutationSignal(subscriptionId, signalId)
    const detail = record(detailValue)
    const concerns = record(detail.betreft ?? detail.heeftBetrekkingOp ?? detail.inschrijving)
    const eventId = text(detail.berichtId) ?? text(detail.registratieId) ?? `${subscriptionId}:${signalId}`
    signals.push({
      eventId,
      subscriptionId,
      signalId,
      signalType: text(detail.signaalType) ?? text(detail.gebeurtenisnaam) ?? text(summary.type) ?? 'ONBEKEND',
      kvkNumber: text(concerns.kvkNummer) ?? text(detail.kvkNummer),
      establishmentNumber: text(concerns.vestigingsnummer) ?? text(detail.vestigingsnummer),
      registeredAt: text(detail.registratietijdstip) ?? text(detail.timestamp),
      payload: detail,
    })
  }
  return signals
}
