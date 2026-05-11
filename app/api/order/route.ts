import { NextRequest } from 'next/server'
import { getSupabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get('session_id')

  if (!sessionId) {
    return Response.json({ error: 'Session ID ontbreekt.' }, { status: 400 })
  }

  const { data, error } = await getSupabase()
    .from('orders')
    .select('id, pakket, status')
    .eq('stripe_session_id', sessionId)
    .single()

  if (error || !data) {
    return Response.json({ error: 'Order niet gevonden.' }, { status: 404 })
  }

  return Response.json({ order: data })
}
