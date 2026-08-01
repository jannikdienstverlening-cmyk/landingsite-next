import { NextRequest } from 'next/server'
import { clientIp, checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { invalidJsonResponse, readJsonBody } from '@/lib/request'
import { rejectCrossOriginMutation } from '@/lib/security'
import { getStripe, PAKKETTEN, SUBSCRIPTION_INTERVAL, TERMS_VERSION } from '@/lib/stripe'
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

  try {
    const session = await getStripe().checkout.sessions.create({
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: `Landingsite.nl ${info.naam}`,
            description: 'Maandelijks websiteabonnement inclusief hosting, SSL, onderhoud, updates, backups en support volgens het gekozen pakket.',
          },
          unit_amount: info.prijs,
          tax_behavior: 'exclusive',
          recurring: { interval: SUBSCRIPTION_INTERVAL },
        },
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: `${baseUrl}/intake/{CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/#prijzen`,
      client_reference_id: parsed.data.requestId,
      metadata: {
        pakket: parsed.data.pakket,
        terms_accepted: 'true',
        terms_version: TERMS_VERSION,
      },
      subscription_data: {
        metadata: {
          pakket: parsed.data.pakket,
          terms_accepted: 'true',
          terms_version: TERMS_VERSION,
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
        submit: { message: `Je sluit zakelijk een maandelijks abonnement af voor ${info.prijs_label} excl. btw. Het abonnement loopt voor onbepaalde tijd en is per maand opzegbaar tegen het einde van de lopende betaalperiode.` },
      },
      ...(process.env.STRIPE_TERMS_CONFIGURED === 'true'
        ? { consent_collection: { terms_of_service: 'required' as const } }
        : {}),
      locale: 'nl',
    }, { idempotencyKey: `checkout-${parsed.data.requestId}` })
    if (!session.url) return Response.json({ error: 'Checkout kon niet worden geopend.' }, { status: 500 })

    const { error } = await getSupabase().from('orders').upsert({
      stripe_session_id: session.id,
      email: '',
      pakket: parsed.data.pakket,
      status: 'pending',
      updated_at: new Date().toISOString(),
    }, { onConflict: 'stripe_session_id', ignoreDuplicates: true })
    if (error) console.error('Pending order opslaan mislukt', { sessionId: session.id, error })
    return Response.json({ url: session.url })
  } catch (error) {
    console.error('Checkout voorbereiden mislukt', error)
    return Response.json({ error: 'Checkout kon niet worden geopend.' }, { status: 500 })
  }
}
