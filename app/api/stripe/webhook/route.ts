import type Stripe from 'stripe'
import { NextRequest } from 'next/server'
import { partnerProgramConfig } from '@/config/partner-program'
import { pricingConfig } from '@/config/pricing'
import { escapeHtml } from '@/lib/html'
import { commissionForLevel } from '@/lib/partner'
import { getResend } from '@/lib/resend'
import { createCustomerToken } from '@/lib/security'
import { adminRecipient } from '@/lib/server-email'
import { getStripe, PAKKETTEN, TERMS_VERSION } from '@/lib/stripe'
import { getSupabase, type ManagementStatus, type Pakket } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

type CheckoutType = 'build' | 'management'

function objectId(value: string | { id: string } | null | undefined) {
  return typeof value === 'string' ? value : value?.id ?? null
}

function isPackage(value: string | undefined): value is Pakket {
  return Boolean(value && value in PAKKETTEN)
}

function invoiceSubscriptionId(invoice: Stripe.Invoice) {
  return objectId(invoice.parent?.subscription_details?.subscription)
}

function subscriptionManagementStatus(subscription: Stripe.Subscription): ManagementStatus {
  if (subscription.status === 'canceled') return 'cancelled'
  if (subscription.status === 'past_due' || subscription.status === 'unpaid' || subscription.status === 'paused') return 'past_due'
  if (subscription.status === 'active' || subscription.status === 'trialing') return 'active'
  return 'awaiting_go_live'
}

async function audit(orderId: string | null, eventId: string | null, action: string, fromStatus: string | null, toStatus: string | null, details: Record<string, unknown> = {}) {
  const { error } = await getSupabase().from('subscription_audit_log').insert({
    order_id: orderId,
    stripe_event_id: eventId,
    action,
    from_status: fromStatus,
    to_status: toStatus,
    details,
  })
  if (error) throw new Error(`Auditlog opslaan mislukt: ${error.message}`)
}

async function notificationWasSent(orderId: string, action: string) {
  const { data, error } = await getSupabase().from('subscription_audit_log')
    .select('id')
    .eq('order_id', orderId)
    .eq('action', action)
    .limit(1)
    .maybeSingle()
  if (error) throw new Error(`Meldingsstatus controleren mislukt: ${error.message}`)
  return Boolean(data)
}

async function sendCheckedEmail(
  message: Parameters<ReturnType<typeof getResend>['emails']['send']>[0],
  idempotencyKey: string,
) {
  const result = await getResend().emails.send(message, { idempotencyKey })
  if (result.error) throw new Error(`E-mail versturen mislukt: ${result.error.message}`)
}

