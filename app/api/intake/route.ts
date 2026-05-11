import { NextRequest } from 'next/server'
import { getSupabase } from '@/lib/supabase'
import type { Pakket } from '@/lib/supabase'

type IntakeFormPayload = {
  bedrijfsnaam: string
  niche: string
  beschrijving: string
  usp_1: string
  usp_2: string
  usp_3: string
  contacttelefoon: string
  contactemail: string
  doelgroep: string
  werkgebied: string
  social_facebook: string
  social_instagram: string
  social_linkedin: string
  testimonial_1_naam: string
  testimonial_1_tekst: string
  testimonial_2_naam: string
  testimonial_2_tekst: string
  faq_1_vraag: string
  faq_1_antwoord: string
  faq_2_vraag: string
  faq_2_antwoord: string
  faq_3_vraag: string
  faq_3_antwoord: string
  extra_wensen: string
  sfeer: string
}

export async function POST(req: NextRequest) {
  const body = await req.json() as {
    session_id?: string
    form?: IntakeFormPayload
  }

  if (!body.session_id || !body.form) {
    return Response.json({ error: 'Intakegegevens ontbreken.' }, { status: 400 })
  }

  const supabase = getSupabase()
  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .select('id, pakket, status')
    .eq('stripe_session_id', body.session_id)
    .single()

  if (orderErr || !order) {
    return Response.json({ error: 'Order niet gevonden.' }, { status: 404 })
  }

  if (order.status === 'pending') {
    return Response.json({ error: 'Betaling is nog niet bevestigd.' }, { status: 409 })
  }

  if (order.status !== 'paid') {
    return Response.json({ error: 'Deze order is al verwerkt.' }, { status: 409 })
  }

  const form = body.form
  if (!form.bedrijfsnaam || !form.niche || !form.beschrijving || !form.usp_1 || !form.contactemail) {
    return Response.json({ error: 'Vul alle verplichte velden in.' }, { status: 400 })
  }

  const pakket = order.pakket as Pakket
  const extraFields: Record<string, unknown> = {
    contacttelefoon: form.contacttelefoon,
    contactemail: form.contactemail,
  }

  if (pakket === 'pro' || pakket === 'premium') {
    extraFields.doelgroep = form.doelgroep
    extraFields.werkgebied = form.werkgebied
    extraFields.social_facebook = form.social_facebook
    extraFields.social_instagram = form.social_instagram
    extraFields.social_linkedin = form.social_linkedin
    extraFields.testimonials = [
      form.testimonial_1_naam ? { naam: form.testimonial_1_naam, tekst: form.testimonial_1_tekst } : null,
      form.testimonial_2_naam ? { naam: form.testimonial_2_naam, tekst: form.testimonial_2_tekst } : null,
    ].filter(Boolean)
    extraFields.faq = [
      form.faq_1_vraag ? { vraag: form.faq_1_vraag, antwoord: form.faq_1_antwoord } : null,
      form.faq_2_vraag ? { vraag: form.faq_2_vraag, antwoord: form.faq_2_antwoord } : null,
      form.faq_3_vraag ? { vraag: form.faq_3_vraag, antwoord: form.faq_3_antwoord } : null,
    ].filter(Boolean)
  }

  if (pakket === 'premium') {
    extraFields.extra_wensen = form.extra_wensen
    extraFields.sfeer = form.sfeer
  }

  const { error: intakeErr } = await supabase.from('intake_forms').insert({
    order_id: order.id,
    bedrijfsnaam: form.bedrijfsnaam,
    niche: form.niche,
    beschrijving: form.beschrijving,
    usp_1: form.usp_1,
    usp_2: form.usp_2,
    usp_3: form.usp_3,
    extra_fields: extraFields,
  })

  if (intakeErr) {
    return Response.json({ error: 'Opslaan mislukt: ' + intakeErr.message }, { status: 500 })
  }

  return Response.json({ order_id: order.id })
}
