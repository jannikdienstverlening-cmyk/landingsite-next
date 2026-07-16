import { NextRequest } from 'next/server'
import { adminCookie, verifyAdminSession } from '@/lib/security'

export async function GET(request: NextRequest) {
  const authenticated = verifyAdminSession(request.cookies.get(adminCookie.name)?.value)
  return Response.json({ authenticated }, { status: authenticated ? 200 : 401 })
}
