import { NextRequest } from 'next/server'
import { z } from 'zod'
import { consentConfig } from '@/config/consent'
import { escapeHtml } from '@/lib/html'
import {
  assertMarketingEnabled,
  createMarketingConfirmationToken,
  hashMarketingToken,
  marketingConfirmationExpiresAt,
  normalizeMarketingEmail,
} from '@/lib/marketing-consent'
import { clientIp, checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { invalidJsonResponse, readJsonBody } from '@/lib/request'
import { getResend } from '@/lib/resend'
import { hashIp, rejectCrossOriginMutation } from '@/lib/security'
import { getSupabase } from '@/lib/supabase'

const schema = z.object({
  email: z.string().trim().email().max(254),
  consent: z.literal(true),
  source: z.enum(['newsletter', 'download', 'customer-preferences']).default('newsletter'),
  website: z.string().max(0).optional().default(''),
})

export async function POST(request: NextRequest) {
  const crossOrigin = rejectCrossOriginMutation(request)
  if (crossOrigin) return crossOrigin
  try { assertMarketingEnabled() } catch { return Response.json({ error: 'Aanmelden voor e-mailupdates is nu niet beschikbaar.' }, { status: 404 }) }

  const limit = checkRateLimit(`marketing-consent:${clientIp(request)}`, 4, 60 * 60_000)
  if (!limit.allowed) return rateLimitResponse(limit.retryAfter)

  let body: unknown
  try { body = await readJsonBody(request, 4_000) } catch (error) { return invalidJsonResponse(error) }
  const parsed = schema.safeParse(body)
  if (!parsed.success) return Response.json({ error: 'Vul een geldig e-mailadres in en geef afzonderlijk toestemming.' }, { status: 400 })
  if (parsed.data.website) return Response.json({ ok: true })

  const email = normalizeMarketingEmail(parsed.data.email)
  const token = createMarketingConfirmationToken()
  const tokenHash = hashMarketingToken(token)
  const expiresAt = marketingConfirmationExpiresAt()
  const requestedAt = new Date().toISOString()
  const supabase = getSupabase()
  const { data: requestRecord, error } = await supabase.from('marketing_consent_requests').insert({
    normalized_email: email,
    source: parsed.data.source,
    consent_text: consentConfig.marketing.consentText,
    consent_version: consentConfig.marketing.version,
    token_hash: tokenHash,
    status: 'pending',
    requested_at: requestedAt,
    expires_at: expiresAt.toISOString(),
    ip_hash: hashIp(clientIp(request)),
  }).select('id').single()
  if (error || !requestRecord) return Response.json({ error: 'Aanmelding opslaan lukt nu niet.' }, { status: 503 })

  const { error: auditError } = await supabase.from('marketing_consent_audit').insert({
    normalized_email: email,
    action: 'requested',
    source: parsed.data.source,
    consent_version: consentConfig.marketing.version,
    evidence: { request_id: requestRecord.id, consent_text: consentConfig.marketing.consentText },
  })
  if (auditError) {
    await supabase.from('marketing_consent_requests').delete().eq('id', requestRecord.id)
    return Response.json({ error: 'Toestemmingsbewijs opslaan lukt nu niet.' }, { status: 503 })
  }

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, '')
  if (!baseUrl) return Response.json({ error: 'Bevestigingslink maken lukt nu niet.' }, { status: 503 })
  const confirmUrl = `${baseUrl}/marketing/bevestigen?token=${encodeURIComponent(token)}`
  const result = await getResend().emails.send({
    from: process.env.RESEND_FROM ?? 'Landingsite.nl <noreply@landingsite.nl>',
    to: email,
    subject: 'Bevestig je e-mailvoorkeur',
    html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#0b1220;max-width:620px;margin:auto;padding:32px"><h1 style="font-size:25px">Bevestig je keuze</h1><p>Je koos voor: ${escapeHtml(consentConfig.marketing.consentText)}</p><p><a href="${escapeHtml(confirmUrl)}" style="display:inline-block;background:#1d4ed8;color:#fff;padding:13px 18px;text-decoration:none">Bevestig mijn e-mailadres</a></p><p>De link verloopt na ${consentConfig.marketing.confirmationTtlHours} uur. Zonder bevestiging sturen we geen marketingberichten.</p></div>`,
  }, { idempotencyKey: `marketing-consent-${requestRecord.id}` })
  if (result.error) return Response.json({ error: 'Bevestigingsmail versturen lukt nu niet.' }, { status: 503 })

  return Response.json({ ok: true })
}
