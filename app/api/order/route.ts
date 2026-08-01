import { NextRequest } from 'next/server'
import { checkRateLimit, clientIp, rateLimitResponse } from '@/lib/rate-limit'
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

  return Response.json({ order: data })
}
