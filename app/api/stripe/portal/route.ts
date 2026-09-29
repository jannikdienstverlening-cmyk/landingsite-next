import { NextRequest } from 'next/server'
import { invalidJsonResponse, readJsonBody } from '@/lib/request'
import { clientIp, checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { rejectCrossOriginMutation, verifyCustomerToken } from '@/lib/security'
import { getStripe, safePaymentError } from '@/lib/stripe'
import { portalFeaturesReady, sitePortalConfiguration } from '@/lib/stripe-support'
import { getSupabase } from '@/lib/supabase'
import { customerManagementSchema, validationMessage } from '@/lib/validation'

export async function POST(request: NextRequest) {
  const crossOrigin = rejectCrossOriginMutation(request)
  if (crossOrigin) return crossOrigin
  const limit = checkRateLimit(`customer-portal:${clientIp(request)}`, 10, 15 * 60_000)
  if (!limit.allowed) return rateLimitResponse(limit.retryAfter)
  let body: unknown
  try { body = await readJsonBody(request, 4_000) } catch (error) { return invalidJsonResponse(error) }
  const parsed = customerManagementSchema.safeParse(body)
  if (!parsed.success) return Response.json({ error: validationMessage(parsed.error) }, { status: 400 })
  if (!verifyCustomerToken(parsed.data.token, parsed.data.order_id)) return Response.json({ error: 'Beheerlink is ongeldig of verlopen.' }, { status: 401 })

  const { data: order, error } = await getSupabase().from('orders').select('stripe_customer_id, management_subscription_id')
    .eq('id', parsed.data.order_id).maybeSingle()
  if (error) return Response.json({ error: 'Klantgegevens ophalen lukt nu niet.' }, { status: 503 })
  if (!order?.stripe_customer_id || !order.management_subscription_id) return Response.json({ error: 'Websitebeheer is nog niet actief.' }, { status: 409 })

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL?.trim().replace(/\/$/, '')
  if (!baseUrl) return Response.json({ error: 'Basis-URL ontbreekt.' }, { status: 500 })
  try {
    const configuration = await sitePortalConfiguration()
    if (!configuration || !portalFeaturesReady(configuration)) throw new Error('Klantportaalconfiguratie ontbreekt.')
    const portal = await getStripe().billingPortal.sessions.create({
      configuration: configuration.id,
      customer: order.stripe_customer_id,
      return_url: `${baseUrl}/beheer/${parsed.data.order_id}?token=${encodeURIComponent(parsed.data.token)}`,
    })
    return Response.json({ url: portal.url })
  } catch (error) {
    console.error('Klantportaal openen mislukt', safePaymentError(error))
    return Response.json({ error: 'Je klantportaal kan nu niet worden geopend. Probeer het later opnieuw of neem contact met ons op.' }, { status: 503 })
  }
}
