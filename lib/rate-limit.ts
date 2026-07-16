import type { NextRequest } from 'next/server'

type Bucket = { count: number; resetAt: number }
const buckets = new Map<string, Bucket>()

export function clientIp(request: NextRequest) {
  return request.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim()
    ?? request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    ?? request.headers.get('x-real-ip')
    ?? 'unknown'
}

export function checkRateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now()
  const existing = buckets.get(key)
  const bucket = !existing || existing.resetAt <= now
    ? { count: 0, resetAt: now + windowMs }
    : existing

  bucket.count += 1
  buckets.set(key, bucket)

  if (buckets.size > 2_000) {
    for (const [entryKey, entry] of buckets) {
      if (entry.resetAt <= now) buckets.delete(entryKey)
    }
  }

  return {
    allowed: bucket.count <= limit,
    remaining: Math.max(0, limit - bucket.count),
    retryAfter: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
  }
}

export function rateLimitResponse(retryAfter: number) {
  return Response.json(
    { error: 'Te veel verzoeken. Probeer het zo opnieuw.' },
    { status: 429, headers: { 'Retry-After': String(retryAfter) } },
  )
}
