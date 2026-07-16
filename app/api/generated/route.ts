import { NextRequest } from 'next/server'
import { verifyOrderToken } from '@/lib/security'
import { getSupabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  const orderId = request.nextUrl.searchParams.get('order_id')
  const token = request.nextUrl.searchParams.get('token') ?? undefined
  if (!orderId || !verifyOrderToken(token, orderId)) {
    return Response.json({ error: 'Geen toegang tot deze status.' }, { status: 401 })
  }

  const { data, error } = await getSupabase().from('generated_pages')
    .select('status, netlify_url, error_message, updated_at')
    .eq('order_id', orderId).order('created_at', { ascending: false }).limit(1).maybeSingle()
  if (error) return Response.json({ error: 'Status kon niet worden opgehaald.' }, { status: 500 })

  return Response.json({
    status: data?.status ?? 'generating',
    netlify_url: data?.netlify_url ?? null,
    message: data?.status === 'failed' ? 'De generatie liep vast. We hebben dit geregistreerd en kunnen hem veilig herstarten.' : null,
    updated_at: data?.updated_at ?? null,
  })
}
