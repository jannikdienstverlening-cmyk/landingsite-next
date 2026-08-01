import { NextRequest, NextResponse } from 'next/server'
import { adminCookie, rejectCrossOriginMutation } from '@/lib/security'

export async function POST(request: NextRequest) {
  const crossOrigin = rejectCrossOriginMutation(request)
  if (crossOrigin) return crossOrigin
  const response = NextResponse.json({ ok: true })
  response.cookies.set(adminCookie.name, '', { ...adminCookie.options, maxAge: 0 })
  return response
}
