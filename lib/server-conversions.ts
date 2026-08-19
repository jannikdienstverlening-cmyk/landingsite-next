import 'server-only'
import { serverTrackingConfig } from '@/config/server-tracking'
import { buildGa4Purchase, buildMetaPurchase, type ConfirmedPurchase } from '@/lib/conversion-payloads'

export async function sendGooglePurchase(input: ConfirmedPurchase) {
  const config = serverTrackingConfig()
  if (!config.enabled || !config.google.measurementId || !config.google.apiSecret) return false
  const payload = buildGa4Purchase(input)
  if (!payload) return false

  const endpoint = new URL('https://www.google-analytics.com/mp/collect')
  endpoint.searchParams.set('measurement_id', config.google.measurementId)
  endpoint.searchParams.set('api_secret', config.google.apiSecret)
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(8_000),
  })
  if (!response.ok) throw new Error(`Google aankoopmeting geweigerd (${response.status}).`)
  return true
}

export async function sendMetaPurchase(input: ConfirmedPurchase) {
  const config = serverTrackingConfig()
  if (!config.enabled || !config.meta.pixelId || !config.meta.accessToken || !config.meta.apiVersion) return false
  const payload = buildMetaPurchase(input)
  if (!payload) return false

  const response = await fetch(`https://graph.facebook.com/${encodeURIComponent(config.meta.apiVersion)}/${encodeURIComponent(config.meta.pixelId)}/events`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...payload, access_token: config.meta.accessToken }),
    signal: AbortSignal.timeout(8_000),
  })
  if (!response.ok) throw new Error(`Meta aankoopmeting geweigerd (${response.status}).`)
  return true
}
