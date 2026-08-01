import { NextRequest } from 'next/server'
import { clientIp, checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { invalidJsonResponse, readJsonBody } from '@/lib/request'
import { referralAttributionId, referralCookie, rejectCrossOriginMutation } from '@/lib/security'
import { configuredBuildPriceId, getStripe, PAKKETTEN, TERMS_VERSION } from '@/lib/stripe'
import { getSupabase } from '@/lib/supabase'
import { checkoutSchema, validationMessage } from '@/lib/validation'

export async function POST(request: NextRequest) {
  const crossOrigin = rejectCrossOriginMutation(request)
  if (crossOrigin) return crossOrigin
  const limit = checkRateLimit(`checkout:${clientIp(request)}`, 8, 15 * 60_000)
  if (!limit.allowed) return rateLimitResponse(limit.retryAfter)
  let body: unknown
  try { body = await readJsonBody(request, 4_000) } catch (error) { return invalidJsonResponse(error) }
  const parsed = checkoutSchema.safeParse(body)
  if (!parsed.success) return Response.json({ error: validationMessage(parsed.error) }, { status: 400 })

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, '')
  if (!baseUrl) return Response.json({ error: 'Basis-URL ontbreekt.' }, { status: 500 })
  const info = PAKKETTEN[parsed.data.pakket]
  const priceId = configuredBuildPriceId(parsed.data.pakket)
  const supabase = getSupabase()
  const attributionId = referralAttributionId(request.cookies.get(referralCookie.name)?.value)
  let validAttributionId: string | null = null
  if (attributionId) {
    const { data: attribution, error } = await supabase.from('referral_attributions')
      .select('id, expires_at')
      .eq('id', attributionId)
      .eq('status', 'visited')
      .maybeSingle()
    if (error) return Response.json({ error: 'Bestellen is tijdelijk niet beschikbaar. Er is niets afgeschreven.' }, { status: 503 })
    if (attribution && new Date(attribution.expires_at).getTime() > Date.now()) validAttributionId = attribution.id
  }

  try {
    const session = await getStripe().checkout.sessions.create({
      line_items: [{
        ...(priceId
          ? { price: priceId }
          : {
              price_data: {
                currency: 'eur',
                product_data: {
                  name: `Landingsite.nl ${info.naam}`,
                  description: 'Eenmalige bouwprijs voor de gekozen landingspagina. Websitebeheer van €79 per maand wordt pas na livegang apart geactiveerd.',
                },
                unit_amount: info.prijs,
                tax_behavior: 'exclusive' as const,
              },
            }),
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${baseUrl}/intake/{CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/#prijzen`,
      client_reference_id: parsed.data.requestId,
      customer_creation: 'always',
      metadata: {
        checkout_type: 'build',
        pakket: parsed.data.pakket,
        referral_attribution_id: validAttributionId ?? '',
        terms_accepted: 'true',
        terms_version: TERMS_VERSION,
      },
      payment_intent_data: {
        metadata: {
          checkout_type: 'build',
          pakket: parsed.data.pakket,
          request_id: parsed.data.requestId,
        },
      },
      automatic_tax: { enabled: true },
      tax_id_collection: { enabled: true },
      billing_address_collection: 'required',
      phone_number_collection: { enabled: true },
      name_collection: { business: { enabled: true, optional: false }, individual: { enabled: true, optional: false } },
      custom_fields: [{
        key: 'kvk',
        label: { type: 'custom', custom: 'KvK-nummer (zakelijke bestelling)' },
        type: 'numeric',
        optional: false,
        numeric: { minimum_length: 8, maximum_length: 8 },
      }],
      custom_text: {
        submit: { message: `Je betaalt zakelijk eenmalig ${info.prijs_label} excl. btw voor de bouw. Websitebeheer van €79 per maand start niet nu; daarvoor ontvang je pas bij livegang een aparte beveiligde abonnementslink.` },
      },
      ...(process.env.STRIPE_TERMS_CONFIGURED === 'true'
        ? { consent_collection: { terms_of_service: 'required' as const } }
        : {}),
      locale: 'nl',
    }, { idempotencyKey: `checkout-${parsed.data.requestId}` })
    if (!session.url) return Response.json({ error: 'Checkout kon niet worden geopend.' }, { status: 500 })

    const { error } = await supabase.from('orders').upsert({
      stripe_session_id: session.id,
      email: '',
      pakket: parsed.data.pakket,
      status: 'pending',
      management_status: 'pending',
      referral_attribution_id: validAttributionId,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'stripe_session_id', ignoreDuplicates: true })
    if (error) {
      console.error('Pending order opslaan mislukt', { sessionId: session.id, error })
      try {
        await getStripe().checkout.sessions.expire(session.id)
      } catch (expireError) {
        console.error('Niet-opgeslagen Stripe-sessie kon niet worden gesloten', { sessionId: session.id, expireError })
      }
      return Response.json({ error: 'Bestellen is tijdelijk niet beschikbaar. Er is niets afgeschreven.' }, { status: 503 })
    }
    return Response.json({ url: session.url })
  } catch (error) {
    console.error('Checkout voorbereiden mislukt', error)
    return Response.json({ error: 'Checkout kon niet worden geopend.' }, { status: 500 })
  }
}
