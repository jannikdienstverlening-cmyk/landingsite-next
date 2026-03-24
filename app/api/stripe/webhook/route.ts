import { NextRequest } from 'next/server'
import { stripe } from '@/lib/stripe'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const body = await req.text()
  const sig = req.headers.get('stripe-signature')!

  let event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return Response.json({ error: 'Webhook signature invalid' }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    await supabase
      .from('orders')
      .update({
        status: 'paid',
        email: session.customer_details?.email ?? '',
        stripe_payment_intent: session.payment_intent as string,
      })
      .eq('stripe_session_id', session.id)
  }

  return Response.json({ received: true })
}
