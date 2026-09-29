import { NextRequest } from 'next/server'
import { adminCookie, rejectCrossOriginMutation, verifyAdminSession } from '@/lib/security'
import { checkRateLimit, clientIp, rateLimitResponse } from '@/lib/rate-limit'
import { getStripe, normalizeStripeSecretKey, safePaymentError } from '@/lib/stripe'
import { expectedStripeCatalog, validateStripeCatalogPrice } from '@/lib/stripe-catalog'
import { dutchTaxRegistrationReady, isSiteWebhook, portalFeaturesReady, requiredStripeEvents, sitePortalConfiguration, verifyStripeWebhookDelivery } from '@/lib/stripe-support'
import { invalidJsonResponse, readJsonBody } from '@/lib/request'
import { z } from 'zod'

export async function GET(request: NextRequest) {
  if (!verifyAdminSession(request.cookies.get(adminCookie.name)?.value)) {
    return Response.json({ error: 'Niet ingelogd.' }, { status: 401 })
  }
  const limit = checkRateLimit(`stripe-health:${clientIp(request)}`, 6, 15 * 60_000)
  if (!limit.allowed) return rateLimitResponse(limit.retryAfter)
  const checks: Record<string, { ok: boolean; code?: string }> = {}
  const diagnostics: Record<string, unknown> = {}
  async function check(name: string, action: () => Promise<boolean>) {
    try { checks[name] = { ok: await action() } }
    catch (error) { checks[name] = { ok: false, code: safePaymentError(error).code } }
  }

  await check('liveCredentials', async () => /^(sk|rk)_live_/.test(normalizeStripeSecretKey(process.env.STRIPE_SECRET_KEY)))
  await check('accountCanCharge', async () => (await getStripe().accounts.retrieveCurrent()).charges_enabled)
  for (const entry of expectedStripeCatalog) {
    await check(`price_${entry.key}`, async () => {
      const price = await getStripe().prices.retrieve(process.env[entry.environmentName]?.trim() || '')
      validateStripeCatalogPrice(entry, price)
      return price.livemode
    })
  }
  await check('webhooks', async () => {
    if (!process.env.STRIPE_WEBHOOK_SECRET?.trim()) return false
    const endpoints = await getStripe().webhookEndpoints.list({ limit: 100 })
    diagnostics.webhooks = endpoints.data.filter(endpoint => {
      const url = new URL(endpoint.url)
      return ['landingsite.nl', 'www.landingsite.nl'].includes(url.hostname) && url.pathname === '/api/stripe/webhook'
    }).map(endpoint => ({
      url: endpoint.url, live: endpoint.livemode, status: endpoint.status,
      missingEvents: endpoint.enabled_events.includes('*') ? [] : requiredStripeEvents.filter(event => !(endpoint.enabled_events as string[]).includes(event)),
    }))
    const active = endpoints.data.filter(endpoint => endpoint.livemode && endpoint.status === 'enabled' && isSiteWebhook(endpoint.url))
    return active.some(endpoint => endpoint.enabled_events.includes('*') || requiredStripeEvents.every(event => (endpoint.enabled_events as string[]).includes(event)))
  })
  await check('automaticTax', async () => (await getStripe().tax.settings.retrieve()).status === 'active')
  await check('dutchTaxRegistration', dutchTaxRegistrationReady)
  await check('customerPortal', async () => {
    if (!process.env.CUSTOMER_PORTAL_SECRET?.trim()) return false
    const config = await sitePortalConfiguration()
    diagnostics.customerPortal = config ? {
      live: config.livemode, invoices: config.features.invoice_history.enabled,
      paymentDetails: config.features.payment_method_update.enabled,
      cancellation: config.features.subscription_cancel.enabled, cancellationMode: config.features.subscription_cancel.mode,
    } : null
    return Boolean(config?.livemode && portalFeaturesReady(config))
  })
  return Response.json({ ready: Object.values(checks).every(check => check.ok), checks, diagnostics }, { headers: { 'Cache-Control': 'no-store' } })
}

const setupSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('configure-checkout-support'), confirmed: z.literal(true) }).strict(),
  z.object({ action: z.literal('verify-webhook-delivery'), confirmed: z.literal(true), requestId: z.string().uuid() }).strict(),
])

export async function POST(request: NextRequest) {
  const crossOrigin = rejectCrossOriginMutation(request)
  if (crossOrigin) return crossOrigin
  if (!verifyAdminSession(request.cookies.get(adminCookie.name)?.value)) return Response.json({ error: 'Niet ingelogd.' }, { status: 401 })
  const limit = checkRateLimit(`stripe-setup:${clientIp(request)}`, 3, 15 * 60_000)
  if (!limit.allowed) return rateLimitResponse(limit.retryAfter)
  let body: unknown
  try { body = await readJsonBody(request, 500) } catch (error) { return invalidJsonResponse(error) }
  const parsed = setupSchema.safeParse(body)
  if (!parsed.success) return Response.json({ error: 'Expliciete bevestiging ontbreekt.' }, { status: 400 })
  if (!process.env.STRIPE_WEBHOOK_SECRET?.trim() || !process.env.CUSTOMER_PORTAL_SECRET?.trim()) {
    return Response.json({ error: 'Beveiligingsconfiguratie ontbreekt.' }, { status: 409 })
  }
  try {
    if (parsed.data.action === 'verify-webhook-delivery') {
      return Response.json({ deliveredAndVerified: await verifyStripeWebhookDelivery(parsed.data.requestId) }, { headers: { 'Cache-Control': 'no-store' } })
    }
    const stripe = getStripe()
    const endpoints = await stripe.webhookEndpoints.list({ limit: 100 })
    const matching = endpoints.data.filter(endpoint => endpoint.status === 'enabled' && isSiteWebhook(endpoint.url))
    if (endpoints.has_more || matching.length !== 1) return Response.json({ error: 'Selecteer eerst handmatig precies een actieve websitewebhook in Stripe.' }, { status: 409 })
    const endpoint = matching[0]
    const events = endpoint.enabled_events.includes('*') ? null : [...new Set([...endpoint.enabled_events, ...requiredStripeEvents])]
    if (events && events.length !== endpoint.enabled_events.length) {
      await stripe.webhookEndpoints.update(endpoint.id, { enabled_events: events as typeof requiredStripeEvents })
    }
    const portal = await sitePortalConfiguration(true)
    if (!portal || !portalFeaturesReady(portal)) return Response.json({ error: 'De bestaande portaalconfiguratie vraagt handmatige controle.' }, { status: 409 })
    return Response.json({ ok: true, webhook: 'configured', customerPortal: 'configured' }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('Stripe-ondersteuning instellen mislukt', safePaymentError(error))
    return Response.json({ error: 'Stripe-instellingen konden niet volledig worden bijgewerkt.' }, { status: 503 })
  }
}
