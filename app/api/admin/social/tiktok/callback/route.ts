import { NextRequest, NextResponse } from 'next/server'
import { requiredEnv } from '@/lib/social/common'
import { saveSocialConnection } from '@/lib/social/connections'
import { exchangeTikTokCode } from '@/lib/social/oauth'
import { oauthStateCookie, validOAuthState } from '@/lib/social/oauth-state'
import { TikTokClient } from '@/lib/social/tiktok'
import { adminCookie, verifyAdminSession } from '@/lib/security'

function adminRedirect(request: NextRequest, result: 'connected' | 'failed') {
  return new URL(`/admin?tiktok=${result}`, request.url)
}

export async function GET(request: NextRequest) {
  if (!verifyAdminSession(request.cookies.get(adminCookie.name)?.value)) {
    return NextResponse.redirect(adminRedirect(request, 'failed'))
  }

  const stateCookie = oauthStateCookie('tiktok')
  const state = request.nextUrl.searchParams.get('state')
  const code = request.nextUrl.searchParams.get('code')
  if (!code || !validOAuthState(request.cookies.get(stateCookie.name)?.value, state)) {
    return NextResponse.redirect(adminRedirect(request, 'failed'))
  }

  try {
    const token = await exchangeTikTokCode({
      clientKey: requiredEnv('TIKTOK_CLIENT_KEY'),
      clientSecret: requiredEnv('TIKTOK_CLIENT_SECRET'),
      redirectUri: requiredEnv('TIKTOK_REDIRECT_URI'),
      code,
    })
    const creator = await new TikTokClient({ accessToken: token.accessToken }).getCreatorInfo()
    await saveSocialConnection({
      platform: 'tiktok',
      accountId: token.openId,
      accountUsername: creator.creator_username,
      accessToken: token.accessToken,
      refreshToken: token.refreshToken,
      accessExpiresAt: new Date(Date.now() + token.expiresIn * 1000).toISOString(),
      refreshExpiresAt: new Date(Date.now() + token.refreshExpiresIn * 1000).toISOString(),
      scopes: token.scope,
      metadata: { nickname: creator.creator_nickname ?? null },
    })
    const response = NextResponse.redirect(adminRedirect(request, 'connected'))
    response.cookies.set(stateCookie.name, '', { ...stateCookie.options, maxAge: 0 })
    return response
  } catch {
    return NextResponse.redirect(adminRedirect(request, 'failed'))
  }
}
