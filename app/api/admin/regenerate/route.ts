import { randomBytes } from 'node:crypto'
import { start } from 'workflow/api'
import { NextRequest } from 'next/server'
import { adminCookie, verifyAdminSession } from '@/lib/security'
import { getSupabase } from '@/lib/supabase'
import { adminRegenerateSchema, validationMessage } from '@/lib/validation'
import { generateLandingWorkflow } from '@/workflows/generate-landing'

export async function POST(request: NextRequest) {
  if (!verifyAdminSession(request.cookies.get(adminCookie.name)?.value)) {
    return Response.json({ error: 'Niet ingelogd.' }, { status: 401 })
  }
  let body: unknown
  try { body = await request.json() } catch { body = null }
  const parsed = adminRegenerateSchema.safeParse(body)
  if (!parsed.success) return Response.json({ error: validationMessage(parsed.error) }, { status: 400 })

  const supabase = getSupabase()
  const { data: order } = await supabase.from('orders').select('id, status').eq('id', parsed.data.order_id).maybeSingle()
  if (!order || !['paid', 'failed', 'completed'].includes(order.status)) {
    return Response.json({ error: 'Deze order kan niet worden gegenereerd.' }, { status: 409 })
  }
  const { data: intake } = await supabase.from('intake_forms').select('id').eq('order_id', order.id).maybeSingle()
  if (!intake) return Response.json({ error: 'Intake ontbreekt.' }, { status: 409 })

  const { data: previous } = await supabase.from('generated_pages').select('netlify_site_id, netlify_url')
    .eq('order_id', order.id).order('created_at', { ascending: false }).limit(1).maybeSingle()
  const { data: page, error } = await supabase.from('generated_pages').insert({
    order_id: order.id,
    status: 'generating',
    lead_token: randomBytes(32).toString('base64url'),
    netlify_site_id: previous?.netlify_site_id ?? null,
    netlify_url: previous?.netlify_url ?? null,
  }).select('id').single()
  if (error || !page) return Response.json({ error: 'Generatie-record aanmaken mislukt.' }, { status: 500 })

  await supabase.from('orders').update({ status: 'generating', last_error: null }).eq('id', order.id)
  try {
    const run = await start(generateLandingWorkflow, [order.id, page.id])
    await supabase.from('generated_pages').update({ workflow_run_id: run.runId }).eq('id', page.id)
    return Response.json({ ok: true, run_id: run.runId }, { status: 202 })
  } catch (startError) {
    console.error('Admin workflow starten mislukt', startError)
    await supabase.from('orders').update({ status: 'failed', last_error: 'Workflow starten mislukt.' }).eq('id', order.id)
    await supabase.from('generated_pages').update({ status: 'failed', error_message: 'Workflow starten mislukt.' }).eq('id', page.id)
    return Response.json({ error: 'Workflow starten mislukt.' }, { status: 500 })
  }
}
