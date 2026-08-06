import { randomUUID } from 'node:crypto'
import { NextRequest } from 'next/server'
import { escapeHtml } from '@/lib/html'
import { clientIp, checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { invalidJsonResponse, readJsonBody } from '@/lib/request'
import { getResend } from '@/lib/resend'
import { contactRecipient } from '@/lib/server-email'
import { rejectCrossOriginMutation } from '@/lib/security'
import { contactSchema, validationMessage } from '@/lib/validation'

export async function POST(request: NextRequest) {
  const crossOrigin = rejectCrossOriginMutation(request)
  if (crossOrigin) return crossOrigin
  const limit = checkRateLimit(`contact:${clientIp(request)}`, 5, 15 * 60_000)
  if (!limit.allowed) return rateLimitResponse(limit.retryAfter)
  let body: unknown
  try { body = await readJsonBody(request, 8_000) } catch (error) { return invalidJsonResponse(error) }
  const parsed = contactSchema.safeParse(body)
  if (!parsed.success) return Response.json({ error: validationMessage(parsed.error) }, { status: 400 })
  if (parsed.data.website) return Response.json({ ok: true })

  try {
    const materialLabels = {
      ja: 'Alles is beschikbaar',
      deels: 'Gedeeltelijk beschikbaar',
      nee: 'Nog niet beschikbaar',
      onbekend: 'Advies gewenst',
    } as const
    const preferenceLabels = {
      '': 'Nog niet gekozen',
      starter: 'Starter',
      pro: 'Pro',
      premium: 'Premium',
      advies: 'Eerst advies',
    } as const
    await getResend().emails.send({
      from: process.env.RESEND_FROM ?? 'Landingsite.nl <noreply@landingsite.nl>',
      to: contactRecipient(),
      replyTo: parsed.data.email,
      subject: `Nieuwe aanvraag van ${parsed.data.naam}`,
      html: `<div style="font-family:Arial,sans-serif;line-height:1.6;color:#0b2019;max-width:620px;margin:auto;padding:32px"><p style="color:#16845c;font-weight:800">Nieuwe website-aanvraag</p><h1 style="font-size:26px">${escapeHtml(parsed.data.naam)}</h1><p><strong>E-mail:</strong> ${escapeHtml(parsed.data.email)}${parsed.data.telefoon ? `<br><strong>Telefoon:</strong> ${escapeHtml(parsed.data.telefoon)}` : ''}${parsed.data.bedrijf ? `<br><strong>Bedrijf:</strong> ${escapeHtml(parsed.data.bedrijf)}` : ''}<br><strong>Materiaal:</strong> ${escapeHtml(materialLabels[parsed.data.materiaal])}<br><strong>Pakketvoorkeur:</strong> ${escapeHtml(preferenceLabels[parsed.data.voorkeur])}${parsed.data.startdatum ? `<br><strong>Gewenste startdatum:</strong> ${escapeHtml(parsed.data.startdatum)}` : ''}</p><h2 style="font-size:18px">Wat wil de klant laten bouwen?</h2><p style="white-space:pre-wrap">${escapeHtml(parsed.data.bericht)}</p></div>`,
    }, { idempotencyKey: `contact-${randomUUID()}` })
    return Response.json({ ok: true })
  } catch (error) {
    console.error('Contactbericht verzenden mislukt', error)
    return Response.json({ error: 'Verzenden mislukt. Probeer het over enkele minuten opnieuw.' }, { status: 500 })
  }
}
