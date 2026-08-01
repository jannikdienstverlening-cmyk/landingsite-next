import { NextRequest, NextResponse } from 'next/server'
import { partnerProgramConfig } from '@/config/partner-program'
import { clientIp, checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { invalidJsonResponse, readJsonBody } from '@/lib/request'
import { createReferralToken, hashIp, referralCookie, rejectCrossOriginMutation } from '@/lib/security'
import { getSupabase } from '@/lib/supabase'
import { referralCaptureSchema, validationMessage } from '@/lib/validation'

export async function POST(request: NextRequest) {
  const crossOrigin = rejectCrossOriginMutation(request)
  if (crossOrigin) return crossOrigin
  const limit = checkRateLimit(`referral:${clientIp(request)}`, 12, 60 * 60_000)
  if (!limit.allowed) return rateLimitResponse(limit.retryAfter)

  let body: unknown
  try { body = await readJsonBody(request, 4_000) } catch (error) { return invalidJsonResponse(error) }
  const parsed = referralCaptureSchema.safeParse(body)
  if (!parsed.success) return Response.json({ error: validationMessage(parsed.error) }, { status: 400 })

  const supabase = getSupabase()
  const { data: partner, error: partnerError } = await supabase.from('partners')
    .select('id, referral_code')
    .eq('referral_code', parsed.data.code)
    .eq('status', 'approved')
    .maybeSingle()
  if (partnerError) return Response.json({ error: 'Partnercode controleren lukt nu niet.' }, { status: 503 })
  if (!partner) return Response.json({ accepted: false }, { status: 200 })

  const expiresAt = new Date(Date.now() + partnerProgramConfig.attributionWindowDays * 86_400_000)
  const { data: attribution, error } = await supabase.from('referral_attributions').insert({
    partner_id: partner.id,
    referral_code: partner.referral_code,
    first_visited_at: new Date().toISOString(),
    expires_at: expiresAt.toISOString(),
    landing_page: parsed.data.landingPath,
    utm_source: parsed.data.utmSource,
    utm_medium: parsed.data.utmMedium,
    utm_campaign: parsed.data.utmCampaign,
    ip_hash: hashIp(clientIp(request)),
    status: 'visited',
  }).select('id').single()
  if (error || !attribution) return Response.json({ error: 'Partnerverwijzing opslaan lukt nu niet.' }, { status: 503 })

  const maxAge = partnerProgramConfig.attributionWindowDays * 86_400
  const response = NextResponse.json({ accepted: true })
  response.cookies.set(referralCookie.name, createReferralToken(attribution.id, maxAge), { ...referralCookie.options, maxAge })
  return response
}