async function markBuildPaid(session: Stripe.Checkout.Session, eventId: string) {
  const pakket = session.metadata?.pakket
  if (!isPackage(pakket)) throw new Error(`Ongeldig pakket in bouwcheckout ${session.id}.`)
  if (session.metadata?.terms_accepted !== 'true') throw new Error(`Voorwaardenacceptatie ontbreekt in bouwcheckout ${session.id}.`)

  const paymentIntentId = objectId(session.payment_intent)
  const customerId = objectId(session.customer)
  if (!paymentIntentId) throw new Error(`Bouwcheckout ${session.id} bevat geen PaymentIntent.`)
  const email = session.customer_details?.email ?? session.customer_email ?? ''
  const kvkNumber = session.custom_fields?.find((field) => field.key === 'kvk')?.numeric?.value ?? ''
  const businessName = session.customer_details?.business_name ?? session.customer_details?.name ?? ''
  const attributionId = session.metadata?.referral_attribution_id || null
  const now = new Date().toISOString()
  const supabase = getSupabase()
  const { data: existing } = await supabase.from('orders').select('id, status, management_status').eq('stripe_session_id', session.id).maybeSingle()
  const orderStatus = existing && ['generating', 'completed'].includes(existing.status) ? existing.status : 'paid'

  const { data: order, error } = await supabase.from('orders').upsert({
    stripe_session_id: session.id,
    stripe_payment_intent: paymentIntentId,
    build_payment_intent_id: paymentIntentId,
    stripe_customer_id: customerId,
    email,
    business_name: businessName,
    kvk_number: kvkNumber,
    pakket,
    status: orderStatus,
    management_status: existing?.management_status === 'active' ? 'active' : 'awaiting_go_live',
    referral_attribution_id: attributionId,
    last_error: null,
    updated_at: now,
  }, { onConflict: 'stripe_session_id' }).select('id, management_status').single()
  if (error || !order) throw new Error(`Bouworder opslaan mislukt: ${error?.message ?? 'onbekend'}`)

  if (attributionId) {
    const { error: attributionError } = await supabase.from('referral_attributions').update({
      customer_id: customerId,
      chosen_package: pakket,
      converted_at: now,
      status: 'converted',
      subscription_status: 'awaiting_go_live',
      updated_at: now,
    }).eq('id', attributionId).eq('status', 'visited')
    if (attributionError) throw new Error(`Partnerattributie koppelen mislukt: ${attributionError.message}`)
  }

  await audit(order.id, eventId, 'build_payment_received', existing?.status ?? 'pending', orderStatus, { payment_intent_id: paymentIntentId, pakket })

  const notificationAction = 'build_purchase_notification_sent'
  if (!(await notificationWasSent(order.id, notificationAction))) {
    const amount = `${PAKKETTEN[pakket].prijs_label} eenmalig excl. btw`
    await sendCheckedEmail({
      from: process.env.RESEND_FROM ?? 'Landingsite.nl <noreply@landingsite.nl>',
      to: adminRecipient(),
      replyTo: email || undefined,
      subject: `Nieuwe aankoop - ${PAKKETTEN[pakket].naam} (${amount})`,
      html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#10231b;max-width:620px;margin:auto;padding:32px"><p style="color:#147a55;font-weight:800">Betaling bevestigd door Stripe</p><h1 style="font-size:26px">Nieuwe landingspagina verkocht</h1><p><strong>Pakket:</strong> ${escapeHtml(PAKKETTEN[pakket].naam)}<br><strong>Bedrag:</strong> ${escapeHtml(amount)}<br><strong>Bedrijf:</strong> ${escapeHtml(businessName || 'Onbekend')}<br><strong>KvK:</strong> ${escapeHtml(kvkNumber || 'Niet beschikbaar')}<br><strong>E-mail:</strong> ${escapeHtml(email || 'Niet beschikbaar')}</p><p>Websitebeheer is nog niet geactiveerd. Dat gebeurt pas via de aparte abonnementslink bij livegang.</p></div>`,
    }, `build-purchase-${session.id}`)
    await audit(order.id, eventId, notificationAction, null, 'sent', { checkout_session_id: session.id })
  }
}

