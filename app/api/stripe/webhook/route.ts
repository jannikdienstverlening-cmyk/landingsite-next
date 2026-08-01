import type Stripe from 'stripe'
import { NextRequest } from 'next/server'
import { escapeHtml } from '@/lib/html'
import { getResend } from '@/lib/resend'
import { getStripe, PAKKETTEN, TERMS_VERSION } from '@/lib/stripe'
import { getSupabase, type Pakket } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

const ORDER_SESSION_METADATA = 'landingsite_order_session_id'
const BILLING_ERROR_PREFIX = 'Abonnement:'

function isPackage(value: string | undefined): value is Pakket {
  return Boolean(value && value in PAKKETTEN)
}

function objectId(value: string | { id: string } | null | undefined) {
  return typeof value === 'string' ? value : value?.id ?? null
}

function invoiceSubscriptionId(invoice: Stripe.Invoice) {
  return objectId(invoice.parent?.subscription_details?.subscription)
}

async function orderSessionForSubscription(subscriptionId: string) {
  const stripe = getStripe()
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  const fromMetadata = subscription.metadata[ORDER_SESSION_METADATA]
  if (fromMetadata) return { sessionId: fromMetadata, subscription }

  const { data } = await getSupabase().from('orders')
    .select('stripe_session_id')
    .eq('stripe_payment_intent', subscriptionId)
    .maybeSingle()
  return { sessionId: data?.stripe_session_id ?? null, subscription }
}

async function updateBillingMessage(subscriptionId: string, message: string | null) {
  const { sessionId } = await orderSessionForSubscription(subscriptionId)
  if (!sessionId) return

  const supabase = getSupabase()
  if (message === null) {
    const { data: order } = await supabase.from('orders').select('last_error').eq('stripe_session_id', sessionId).maybeSingle()
    if (!order?.last_error?.startsWith(BILLING_ERROR_PREFIX)) return
  }

  const { error } = await supabase.from('orders').update({
    last_error: message,
    updated_at: new Date().toISOString(),
  }).eq('stripe_session_id', sessionId)
  if (error) throw new Error(`Abonnementsstatus opslaan mislukt: ${error.message}`)
}

async function linkSubscriptionToOrder(session: Stripe.Checkout.Session) {
  const subscriptionId = objectId(session.subscription)
  if (!subscriptionId) throw new Error(`Stripe-sessie ${session.id} bevat geen abonnement.`)

  const stripe = getStripe()
  const subscription = await stripe.subscriptions.retrieve(subscriptionId)
  await stripe.subscriptions.update(subscriptionId, {
    metadata: {
      ...subscription.metadata,
      [ORDER_SESSION_METADATA]: session.id,
      pakket: session.metadata?.pakket ?? '',
      terms_accepted: 'true',
      terms_version: session.metadata?.terms_version ?? TERMS_VERSION,
    },
  })
  return subscriptionId
}

