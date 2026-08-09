import { NextRequest } from 'next/server'
import { z } from 'zod'
import { generateDemoConcept } from '@/lib/ai'
import { addCrmNote, applyProspectAction, createDemoPreview, deleteProspectData, getProspect, recordOutreachOutcome } from '@/lib/crm'
import { PIPELINE_STATUSES } from '@/lib/lead-engine/types'
import { clientIp, checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { invalidJsonResponse, readJsonBody } from '@/lib/request'
import { adminCookie, rejectCrossOriginMutation, verifyAdminSession } from '@/lib/security'

const actionSchema = z.discriminatedUnion('action', [
  z.object({ action: z.literal('GENERATE_DEMO') }),
  z.object({ action: z.literal('SEND'), draftId: z.string().min(1) }),
  z.object({ action: z.literal('SKIP'), draftId: z.string().min(1) }),
  z.object({ action: z.literal('LATER'), draftId: z.string().min(1), scheduledFor: z.iso.datetime().optional() }),
  z.object({ action: z.literal('UPDATE_DRAFT'), draftId: z.string().min(1), body: z.string().min(10).max(4_000) }),
  z.object({ action: z.literal('PIPELINE'), pipelineStatus: z.enum(PIPELINE_STATUSES) }),
  z.object({ action: z.literal('DO_NOT_CONTACT') }),
  z.object({ action: z.literal('DELETE_DATA'), confirmation: z.literal('VERWIJDER') }),
  z.object({ action: z.literal('ADD_NOTE'), body: z.string().min(1).max(4_000) }),
  z.object({ action: z.literal('OUTCOME'), outcome: z.enum(['NO_RESPONSE','POSITIVE','NEGATIVE','APPOINTMENT','CUSTOMER']), channel: z.enum(['EMAIL','INSTAGRAM','LINKEDIN','WHATSAPP','PHONE']), openingVariant: z.string().max(500).optional(), offer: z.string().max(500).optional() }),
])

export async function POST(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  if (!verifyAdminSession(request.cookies.get(adminCookie.name)?.value)) return Response.json({ error: 'Niet geautoriseerd.' }, { status: 401 })
  const crossOrigin = rejectCrossOriginMutation(request)
  if (crossOrigin) return crossOrigin
  const limit = checkRateLimit(`lead-action:${clientIp(request)}`, 60, 60_000)
  if (!limit.allowed) return rateLimitResponse(limit.retryAfter)
  let body: unknown
  try { body = await readJsonBody(request, 8_000) } catch (error) { return invalidJsonResponse(error) }
  const parsed = actionSchema.safeParse(body)
  if (!parsed.success) return Response.json({ error: 'Ongeldige leadactie.' }, { status: 400 })
  const { id } = await context.params

  if (parsed.data.action === 'GENERATE_DEMO') {
    const prospect = await getProspect(id)
    if (!prospect) return Response.json({ error: 'Lead niet gevonden.' }, { status: 404 })
    if (prospect.suppressed) return Response.json({ error: 'Deze lead staat op de suppressionlijst.' }, { status: 409 })
    const content = await generateDemoConcept(prospect)
    const preview = await createDemoPreview(id, content)
    return Response.json({ ok: true, ...preview }, { status: 201 })
  }

  if (parsed.data.action === 'DELETE_DATA') {
    return Response.json(await deleteProspectData(id, 'Handmatige verwijdering vanuit leaddossier'))
  }
  if (parsed.data.action === 'ADD_NOTE') return Response.json(await addCrmNote(id, parsed.data.body))
  if (parsed.data.action === 'OUTCOME') return Response.json(await recordOutreachOutcome(id, parsed.data))

  const result = await applyProspectAction({
    prospectId: id,
    action: parsed.data.action,
    draftId: 'draftId' in parsed.data ? parsed.data.draftId : undefined,
    body: 'body' in parsed.data ? parsed.data.body : undefined,
    pipelineStatus: 'pipelineStatus' in parsed.data ? parsed.data.pipelineStatus : undefined,
    scheduledFor: 'scheduledFor' in parsed.data ? parsed.data.scheduledFor : undefined,
  })
  return Response.json(result)
}