async function markManagementActive(session: Stripe.Checkout.Session, eventId: string) {
  const orderId = session.metadata?.order_id
  const subscriptionId = objectId(session.subscription)
  const customerId = objectId(session.customer)
  if (!orderId || !subscriptionId || !customerId) throw new Error(`Websitebeheer-checkout ${session.id} mist order, klant of abonnement.`)
  if (session.metadata?.terms_accepted !== 'true') throw new Error(`Voorwaardenacceptatie ontbreekt in Websitebeheer-checkout ${session.id}.`)

  const supabase = getSupabase()
  const { data: order, error: orderError } = await supabase.from('orders').select('id, email, management_status, management_subscription_id, referral_attribution_id')
    .eq('id', orderId).maybeSingle()
  if (orderError || !order) throw new Error(`Order bij Websitebeheer-checkout ontbreekt: ${orderError?.message ?? orderId}`)
  if (order.management_subscription_id && order.management_subscription_id !== subscriptionId) {
    throw new Error(`Order ${orderId} is al aan een ander Websitebeheer-abonnement gekoppeld.`)
  }

  const now = new Date().toISOString()
  const { error } = await supabase.from('orders').update({
    stripe_customer_id: customerId,
    management_checkout_session_id: session.id,
    management_subscription_id: subscriptionId,
    management_status: 'active',
    management_started_at: now,
    management_cancel_at_period_end: false,
    updated_at: now,
  }).eq('id', orderId)
  if (error) throw new Error(`Websitebeheer activeren mislukt: ${error.message}`)

  await getStripe().subscriptions.update(subscriptionId, {
    metadata: { checkout_type: 'management', order_id: orderId, terms_accepted: 'true', terms_version: TERMS_VERSION },
  })
  if (order.referral_attribution_id) {
    await supabase.from('referral_attributions').update({ subscription_status: 'active', updated_at: now }).eq('id', order.referral_attribution_id)
  }
  await audit(orderId, eventId, 'management_activated', order.management_status, 'active', { subscription_id: subscriptionId, checkout_session_id: session.id })

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://landingsite.nl'
  const customerUrl = `${baseUrl}/beheer/${orderId}?token=${encodeURIComponent(createCustomerToken(orderId))}`
  await sendCheckedEmail({
    from: process.env.RESEND_FROM ?? 'Landingsite.nl <noreply@landingsite.nl>',
    to: order.email,
    subject: 'Websitebeheer is actief',
    html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#10231b;max-width:620px;margin:auto;padding:32px"><h1 style="font-size:25px">Websitebeheer is actief</h1><p>Je abonnement van €${pricingConfig.websiteManagement.monthlyPrice} per maand exclusief btw is na jouw toestemming gestart. Via de beveiligde beheerpagina kun je betaalgegevens, facturen en opzegging beheren.</p><p><a href="${escapeHtml(customerUrl)}" style="display:inline-block;background:#147a55;color:#fff;padding:13px 19px;border-radius:999px;text-decoration:none;font-weight:700">Open Websitebeheer</a></p></div>`,
  }, `management-active-${session.id}`)

  const notificationAction = 'management_purchase_notification_sent'
  if (!(await notificationWasSent(orderId, notificationAction))) {
    await sendCheckedEmail({
      from: process.env.RESEND_FROM ?? 'Landingsite.nl <noreply@landingsite.nl>',
      to: adminRecipient(),
      replyTo: order.email,
      subject: `Nieuw Websitebeheer-abonnement - €${pricingConfig.websiteManagement.monthlyPrice} p/m`,
      html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#10231b;max-width:620px;margin:auto;padding:32px"><p style="color:#147a55;font-weight:800">Abonnement bevestigd door Stripe</p><h1 style="font-size:26px">Websitebeheer is verkocht</h1><p><strong>Bedrag:</strong> €${pricingConfig.websiteManagement.monthlyPrice} per maand excl. btw<br><strong>Klant:</strong> ${escapeHtml(order.email)}<br><strong>Start:</strong> ${escapeHtml(new Date(now).toLocaleDateString('nl-NL'))}</p><p>Het abonnement is actief en gekoppeld aan order ${escapeHtml(orderId)}.</p></div>`,
    }, `management-purchase-${session.id}`)
    await audit(orderId, eventId, notificationAction, null, 'sent', { checkout_session_id: session.id, subscription_id: subscriptionId })
  }
}

async function orderForSubscription(subscriptionId: string) {
  const { data, error } = await getSupabase().from('orders').select('id, management_status, referral_attribution_id')
    .eq('management_subscription_id', subscriptionId).maybeSingle()
  if (error) throw new Error(`Abonnement koppelen aan order mislukt: ${error.message}`)
  if (data) return data
  const subscription = await getStripe().subscriptions.retrieve(subscriptionId)
  const orderId = subscription.metadata.order_id
  if (!orderId) return null
  const { data: fallback, error: fallbackError } = await getSupabase().from('orders').select('id, management_status, referral_attribution_id')
    .eq('id', orderId).maybeSingle()
  if (fallbackError) throw new Error(`Abonnementsmetadata koppelen mislukt: ${fallbackError.message}`)
  return fallback
}

async function setManagementStatus(subscription: Stripe.Subscription, eventId: string, forced?: ManagementStatus) {
  const order = await orderForSubscription(subscription.id)
  if (!order) return
  const nextStatus = forced ?? subscriptionManagementStatus(subscription)
  const { error } = await getSupabase().from('orders').update({
    management_subscription_id: subscription.id,
    stripe_customer_id: objectId(subscription.customer),
    management_status: nextStatus,
    management_cancel_at_period_end: subscription.cancel_at_period_end,
    updated_at: new Date().toISOString(),
  }).eq('id', order.id)
  if (error) throw new Error(`Websitebeheerstatus opslaan mislukt: ${error.message}`)
  if (order.referral_attribution_id) {
    await getSupabase().from('referral_attributions').update({ subscription_status: nextStatus, updated_at: new Date().toISOString() }).eq('id', order.referral_attribution_id)
  }
  await audit(order.id, eventId, 'management_status_changed', order.management_status, nextStatus, { subscription_id: subscription.id, cancel_at_period_end: subscription.cancel_at_period_end })
}

