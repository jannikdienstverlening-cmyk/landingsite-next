import { NextRequest } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { getSupabase } from '@/lib/supabase'
import { escapeHtml } from '@/lib/html'
import { getResend } from '@/lib/resend'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event
  try {
    event = getStripe().webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return Response.json({ error: 'Webhook signature invalid' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const klantEmail = session.customer_details?.email ?? ''
    const klantNaam = session.customer_details?.name ?? 'Onbekend'
    const pakket = session.metadata?.pakket ?? 'onbekend'
    const bedrag = session.amount_total ? `€${(session.amount_total / 100).toFixed(2)}` : '?'
    const safeKlantEmail = escapeHtml(klantEmail)
    const safeKlantNaam = escapeHtml(klantNaam)
    const safePakket = escapeHtml(pakket)
    const safeBedrag = escapeHtml(bedrag)
    const safeSessionId = escapeHtml(session.id)
    const adminUrl = escapeHtml(`${process.env.NEXT_PUBLIC_BASE_URL}/admin`)

    // Update order in Supabase
    await getSupabase()
      .from('orders')
      .update({
        status: 'paid',
        email: klantEmail,
        stripe_payment_intent: session.payment_intent as string,
      })
      .eq('stripe_session_id', session.id)

    // Stuur notificatie naar Jannik
    await getResend().emails.send({
      from: 'Landingsite.nl <noreply@landingsite.nl>',
      to: 'jannikklumpenaar@gmail.com',
      subject: `💰 Nieuwe bestelling — ${pakket} pakket (${bedrag})`,
      html: `
<!DOCTYPE html>
<html lang="nl">
<head><meta charset="UTF-8"></head>
<body style="font-family: 'Courier New', monospace; background: #f5f2eb; color: #0d0d0d; padding: 2rem; max-width: 600px; margin: 0 auto;">
  <h2 style="font-size: 1.5rem; margin-bottom: 0.5rem;">Nieuwe bestelling ontvangen!</h2>
  <p style="color: #6b6458; margin-bottom: 2rem; font-size: 0.85rem;">Er is zojuist een betaling binnengekomen op Landingsite.nl.</p>

  <div style="background: #ece8df; border: 1px solid #d4cec3; padding: 1.5rem; margin-bottom: 1.5rem;">
    <p style="margin-bottom: 0.5rem;"><strong>Pakket:</strong> ${safePakket.charAt(0).toUpperCase() + safePakket.slice(1)}</p>
    <p style="margin-bottom: 0.5rem;"><strong>Bedrag:</strong> ${safeBedrag}</p>
    <p style="margin-bottom: 0.5rem;"><strong>Klant:</strong> ${safeKlantNaam}</p>
    <p style="margin-bottom: 0.5rem;"><strong>E-mail:</strong> <a href="mailto:${safeKlantEmail}" style="color: #c8440a;">${safeKlantEmail}</a></p>
    <p style="margin-bottom: 0;"><strong>Session ID:</strong> <span style="font-size: 0.75rem; color: #6b6458;">${safeSessionId}</span></p>
  </div>

  <p style="font-size: 0.85rem; margin-bottom: 1rem;">
    De klant ontvangt nu het intakeformulier. Zodra ingevuld start de automatische generatie.
  </p>

  <a href="${adminUrl}" style="display: inline-block; background: #0d0d0d; color: #f5f2eb; font-family: 'Courier New', monospace; font-size: 0.75rem; letter-spacing: 0.06em; text-transform: uppercase; padding: 0.8rem 1.5rem; text-decoration: none;">
    Bekijk in admin →
  </a>

  <hr style="border: none; border-top: 1px solid #d4cec3; margin: 2rem 0;">
  <p style="color: #6b6458; font-size: 0.75rem;">© 2026 Landingsite.nl</p>
</body>
</html>
      `,
    })
  }

  return Response.json({ received: true })
}
