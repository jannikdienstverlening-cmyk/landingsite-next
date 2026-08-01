import { NextRequest } from 'next/server'
import { cents, pricingConfig } from '@/config/pricing'
import { escapeHtml } from '@/lib/html'
import { getResend } from '@/lib/resend'
import { adminCookie, createCustomerToken, rejectCrossOriginMutation, verifyAdminSession } from '@/lib/security'
import { configuredManagementPriceId, getStripe, SUBSCRIPTION_INTERVAL, TERMS_VERSION } from '@/lib/stripe'
import { getSupabase } from '@/lib/supabase'
import { managementActivationSchema, validationMessage } from '@/lib/validation'
import { invalidJsonResponse, readJsonBody } from '@/lib/request'

export async function POST(request: NextRequest) {
  if (!verifyAdminSession(request.cookies.get(adminCookie.name)?.value)) {
    return Response.json({ error: 'Niet ingelogd.' }, { status: 401 })
  }
  const crossOrigin = rejectCrossOriginMutation(request)
  if (crossOrigin) return crossOrigin

  let body: unknown
  try { body = await readJsonBody(request, 4_000) } catch (error) { return invalidJsonResponse(error) }
  const parsed = managementActivationSchema.safeParse(body)
  if (!parsed.success) return Response.json({ error: validationMessage(parsed.error) }, { status: 400 })

  const supabase = getSupabase()
  const { data: order, error } = await supabase.from('orders').select('id, email, status, stripe_customer_id, management_status, management_subscription_id, management_checkout_session_id, went_live_at')
    .eq('id', parsed.data.order_id).maybeSingle()
  if (error) return Response.json({ error: 'Order controleren lukt nu niet.' }, { status: 503 })
  if (!order || order.status !== 'completed') return Response.json({ error: 'De eerste versie moet eerst zijn afgerond.' }, { status: 409 })
  if (order.management_subscription_id || order.management_status === 'active') {
    return Response.json({ error: 'Websitebeheer is al actief; er is geen tweede abonnement aangemaakt.' }, { status: 409 })
  }

  if (order.management_checkout_session_id) {
    try {
      const existing = await getStripe().checkout.sessions.retrieve(order.management_checkout_session_id)
      if (existing.status === 'open' && existing.url) return Response.json({ url: existing.url, reused: true })
    } catch { /* een verlopen of verwijderde sessie mag veilig worden vervangen */ }
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, '')
  if (!baseUrl) return Response.json({ error: 'Basis-URL ontbreekt.' }, { status: 500 })
  if (process.env.STRIPE_TERMS_CONFIGURED !== 'true') {
    return Response.json({ error: 'Stripe-voorwaarden moeten eerst in het gekoppelde account worden ingesteld.' }, { status: 503 })
  }
  const customerToken = createCustomerToken(order.id)
  const managementPriceId = configuredManagementPriceId()
  const goLiveAt = order.went_live_at ?? new Date().toISOString()

  const session = await getStripe().checkout.sessions.create({
    mode: 'subscription',
    line_items: [{
      ...(managementPriceId
        ? { price: managementPriceId }
        : { price_data: {
            currency: 'eur',
            unit_amount: cents(pricingConfig.websiteManagement.monthlyPrice),
            tax_behavior: 'exclusive' as const,
            recurring: { interval: SUBSCRIPTION_INTERVAL },
            product_data: { name: pricingConfig.websiteManagement.name, description: 'Managed hosting, SSL, back-ups, updates, monitoring, ondersteuning en kleine wijzigingen.' },
          } }),
      quantity: 1,
    }],
    ...(order.stripe_customer_id ? { customer: order.stripe_customer_id } : { customer_email: order.email }),
    success_url: `${baseUrl}/beheer/${order.id}?token=${encodeURIComponent(customerToken)}&activated=1`,
    cancel_url: `${baseUrl}/beheer/${order.id}?token=${encodeURIComponent(customerToken)}`,
    client_reference_id: order.id,
    metadata: { checkout_type: 'management', order_id: order.id, terms_version: TERMS_VERSION, go_live_at: goLiveAt },
    subscription_data: { metadata: { checkout_type: 'management', order_id: order.id, go_live_at: goLiveAt } },
    automatic_tax: { enabled: true },
    tax_id_collection: { enabled: true },
    billing_address_collection: 'required',
    consent_collection: { terms_of_service: 'required' },
    custom_text: { submit: { message: `Websitebeheer kost €${pricingConfig.websiteManagement.monthlyPrice} per maand exclusief btw en start direct na afronding van deze checkout. Opzeggen kan tegen het einde van de lopende maand via je beveiligde beheerlink.` } },
    locale: 'nl',
  }, { idempotencyKey: `management-${order.id}-${parsed.data.requestId}` })
  if (!session.url) return Response.json({ error: 'Abonnementslink kon niet worden gemaakt.' }, { status: 500 })

  const { error: updateError } = await supabase.from('orders').update({
    management_checkout_session_id: session.id,
    management_status: 'awaiting_go_live',
    went_live_at: goLiveAt,
    updated_at: new Date().toISOString(),
  }).eq('id', order.id).is('management_subscription_id', null)
  if (updateError) {
    await getStripe().checkout.sessions.expire(session.id).catch(() => undefined)
    return Response.json({ error: 'Abonnementslink kon niet veilig worden gekoppeld.' }, { status: 503 })
  }

  await supabase.from('subscription_audit_log').insert({
    order_id: order.id,
    action: 'management_link_created',
    from_status: order.management_status,
    to_status: 'awaiting_go_live',
    details: { checkout_session_id: session.id, go_live_at: goLiveAt },
  })

  const customerPage = `${baseUrl}/beheer/${order.id}?token=${encodeURIComponent(customerToken)}`
  try {
    await getResend().emails.send({
      from: process.env.RESEND_FROM ?? 'Landingsite.nl <noreply@landingsite.nl>',
      to: order.email,
      subject: 'Je website gaat live: activeer Websitebeheer',
      html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#10231b;max-width:620px;margin:auto;padding:32px"><h1 style="font-size:25px">Je website is klaar voor livegang</h1><p>Websitebeheer wordt pas actief nadat je de aparte Stripe-checkout zelf afrondt. Het kost €${pricingConfig.websiteManagement.monthlyPrice} per maand exclusief btw.</p><p><a href="${escapeHtml(session.url)}" style="display:inline-block;background:#147a55;color:#fff;padding:13px 19px;border-radius:999px;text-decoration:none;font-weight:700">Websitebeheer activeren</a></p><p>Na activatie beheer je opzegging en betaalgegevens via je <a href="${escapeHtml(customerPage)}">beveiligde beheerpagina</a>.</p></div>`,
    }, { idempotencyKey: `management-link-${session.id}` })
  } catch (emailError) {
    console.error('Websitebeheer-link mailen mislukt', { orderId: order.id, emailError })
  }

  return Response.json({ url: session.url, customer_page: customerPage }, { status: 201 })
}
