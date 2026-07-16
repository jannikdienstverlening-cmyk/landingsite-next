import type Stripe from 'stripe'
import { NextRequest } from 'next/server'
import { escapeHtml } from '@/lib/html'
import { getResend } from '@/lib/resend'
import { getStripe, PAKKETTEN } from '@/lib/stripe'
import { getSupabase, type Pakket } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

function isPackage(value: string | undefined): value is Pakket {
  return Boolean(value && value in PAKKETTEN)
}

async function markPaid(session: Stripe.Checkout.Session, eventId: string) {
  const pakket = session.metadata?.pakket
  if (!isPackage(pakket)) throw new Error(`Ongeldig pakket in Stripe-sessie ${session.id}.`)
  const email = session.customer_details?.email ?? session.customer_email ?? ''
  const kvkNumber = session.custom_fields?.find(field => field.key === 'kvk')?.numeric?.value ?? ''
  const businessName = session.customer_details?.business_name ?? session.customer_details?.name ?? ''
  const paymentIntent = typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id ?? null
  const now = new Date().toISOString()
  const supabase = getSupabase()
  const { error } = await supabase.from('orders').upsert({
    stripe_session_id: session.id,
    stripe_payment_intent: paymentIntent,
    email,
    business_name: businessName,
    kvk_number: kvkNumber,
    pakket,
    status: 'paid',
    last_error: null,
    updated_at: now,
  }, { onConflict: 'stripe_session_id' })
  if (error) throw new Error(`Order opslaan mislukt: ${error.message}`)

  const amount = new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format((session.amount_total ?? 0) / 100)
  const adminUrl = `${process.env.NEXT_PUBLIC_BASE_URL ?? 'https://landingsite.nl'}/admin`
  await getResend().emails.send({
    from: process.env.RESEND_FROM ?? 'Landingsite.nl <noreply@landingsite.nl>',
    to: process.env.ADMIN_EMAIL ?? 'jannikklumpenaar@gmail.com',
    replyTo: email || undefined,
    subject: `Nieuwe bestelling — ${PAKKETTEN[pakket].naam} (${amount})`,
    html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#0b2019;max-width:620px;margin:auto;padding:32px">
      <p style="color:#16845c;font-weight:800">Betaling ontvangen</p><h1 style="font-size:26px">Nieuwe bestelling</h1>
      <p><strong>Pakket:</strong> ${escapeHtml(PAKKETTEN[pakket].naam)}<br><strong>Bedrag:</strong> ${escapeHtml(amount)}<br><strong>Bedrijf:</strong> ${escapeHtml(businessName || 'Onbekend')}<br><strong>KvK:</strong> ${escapeHtml(kvkNumber || 'Niet beschikbaar')}<br><strong>Klant:</strong> ${escapeHtml(session.customer_details?.name ?? 'Onbekend')}<br><strong>E-mail:</strong> ${escapeHtml(email || 'Niet beschikbaar')}</p>
      <p><a href="${escapeHtml(adminUrl)}" style="display:inline-block;background:#0b3d2e;color:#fff;padding:12px 18px;border-radius:999px;text-decoration:none">Open dashboard</a></p>
    </div>`,
  }, { idempotencyKey: `stripe-${eventId}` })
}

export async function POST(request: NextRequest) {
  const signature = request.headers.get('stripe-signature')
  const secret = process.env.STRIPE_WEBHOOK_SECRET
  if (!signature || !secret) return Response.json({ error: 'Webhookconfiguratie ontbreekt.' }, { status: 400 })

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
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object
      if (session.payment_status === 'paid') await markPaid(session, event.id)
    } else if (event.type === 'checkout.session.async_payment_succeeded') {
      await markPaid(event.data.object, event.id)
    }

    const { error } = await supabase.from('stripe_webhook_events').upsert({
      event_id: event.id,
      event_type: event.type,
    }, { onConflict: 'event_id', ignoreDuplicates: true })
    if (error) throw error
    return Response.json({ received: true })
  } catch (error) {
    console.error('Stripe-webhook verwerken mislukt', { eventId: event.id, error })
    return Response.json({ error: 'Webhookverwerking mislukt.' }, { status: 500 })
  }
}
