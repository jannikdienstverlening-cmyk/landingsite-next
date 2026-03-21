import { NextRequest } from 'next/server'
import { stripe, PAKKETTEN } from '@/lib/stripe'
import { supabase } from '@/lib/supabase'
import type { Pakket } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { pakket } = await req.json() as { pakket: Pakket }

  if (!PAKKETTEN[pakket]) {
    return Response.json({ error: 'Ongeldig pakket' }, { status: 400 })
  }

  const info = PAKKETTEN[pakket]
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card', 'ideal'],
    line_items: [
      {
        price_data: {
          currency: 'eur',
          product_data: {
            name: `Landingsite.nl — ${info.naam} Pakket`,
            description: `Professionele landingspagina — ${info.prijs_label} eenmalig`,
          },
          unit_amount: info.prijs,
        },
        quantity: 1,
      },
    ],
    mode: 'payment',
    success_url: `${baseUrl}/intake/{CHECKOUT_SESSION_ID}`,
    cancel_url: `${baseUrl}/#pricing`,
    metadata: { pakket },
    billing_address_collection: 'required',
    customer_email: undefined,
    phone_number_collection: { enabled: false },
  })

  // Sla order op in Supabase
  await supabase.from('orders').insert({
    stripe_session_id: session.id,
    email: '',
    pakket,
    status: 'pending',
  })

  return Response.json({ url: session.url })
}
