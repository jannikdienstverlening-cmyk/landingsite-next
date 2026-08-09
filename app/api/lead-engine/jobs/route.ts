import { randomUUID } from 'node:crypto'
import { NextRequest } from 'next/server'
import { start } from 'workflow/api'
import { clientIp, checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { adminCookie, rejectCrossOriginMutation, verifyAdminSession } from '@/lib/security'
import { leadEngineDailyWorkflow } from '@/workflows/lead-engine/daily'

export async function POST(request: NextRequest) {
  if (!verifyAdminSession(request.cookies.get(adminCookie.name)?.value)) return Response.json({ error: 'Niet geautoriseerd.' }, { status: 401 })
  const crossOrigin = rejectCrossOriginMutation(request)
  if (crossOrigin) return crossOrigin
  const limit = checkRateLimit(`lead-job:${clientIp(request)}`, 3, 60 * 60_000)
  if (!limit.allowed) return rateLimitResponse(limit.retryAfter)
  const jobId = randomUUID()
  const run = await start(leadEngineDailyWorkflow, [jobId])
  return Response.json({ ok: true, jobId, runId: run.runId }, { status: 202 })
}
