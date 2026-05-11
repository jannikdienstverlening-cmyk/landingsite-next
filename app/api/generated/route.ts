import { NextRequest } from 'next/server'
import { getSupabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  const orderId = req.nextUrl.searchParams.get('order_id')

  if (!orderId) {
    return Response.json({ error: 'Order ID ontbreekt.' }, { status: 400 })
  }

  const { data, error } = await getSupabase()
    .from('generated_pages')
    .select('status, netlify_url')
    .eq('order_id', orderId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (error) {
    return Response.json({ error: 'Status kon niet worden opgehaald.' }, { status: 500 })
  }

  return Response.json({
    status: data?.status ?? 'generating',
    netlify_url: data?.netlify_url ?? null,
  })
}
