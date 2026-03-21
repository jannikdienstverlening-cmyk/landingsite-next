import { NextRequest } from 'next/server'
import { supabase } from '@/lib/supabase'
import { genereerLandingspagina, IntakeData } from '@/lib/claude'
import { deployNailSite } from '@/lib/netlify'
import { stuurBevEstigingEmail } from '@/lib/email'
import type { Pakket } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { order_id } = body

  // Haal order op
  const { data: order, error: orderErr } = await supabase
    .from('orders')
    .select('*')
    .eq('id', order_id)
    .single()

  if (orderErr || !order) {
    return Response.json({ error: 'Order niet gevonden' }, { status: 404 })
  }
  if (order.status !== 'paid') {
    return Response.json({ error: 'Order nog niet betaald' }, { status: 400 })
  }

  // Haal intake op
  const { data: intake, error: intakeErr } = await supabase
    .from('intake_forms')
    .select('*')
    .eq('order_id', order_id)
    .single()

  if (intakeErr || !intake) {
    return Response.json({ error: 'Intake niet gevonden' }, { status: 404 })
  }

  // Maak generated_page record aan
  const { data: page } = await supabase
    .from('generated_pages')
    .insert({ order_id, status: 'generating' })
    .select()
    .single()

  // Update order status
  await supabase.from('orders').update({ status: 'generating' }).eq('id', order_id)

  try {
    // Genereer HTML met Claude
    const intakeData: IntakeData = {
      pakket: order.pakket as Pakket,
      bedrijfsnaam: intake.bedrijfsnaam,
      niche: intake.niche,
      beschrijving: intake.beschrijving,
      usp_1: intake.usp_1,
      usp_2: intake.usp_2,
      usp_3: intake.usp_3,
      extra_fields: intake.extra_fields ?? {},
    }

    const html = await genereerLandingspagina(intakeData)

    // Deploy naar Netlify
    const { siteId, siteUrl } = await deployNailSite(intake.bedrijfsnaam, html)

    // Sla op in Supabase
    await supabase
      .from('generated_pages')
      .update({
        netlify_site_id: siteId,
        netlify_url: siteUrl,
        html_content: html,
        status: 'completed',
      })
      .eq('id', page.id)

    await supabase.from('orders').update({ status: 'completed' }).eq('id', order_id)

    // Stuur e-mail naar klant
    await stuurBevEstigingEmail({
      email: order.email,
      bedrijfsnaam: intake.bedrijfsnaam,
      pakket: order.pakket,
      netlifyUrl: siteUrl,
    })

    return Response.json({ success: true, netlify_url: siteUrl, page_id: page.id })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Onbekende fout'
    await supabase
      .from('generated_pages')
      .update({ status: 'failed' })
      .eq('id', page.id)
    await supabase.from('orders').update({ status: 'failed' }).eq('id', order_id)
    return Response.json({ error: msg }, { status: 500 })
  }
}
