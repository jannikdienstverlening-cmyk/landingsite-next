import { NextRequest, NextResponse } from 'next/server'
import { clientIp, checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { adminCookie, createAdminSession, passwordMatches } from '@/lib/security'
import { adminLoginSchema } from '@/lib/validation'

export async function POST(request: NextRequest) {
  const limit = checkRateLimit(`admin-login:${clientIp(request)}`, 6, 15 * 60_000)
  if (!limit.allowed) return rateLimitResponse(limit.retryAfter)
  let body: unknown
  try { body = await request.json() } catch { body = null }
  const parsed = adminLoginSchema.safeParse(body)
  if (!parsed.success || !passwordMatches(parsed.data.password)) {
    return Response.json({ error: 'Onjuiste inloggegevens.' }, { status: 401 })
  }
  const response = NextResponse.json({ ok: true })
  response.cookies.set(adminCookie.name, createAdminSession(), adminCookie.options)
  return response
}
