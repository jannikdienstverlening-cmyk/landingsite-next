import { randomUUID } from 'node:crypto'
import { NextRequest } from 'next/server'
import { escapeHtml } from '@/lib/html'
import { clientIp, checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { getResend } from '@/lib/resend'
import { contactSchema, validationMessage } from '@/lib/validation'

export async function POST(request: NextRequest) {
  const limit = checkRateLimit(`contact:${clientIp(request)}`, 5, 15 * 60_000)
  if (!limit.allowed) return rateLimitResponse(limit.retryAfter)
  let body: unknown
  try { body = await request.json() } catch { body = null }
  const parsed = contactSchema.safeParse(body)
  if (!parsed.success) return Response.json({ error: validationMessage(parsed.error) }, { status: 400 })
  if (parsed.data.website) return Response.json({ ok: true })

  try {
    await getResend().emails.send({
      from: process.env.RESEND_FROM ?? 'Landingsite.nl <noreply@landingsite.nl>',
      to: process.env.CONTACT_EMAIL ?? 'info@landingsite.nl',
      replyTo: parsed.data.email,
      subject: `Nieuwe aanvraag van ${parsed.data.naam}`,
      html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#0b2019;max-width:620px;margin:auto;padding:32px"><p style="color:#16845c;font-weight:800">Nieuwe website-aanvraag</p><h1 style="font-size:26px">${escapeHtml(parsed.data.naam)}</h1><p><strong>E-mail:</strong> ${escapeHtml(parsed.data.email)}${parsed.data.bedrijf ? `<br><strong>Bedrijf:</strong> ${escapeHtml(parsed.data.bedrijf)}` : ''}</p><p style="white-space:pre-wrap">${escapeHtml(parsed.data.bericht)}</p></div>`,
    }, { idempotencyKey: `contact-${randomUUID()}` })
    return Response.json({ ok: true })
  } catch (error) {
    console.error('Contactbericht verzenden mislukt', error)
    return Response.json({ error: 'Verzenden mislukt. Mail eventueel direct naar info@landingsite.nl.' }, { status: 500 })
  }
}
