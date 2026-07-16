import { randomBytes } from 'node:crypto'
import { start } from 'workflow/api'
import { NextRequest } from 'next/server'
import { clientIp, checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { createOrderToken } from '@/lib/security'
import { getSupabase } from '@/lib/supabase'
import { generateSchema, validationMessage } from '@/lib/validation'
import { generateLandingWorkflow } from '@/workflows/generate-landing'

export async function POST(request: NextRequest) {
  const limit = checkRateLimit(`generate:${clientIp(request)}`, 5, 15 * 60_000)
  if (!limit.allowed) return rateLimitResponse(limit.retryAfter)

  let body: unknown
  try { body = await request.json() } catch { body = null }
  const parsed = generateSchema.safeParse(body)
  if (!parsed.success) return Response.json({ error: validationMessage(parsed.error) }, { status: 400 })

  const supabase = getSupabase()
  const { data: order } = await supabase
    .from('orders')
    .select('id, status')
    .eq('stripe_session_id', parsed.data.session_id)
    .maybeSingle()

  if (!order) return Response.json({ error: 'Order niet gevonden.' }, { status: 404 })
  if (order.status !== 'paid') {
    const token = createOrderToken(order.id)
    if (order.status === 'generating' || order.status === 'completed') {
      return Response.json({ order_id: order.id, status_token: token, already_started: true })
    }
    return Response.json({ error: 'Deze order kan nu niet worden gestart.' }, { status: 409 })
  }

  const { data: claimed } = await supabase.from('orders')
    .update({ status: 'generating', last_error: null, updated_at: new Date().toISOString() })
    .eq('id', order.id).eq('status', 'paid').select('id').maybeSingle()
  if (!claimed) return Response.json({ error: 'De generatie is al gestart.' }, { status: 409 })

  const { data: page, error: pageError } = await supabase.from('generated_pages').insert({
    order_id: order.id,
    status: 'generating',
    lead_token: randomBytes(32).toString('base64url'),
  }).select('id').single()

  if (pageError || !page) {
    await supabase.from('orders').update({ status: 'paid', last_error: 'Generatie-record aanmaken mislukt.' }).eq('id', order.id)
    return Response.json({ error: 'De generatie kon niet worden klaargezet.' }, { status: 500 })
  }

  try {
    const run = await start(generateLandingWorkflow, [order.id, page.id])
    await supabase.from('generated_pages').update({ workflow_run_id: run.runId }).eq('id', page.id)
    return Response.json({
      order_id: order.id,
      page_id: page.id,
      run_id: run.runId,
      status_token: createOrderToken(order.id),
    }, { status: 202 })
  } catch (error) {
    console.error('Workflow starten mislukt', error)
    await Promise.all([
      supabase.from('generated_pages').update({ status: 'failed', error_message: 'Workflow starten mislukt.' }).eq('id', page.id),
      supabase.from('orders').update({ status: 'failed', last_error: 'Workflow starten mislukt.' }).eq('id', order.id),
    ])
    return Response.json({ error: 'De generatie kon niet worden gestart.' }, { status: 500 })
  }
}
