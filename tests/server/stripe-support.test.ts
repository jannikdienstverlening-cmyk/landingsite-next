import assert from 'node:assert/strict'
import test from 'node:test'
import { randomUUID } from 'node:crypto'
import { NextRequest } from 'next/server'
import { POST as setup } from '../../app/api/admin/stripe-health/route'
import { POST as portal } from '../../app/api/stripe/portal/route'
import { createAdminSession, createCustomerToken } from '../../lib/security'
import { getStripe } from '../../lib/stripe'
import { getSupabase } from '../../lib/supabase'
import { isSiteWebhook, portalFeaturesReady, requiredStripeEvents, sitePortalConfiguration, verifyStripeWebhookDelivery } from '../../lib/stripe-support'

process.env.STRIPE_SECRET_KEY = 'sk_test_localmock'
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_localmock'
process.env.STRIPE_PRICE_WEBSITE_MANAGEMENT = 'price_localmanagement'
process.env.NEXT_PUBLIC_BASE_URL = 'https://www.landingsite.nl'
process.env.ADMIN_SESSION_SECRET = 'local-mock-admin'
process.env.CUSTOMER_PORTAL_SECRET = 'local-mock-customer'
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://database.example.com'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'local-mock-key'

const configuration = {
  id: 'bpc_mock', active: true, livemode: false,
  metadata: { application: 'landingsite.nl', purpose: 'customer_portal_v1' },
  features: { invoice_history: { enabled: true }, payment_method_update: { enabled: true }, subscription_cancel: { enabled: true, mode: 'at_period_end' } },
}

function request(body: unknown, authenticated = true, origin = 'https://www.landingsite.nl') {
  return new NextRequest('https://www.landingsite.nl/api/admin/stripe-health', {
    method: 'POST', headers: { origin, 'content-type': 'application/json', 'x-forwarded-for': randomUUID(), ...(authenticated ? { cookie: `landingsite_admin=${createAdminSession()}` } : {}) },
    body: JSON.stringify(body),
  })
}

test('webhook health accepts tracking queries but not a different host or path', () => {
  assert.ok(isSiteWebhook('https://www.landingsite.nl/api/stripe/webhook?source=live'))
  assert.equal(isSiteWebhook('https://landingsite.nl/api/stripe/webhook'), false)
  assert.equal(isSiteWebhook('https://www.landingsite.nl.evil.example/api/stripe/webhook'), false)
  assert.equal(isSiteWebhook('https://www.landingsite.nl/api/stripe/portal'), false)
  assert.equal(isSiteWebhook('not a URL'), false)
})

test('support setup requires admin, same origin and explicit bounded confirmation', async context => {
  const list = context.mock.method(getStripe().webhookEndpoints, 'list', () => { throw new Error('Unexpected provider call') })
  assert.equal((await setup(request({}, false))).status, 401)
  assert.equal((await setup(request({}, true, 'https://evil.example'))).status, 403)
  assert.equal((await setup(request({ action: 'configure-checkout-support', confirmed: true, price: 1 }))).status, 400)
  assert.equal(list.mock.callCount(), 0)
})

test('setup only adds required events to the existing endpoint and leaves its URL and secret intact', async context => {
  context.mock.method(getStripe().webhookEndpoints, 'list', async () => ({ data: [{ id: 'we_mock', status: 'enabled', url: 'https://www.landingsite.nl/api/stripe/webhook?source=live', enabled_events: ['charge.succeeded'] }], has_more: false }) as never)
  const update = context.mock.method(getStripe().webhookEndpoints, 'update', async () => ({}) as never)
  context.mock.method(getStripe().billingPortal.configurations, 'list', async () => ({ data: [configuration], has_more: false }) as never)
  assert.equal((await setup(request({ action: 'configure-checkout-support', confirmed: true }))).status, 200)
  const [id, params] = update.mock.calls[0].arguments
  assert.equal(id, 'we_mock')
  assert.deepEqual(Object.keys(params!), ['enabled_events'])
  assert.ok(params!.enabled_events?.includes('charge.succeeded'))
  assert.ok(requiredStripeEvents.every(event => params!.enabled_events?.includes(event)))
})

test('ambiguous webhook configuration is never guessed or modified', async context => {
  context.mock.method(getStripe().webhookEndpoints, 'list', async () => ({ data: [], has_more: false }) as never)
  const update = context.mock.method(getStripe().webhookEndpoints, 'update', () => { throw new Error('Unexpected update') })
  assert.equal((await setup(request({ action: 'configure-checkout-support', confirmed: true }))).status, 409)
  assert.equal(update.mock.callCount(), 0)
})

