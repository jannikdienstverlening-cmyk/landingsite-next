import { NextRequest } from 'next/server'
import { z } from 'zod'
import { consentConfig } from '@/config/consent'
import { hashMarketingToken } from '@/lib/marketing-consent'
import { clientIp, checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { invalidJsonResponse, readJsonBody } from '@/lib/request'
import { rejectCrossOriginMutation } from '@/lib/security'
import { getSupabase } from '@/lib/supabase'

const schema = z.object({ token: z.string().min(32).max(256) })

export async function POST(request: NextRequest) {
  const crossOrigin = rejectCrossOriginMutation(request)
  if (crossOrigin) return crossOrigin
  const limit = checkRateLimit(`marketing-confirm:${clientIp(request)}`, 10, 60 * 60_000)
  if (!limit.allowed) return rateLimitResponse(limit.retryAfter)

  let body: unknown
  try { body = await readJsonBody(request, 1_000) } catch (error) { return invalidJsonResponse(error) }
  const parsed = schema.safeParse(body)
  if (!parsed.success) return Response.json({ error: 'Bevestigingslink is ongeldig.' }, { status: 400 })

  const supabase = getSupabase()
  const { data: consentRequest, error } = await supabase.from('marketing_consent_requests')
    .select('id, normalized_email, source, consent_version, consent_text, status, expires_at')
    .eq('token_hash', hashMarketingToken(parsed.data.token))
    .maybeSingle()
  if (error) return Response.json({ error: 'Bevestiging controleren lukt nu niet.' }, { status: 503 })
  if (!consentRequest || consentRequest.status !== 'pending' || new Date(consentRequest.expires_at).getTime() <= Date.now()) {
    return Response.json({ error: 'Bevestigingslink is ongeldig of verlopen.' }, { status: 410 })
  }
  if (consentRequest.consent_version !== consentConfig.marketing.version) {
    return Response.json({ error: 'De toestemmingsversie is gewijzigd. Meld je opnieuw aan.' }, { status: 409 })
  }

  const confirmedAt = new Date().toISOString()
  const { data: subscriber, error: subscriberError } = await supabase.from('marketing_subscribers').upsert({
    normalized_email: consentRequest.normalized_email,
    status: 'active',
    consent_source: consentRequest.source,
    consent_text: consentRequest.consent_text,
    consent_version: consentRequest.consent_version,
    granted_at: confirmedAt,
    revoked_at: null,
    updated_at: confirmedAt,
  }, { onConflict: 'normalized_email' }).select('id').single()
  if (subscriberError || !subscriber) return Response.json({ error: 'Voorkeur opslaan lukt nu niet.' }, { status: 503 })

  const results = await Promise.all([
    supabase.from('marketing_consent_requests').update({ status: 'confirmed', confirmed_at: confirmedAt }).eq('id', consentRequest.id).eq('status', 'pending'),
    supabase.from('marketing_suppressions').delete().eq('normalized_email', consentRequest.normalized_email),
    supabase.from('marketing_consent_audit').insert({
      subscriber_id: subscriber.id,
      normalized_email: consentRequest.normalized_email,
      action: 'confirmed',
      source: consentRequest.source,
      consent_version: consentRequest.consent_version,
      evidence: { request_id: consentRequest.id },
    }),
  ])
  if (results.some((result) => result.error)) return Response.json({ error: 'Bevestiging afronden lukt nu niet.' }, { status: 503 })

  return Response.json({ ok: true })
}
