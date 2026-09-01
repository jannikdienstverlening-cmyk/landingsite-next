import { NextRequest } from 'next/server'
import { adminCookie, verifyAdminSession } from '@/lib/security'
import { publicConnectionStatuses } from '@/lib/social/connections'

export async function GET(request: NextRequest) {
  if (!verifyAdminSession(request.cookies.get(adminCookie.name)?.value)) {
    return Response.json({ error: 'Niet geautoriseerd.' }, { status: 401 })
  }
  return Response.json({ connections: await publicConnectionStatuses() })
}
