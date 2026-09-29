import { NextRequest } from 'next/server'
import { adminCookie, verifyAdminSession } from '@/lib/security'
import { checkRateLimit, clientIp, rateLimitResponse } from '@/lib/rate-limit'
import { getStripe, normalizeStripeSecretKey, safePaymentError } from '@/lib/stripe'
import { expectedStripeCatalog, validateStripeCatalogPrice } from '@/lib/stripe-catalog'

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
    const required = [
      'checkout.session.completed', 'checkout.session.async_payment_succeeded', 'checkout.session.async_payment_failed',
      'checkout.session.expired', 'invoice.paid', 'invoice.payment_failed', 'invoice.voided',
      'customer.subscription.created', 'customer.subscription.updated', 'customer.subscription.deleted',
      'charge.refunded', 'charge.dispute.created', 'charge.dispute.closed',
    ]
    const endpoints = await getStripe().webhookEndpoints.list({ limit: 100 })
    const expectedUrl = `${process.env.NEXT_PUBLIC_BASE_URL?.trim().replace(/\/$/, '')}/api/stripe/webhook`
    diagnostics.webhooks = endpoints.data.filter(endpoint => {
      const url = new URL(endpoint.url)
      return ['landingsite.nl', 'www.landingsite.nl'].includes(url.hostname) && url.pathname === '/api/stripe/webhook'
    }).map(endpoint => ({
      url: endpoint.url, live: endpoint.livemode, status: endpoint.status,
      missingEvents: endpoint.enabled_events.includes('*') ? [] : required.filter(event => !(endpoint.enabled_events as string[]).includes(event)),
    }))
    const active = endpoints.data.filter(endpoint => endpoint.livemode && endpoint.status === 'enabled' && endpoint.url === expectedUrl)
    return active.some(endpoint => endpoint.enabled_events.includes('*') || required.every(event => (endpoint.enabled_events as string[]).includes(event)))
  })
  await check('automaticTax', async () => (await getStripe().tax.settings.retrieve()).status === 'active')
  await check('customerPortal', async () => {
    if (!process.env.CUSTOMER_PORTAL_SECRET?.trim()) return false
    const configurations = await getStripe().billingPortal.configurations.list({ active: true, is_default: true, limit: 10 })
    diagnostics.customerPortal = configurations.data.map(config => ({
      live: config.livemode, invoices: config.features.invoice_history.enabled,
      paymentDetails: config.features.payment_method_update.enabled,
      cancellation: config.features.subscription_cancel.enabled, cancellationMode: config.features.subscription_cancel.mode,
    }))
    return configurations.data.some(config => config.livemode && config.features.invoice_history.enabled && config.features.payment_method_update.enabled && config.features.subscription_cancel.enabled && config.features.subscription_cancel.mode === 'at_period_end')
  })
  return Response.json({ ready: Object.values(checks).every(check => check.ok), checks, diagnostics }, { headers: { 'Cache-Control': 'no-store' } })
}
