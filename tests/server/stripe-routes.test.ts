import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import test, { beforeEach } from 'node:test'
import { NextRequest } from 'next/server'
import { POST as checkout } from '../../app/api/stripe/checkout/route'
import { POST as webhook } from '../../app/api/stripe/webhook/route'
import { GET as health } from '../../app/api/admin/stripe-health/route'
import { getStripe } from '../../lib/stripe'
import { getSupabase } from '../../lib/supabase'
import { getResend } from '../../lib/resend'
import { effectiveBuildPrice } from '../../config/commercial'

// Provider calls are always mocked; this suite never creates payments or database rows.
process.env.STRIPE_SECRET_KEY = 'sk_test_localmock'
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_localmock'
process.env.STRIPE_PRICE_WEBSITE_MANAGEMENT = 'price_localmanagement'
process.env.STRIPE_BUILD_PRICE_STARTER = 'price_localstarter'
process.env.STRIPE_BUILD_PRICE_PRO = 'price_localpro'
process.env.STRIPE_BUILD_PRICE_PREMIUM = 'price_localpremium'
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://database.example.com'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'local-mock-key'
process.env.NEXT_PUBLIC_BASE_URL = 'https://www.landingsite.nl'
process.env.ADMIN_SESSION_SECRET = 'local-mock-secret'
process.env.CUSTOMER_PORTAL_SECRET = 'local-mock-customer-secret'
process.env.RESEND_API_KEY = 're_localmock'
process.env.ADMIN_EMAIL = 'admin@example.com'

beforeEach(context => {
  assert.ok('mock' in context)
  context.mock.method(getStripe().tax.registrations, 'list', async () => ({ data: [{ country: 'NL' }] }) as never)
})

function request(body: unknown, origin = 'https://www.landingsite.nl') {
  return new NextRequest('https://www.landingsite.nl/api/stripe/checkout', {
    method: 'POST', headers: { origin, 'content-type': 'application/json', 'x-forwarded-for': randomUUID() }, body: JSON.stringify(body),
  })
}

test('each checkout adds only the server build price and recurring management item', async context => {
  const create = context.mock.method(getStripe().checkout.sessions, 'create', async () => ({ id: 'cs_test_mock', url: 'https://checkout.stripe.com/c/pay/cs_test_mock' }) as never)
  context.mock.method(getStripe().checkout.sessions, 'retrieve', async () => ({ status: 'open', url: 'https://checkout.stripe.com/c/pay/cs_test_mock' }) as never)
  context.mock.method(getSupabase(), 'from', (() => ({ upsert: async () => ({ error: null }) })) as never)
  for (const pakket of ['starter', 'pro', 'premium'] as const) {
    const requestId = randomUUID()
    assert.equal((await checkout(request({ pakket, requestId, termsAccepted: true }))).status, 200)
    const args = create.mock.calls.at(-1)!.arguments
    const params = args[0]!
    assert.equal(params.mode, 'subscription')
    assert.equal(params.automatic_tax?.enabled, true)
    assert.equal(params.success_url, 'https://www.landingsite.nl/intake/{CHECKOUT_SESSION_ID}')
    assert.match(params.cancel_url!, new RegExp(`pakket=${pakket}&status=geannuleerd`))
    const build = effectiveBuildPrice(pakket)
    assert.equal(params.line_items!.length, build > 0 ? 2 : 1)
    assert.deepEqual(params.line_items!.at(-1), { price: 'price_localmanagement', quantity: 1 })
    const first = params.line_items![0]
    if (build > 0 && first.price_data) {
      assert.equal(first.price_data.unit_amount, build * 100)
      assert.equal(first.price_data.tax_behavior, 'inclusive')
      assert.equal(first.price_data.recurring, undefined)
    }
    assert.equal(args[1]?.idempotencyKey, `checkout-${requestId}`)
  }
})

test('checkout rejects price injection and cross-origin requests before contacting Stripe', async context => {
  const create = context.mock.method(getStripe().checkout.sessions, 'create', async () => { throw new Error('Unexpected network request') })
  const body = { pakket: 'pro', requestId: randomUUID(), termsAccepted: true }
  assert.equal((await checkout(request({ ...body, price: 1 }))).status, 400)
  assert.equal((await checkout(request(body, 'https://evil.example'))).status, 403)
  assert.equal((await checkout(request({ ...body, termsAccepted: false }))).status, 400)
  assert.equal(create.mock.callCount(), 0)
})

