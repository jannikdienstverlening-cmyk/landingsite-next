import { NextRequest } from 'next/server'
import { verifyCustomerToken } from '@/lib/security'
import { getSupabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const orderId = request.nextUrl.searchParams.get('order_id') ?? ''
  const token = request.nextUrl.searchParams.get('token') ?? ''
  if (!verifyCustomerToken(token, orderId)) return Response.json({ error: 'Beheerlink is ongeldig of verlopen.' }, { status: 401 })
  const { data, error } = await getSupabase().from('orders').select('management_status, management_started_at, management_cancel_at_period_end, management_subscription_id, went_live_at')
    .eq('id', orderId).maybeSingle()
  if (error) return Response.json({ error: 'Beheerstatus ophalen lukt nu niet.' }, { status: 503 })
  if (!data) return Response.json({ error: 'Order niet gevonden.' }, { status: 404 })
  return Response.json({
    management: {
      management_status: data.management_status,
      management_started_at: data.management_started_at,
      management_cancel_at_period_end: data.management_cancel_at_period_end,
      went_live_at: data.went_live_at,
      can_activate: Boolean(data.went_live_at && !data.management_subscription_id),
    },
  })
}
