import { NextRequest } from 'next/server'
import { clientIp, checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { invalidJsonResponse, readJsonBody } from '@/lib/request'
import { rejectCrossOriginMutation } from '@/lib/security'
import { answerSiteQuestion } from '@/lib/site-chat'
import { chatSchema, validationMessage } from '@/lib/validation'

export const runtime = 'nodejs'
export const maxDuration = 20

export async function POST(request: NextRequest) {
  const crossOrigin = rejectCrossOriginMutation(request)
  if (crossOrigin) return crossOrigin

  const limit = checkRateLimit(`chat:${clientIp(request)}`, 12, 10 * 60_000)
  if (!limit.allowed) return rateLimitResponse(limit.retryAfter)

  let body: unknown
  try { body = await readJsonBody(request, 12_000) } catch (error) { return invalidJsonResponse(error) }

  const parsed = chatSchema.safeParse(body)
  if (!parsed.success) return Response.json({ error: validationMessage(parsed.error) }, { status: 400 })

  try {
    const reply = await answerSiteQuestion(parsed.data.messages)
    return Response.json({ reply }, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('Chatassistent antwoorden mislukt', error)
    return Response.json({ error: 'De assistent is nu even niet beschikbaar. Gebruik gerust het contactformulier.' }, { status: 503 })
  }
}
