import { NextRequest } from 'next/server'
import { getSupabase } from '@/lib/supabase'

function hasAdminAccess(password: unknown) {
  return typeof password === 'string' && password === process.env.ADMIN_PASSWORD
}

export async function POST(req: NextRequest) {
  const { password, order_id } = await req.json() as {
    password?: string
    order_id?: string
  }

  if (!hasAdminAccess(password)) {
    return Response.json({ error: 'Onjuist wachtwoord.' }, { status: 401 })
  }

  if (!order_id) {
    return Response.json({ error: 'Order ID ontbreekt.' }, { status: 400 })
  }

  const { error } = await getSupabase()
    .from('orders')
    .update({ status: 'paid' })
    .eq('id', order_id)

  if (error) {
    return Response.json({ error: 'Order kon niet worden klaargezet.' }, { status: 500 })
  }

  return Response.json({ ok: true })
}
