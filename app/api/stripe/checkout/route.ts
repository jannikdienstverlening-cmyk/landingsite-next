import type Stripe from 'stripe'
import { NextRequest } from 'next/server'
import { activePromotion, cents, commercialConfig, effectiveBuildPrice, effectiveFirstPayment } from '@/config/commercial'
import { clientIp, checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { invalidJsonResponse, readJsonBody } from '@/lib/request'
import { referralAttributionId, referralCookie, rejectCrossOriginMutation } from '@/lib/security'
import {
  configuredBuildPriceId,
  configuredManagementPriceId,
  getStripe,
  PAKKETTEN,
  STRIPE_COMBINED_PAYMENT_METHODS,
  stripeCheckoutBranding,
  stripePaymentMethods,
  TERMS_VERSION,
  type PakketId,
} from '@/lib/stripe'
import { getSupabase } from '@/lib/supabase'
import { checkoutSchema, validationMessage } from '@/lib/validation'

function buildLineItem(pakket: PakketId, buildPrice = PAKKETTEN[pakket].prijs / 100): Stripe.Checkout.SessionCreateParams.LineItem {
  const info = PAKKETTEN[pakket]
  const priceId = configuredBuildPriceId(pakket)
  const regularPrice = info.prijs / 100
  if (priceId && buildPrice === regularPrice) return { price: priceId, quantity: 1 }

  return {
    price_data: {
      currency: 'eur',
      product_data: {
        name: `Landingsite.nl ${info.naam}`,
        description: buildPrice === regularPrice ? 'Eenmalige bouwprijs voor het gekozen websitepakket.' : 'Tijdelijke zomeractie voor het gekozen websitepakket.',
      },
      unit_amount: cents(buildPrice),
      tax_behavior: commercialConfig.stripeTaxBehavior,
    },
    quantity: 1,
  }
}

function managementLineItem(): Stripe.Checkout.SessionCreateParams.LineItem {
  const priceId = configuredManagementPriceId()
  if (priceId) return { price: priceId, quantity: 1 }

  return {
    price_data: {
      currency: 'eur',
      product_data: {
        name: commercialConfig.management.name,
        description: `Hosting, beveiliging, onderhoud en maximaal ${commercialConfig.management.includedChangeMinutes} minuten kleine wijzigingen per maand.`,
      },
      unit_amount: cents(commercialConfig.management.monthlyPrice),
      recurring: { interval: 'month' },
      tax_behavior: commercialConfig.stripeTaxBehavior,
    },
    quantity: 1,
  }
}

export async function POST(request: NextRequest) {
  const crossOrigin = rejectCrossOriginMutation(request)
  if (crossOrigin) return crossOrigin
  const limit = checkRateLimit(`checkout:${clientIp(request)}`, 8, 15 * 60_000)
  if (!limit.allowed) return rateLimitResponse(limit.retryAfter)

  let body: unknown
  try {
    body = await readJsonBody(request, 4_000)
  } catch (error) {
    return invalidJsonResponse(error)
  }
  const parsed = checkoutSchema.safeParse(body)
  if (!parsed.success) return Response.json({ error: validationMessage(parsed.error) }, { status: 400 })

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, '')
  if (!baseUrl) return Response.json({ error: 'Basis-URL ontbreekt.' }, { status: 500 })

  const info = PAKKETTEN[parsed.data.pakket]
  const checkoutTime = new Date()
  const promotion = activePromotion(checkoutTime)
  const buildPrice = effectiveBuildPrice(parsed.data.pakket, checkoutTime)
  const initialPayment = effectiveFirstPayment(parsed.data.pakket, checkoutTime)
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
    const metadata = {
      checkout_type: 'combined',
      pakket: parsed.data.pakket,
      request_id: parsed.data.requestId,
      referral_attribution_id: validAttributionId ?? '',
      terms_accepted: 'true',
      terms_version: TERMS_VERSION,
      promotion_code: promotion?.code ?? '',
      build_price_including_vat: String(buildPrice),
      initial_payment_including_vat: String(initialPayment),
    }
    const lineItems = [managementLineItem()]
    if (buildPrice > 0) lineItems.unshift(buildLineItem(parsed.data.pakket, buildPrice))
    const session = await getStripe().checkout.sessions.create({
      line_items: lineItems,
      mode: 'subscription',
      payment_method_types: stripePaymentMethods(STRIPE_COMBINED_PAYMENT_METHODS),
      wallet_options: { link: { display: 'never' } },
      branding_settings: stripeCheckoutBranding(baseUrl),
      success_url: `${baseUrl}/intake/{CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/start?pakket=${parsed.data.pakket}&status=geannuleerd`,
      client_reference_id: parsed.data.requestId,
      metadata,
      subscription_data: { metadata },
      automatic_tax: { enabled: true },
      tax_id_collection: { enabled: true },
      billing_address_collection: 'required',
      name_collection: {
        business: { enabled: true, optional: false },
        individual: { enabled: true, optional: false },
      },
      custom_fields: [{
        key: 'kvk',
        label: { type: 'custom', custom: 'KvK-nummer (zakelijke bestelling)' },
        type: 'numeric',
        optional: false,
        numeric: { minimum_length: 8, maximum_length: 8 },
      }],
      custom_text: {
        submit: {
          message: promotion
            ? `${promotion.name}: voor ${info.naam} geldt tijdelijk een bouwprijs van €${buildPrice}. Je betaalt nu in totaal €${initialPayment} inclusief btw, inclusief de eerste maand Hosting & Websitebeheer. Daarna betaal je €${commercialConfig.management.monthlyPrice} per maand inclusief btw. Je bekijkt de eerste versie vóór publicatie.`
            : `${info.naam}: ${info.prijs_label} inclusief btw plus de eerste maand beheer van €${commercialConfig.management.monthlyPrice} inclusief btw. Eerste betaling €${initialPayment} inclusief btw; daarna €${commercialConfig.management.monthlyPrice} per maand inclusief btw.`,
        },
        after_submit: {
          message: 'Na de betaling ga je direct door naar de beveiligde intake. De 48 uur starten zodra die intake compleet is.',
        },
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
