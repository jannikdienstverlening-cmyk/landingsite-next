import { NextRequest } from 'next/server'
import { createOrReuseManagementCheckout, ManagementCheckoutError } from '@/lib/management-checkout'
import { clientIp, checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { invalidJsonResponse, readJsonBody } from '@/lib/request'
import { rejectCrossOriginMutation, verifyCustomerToken } from '@/lib/security'
import { getSupabase } from '@/lib/supabase'
import { customerManagementCheckoutSchema, validationMessage } from '@/lib/validation'

export async function POST(request: NextRequest) {
  const crossOrigin = rejectCrossOriginMutation(request)
  if (crossOrigin) return crossOrigin

  const limit = checkRateLimit(`management-checkout:${clientIp(request)}`, 8, 15 * 60_000)
  if (!limit.allowed) return rateLimitResponse(limit.retryAfter)

  let body: unknown
  try { body = await readJsonBody(request, 4_000) } catch (error) { return invalidJsonResponse(error) }
  const parsed = customerManagementCheckoutSchema.safeParse(body)
  if (!parsed.success) return Response.json({ error: validationMessage(parsed.error) }, { status: 400 })
  if (!verifyCustomerToken(parsed.data.token, parsed.data.order_id)) {
    return Response.json({ error: 'Beheerlink is ongeldig of verlopen.' }, { status: 401 })
  }

  const { data: order, error } = await getSupabase().from('orders')
    .select('id, email, status, stripe_customer_id, management_status, management_subscription_id, management_checkout_session_id, went_live_at')
    .eq('id', parsed.data.order_id)
    .maybeSingle()
  if (error) return Response.json({ error: 'Order controleren lukt nu niet.' }, { status: 503 })
  if (!order) return Response.json({ error: 'Order niet gevonden.' }, { status: 404 })

  try {
    const checkout = await createOrReuseManagementCheckout(order, parsed.data.token, parsed.data.requestId, { markGoLive: false })
    return Response.json({ url: checkout.url, reused: checkout.reused }, { status: checkout.reused ? 200 : 201 })
  } catch (checkoutError) {
    if (checkoutError instanceof ManagementCheckoutError) {
      return Response.json({ error: checkoutError.message }, { status: checkoutError.status })
    }
    console.error('Klantcheckout voor Websitebeheer maken mislukt', { orderId: order.id, checkoutError })
    return Response.json({ error: 'Abonnementscheckout openen lukt nu niet.' }, { status: 500 })
  }
}
