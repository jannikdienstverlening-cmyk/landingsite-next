import { randomBytes } from 'node:crypto'
import { NextRequest } from 'next/server'
import { clientIp, checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { getSupabase } from '@/lib/supabase'

const types: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp' }

export async function POST(request: NextRequest) {
  const limit = checkRateLimit(`upload:${clientIp(request)}`, 12, 30 * 60_000)
  if (!limit.allowed) return rateLimitResponse(limit.retryAfter)
  const form = await request.formData()
  const sessionId = form.get('session_id')
  const file = form.get('file')
  if (typeof sessionId !== 'string' || !(file instanceof File)) return Response.json({ error: 'Bestand ontbreekt.' }, { status: 400 })
  if (!types[file.type] || file.size > 5 * 1024 * 1024) return Response.json({ error: 'Gebruik JPG, PNG of WebP tot 5 MB.' }, { status: 400 })

  const supabase = getSupabase()
  const { data: order } = await supabase.from('orders').select('id, status').eq('stripe_session_id', sessionId).maybeSingle()
  if (!order || !['paid', 'generating'].includes(order.status)) return Response.json({ error: 'Geen geldige betaalde order.' }, { status: 403 })

  const path = `${order.id}/${randomBytes(16).toString('hex')}.${types[file.type]}`
  const { error } = await supabase.storage.from('customer-assets').upload(path, file, { contentType: file.type, upsert: false })
  if (error) {
    console.error('Assetupload mislukt', error)
    return Response.json({ error: 'Uploaden is niet gelukt.' }, { status: 500 })
  }
  return Response.json({ url: supabase.storage.from('customer-assets').getPublicUrl(path).data.publicUrl }, { status: 201 })
}
