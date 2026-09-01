import { NextRequest, NextResponse } from 'next/server'
import { adminCookie, verifyAdminSession } from '@/lib/security'
import { requiredEnv } from '@/lib/social/common'
import { tiktokAuthorizeUrl } from '@/lib/social/oauth'
import { createOAuthState, oauthStateCookie } from '@/lib/social/oauth-state'

export async function GET(request: NextRequest) {
  if (!verifyAdminSession(request.cookies.get(adminCookie.name)?.value)) {
    return Response.json({ error: 'Niet geautoriseerd.' }, { status: 401 })
  }
  const state = createOAuthState()
  const response = NextResponse.redirect(tiktokAuthorizeUrl({
    clientKey: requiredEnv('TIKTOK_CLIENT_KEY'),
    redirectUri: requiredEnv('TIKTOK_REDIRECT_URI'),
    state,
  }))
  const stateCookie = oauthStateCookie('tiktok')
  response.cookies.set(stateCookie.name, state, stateCookie.options)
  return response
}
