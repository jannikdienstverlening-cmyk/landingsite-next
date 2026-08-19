import { NextRequest } from 'next/server'
import { checkRateLimit, clientIp, rateLimitResponse } from '@/lib/rate-limit'
import { getStripe } from '@/lib/stripe'
import { getSupabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const limit = checkRateLimit(`order:${clientIp(req)}`, 30, 10 * 60_000)
  if (!limit.allowed) return rateLimitResponse(limit.retryAfter)
  const sessionId = req.nextUrl.searchParams.get('session_id')

  if (!sessionId || sessionId.length > 300) {
    return Response.json({ error: 'Session ID ontbreekt.' }, { status: 400 })
  }

  const { data, error } = await getSupabase()
    .from('orders')
    .select('id, pakket, status')
    .eq('stripe_session_id', sessionId)
    .maybeSingle()

  if (error) {
    console.error('Orderstatus ophalen mislukt', { sessionId, error })
    return Response.json({ error: 'Ordercontrole is tijdelijk niet beschikbaar.' }, { status: 503 })
  }
  if (!data) {
    return Response.json({ error: 'Order niet gevonden.' }, { status: 404 })
  }

  let purchase: { eventId: string; value: number; currency: 'EUR' } | null = null
  if (data.status === 'paid') {
    try {
      const session = await getStripe().checkout.sessions.retrieve(sessionId)
      const value = Number(session.metadata?.initial_payment_including_vat)
      if (session.payment_status === 'paid' && Number.isFinite(value) && value >= 0) {
        purchase = { eventId: session.id, value, currency: 'EUR' }
      }
    } catch {
      // De intake blijft beschikbaar wanneer alleen de optionele meetinformatie tijdelijk niet kan worden geladen.
    }
  }

  return Response.json({ order: { ...data, purchase } })
}
