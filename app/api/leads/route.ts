import { NextRequest } from 'next/server'
import { escapeHtml } from '@/lib/html'
import { clientIp, checkRateLimit } from '@/lib/rate-limit'
import { getResend } from '@/lib/resend'
import { hashIp } from '@/lib/security'
import { getSupabase } from '@/lib/supabase'
import { leadSchema, validationMessage } from '@/lib/validation'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
}

export function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders })
}

export async function POST(request: NextRequest) {
  const limit = checkRateLimit(`lead:${clientIp(request)}`, 8, 10 * 60_000)
  if (!limit.allowed) return Response.json(
    { error: 'Te veel verzoeken. Probeer het later opnieuw.' },
    { status: 429, headers: { ...corsHeaders, 'Retry-After': String(limit.retryAfter) } },
  )

  let raw: unknown
  try {
    raw = await request.json()
  } catch {
    return Response.json({ error: 'Ongeldig verzoek.' }, { status: 400, headers: corsHeaders })
  }

  const result = leadSchema.safeParse(raw)
  if (!result.success) {
    return Response.json({ error: validationMessage(result.error) }, { status: 400, headers: corsHeaders })
  }
  if (result.data.website) return Response.json({ ok: true }, { headers: corsHeaders })

  const supabase = getSupabase()
  const { data: page } = await supabase
    .from('generated_pages')
    .select('id, order_id, netlify_url')
    .eq('lead_token', result.data.token)
    .eq('status', 'completed')
    .maybeSingle()

  if (!page) return Response.json({ error: 'Dit formulier is niet meer geldig.' }, { status: 404, headers: corsHeaders })

  const [{ data: intake }, { data: order }] = await Promise.all([
    supabase.from('intake_forms').select('bedrijfsnaam, extra_fields').eq('order_id', page.order_id).maybeSingle(),
    supabase.from('orders').select('email').eq('id', page.order_id).maybeSingle(),
  ])
  if (!intake || !order) return Response.json({ error: 'Ontvanger niet gevonden.' }, { status: 404, headers: corsHeaders })

  const { data: lead, error } = await supabase.from('leads').insert({
    generated_page_id: page.id,
    name: result.data.naam,
    email: result.data.email,
    phone: result.data.telefoon,
    message: result.data.bericht,
    ip_hash: hashIp(clientIp(request)),
  }).select('id').single()

  if (error || !lead) {
    console.error('Lead opslaan mislukt', error)
    return Response.json({ error: 'Verzenden is niet gelukt. Probeer het opnieuw.' }, { status: 500, headers: corsHeaders })
  }

  const extra = intake.extra_fields as { contactemail?: string } | null
  const recipient = extra?.contactemail || order.email
  try {
    await getResend().emails.send({
      from: process.env.RESEND_FROM ?? 'Landingsite.nl <noreply@landingsite.nl>',
      to: recipient,
      replyTo: result.data.email,
      subject: `Nieuwe aanvraag via ${intake.bedrijfsnaam}`,
      html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#10201c;max-width:640px;margin:auto;padding:32px">
        <p style="color:#147a55;font-weight:700">Nieuwe aanvraag</p>
        <h1 style="font-size:26px">Iemand nam contact op via je landingspagina</h1>
        <p><strong>Naam:</strong> ${escapeHtml(result.data.naam)}<br><strong>E-mail:</strong> <a href="mailto:${escapeHtml(result.data.email)}">${escapeHtml(result.data.email)}</a>${result.data.telefoon ? `<br><strong>Telefoon:</strong> ${escapeHtml(result.data.telefoon)}` : ''}</p>
        ${result.data.bericht ? `<p><strong>Bericht:</strong></p><p style="white-space:pre-wrap">${escapeHtml(result.data.bericht)}</p>` : ''}
        <hr style="border:0;border-top:1px solid #dce7e2;margin:28px 0"><p style="font-size:12px;color:#66756f">Verzonden via ${escapeHtml(page.netlify_url ?? intake.bedrijfsnaam)}</p>
      </div>`,
    }, { idempotencyKey: `lead-${lead.id}` })
  } catch (mailError) {
    console.error('Lead e-mail verzenden mislukt', { leadId: lead.id, error: mailError })
  }

  return Response.json({ ok: true }, { status: 201, headers: corsHeaders })
}
