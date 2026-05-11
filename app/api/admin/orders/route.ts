import { NextRequest } from 'next/server'
import { getSupabase } from '@/lib/supabase'

function hasAdminAccess(password: unknown) {
  return typeof password === 'string' && password === process.env.ADMIN_PASSWORD
}

export async function POST(req: NextRequest) {
  const { password } = await req.json() as { password?: string }

  if (!hasAdminAccess(password)) {
    return Response.json({ error: 'Onjuist wachtwoord.' }, { status: 401 })
  }

  const { data, error } = await getSupabase()
    .from('orders')
    .select(`
      id, email, pakket, status, created_at,
      intake_forms ( bedrijfsnaam ),
      generated_pages ( netlify_url, status )
    `)
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) {
    return Response.json({ error: 'Orders ophalen mislukt.' }, { status: 500 })
  }

  return Response.json({ orders: data ?? [] })
}
