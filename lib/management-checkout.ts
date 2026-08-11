import { cents, pricingConfig } from '@/config/pricing'
import {
  configuredManagementPriceId,
  getStripe,
  STRIPE_MANAGEMENT_PAYMENT_METHODS,
  stripeCheckoutBranding,
  stripePaymentMethods,
  SUBSCRIPTION_INTERVAL,
  TERMS_VERSION,
} from '@/lib/stripe'
import { getSupabase } from '@/lib/supabase'

export type ManagementCheckoutOrder = {
  id: string
  email: string
  status: string
  stripe_customer_id: string | null
  management_status: string
  management_subscription_id: string | null
  management_checkout_session_id: string | null
  went_live_at: string | null
}

export class ManagementCheckoutError extends Error {
  constructor(message: string, readonly status: number) {
    super(message)
  }
}

export async function createOrReuseManagementCheckout(
  order: ManagementCheckoutOrder,
  customerToken: string,
  requestId: string,
  options: { markGoLive: boolean; termsAccepted: boolean },
) {
  if (order.status !== 'completed') {
    throw new ManagementCheckoutError('De eerste versie moet eerst zijn afgerond.', 409)
  }
  if (order.management_subscription_id || order.management_status === 'active') {
    throw new ManagementCheckoutError('Websitebeheer is al actief; er is geen tweede abonnement aangemaakt.', 409)
  }

  if (order.management_checkout_session_id) {
    try {
      const existing = await getStripe().checkout.sessions.retrieve(order.management_checkout_session_id)
      if (existing.status === 'open' && existing.url) {
        if (options.termsAccepted && existing.metadata?.terms_accepted !== 'true') {
          await getStripe().checkout.sessions.update(existing.id, {
            metadata: { terms_accepted: 'true', terms_version: TERMS_VERSION },
          })
        }
        return { url: existing.url, reused: true, goLiveAt: order.went_live_at }
      }
      if (existing.status === 'complete') {
        throw new ManagementCheckoutError('De abonnementsbetaling wordt nog verwerkt. Ververs deze pagina over enkele ogenblikken.', 409)
      }
    } catch (error) {
      if (error instanceof ManagementCheckoutError) throw error
      // Een verlopen of verwijderde Stripe-sessie mag veilig worden vervangen.
    }
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, '')
  if (!baseUrl) throw new ManagementCheckoutError('Basis-URL ontbreekt.', 500)

  const goLiveAt = order.went_live_at ?? (options.markGoLive ? new Date().toISOString() : null)
  if (!goLiveAt) {
    throw new ManagementCheckoutError('Websitebeheer kan pas worden geactiveerd nadat de livegang is bevestigd.', 409)
  }

  const managementPriceId = configuredManagementPriceId()
  const session = await getStripe().checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: stripePaymentMethods(STRIPE_MANAGEMENT_PAYMENT_METHODS),
    wallet_options: { link: { display: 'never' } },
    submit_type: 'subscribe',
    branding_settings: stripeCheckoutBranding(baseUrl),
    line_items: [{
      ...(managementPriceId
        ? { price: managementPriceId }
        : { price_data: {
            currency: 'eur',
            unit_amount: cents(pricingConfig.websiteManagement.monthlyPrice),
            tax_behavior: pricingConfig.vatIncluded ? 'inclusive' as const : 'exclusive' as const,
            recurring: { interval: SUBSCRIPTION_INTERVAL },
            product_data: {
              name: pricingConfig.websiteManagement.name,
              description: 'Managed hosting, SSL, back-ups, updates, monitoring, ondersteuning en kleine wijzigingen.',
            },
          } }),
      quantity: 1,
    }],
    ...(order.stripe_customer_id ? { customer: order.stripe_customer_id } : { customer_email: order.email }),
    success_url: `${baseUrl}/beheer/${order.id}?token=${encodeURIComponent(customerToken)}&activated=1`,
    cancel_url: `${baseUrl}/beheer/${order.id}?token=${encodeURIComponent(customerToken)}`,
    client_reference_id: order.id,
    metadata: {
      checkout_type: 'management',
      order_id: order.id,
      terms_accepted: options.termsAccepted ? 'true' : 'false',
      terms_version: TERMS_VERSION,
      go_live_at: goLiveAt,
    },
    subscription_data: { metadata: { checkout_type: 'management', order_id: order.id, go_live_at: goLiveAt } },
    automatic_tax: { enabled: true },
    tax_id_collection: { enabled: true },
    billing_address_collection: 'required',
    custom_text: {
      submit: {
        message: `Je start Websitebeheer voor €${pricingConfig.websiteManagement.monthlyPrice} per maand inclusief btw. De eerste afschrijving vindt plaats na je bevestiging. Daarna wordt het bedrag maandelijks afgeschreven.`,
      },
      after_submit: {
        message: 'Je ontvangt een bevestiging en kunt facturen, betaalgegevens en opzegging daarna beheren via je beveiligde klantpagina.',
      },
    },
    locale: 'nl',
  }, { idempotencyKey: `management-${order.id}-${requestId}` })
  if (!session.url) throw new ManagementCheckoutError('Abonnementslink kon niet worden gemaakt.', 500)

  const supabase = getSupabase()
  const { data: updated, error: updateError } = await supabase.from('orders').update({
    management_checkout_session_id: session.id,
    management_status: 'awaiting_go_live',
    went_live_at: goLiveAt,
    updated_at: new Date().toISOString(),
  }).eq('id', order.id).is('management_subscription_id', null).select('id').maybeSingle()
  if (updateError || !updated) {
    await getStripe().checkout.sessions.expire(session.id).catch(() => undefined)
    throw new ManagementCheckoutError('Abonnementslink kon niet veilig worden gekoppeld.', 503)
  }

  const { error: auditError } = await supabase.from('subscription_audit_log').insert({
    order_id: order.id,
    action: 'management_link_created',
    from_status: order.management_status,
    to_status: 'awaiting_go_live',
    details: { checkout_session_id: session.id, go_live_at: goLiveAt },
  })
  if (auditError) console.error('Websitebeheer-auditlog opslaan mislukt', { orderId: order.id, auditError })

  return { url: session.url, reused: false, goLiveAt }
}
