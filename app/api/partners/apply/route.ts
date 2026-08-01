import { NextRequest } from 'next/server'
import { escapeHtml } from '@/lib/html'
import { clientIp, checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { invalidJsonResponse, readJsonBody } from '@/lib/request'
import { getResend } from '@/lib/resend'
import { referralAttributionId, referralCookie, rejectCrossOriginMutation } from '@/lib/security'
import { getSupabase } from '@/lib/supabase'
import { partnerApplicationSchema, validationMessage } from '@/lib/validation'

export async function POST(request: NextRequest) {
  const crossOrigin = rejectCrossOriginMutation(request)
  if (crossOrigin) return crossOrigin
  const limit = checkRateLimit(`partner-apply:${clientIp(request)}`, 5, 60 * 60_000)
  if (!limit.allowed) return rateLimitResponse(limit.retryAfter)

  let body: unknown
  try { body = await readJsonBody(request, 8_000) } catch (error) { return invalidJsonResponse(error) }
  const parsed = partnerApplicationSchema.safeParse(body)
  if (!parsed.success) return Response.json({ error: validationMessage(parsed.error) }, { status: 400 })
  const input = parsed.data

  const supabase = getSupabase()
  const attributionId = referralAttributionId(request.cookies.get(referralCookie.name)?.value)
  let parentPartnerId: string | null = null
  if (attributionId) {
    const { data } = await supabase.from('referral_attributions').select('partner_id, expires_at').eq('id', attributionId).eq('status', 'visited').maybeSingle()
    if (data && new Date(data.expires_at).getTime() > Date.now()) parentPartnerId = data.partner_id
  }

  const normalizedEmail = input.email.toLowerCase()
  const { data: existing, error: existingError } = await supabase.from('partners').select('id, status').eq('email', normalizedEmail).maybeSingle()
  if (existingError) return Response.json({ error: 'Aanvraag controleren lukt nu niet.' }, { status: 503 })
  if (existing) return Response.json({ ok: true, status: existing.status })

  const { data: partner, error } = await supabase.from('partners').insert({
    first_name: input.voornaam,
    last_name: input.achternaam,
    email: normalizedEmail,
    phone: input.telefoon,
    partner_type: input.type,
    company_name: input.type === 'ondernemer' ? input.bedrijfsnaam : '',
    kvk_number: input.type === 'ondernemer' ? input.kvkNummer.replace(/\s/g, '') : '',
    vat_number: input.btwNummer,
    parent_partner_id: parentPartnerId,
    status: 'pending',
    terms_version: '2026-08-01',
    terms_accepted_at: new Date().toISOString(),
    privacy_accepted_at: new Date().toISOString(),
  }).select('id').single()
  if (error || !partner) return Response.json({ error: 'Aanvraag opslaan lukt nu niet.' }, { status: 503 })

  const fullName = `${input.voornaam} ${input.achternaam}`
  const resend = getResend()
  try {
    await Promise.all([
    resend.emails.send({
      from: process.env.RESEND_FROM ?? 'Landingsite.nl <noreply@landingsite.nl>',
      to: normalizedEmail,
      subject: 'Je partneraanvraag is ontvangen',
      html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#10231b;max-width:620px;margin:auto;padding:32px"><h1 style="font-size:25px">Aanvraag ontvangen</h1><p>Hallo ${escapeHtml(input.voornaam)},</p><p>Je aanvraag staat op <strong>pending</strong> en wordt handmatig gecontroleerd. Er is nog geen partnercode of uitbetalingsmogelijkheid actief. Na goedkeuring ontvang je apart bericht.</p><p>Landingsite.nl</p></div>`,
    }, { idempotencyKey: `partner-confirm-${input.requestId}` }),
    resend.emails.send({
      from: process.env.RESEND_FROM ?? 'Landingsite.nl <noreply@landingsite.nl>',
      to: process.env.ADMIN_EMAIL ?? 'jannikklumpenaar@gmail.com',
      replyTo: normalizedEmail,
      subject: `Nieuwe partneraanvraag: ${fullName}`,
      html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#10231b;max-width:620px;margin:auto;padding:32px"><h1 style="font-size:25px">Nieuwe partneraanvraag</h1><p><strong>Naam:</strong> ${escapeHtml(fullName)}<br><strong>E-mail:</strong> ${escapeHtml(normalizedEmail)}<br><strong>Type:</strong> ${escapeHtml(input.type)}<br><strong>Bedrijf:</strong> ${escapeHtml(input.bedrijfsnaam || 'Niet van toepassing')}<br><strong>KvK:</strong> ${escapeHtml(input.kvkNummer || 'Niet van toepassing')}</p><p>Controleer en keur de aanvraag handmatig goed in het beheer.</p></div>`,
    }, { idempotencyKey: `partner-admin-${input.requestId}` }),
    ])
  } catch (emailError) {
    console.error('Partneraanvraag is opgeslagen maar e-mailen mislukt', { partnerId: partner.id, emailError })
  }

  return Response.json({ ok: true, status: 'pending' }, { status: 201 })
}