test('checkout cannot create a payment with missing Dutch VAT registration', async context => {
  context.mock.method(getStripe().tax.registrations, 'list', async () => ({ data: [] }) as never)
  const create = context.mock.method(getStripe().checkout.sessions, 'create', () => { throw new Error('Unexpected payment creation') })
  const response = await checkout(request({ pakket: 'pro', requestId: randomUUID(), termsAccepted: true }))
  assert.equal(response.status, 503)
  assert.equal((await response.json()).url, undefined)
  assert.equal(create.mock.callCount(), 0)
})

test('a checkout whose pending order cannot be stored is expired and not returned', async context => {
  context.mock.method(getStripe().checkout.sessions, 'create', async () => ({ id: 'cs_test_mock', url: 'https://checkout.stripe.com/c/pay/cs_test_mock' }) as never)
  context.mock.method(getStripe().checkout.sessions, 'retrieve', async () => ({ status: 'open', url: 'https://checkout.stripe.com/c/pay/cs_test_mock' }) as never)
  const expire = context.mock.method(getStripe().checkout.sessions, 'expire', async () => ({}) as never)
  context.mock.method(getSupabase(), 'from', (() => ({ upsert: async () => ({ error: { code: 'db_error', message: 'private customer detail' } }) })) as never)
  const log = context.mock.method(console, 'error', () => {})
  const response = await checkout(request({ pakket: 'pro', requestId: randomUUID(), termsAccepted: true }))
  assert.equal(response.status, 503)
  assert.equal((await response.json()).url, undefined)
  assert.equal(expire.mock.callCount(), 1)
  assert.doesNotMatch(JSON.stringify(log.mock.calls), /private customer/)
})

function signedEvent(type = 'checkout.session.completed', signature = true, object?: Record<string, unknown>) {
  const body = JSON.stringify({ id: 'evt_localtest', type, data: { object: object ?? { id: 'cs_test_local', payment_status: 'unpaid', metadata: { checkout_type: 'combined' } } } })
  return new NextRequest('https://www.landingsite.nl/api/stripe/webhook', {
    method: 'POST', body, headers: signature ? { 'stripe-signature': getStripe().webhooks.generateTestHeaderString({ payload: body, secret: 'whsec_localmock' }) } : {},
  })
}

test('webhook requires a valid signature before any database access', async context => {
  const from = context.mock.method(getSupabase(), 'from', () => { throw new Error('Unexpected database call') })
  assert.equal((await webhook(signedEvent('checkout.session.completed', false))).status, 400)
  const invalid = signedEvent()
  invalid.headers.set('stripe-signature', 't=1,v1=invalid')
  assert.equal((await webhook(invalid)).status, 400)
  assert.equal(from.mock.callCount(), 0)
})

test('unpaid completion cannot unlock intake and duplicate events are not reprocessed', async context => {
  let state: Record<string, unknown> | null = null
  const tables: string[] = []
  context.mock.method(getSupabase(), 'from', ((table: string) => {
    tables.push(table)
    const query = {
      select() { return this }, eq() { return this },
      maybeSingle: async () => ({ data: state, error: null }),
      insert: async (value: Record<string, unknown>) => { state = value; return { error: null } },
      update(value: Record<string, unknown>) { state = { ...state, ...value }; return this },
      then(resolve: (result: { error: null }) => unknown) { return Promise.resolve(resolve({ error: null })) },
    }
    return query
  }) as never)
  assert.equal((await webhook(signedEvent())).status, 200)
  const second = await webhook(signedEvent())
  assert.deepEqual(await second.json(), { received: true, duplicate: true })
  assert.ok(tables.every(table => table === 'stripe_webhook_events'))
})

test('a concurrent webhook retry that loses its claim cannot fulfill the order', async context => {
  const filters: string[] = []
  let lookups = 0
  context.mock.method(getSupabase(), 'from', ((table: string) => {
    assert.equal(table, 'stripe_webhook_events')
    const query = {
      select() { return this }, update() { return this },
      eq(column: string) { filters.push(column); return this },
      maybeSingle: async () => ({ data: lookups++ === 0 ? { status: 'failed', attempts: 1, updated_at: '2026-01-01T00:00:00Z' } : null, error: null }),
    }
    return query
  }) as never)
  assert.equal((await webhook(signedEvent())).status, 409)
  assert.ok(filters.includes('status'))
  assert.ok(filters.includes('updated_at'))
})

test('Stripe readiness is private', async () => {
  assert.equal((await health(new NextRequest('https://www.landingsite.nl/api/admin/stripe-health'))).status, 401)
})

