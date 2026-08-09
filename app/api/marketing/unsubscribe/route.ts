import { NextRequest } from 'next/server'
import { z } from 'zod'
import { clientIp, checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { invalidJsonResponse, readJsonBody } from '@/lib/request'
import { marketingSubscriberId, rejectCrossOriginMutation } from '@/lib/security'
import { getSupabase } from '@/lib/supabase'

const schema = z.object({ token: z.string().min(32).max(2_000) })

export async function POST(request: NextRequest) {
  const crossOrigin = rejectCrossOriginMutation(request)
  if (crossOrigin) return crossOrigin
  const limit = checkRateLimit(`marketing-unsubscribe:${clientIp(request)}`, 12, 60 * 60_000)
  if (!limit.allowed) return rateLimitResponse(limit.retryAfter)

  let body: unknown
  try { body = await readJsonBody(request, 3_000) } catch (error) { return invalidJsonResponse(error) }
  const parsed = schema.safeParse(body)
  if (!parsed.success) return Response.json({ error: 'Afmeldlink is ongeldig.' }, { status: 400 })
  const subscriberId = marketingSubscriberId(parsed.data.token)
  if (!subscriberId) return Response.json({ error: 'Afmeldlink is ongeldig of verlopen.' }, { status: 401 })

  const supabase = getSupabase()
  const { data: subscriber, error } = await supabase.from('marketing_subscribers')
    .select('id, normalized_email, consent_source, consent_version')
    .eq('id', subscriberId)
    .maybeSingle()
  if (error) return Response.json({ error: 'Voorkeur ophalen lukt nu niet.' }, { status: 503 })
  if (!subscriber) return Response.json({ ok: true })

  const revokedAt = new Date().toISOString()
  const results = await Promise.all([
    supabase.from('marketing_subscribers').update({ status: 'unsubscribed', revoked_at: revokedAt, updated_at: revokedAt }).eq('id', subscriber.id),
    supabase.from('marketing_suppressions').upsert({ normalized_email: subscriber.normalized_email, reason: 'unsubscribe', created_at: revokedAt }, { onConflict: 'normalized_email' }),
    supabase.from('marketing_consent_audit').insert({
      subscriber_id: subscriber.id,
      normalized_email: subscriber.normalized_email,
      action: 'revoked',
      source: subscriber.consent_source,
      consent_version: subscriber.consent_version,
      evidence: { method: 'self-service-link' },
    }),
  ])
  if (results.some((result) => result.error)) return Response.json({ error: 'Afmelden lukt nu niet.' }, { status: 503 })
  return Response.json({ ok: true })
}
