import { getStepMetadata } from 'workflow'
import { generateLandingContent, type IntakeData } from '@/lib/claude'
import { sendDeliveryEmail } from '@/lib/email'
import { renderLandingPage } from '@/lib/landing-renderer'
import { deployToNetlifySite, ensureNetlifySite } from '@/lib/netlify'
import { getSupabase, type Pakket } from '@/lib/supabase'

type GenerationInput = {
  orderId: string
  pageId: string
  order: { email: string; pakket: Pakket }
  intake: IntakeData
  existingSiteId: string | null
  existingUrl: string | null
  leadToken: string
}

async function loadInput(orderId: string, pageId: string): Promise<GenerationInput> {
  'use step'
  console.info('generation.load.start', { orderId, pageId })
  const supabase = getSupabase()
  const [{ data: order }, { data: intake }, { data: page }] = await Promise.all([
    supabase.from('orders').select('email, pakket').eq('id', orderId).single(),
    supabase.from('intake_forms').select('*').eq('order_id', orderId).single(),
    supabase.from('generated_pages').select('netlify_site_id, netlify_url, lead_token').eq('id', pageId).single(),
  ])
  if (!order || !intake || !page?.lead_token) throw new Error('Order, intake of paginatoken ontbreekt.')

  const result: GenerationInput = {
    orderId,
    pageId,
    order: { email: order.email, pakket: order.pakket as Pakket },
    intake: {
      pakket: order.pakket as Pakket,
      bedrijfsnaam: intake.bedrijfsnaam,
      niche: intake.niche,
      beschrijving: intake.beschrijving,
      usp_1: intake.usp_1,
      usp_2: intake.usp_2,
      usp_3: intake.usp_3,
      extra_fields: intake.extra_fields ?? {},
    },
    existingSiteId: page.netlify_site_id,
    existingUrl: page.netlify_url,
    leadToken: page.lead_token,
  }
  console.info('generation.load.done', { orderId, pageId })
  return result
}

async function buildHtml(input: GenerationInput) {
  'use step'
  console.info('generation.content.start', { orderId: input.orderId, pageId: input.pageId })
  const content = await generateLandingContent(input.intake)
  const html = renderLandingPage({ intake: input.intake, content, leadToken: input.leadToken })
  console.info('generation.content.done', { orderId: input.orderId, pageId: input.pageId, bytes: html.length })
  return html
}

async function prepareSite(input: GenerationInput) {
  'use step'
  console.info('generation.site.start', { orderId: input.orderId, pageId: input.pageId })
  const site = await ensureNetlifySite({
    bedrijfsnaam: input.intake.bedrijfsnaam,
    pageId: input.pageId,
    existingSiteId: input.existingSiteId,
    existingUrl: input.existingUrl,
  })
  const { error } = await getSupabase().from('generated_pages').update({
    netlify_site_id: site.siteId,
    netlify_url: site.siteUrl,
    updated_at: new Date().toISOString(),
  }).eq('id', input.pageId)
  if (error) throw new Error(`Netlify-site opslaan mislukt: ${error.message}`)
  console.info('generation.site.done', { orderId: input.orderId, pageId: input.pageId, siteId: site.siteId })
  return site
}

async function publishSite(input: GenerationInput, siteId: string, html: string) {
  'use step'
  console.info('generation.deploy.start', { orderId: input.orderId, pageId: input.pageId, siteId })
  const result = await deployToNetlifySite(siteId, html)
  console.info('generation.deploy.done', { orderId: input.orderId, pageId: input.pageId, deployId: result.deployId })
  return result
}

async function persistCompletion(input: GenerationInput, html: string, siteUrl: string) {
  'use step'
  console.info('generation.persist.start', { orderId: input.orderId, pageId: input.pageId })
  const supabase = getSupabase()
  const now = new Date().toISOString()
  const [{ error: pageError }, { error: orderError }] = await Promise.all([
    supabase.from('generated_pages').update({ html_content: html, netlify_url: siteUrl, status: 'completed', error_message: null, updated_at: now }).eq('id', input.pageId),
    supabase.from('orders').update({ status: 'completed', last_error: null, updated_at: now }).eq('id', input.orderId),
  ])
  if (pageError || orderError) throw new Error(`Afronding opslaan mislukt: ${pageError?.message ?? orderError?.message}`)
  console.info('generation.persist.done', { orderId: input.orderId, pageId: input.pageId })
}

async function notifyCustomer(input: GenerationInput, siteUrl: string) {
  'use step'
  const { stepId } = getStepMetadata()
  console.info('generation.email.start', { orderId: input.orderId, pageId: input.pageId })
  await sendDeliveryEmail({
    email: input.order.email,
    bedrijfsnaam: input.intake.bedrijfsnaam,
    pakket: input.order.pakket,
    netlifyUrl: siteUrl,
    idempotencyKey: `delivery-${input.pageId}-${stepId}`,
  })
  console.info('generation.email.done', { orderId: input.orderId, pageId: input.pageId })
}

async function persistFailure(orderId: string, pageId: string, message: string) {
  'use step'
  console.error('generation.failed', { orderId, pageId, message })
  const safeMessage = message.slice(0, 2_000)
  const now = new Date().toISOString()
  await Promise.all([
    getSupabase().from('generated_pages').update({ status: 'failed', error_message: safeMessage, updated_at: now }).eq('id', pageId),
    getSupabase().from('orders').update({ status: 'failed', last_error: safeMessage, updated_at: now }).eq('id', orderId),
  ])
}

export async function generateLandingWorkflow(orderId: string, pageId: string) {
  'use workflow'
  try {
    const input = await loadInput(orderId, pageId)
    const html = await buildHtml(input)
    const site = await prepareSite(input)
    await publishSite(input, site.siteId, html)
    await persistCompletion(input, html, site.siteUrl)
    await notifyCustomer(input, site.siteUrl)
    return { pageId, siteUrl: site.siteUrl }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Onbekende generatiefout.'
    await persistFailure(orderId, pageId, message)
    throw error
  }
}