async function markInitialPaymentPaid(session: Stripe.Checkout.Session, eventId: string) {
  const pakket = session.metadata?.pakket
  if (!isPackage(pakket)) throw new Error(`Ongeldig pakket in Stripe-sessie ${session.id}.`)
  if (session.metadata?.terms_accepted !== 'true') throw new Error(`Voorwaardenacceptatie ontbreekt in Stripe-sessie ${session.id}.`)

  const subscriptionId = await linkSubscriptionToOrder(session)
  const email = session.customer_details?.email ?? session.customer_email ?? ''
  const kvkNumber = session.custom_fields?.find(field => field.key === 'kvk')?.numeric?.value ?? ''
  const businessName = session.customer_details?.business_name ?? session.customer_details?.name ?? ''
  const now = new Date().toISOString()
  const supabase = getSupabase()
  const { data: existing } = await supabase.from('orders').select('status').eq('stripe_session_id', session.id).maybeSingle()
  const status = existing && ['generating', 'completed'].includes(existing.status) ? existing.status : 'paid'

  const { error } = await supabase.from('orders').upsert({
    stripe_session_id: session.id,
    stripe_payment_intent: subscriptionId,
    email,
    business_name: businessName,
    kvk_number: kvkNumber,
    pakket,
    status,
    last_error: null,
    updated_at: now,
  }, { onConflict: 'stripe_session_id' })
  if (error) throw new Error(`Order opslaan mislukt: ${error.message}`)

  const amount = `${PAKKETTEN[pakket].prijs_label} per maand excl. btw`
  const adminUrl = `${process.env.NEXT_PUBLIC_BASE_URL ?? 'https://landingsite.nl'}/admin`
  await getResend().emails.send({
    from: process.env.RESEND_FROM ?? 'Landingsite.nl <noreply@landingsite.nl>',
    to: process.env.ADMIN_EMAIL ?? 'jannikklumpenaar@gmail.com',
    replyTo: email || undefined,
    subject: `Nieuw abonnement - ${PAKKETTEN[pakket].naam} (${amount})`,
    html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#0b2019;max-width:620px;margin:auto;padding:32px">
      <p style="color:#16845c;font-weight:800">Eerste abonnementsbetaling ontvangen</p><h1 style="font-size:26px">Nieuw websiteabonnement</h1>
      <p><strong>Pakket:</strong> ${escapeHtml(PAKKETTEN[pakket].naam)}<br><strong>Bedrag:</strong> ${escapeHtml(amount)}<br><strong>Bedrijf:</strong> ${escapeHtml(businessName || 'Onbekend')}<br><strong>KvK:</strong> ${escapeHtml(kvkNumber || 'Niet beschikbaar')}<br><strong>Klant:</strong> ${escapeHtml(session.customer_details?.name ?? 'Onbekend')}<br><strong>E-mail:</strong> ${escapeHtml(email || 'Niet beschikbaar')}<br><strong>Stripe-abonnement:</strong> ${escapeHtml(subscriptionId)}</p>
      <p><a href="${escapeHtml(adminUrl)}" style="display:inline-block;background:#0b3d2e;color:#fff;padding:12px 18px;border-radius:999px;text-decoration:none">Open dashboard</a></p>
    </div>`,
  }, { idempotencyKey: `stripe-${eventId}` })
}

async function handleSubscription(subscription: Stripe.Subscription, deleted = false) {
  if (deleted || subscription.status === 'canceled') {
    return updateBillingMessage(subscription.id, `${BILLING_ERROR_PREFIX} beëindigd. Controleer de einddatum, overdracht en publicatie.`)
  }
  if (subscription.cancel_at_period_end) {
    return updateBillingMessage(subscription.id, `${BILLING_ERROR_PREFIX} opzegging staat gepland aan het einde van de lopende betaalperiode.`)
  }
  if (subscription.status === 'active' || subscription.status === 'trialing') {
    return updateBillingMessage(subscription.id, null)
  }
  if (['past_due', 'unpaid', 'incomplete_expired', 'paused'].includes(subscription.status)) {
    return updateBillingMessage(subscription.id, `${BILLING_ERROR_PREFIX} status ${subscription.status}; controleer de openstaande factuur in Stripe.`)
  }
}

async function handleEvent(event: Stripe.Event) {
  switch (event.type) {
    case 'checkout.session.completed':
    case 'checkout.session.async_payment_succeeded': {
      const session = event.data.object
      if (session.payment_status === 'paid' || session.payment_status === 'no_payment_required') {
        await markInitialPaymentPaid(session, event.id)
      }
      return
    }
    case 'checkout.session.expired': {
      await getSupabase().from('orders').update({
        status: 'failed',
        last_error: 'Checkout verlopen zonder afgeronde eerste betaling.',
        updated_at: new Date().toISOString(),
      }).eq('stripe_session_id', event.data.object.id).eq('status', 'pending')
      return
    }
    case 'invoice.paid': {
      const subscriptionId = invoiceSubscriptionId(event.data.object)
      if (subscriptionId) await updateBillingMessage(subscriptionId, null)
      return
    }
    case 'invoice.payment_failed': {
      const subscriptionId = invoiceSubscriptionId(event.data.object)
      if (subscriptionId) await updateBillingMessage(subscriptionId, `${BILLING_ERROR_PREFIX} maandbetaling mislukt; Stripe probeert volgens de ingestelde incassoregels opnieuw.`)
      return
    }
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      await handleSubscription(event.data.object)
      return
    case 'customer.subscription.deleted':
      await handleSubscription(event.data.object, true)
      return
  }
}

export async function POST(request: NextRequest) {
  const signature = request.headers.get('stripe-signature')
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!signature || !secret) return Response.json({ error: 'Webhookconfiguratie ontbreekt.' }, { status: 400 })
  const declaredLength = Number(request.headers.get('content-length') ?? 0)
  if (Number.isFinite(declaredLength) && declaredLength > 1_000_000) {
    return Response.json({ error: 'Webhookpayload is te groot.' }, { status: 413 })
  }

  let event: Stripe.Event
  try {
    event = getStripe().webhooks.constructEvent(await request.text(), signature, secret)
  } catch {
    return Response.json({ error: 'Ongeldige webhookhandtekening.' }, { status: 400 })
  }

  const supabase = getSupabase()
  const { data: handled } = await supabase.from('stripe_webhook_events').select('event_id').eq('event_id', event.id).maybeSingle()
  if (handled) return Response.json({ received: true, duplicate: true })

  try {
    await handleEvent(event)
    const { error } = await supabase.from('stripe_webhook_events').upsert({
      event_id: event.id,
      event_type: event.type,
    }, { onConflict: 'event_id', ignoreDuplicates: true })
    if (error) throw error
    return Response.json({ received: true })
  } catch (error) {
    console.error('Stripe-webhook verwerken mislukt', { eventId: event.id, eventType: event.type, error })
    return Response.json({ error: 'Webhookverwerking mislukt.' }, { status: 500 })
  }
}
