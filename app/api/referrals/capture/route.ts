import { NextRequest, NextResponse } from 'next/server'
import { partnerProgramConfig } from '@/config/partner-program'
import { clientIp, checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { invalidJsonResponse, readJsonBody } from '@/lib/request'
import { createReferralToken, hashIp, referralAttributionId, referralCookie, rejectCrossOriginMutation } from '@/lib/security'
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

  const persistent = parsed.data.persistence === 'persistent'
  if (persistent && parsed.data.consentVersion !== 'referral-30d-v1') {
    return Response.json({ error: 'Ongeldige toestemmingsversie.' }, { status: 400 })
  }

  const existingId = referralAttributionId(request.cookies.get(referralCookie.name)?.value)
  if (existingId) {
    const { data: existing } = await supabase.from('referral_attributions')
      .select('id, partner_id, status, expires_at')
      .eq('id', existingId)
      .eq('partner_id', partner.id)
      .eq('status', 'visited')
      .maybeSingle()
    if (existing && new Date(existing.expires_at).getTime() > Date.now()) {
      const response = NextResponse.json({ accepted: true, persistence: persistent ? 'persistent' : 'session' })
      const maxAge = partnerProgramConfig.attributionWindowDays * 86_400
      response.cookies.set(referralCookie.name, createReferralToken(existing.id, maxAge), {
        ...referralCookie.options,
        ...(persistent ? { maxAge } : {}),
      })
      if (persistent) {
        const { error: consentError } = await supabase.from('subscription_audit_log').insert({
          action: 'referral_tracking_consent_granted',
          details: {
            attribution_id: existing.id,
            consent_version: parsed.data.consentVersion,
            attribution_window_days: partnerProgramConfig.attributionWindowDays,
          },
        })
        if (consentError) return Response.json({ error: 'Toestemming vastleggen lukt nu niet.' }, { status: 503 })
      }
      return response
    }
  }

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
  const response = NextResponse.json({ accepted: true, persistence: persistent ? 'persistent' : 'session' })
  response.cookies.set(referralCookie.name, createReferralToken(attribution.id, maxAge), {
    ...referralCookie.options,
    ...(persistent ? { maxAge } : {}),
  })
  if (persistent) {
    const { error: consentError } = await supabase.from('subscription_audit_log').insert({
      action: 'referral_tracking_consent_granted',
      details: {
        attribution_id: attribution.id,
        consent_version: parsed.data.consentVersion,
        attribution_window_days: partnerProgramConfig.attributionWindowDays,
      },
    })
    if (consentError) {
      await supabase.from('referral_attributions').delete().eq('id', attribution.id)
      return Response.json({ error: 'Toestemming vastleggen lukt nu niet.' }, { status: 503 })
    }
  }
  return response
}