test('portal setup is scoped to Landingsite with period-end cancellation and no plan changes', async context => {
  let stored = false
  context.mock.method(getStripe().billingPortal.configurations, 'list', async () => ({ data: stored ? [configuration] : [{ ...configuration, id: 'bpc_unrelated', metadata: { application: 'another-project' } }], has_more: false }) as never)
  const create = context.mock.method(getStripe().billingPortal.configurations, 'create', async () => { stored = true; return configuration as never })
  assert.equal(await sitePortalConfiguration(), null)
  assert.equal(create.mock.callCount(), 0)
  await sitePortalConfiguration(true)
  await sitePortalConfiguration(true)
  assert.equal(create.mock.callCount(), 1)
  const [params, options] = create.mock.calls[0].arguments
  assert.deepEqual(params!.features.subscription_cancel, { enabled: true, mode: 'at_period_end', proration_behavior: 'none' })
  assert.deepEqual(params!.features.subscription_update, { enabled: false })
  assert.equal(options?.idempotencyKey, 'landingsite-customer-portal-v1')
  assert.ok(portalFeaturesReady(configuration as never))
})

test('customer portal uses the verified customer and explicit site configuration', async context => {
  const id = randomUUID()
  const token = createCustomerToken(id)
  context.mock.method(getSupabase(), 'from', (() => {
    const query = { select() { return this }, eq() { return this }, maybeSingle: async () => ({ data: { stripe_customer_id: 'cus_mock', management_subscription_id: 'sub_mock' }, error: null }) }
    return query
  }) as never)
  context.mock.method(getStripe().billingPortal.configurations, 'list', async () => ({ data: [configuration], has_more: false }) as never)
  const create = context.mock.method(getStripe().billingPortal.sessions, 'create', async () => ({ url: 'https://billing.stripe.com/p/session/mock' }) as never)
  const response = await portal(request({ order_id: id, token }, false))
  assert.equal(response.status, 200)
  assert.equal(create.mock.calls[0].arguments[0]!.configuration, 'bpc_mock')
  assert.equal(create.mock.calls[0].arguments[0]!.customer, 'cus_mock')
  assert.ok(create.mock.calls[0].arguments[0]!.return_url?.startsWith(`https://www.landingsite.nl/beheer/${id}`))
})

test('delivery verification only expires an empty diagnostic session and requires a processed signed event', async context => {
  const create = context.mock.method(getStripe().checkout.sessions, 'create', async () => ({ id: 'cs_test_diagnostic' }) as never)
  context.mock.method(getStripe().checkout.sessions, 'retrieve', async () => ({ status: 'open', payment_status: 'unpaid' }) as never)
  const expire = context.mock.method(getStripe().checkout.sessions, 'expire', async () => ({}) as never)
  context.mock.method(getStripe().events, 'list', async () => ({ data: [{ id: 'evt_diagnostic', data: { object: { id: 'cs_test_diagnostic' } } }] }) as never)
  context.mock.method(getSupabase(), 'from', ((table: string) => {
    assert.equal(table, 'stripe_webhook_events')
    const query = { select() { return this }, eq() { return this }, maybeSingle: async () => ({ data: { status: 'processed' }, error: null }) }
    return query
  }) as never)
  assert.equal(await verifyStripeWebhookDelivery(randomUUID()), true)
  assert.equal(expire.mock.callCount(), 1)
  assert.equal(create.mock.calls[0].arguments[0]!.metadata?.checkout_type, 'diagnostic')
  assert.deepEqual(create.mock.calls[0].arguments[0]!.line_items, [{ price: 'price_localmanagement', quantity: 1 }])
})

test('delivery verification refuses to alter a checkout with customer or payment data', async context => {
  context.mock.method(getStripe().checkout.sessions, 'create', async () => ({ id: 'cs_test_diagnostic' }) as never)
  context.mock.method(getStripe().checkout.sessions, 'retrieve', async () => ({ status: 'complete', payment_status: 'paid', customer: 'cus_mock' }) as never)
  const expire = context.mock.method(getStripe().checkout.sessions, 'expire', () => { throw new Error('Unexpected expiration') })
  await assert.rejects(verifyStripeWebhookDelivery(randomUUID()), /geen klantbetaling wijzigen/)
  assert.equal(expire.mock.callCount(), 0)
})
