import { NextRequest } from 'next/server'
import { pricingConfig } from '@/config/pricing'
import { escapeHtml } from '@/lib/html'
import { createOrReuseManagementCheckout, ManagementCheckoutError } from '@/lib/management-checkout'
import { getResend } from '@/lib/resend'
import { adminCookie, createCustomerToken, rejectCrossOriginMutation, verifyAdminSession } from '@/lib/security'
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
  if (!order) return Response.json({ error: 'Order niet gevonden.' }, { status: 404 })

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, '')
  if (!baseUrl) return Response.json({ error: 'Basis-URL ontbreekt.' }, { status: 500 })
  const customerToken = createCustomerToken(order.id)
  let checkout: Awaited<ReturnType<typeof createOrReuseManagementCheckout>>
  try {
    checkout = await createOrReuseManagementCheckout(order, customerToken, parsed.data.requestId, { markGoLive: true })
  } catch (checkoutError) {
    if (checkoutError instanceof ManagementCheckoutError) {
      return Response.json({ error: checkoutError.message }, { status: checkoutError.status })
    }
    console.error('Websitebeheer-checkout maken mislukt', { orderId: order.id, checkoutError })
    return Response.json({ error: 'Abonnementslink kon niet worden gemaakt.' }, { status: 500 })
  }

  const customerPage = `${baseUrl}/beheer/${order.id}?token=${encodeURIComponent(customerToken)}`
  try {
    await getResend().emails.send({
      from: process.env.RESEND_FROM ?? 'Landingsite.nl <noreply@landingsite.nl>',
      to: order.email,
      subject: 'Je website gaat live: activeer Websitebeheer',
      html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#10231b;max-width:620px;margin:auto;padding:32px"><h1 style="font-size:25px">Je website is klaar voor livegang</h1><p>Websitebeheer wordt pas actief nadat je de aparte Stripe-checkout zelf afrondt. Het kost €${pricingConfig.websiteManagement.monthlyPrice} per maand exclusief btw.</p><p><a href="${escapeHtml(customerPage)}" style="display:inline-block;background:#147a55;color:#fff;padding:13px 19px;border-radius:999px;text-decoration:none;font-weight:700">Websitebeheer activeren</a></p><p>Op deze beveiligde pagina rond je het abonnement af en beheer je daarna je betaalgegevens, facturen en opzegging.</p></div>`,
    }, { idempotencyKey: `management-link-${order.id}-${checkout.goLiveAt}` })
  } catch (emailError) {
    console.error('Websitebeheer-link mailen mislukt', { orderId: order.id, emailError })
  }

  return Response.json({ url: checkout.url, customer_page: customerPage, reused: checkout.reused }, { status: checkout.reused ? 200 : 201 })
}