async function recordPartnerCommissions(invoice: Stripe.Invoice, subscriptionId: string, eventId: string) {
  const supabase = getSupabase()
  const order = await orderForSubscription(subscriptionId)
  if (!order?.referral_attribution_id) return
  const { data: attribution, error } = await supabase.from('referral_attributions').select('partner_id').eq('id', order.referral_attribution_id).eq('status', 'converted').maybeSingle()
  if (error) throw new Error(`Partnerattributie ophalen mislukt: ${error.message}`)
  if (!attribution) return

  const paidAt = new Date((invoice.status_transitions.paid_at ?? Math.floor(Date.now() / 1000)) * 1_000)
  const availableAt = new Date(paidAt.getTime() + partnerProgramConfig.waitingPeriodDays * 86_400_000)
  const period = invoice.lines.data[0]?.period
  let partnerId: string | null = attribution.partner_id
  let inserted = 0

  for (let level = 1; level <= partnerProgramConfig.maximumPaidLevels && partnerId; level += 1) {
    const { data: partner, error: partnerError } = await supabase.from('partners').select('id, parent_partner_id, status').eq('id', partnerId).maybeSingle()
    if (partnerError) throw new Error(`Partnerketen ophalen mislukt: ${partnerError.message}`)
    if (!partner) break
    if (partner.status === 'approved') {
      const { error: commissionError } = await supabase.from('partner_commissions').upsert({
        partner_id: partner.id,
        order_id: order.id,
        level,
        amount_cents: commissionForLevel(level) * 100,
        stripe_subscription_id: subscriptionId,
        stripe_invoice_id: invoice.id,
        invoice_period_start: period ? new Date(period.start * 1_000).toISOString() : null,
        invoice_period_end: period ? new Date(period.end * 1_000).toISOString() : null,
        paid_at: paidAt.toISOString(),
        available_at: availableAt.toISOString(),
        status: 'pending_review',
        audit_note: 'Handmatige controle vereist; geen automatische bankuitbetaling.',
      }, { onConflict: 'stripe_invoice_id,partner_id,level', ignoreDuplicates: true })
      if (commissionError) throw new Error(`Commissie boeken mislukt: ${commissionError.message}`)
      inserted += 1
    }
    partnerId = partner.parent_partner_id
  }
  await audit(order.id, eventId, 'partner_commissions_recorded', null, 'pending_review', { invoice_id: invoice.id, levels_recorded: inserted, available_at: availableAt.toISOString() })
}

async function reverseInvoiceCommissions(invoiceId: string, eventId: string, reason: string) {
  const { data, error } = await getSupabase().from('partner_commissions').update({
    status: 'reversed',
    audit_note: reason,
    updated_at: new Date().toISOString(),
  }).eq('stripe_invoice_id', invoiceId).in('status', ['pending_review', 'approved']).select('order_id')
  if (error) throw new Error(`Commissiecorrectie mislukt: ${error.message}`)
  const orderIds = [...new Set((data ?? []).map((item) => item.order_id))]
  for (const orderId of orderIds) await audit(orderId, eventId, 'partner_commissions_reversed', null, 'reversed', { invoice_id: invoiceId, reason })
}

async function handleEvent(event: Stripe.Event) {
  switch (event.type) {
    case 'checkout.session.completed':
    case 'checkout.session.async_payment_succeeded': {
      const session = event.data.object
      if (session.payment_status !== 'paid' && session.payment_status !== 'no_payment_required') return
      const checkoutType = session.metadata?.checkout_type as CheckoutType | undefined
      if (checkoutType === 'build') await markBuildPaid(session, event.id)
      else if (checkoutType === 'management') await markManagementActive(session, event.id)
      // Het Stripe-account kan meerdere projecten bedienen; onbekende sessies horen niet bij Landingsite.nl.
      return
    }
    case 'checkout.session.expired': {
      const session = event.data.object
      if (session.metadata?.checkout_type === 'build') {
        await getSupabase().from('orders').update({ status: 'failed', last_error: 'Bouwcheckout verlopen zonder betaling.', updated_at: new Date().toISOString() }).eq('stripe_session_id', session.id).eq('status', 'pending')
      } else if (session.metadata?.checkout_type === 'management' && session.metadata.order_id) {
        await getSupabase().from('orders').update({ management_checkout_session_id: null, updated_at: new Date().toISOString() }).eq('id', session.metadata.order_id).eq('management_status', 'awaiting_go_live')
        await audit(session.metadata.order_id, event.id, 'management_checkout_expired', 'awaiting_go_live', 'awaiting_go_live', { checkout_session_id: session.id })
      }
      return
    }
    case 'invoice.paid': {
      const subscriptionId = invoiceSubscriptionId(event.data.object)
      if (!subscriptionId) return
      const subscription = await getStripe().subscriptions.retrieve(subscriptionId)
      await setManagementStatus(subscription, event.id, 'active')
      await recordPartnerCommissions(event.data.object, subscriptionId, event.id)
      return
    }
    case 'invoice.payment_failed': {
      const subscriptionId = invoiceSubscriptionId(event.data.object)
      if (!subscriptionId) return
      const subscription = await getStripe().subscriptions.retrieve(subscriptionId)
      await setManagementStatus(subscription, event.id, 'payment_failed')
      return
    }
    case 'invoice.voided':
      await reverseInvoiceCommissions(event.data.object.id, event.id, 'Maandfactuur ongeldig gemaakt; gekoppelde commissie vervalt.')
      return
    case 'charge.refunded': {
      const charge = event.data.object as Stripe.Charge & { invoice?: string | Stripe.Invoice | null }
      const invoiceId = objectId(charge.invoice)
      if (invoiceId) await reverseInvoiceCommissions(invoiceId, event.id, 'Betaling terugbetaald; gekoppelde commissie vervalt.')
      return
    }
    case 'customer.subscription.created':
    case 'customer.subscription.updated':
      await setManagementStatus(event.data.object, event.id)
      return
    case 'customer.subscription.deleted':
      await setManagementStatus(event.data.object, event.id, 'cancelled')
      return
  }
}

