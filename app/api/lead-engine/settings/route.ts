import { NextRequest } from 'next/server'
import { z } from 'zod'
import { getScoringWeights, updateScoringWeights } from '@/lib/crm'
import { clientIp, checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { invalidJsonResponse, readJsonBody } from '@/lib/request'
import { adminCookie, rejectCrossOriginMutation, verifyAdminSession } from '@/lib/security'

const schema = z.object({
  weights: z.array(z.object({
    key: z.string().min(1).max(80),
    label: z.string().min(1).max(160),
    value: z.number().int().min(-100).max(100),
    enabled: z.boolean(),
  })).min(1).max(50),
})

function authenticated(request: NextRequest) {
  return verifyAdminSession(request.cookies.get(adminCookie.name)?.value)
}

export async function GET(request: NextRequest) {
  if (!authenticated(request)) return Response.json({ error: 'Niet geautoriseerd.' }, { status: 401 })
  return Response.json({ weights: await getScoringWeights() })
}

export async function PUT(request: NextRequest) {
  if (!authenticated(request)) return Response.json({ error: 'Niet geautoriseerd.' }, { status: 401 })
  const crossOrigin = rejectCrossOriginMutation(request)
  if (crossOrigin) return crossOrigin
  const limit = checkRateLimit(`lead-settings:${clientIp(request)}`, 10, 60_000)
  if (!limit.allowed) return rateLimitResponse(limit.retryAfter)
  let body: unknown
  try { body = await readJsonBody(request, 20_000) } catch (error) { return invalidJsonResponse(error) }
  const parsed = schema.safeParse(body)
  if (!parsed.success) return Response.json({ error: 'Ongeldige scoreconfiguratie.' }, { status: 400 })
  await updateScoringWeights(parsed.data.weights)
  return Response.json({ ok: true })
}
