import { NextRequest, NextResponse } from 'next/server'
import { clientIp, checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { invalidJsonResponse, readJsonBody } from '@/lib/request'
import { adminCookie, createAdminSession, passwordMatches, rejectCrossOriginMutation } from '@/lib/security'
import { adminLoginSchema } from '@/lib/validation'

export async function POST(request: NextRequest) {
  const crossOrigin = rejectCrossOriginMutation(request)
  if (crossOrigin) return crossOrigin
  const limit = checkRateLimit(`admin-login:${clientIp(request)}`, 6, 15 * 60_000)
  if (!limit.allowed) return rateLimitResponse(limit.retryAfter)
  let body: unknown
  try { body = await readJsonBody(request, 2_000) } catch (error) { return invalidJsonResponse(error) }
  const parsed = adminLoginSchema.safeParse(body)
  if (!parsed.success || !passwordMatches(parsed.data.password)) {
    return Response.json({ error: 'Onjuiste inloggegevens.' }, { status: 401 })
  }
  const response = NextResponse.json({ ok: true })
  response.cookies.set(adminCookie.name, createAdminSession(), adminCookie.options)
  return response
}
