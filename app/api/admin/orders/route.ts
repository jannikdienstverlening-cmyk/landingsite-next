import { NextRequest } from 'next/server'
import { adminCookie, verifyAdminSession } from '@/lib/security'
import { getSupabase } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  if (!verifyAdminSession(request.cookies.get(adminCookie.name)?.value)) {
    return Response.json({ error: 'Niet ingelogd.' }, { status: 401 })
  }
  const supabase = getSupabase()
  const [{ data, error }, { data: partners, error: partnerError }, { data: commissions, error: commissionError }] = await Promise.all([
    supabase.from('orders').select(`
    id, email, pakket, status, created_at, last_error, management_status, management_started_at, management_subscription_id, went_live_at,
    intake_forms ( bedrijfsnaam ),
    generated_pages ( netlify_url, status, created_at )
  `).order('created_at', { ascending: false }).limit(100),
    supabase.from('partners').select('id, first_name, last_name, email, partner_type, company_name, kvk_number, referral_code, status, created_at').order('created_at', { ascending: false }).limit(100),
    supabase.from('partner_commissions').select('id, partner_id, order_id, level, amount_cents, stripe_invoice_id, available_at, status, audit_note, created_at').order('created_at', { ascending: false }).limit(200),
  ])
  if (error || partnerError || commissionError) return Response.json({ error: 'Beheerdata ophalen mislukt.' }, { status: 500 })
  return Response.json({ orders: data ?? [], partners: partners ?? [], commissions: commissions ?? [] })
}