async function claimEvent(event: Stripe.Event) {
  const supabase = getSupabase()
  const { data: existing, error: lookupError } = await supabase.from('stripe_webhook_events').select('status, attempts, updated_at').eq('event_id', event.id).maybeSingle()
  if (lookupError) throw new Error(`Webhookstatus controleren mislukt: ${lookupError.message}`)
  if (existing?.status === 'processed') return 'processed' as const
  if (existing?.status === 'processing' && Date.now() - new Date(existing.updated_at).getTime() < 5 * 60_000) return 'processing' as const

  if (existing) {
    const { error } = await supabase.from('stripe_webhook_events').update({ status: 'processing', attempts: existing.attempts + 1, last_error: null, updated_at: new Date().toISOString() }).eq('event_id', event.id)
    if (error) throw new Error(`Webhookretry claimen mislukt: ${error.message}`)
  } else {
    const { error } = await supabase.from('stripe_webhook_events').insert({ event_id: event.id, event_type: event.type, status: 'processing', attempts: 1, processed_at: new Date().toISOString(), updated_at: new Date().toISOString() })
    if (error?.code === '23505') return 'processing' as const
    if (error) throw new Error(`Webhook claimen mislukt: ${error.message}`)
  }
  return 'claimed' as const
}

export async function POST(request: NextRequest) {
  const signature = request.headers.get('stripe-signature')
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!signature || !secret) return Response.json({ error: 'Webhookconfiguratie ontbreekt.' }, { status: 400 })
  const declaredLength = Number(request.headers.get('content-length') ?? 0)
  if (Number.isFinite(declaredLength) && declaredLength > 1_000_000) return Response.json({ error: 'Webhookpayload is te groot.' }, { status: 413 })

  let event: Stripe.Event
  try { event = getStripe().webhooks.constructEvent(await request.text(), signature, secret) }
  catch { return Response.json({ error: 'Ongeldige webhookhandtekening.' }, { status: 400 }) }

  let claim: 'processed' | 'processing' | 'claimed'
  try { claim = await claimEvent(event) }
  catch (error) {
    console.error('Stripe-webhook claimen mislukt', { eventId: event.id, error })
    return Response.json({ error: 'Webhookverwerking tijdelijk niet beschikbaar.' }, { status: 503 })
  }
  if (claim === 'processed') return Response.json({ received: true, duplicate: true })
  if (claim === 'processing') return Response.json({ error: 'Webhook wordt al verwerkt.' }, { status: 409 })

  try {
    await handleEvent(event)
    const { error } = await getSupabase().from('stripe_webhook_events').update({ status: 'processed', last_error: null, processed_at: new Date().toISOString(), updated_at: new Date().toISOString() }).eq('event_id', event.id)
    if (error) throw error
    return Response.json({ received: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Onbekende webhookfout.'
    console.error('Stripe-webhook verwerken mislukt', { eventId: event.id, eventType: event.type, error })
    await getSupabase().from('stripe_webhook_events').update({ status: 'failed', last_error: message.slice(0, 2_000), updated_at: new Date().toISOString() }).eq('event_id', event.id)
    return Response.json({ error: 'Webhookverwerking mislukt.' }, { status: 500 })
  }
}
