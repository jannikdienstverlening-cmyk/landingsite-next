import { randomBytes } from 'node:crypto'
import { NextRequest } from 'next/server'
import sharp from 'sharp'
import { clientIp, checkRateLimit, rateLimitResponse } from '@/lib/rate-limit'
import { rejectCrossOriginMutation } from '@/lib/security'
import { getSupabase } from '@/lib/supabase'

const types = new Set(['image/jpeg', 'image/png', 'image/webp'])

async function hasValidImageSignature(file: File) {
  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer())
  if (file.type === 'image/jpeg') return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
  if (file.type === 'image/png') return bytes.slice(0, 8).every((value, index) => value === [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a][index])
  if (file.type === 'image/webp') {
    return new TextDecoder().decode(bytes.slice(0, 4)) === 'RIFF' && new TextDecoder().decode(bytes.slice(8, 12)) === 'WEBP'
  }
  return false
}

export async function POST(request: NextRequest) {
  const crossOrigin = rejectCrossOriginMutation(request)
  if (crossOrigin) return crossOrigin
  const limit = checkRateLimit(`upload:${clientIp(request)}`, 12, 30 * 60_000)
  if (!limit.allowed) return rateLimitResponse(limit.retryAfter)
  const form = await request.formData()
  const sessionId = form.get('session_id')
  const file = form.get('file')
  if (typeof sessionId !== 'string' || !(file instanceof File)) return Response.json({ error: 'Bestand ontbreekt.' }, { status: 400 })
  if (!types.has(file.type) || file.size > 5 * 1024 * 1024) return Response.json({ error: 'Gebruik JPG, PNG of WebP tot 5 MB.' }, { status: 400 })
  if (!(await hasValidImageSignature(file))) return Response.json({ error: 'Het bestand is geen geldige afbeelding.' }, { status: 400 })

  const supabase = getSupabase()
  const { data: order } = await supabase.from('orders').select('id, status').eq('stripe_session_id', sessionId).maybeSingle()
  if (!order || !['paid', 'generating'].includes(order.status)) return Response.json({ error: 'Geen geldige betaalde order.' }, { status: 403 })

  let sanitized: Buffer
  try {
    sanitized = await sharp(Buffer.from(await file.arrayBuffer()), { failOn: 'warning', limitInputPixels: 40_000_000 })
      .rotate()
      .resize({ width: 2560, height: 2560, fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 86, effort: 5 })
      .toBuffer()
  } catch {
    return Response.json({ error: 'De afbeelding kon niet veilig worden verwerkt.' }, { status: 400 })
  }

  const path = `${order.id}/${randomBytes(16).toString('hex')}.webp`
  const { error } = await supabase.storage.from('customer-assets').upload(path, sanitized, { contentType: 'image/webp', upsert: false })
  if (error) {
    console.error('Assetupload mislukt', error)
    return Response.json({ error: 'Uploaden is niet gelukt.' }, { status: 500 })
  }
  return Response.json({ url: supabase.storage.from('customer-assets').getPublicUrl(path).data.publicUrl }, { status: 201 })
}
