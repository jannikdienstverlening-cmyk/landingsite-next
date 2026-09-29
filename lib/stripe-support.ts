import 'server-only'
import type Stripe from 'stripe'
import { configuredManagementPriceId, getStripe } from '@/lib/stripe'
import { getSupabase } from '@/lib/supabase'

export const requiredStripeEvents: Stripe.WebhookEndpointUpdateParams.EnabledEvent[] = [
  'checkout.session.completed', 'checkout.session.async_payment_succeeded', 'checkout.session.async_payment_failed',
  'checkout.session.expired', 'invoice.paid', 'invoice.payment_failed', 'invoice.voided',
  'customer.subscription.created', 'customer.subscription.updated', 'customer.subscription.deleted',
  'charge.refunded', 'charge.dispute.created', 'charge.dispute.closed',
]

export function isSiteWebhook(url: string) {
  try {
    const actual = new URL(url)
    const expected = new URL('/api/stripe/webhook', process.env.NEXT_PUBLIC_BASE_URL?.trim())
    return actual.origin === expected.origin && actual.pathname === expected.pathname
  } catch { return false }
}

export function portalFeaturesReady(config: Stripe.BillingPortal.Configuration) {
  return config.active && config.features.invoice_history.enabled && config.features.payment_method_update.enabled
    && config.features.subscription_cancel.enabled && config.features.subscription_cancel.mode === 'at_period_end'
}

export async function dutchTaxRegistrationReady() {
  const registrations = await getStripe().tax.registrations.list({ status: 'active', limit: 100 })
  return registrations.data.some(registration => registration.country === 'NL')
}

export async function sitePortalConfiguration(createIfMissing = false) {
  const stripe = getStripe()
  const configurations = await stripe.billingPortal.configurations.list({ active: true, limit: 100 })
  const existing = configurations.data.find(config => config.metadata?.application === 'landingsite.nl' && config.metadata?.purpose === 'customer_portal_v1')
  if (existing || !createIfMissing) return existing ?? null
  if (configurations.has_more) throw new Error('Portaalconfiguraties vragen handmatige controle.')
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL?.trim().replace(/\/$/, '')
  if (!baseUrl) throw new Error('Basis-URL ontbreekt.')

  // A dedicated configuration leaves other applications and existing subscriptions untouched.
  return stripe.billingPortal.configurations.create({
    business_profile: { headline: 'Landingsite.nl Websitebeheer', privacy_policy_url: `${baseUrl}/privacybeleid`, terms_of_service_url: `${baseUrl}/algemene-voorwaarden` },
    default_return_url: baseUrl,
    features: {
      invoice_history: { enabled: true },
      payment_method_update: { enabled: true },
      subscription_cancel: { enabled: true, mode: 'at_period_end', proration_behavior: 'none' },
      subscription_update: { enabled: false },
    },
    metadata: { application: 'landingsite.nl', purpose: 'customer_portal_v1' },
  }, { idempotencyKey: 'landingsite-customer-portal-v1' })
}

export async function verifyStripeWebhookDelivery(requestId: string) {
  const stripe = getStripe()
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL?.trim().replace(/\/$/, '')
  const managementPrice = configuredManagementPriceId()
  if (!baseUrl || !managementPrice) throw new Error('Checkoutconfiguratie ontbreekt.')
  const started = Math.floor(Date.now() / 1000) - 10
  // This URL is never exposed or opened. Expiration cannot charge or create a subscription.
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription', line_items: [{ price: managementPrice, quantity: 1 }],
    success_url: `${baseUrl}/start`, cancel_url: `${baseUrl}/start`,
    metadata: { checkout_type: 'diagnostic', application: 'landingsite.nl', diagnostic_id: requestId },
  }, { idempotencyKey: `webhook-diagnostic-${requestId}` })
  const current = await stripe.checkout.sessions.retrieve(session.id)
  if (current.customer || current.subscription || current.customer_details?.email || current.payment_status === 'paid') {
    throw new Error('De controle mag geen klantbetaling wijzigen.')
  }
  if (current.status === 'open') await stripe.checkout.sessions.expire(session.id)
  else if (current.status !== 'expired') throw new Error('Onverwachte controlesessie.')

  for (let attempt = 0; attempt < 6; attempt++) {
    if (attempt) await new Promise(resolve => setTimeout(resolve, 1_500))
    const events = await stripe.events.list({ type: 'checkout.session.expired', created: { gte: started }, limit: 10 })
    const event = events.data.find(item => (item.data.object as Stripe.Checkout.Session).id === session.id)
    if (!event) continue
    const { data, error } = await getSupabase().from('stripe_webhook_events').select('status').eq('event_id', event.id).maybeSingle()
    if (error) throw new Error('Aflevercontrole niet beschikbaar.')
    if (data?.status === 'processed') return true
  }
  return false
}
