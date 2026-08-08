import { randomBytes } from 'node:crypto'
import { NextRequest } from 'next/server'
import { getResend } from '@/lib/resend'
import { adminCookie, rejectCrossOriginMutation, verifyAdminSession } from '@/lib/security'
import { getSupabase } from '@/lib/supabase'
import { invalidJsonResponse, readJsonBody } from '@/lib/request'
import { partnerDecisionSchema, validationMessage } from '@/lib/validation'

function newReferralCode() {
  return `PARTNER-${randomBytes(4).toString('hex').toUpperCase()}`
}

export async function POST(request: NextRequest) {
  if (!verifyAdminSession(request.cookies.get(adminCookie.name)?.value)) return Response.json({ error: 'Niet ingelogd.' }, { status: 401 })
  const crossOrigin = rejectCrossOriginMutation(request)
  if (crossOrigin) return crossOrigin
  let body: unknown
  try { body = await readJsonBody(request, 4_000) } catch (error) { return invalidJsonResponse(error) }
  const parsed = partnerDecisionSchema.safeParse(body)
  if (!parsed.success) return Response.json({ error: validationMessage(parsed.error) }, { status: 400 })

  const supabase = getSupabase()
  const { data: partner, error } = await supabase.from('partners').select('id, first_name, email, status, referral_code').eq('id', parsed.data.partner_id).maybeSingle()
  if (error) return Response.json({ error: 'Partner controleren lukt nu niet.' }, { status: 503 })
  if (!partner || partner.status !== 'pending') return Response.json({ error: 'Deze aanvraag is al verwerkt.' }, { status: 409 })

  if (parsed.data.decision === 'reject') {
    const { error: updateError } = await supabase.from('partners').update({ status: 'rejected', updated_at: new Date().toISOString() }).eq('id', partner.id).eq('status', 'pending')
    if (updateError) return Response.json({ error: 'Aanvraag afwijzen lukt nu niet.' }, { status: 503 })
    return Response.json({ ok: true, status: 'rejected' })
  }

  let referralCode = partner.referral_code
  for (let attempt = 0; !referralCode && attempt < 4; attempt += 1) {
    const candidate = newReferralCode()
    const { data, error: updateError } = await supabase.from('partners').update({
      status: 'approved', referral_code: candidate, approved_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    }).eq('id', partner.id).eq('status', 'pending').select('referral_code').maybeSingle()
    if (!updateError && data) referralCode = data.referral_code
    else if (updateError?.code !== '23505') return Response.json({ error: 'Partner goedkeuren lukt nu niet.' }, { status: 503 })
  }
  if (!referralCode) return Response.json({ error: 'Unieke partnercode maken lukt nu niet.' }, { status: 503 })

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? 'https://www.landingsite.nl'
  try {
    await getResend().emails.send({
      from: process.env.RESEND_FROM ?? 'Landingsite.nl <noreply@landingsite.nl>',
      to: partner.email,
      subject: 'Je partneraanvraag is goedgekeurd',
      html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#10231b;max-width:620px;margin:auto;padding:32px"><h1 style="font-size:25px">Welkom als partner</h1><p>Hallo ${partner.first_name},</p><p>Je partnercode is <strong>${referralCode}</strong>.</p><p>Persoonlijke link: <a href="${baseUrl}/?ref=${referralCode}">${baseUrl}/?ref=${referralCode}</a></p><p>Een klik of registratie levert nog geen commissie op. Alleen actieve, betaalde Websitebeheer-facturen tellen mee en blijven onder handmatige controle.</p></div>`,
    }, { idempotencyKey: `partner-approved-${partner.id}` })
  } catch (emailError) {
    console.error('Partnergoedkeuring mailen mislukt', { partnerId: partner.id, emailError })
  }
  return Response.json({ ok: true, status: 'approved', referral_code: referralCode })
}
