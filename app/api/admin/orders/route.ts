import { NextRequest } from 'next/server'
import { adminCookie, verifyAdminSession } from '@/lib/security'
import { getSupabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  if (!verifyAdminSession(request.cookies.get(adminCookie.name)?.value)) {
    return Response.json({ error: 'Niet ingelogd.' }, { status: 401 })
  }
  const { data, error } = await getSupabase().from('orders').select(`
    id, email, pakket, status, created_at, last_error,
    intake_forms ( bedrijfsnaam ),
    generated_pages ( netlify_url, status, created_at )
  `).order('created_at', { ascending: false }).limit(100)
  if (error) return Response.json({ error: 'Orders ophalen mislukt.' }, { status: 500 })
  return Response.json({ orders: data ?? [] })
}
