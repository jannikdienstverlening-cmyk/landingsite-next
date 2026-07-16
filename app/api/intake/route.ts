import { NextRequest } from 'next/server'
import { clientIp, checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { getSupabase, type Pakket } from '@/lib/supabase'
import { intakeSchema, validationMessage } from '@/lib/validation'

export async function POST(request: NextRequest) {
  const limit = checkRateLimit(`intake:${clientIp(request)}`, 12, 30 * 60_000)
  if (!limit.allowed) return rateLimitResponse(limit.retryAfter)
  let body: unknown
  try { body = await request.json() } catch { body = null }
  const parsed = intakeSchema.safeParse(body)
  if (!parsed.success) return Response.json({ error: validationMessage(parsed.error) }, { status: 400 })

  const supabase = getSupabase()
  const { data: order } = await supabase.from('orders').select('id, pakket, status')
    .eq('stripe_session_id', parsed.data.session_id).maybeSingle()
  if (!order) return Response.json({ error: 'Order niet gevonden.' }, { status: 404 })
  if (order.status === 'pending') return Response.json({ error: 'Betaling is nog niet bevestigd. Ververs over enkele seconden.' }, { status: 409 })
  if (order.status !== 'paid') return Response.json({ error: 'Deze intake is al verwerkt.' }, { status: 409 })

  const form = parsed.data.form
  const pakket = order.pakket as Pakket
  const extraFields: Record<string, unknown> = {
    contacttelefoon: form.contacttelefoon,
    contactemail: form.contactemail,
    logo_url: form.logo_url,
    hero_image_url: form.hero_image_url,
  }
  if (pakket === 'pro' || pakket === 'premium') {
    Object.assign(extraFields, {
      doelgroep: form.doelgroep,
      werkgebied: form.werkgebied,
      social_facebook: form.social_facebook,
      social_instagram: form.social_instagram,
      social_linkedin: form.social_linkedin,
      testimonials: [
        form.testimonial_1_naam && form.testimonial_1_tekst ? { naam: form.testimonial_1_naam, tekst: form.testimonial_1_tekst } : null,
        form.testimonial_2_naam && form.testimonial_2_tekst ? { naam: form.testimonial_2_naam, tekst: form.testimonial_2_tekst } : null,
      ].filter(Boolean),
      faq: [
        form.faq_1_vraag && form.faq_1_antwoord ? { vraag: form.faq_1_vraag, antwoord: form.faq_1_antwoord } : null,
        form.faq_2_vraag && form.faq_2_antwoord ? { vraag: form.faq_2_vraag, antwoord: form.faq_2_antwoord } : null,
        form.faq_3_vraag && form.faq_3_antwoord ? { vraag: form.faq_3_vraag, antwoord: form.faq_3_antwoord } : null,
      ].filter(Boolean),
    })
  }
  if (pakket === 'premium') Object.assign(extraFields, { extra_wensen: form.extra_wensen, sfeer: form.sfeer })

  const { error } = await supabase.from('intake_forms').upsert({
    order_id: order.id,
    bedrijfsnaam: form.bedrijfsnaam,
    niche: form.niche,
    beschrijving: form.beschrijving,
    usp_1: form.usp_1,
    usp_2: form.usp_2,
    usp_3: form.usp_3,
    extra_fields: extraFields,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'order_id' })
  if (error) {
    console.error('Intake opslaan mislukt', error)
    return Response.json({ error: 'De intake kon niet worden opgeslagen.' }, { status: 500 })
  }
  return Response.json({ order_id: order.id })
}
