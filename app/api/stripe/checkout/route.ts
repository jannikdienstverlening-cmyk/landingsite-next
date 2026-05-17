import { NextRequest } from 'next/server'
import { getStripe, PAKKETTEN } from '@/lib/stripe'
import { getSupabase } from '@/lib/supabase'
import type { Pakket } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const { pakket } = (await req.json()) as { pakket: Pakket }

  if (!PAKKETTEN[pakket]) {
    return Response.json({ error: 'Ongeldig pakket' }, { status: 400 })
  }

  const info = PAKKETTEN[pakket]
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
  if (!baseUrl) {
    return Response.json({ error: 'Basis-URL ontbreekt.' }, { status: 500 })
  }

  try {
    const session = await getStripe().checkout.sessions.create({
      payment_method_types: ['card', 'ideal'],
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: `Landingsite.nl ${info.naam}`,
              description: 'Professionele landingspagina live binnen 48 uur.',
            },
            unit_amount: info.prijs,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${baseUrl}/intake/{CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/#prijzen`,
      metadata: { pakket },
      billing_address_collection: 'required',
      customer_email: undefined,
      phone_number_collection: { enabled: false },
    })

    // Sla order op in Supabase
    const { error } = await getSupabase().from('orders').insert({
      stripe_session_id: session.id,
      email: '',
      pakket,
      status: 'pending',
    })

    if (error) {
      console.error('Could not create pending order', error)
      return Response.json({ error: 'Checkout kon niet worden opgeslagen.' }, { status: 500 })
    }

    if (!session.url) {
      console.error('Stripe checkout session did not include a URL', { sessionId: session.id })
      return Response.json({ error: 'Checkout kon niet worden geopend.' }, { status: 500 })
    }

    return Response.json({ url: session.url })
  } catch (error) {
    console.error('Could not prepare checkout', error)
    return Response.json({ error: 'Checkout kon niet worden geopend.' }, { status: 500 })
  }
}