test('cached checkout retries never redirect to expired or already completed payment sessions', async context => {
  let status = 'expired'
  context.mock.method(getStripe().checkout.sessions, 'create', async () => ({ id: 'cs_test_mock', url: 'https://checkout.stripe.com/c/pay/cs_test_mock', status: 'open' }) as never)
  context.mock.method(getStripe().checkout.sessions, 'retrieve', async () => ({ status }) as never)
  const expired = await checkout(request({ pakket: 'pro', requestId: randomUUID(), termsAccepted: true }))
  assert.equal(expired.status, 409)
  assert.equal((await expired.json()).code, 'checkout_expired')
  status = 'complete'
  const complete = await checkout(request({ pakket: 'pro', requestId: randomUUID(), termsAccepted: true }))
  assert.equal(complete.status, 200)
  assert.deepEqual(await complete.json(), { url: 'https://www.landingsite.nl/intake/cs_test_mock' })
})

test('paid checkout creates one order and sends the intake confirmation only once', async context => {
  let event: Record<string, unknown> | null = null
  let order: Record<string, unknown> | null = null
  let upserts = 0
  const notifications = new Set<string>()
  const send = context.mock.method(getResend().emails, 'send', async () => ({ data: { id: 'email_mock' }, error: null }))
  context.mock.method(getStripe().subscriptions, 'retrieve', async () => ({ metadata: {} }) as never)
  const subscriptionUpdate = context.mock.method(getStripe().subscriptions, 'update', async () => ({}) as never)
  context.mock.method(getSupabase(), 'from', ((table: string) => {
    assert.ok(['orders', 'stripe_webhook_events', 'subscription_audit_log'].includes(table))
    let action = ''
    const query = {
      select() { return this }, limit() { return this },
      eq(column: string, value: string) { if (column === 'action') action = value; return this },
      maybeSingle: async () => ({ data: table === 'orders' ? order : table === 'stripe_webhook_events' ? event : notifications.has(action) ? { id: 'audit_mock' } : null, error: null }),
      single: async () => ({ data: order, error: null }),
      insert(value: Record<string, unknown>) {
        if (table === 'stripe_webhook_events') event = value
        if (table === 'subscription_audit_log' && typeof value.action === 'string') notifications.add(value.action)
        return this
      },
      upsert(value: Record<string, unknown>, options: { onConflict: string }) {
        assert.equal(options.onConflict, 'stripe_session_id')
        upserts++
        order = { id: 'order_mock', ...value }
        return this
      },
      update(value: Record<string, unknown>) { if (table === 'stripe_webhook_events') event = { ...event, ...value }; return this },
      then(resolve: (result: { error: null }) => unknown) { return Promise.resolve(resolve({ error: null })) },
    }
    return query
  }) as never)
  const session = {
    id: 'cs_test_local', payment_status: 'paid', customer: 'cus_mock', subscription: 'sub_mock',
    customer_details: { email: 'buyer@example.com', name: 'Test buyer' },
    metadata: { checkout_type: 'combined', pakket: 'pro', terms_accepted: 'true', build_price_including_vat: '199', initial_payment_including_vat: '278' },
  }
  assert.equal((await webhook(signedEvent('checkout.session.completed', true, session))).status, 200)
  assert.deepEqual(await (await webhook(signedEvent('checkout.session.completed', true, session))).json(), { received: true, duplicate: true })
  assert.equal(upserts, 1)
  assert.equal(subscriptionUpdate.mock.callCount(), 1)
  assert.equal(send.mock.callCount(), 2)
  assert.match(send.mock.calls[1].arguments[0]!.html as string, /\/intake\/cs_test_local/)
  assert.equal(send.mock.calls[1].arguments[1]?.idempotencyKey, 'combined-customer-cs_test_local')
})

test('failed asynchronous checkout only marks a pending order as failed', async context => {
  const filters: Array<[string, unknown]> = []
  let updated: Record<string, unknown> | undefined
  context.mock.method(getSupabase(), 'from', ((table: string) => {
    assert.ok(['orders', 'stripe_webhook_events'].includes(table))
    const query = {
      select() { return this },
      eq(column: string, value: unknown) { if (table === 'orders') filters.push([column, value]); return this },
      maybeSingle: async () => ({ data: null, error: null }),
      insert() { return this },
      update(value: Record<string, unknown>) { if (table === 'orders') updated = value; return this },
      then(resolve: (result: { error: null }) => unknown) { return Promise.resolve(resolve({ error: null })) },
    }
    return query
  }) as never)
  assert.equal((await webhook(signedEvent('checkout.session.async_payment_failed'))).status, 200)
  assert.equal(updated?.status, 'failed')
  assert.ok(filters.some(([column, value]) => column === 'status' && value === 'pending'))
})
