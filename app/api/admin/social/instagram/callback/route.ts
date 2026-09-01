import { NextRequest, NextResponse } from 'next/server'
import { requiredEnv } from '@/lib/social/common'
import { saveSocialConnection } from '@/lib/social/connections'
import { InstagramClient } from '@/lib/social/instagram'
import { exchangeInstagramCode } from '@/lib/social/oauth'
import { oauthStateCookie, validOAuthState } from '@/lib/social/oauth-state'
import { adminCookie, verifyAdminSession } from '@/lib/security'

function adminRedirect(request: NextRequest, result: 'connected' | 'failed') {
  return new URL(`/admin?instagram=${result}`, request.url)
}

export async function GET(request: NextRequest) {
  if (!verifyAdminSession(request.cookies.get(adminCookie.name)?.value)) {
    return NextResponse.redirect(adminRedirect(request, 'failed'))
  }

  const stateCookie = oauthStateCookie('instagram')
  const state = request.nextUrl.searchParams.get('state')
  const code = request.nextUrl.searchParams.get('code')?.replace(/#_$/u, '')
  if (!code || !validOAuthState(request.cookies.get(stateCookie.name)?.value, state)) {
    return NextResponse.redirect(adminRedirect(request, 'failed'))
  }

  try {
    const token = await exchangeInstagramCode({
      clientId: requiredEnv('INSTAGRAM_APP_ID'),
      clientSecret: requiredEnv('INSTAGRAM_APP_SECRET'),
      redirectUri: requiredEnv('INSTAGRAM_REDIRECT_URI'),
      code,
    })
    const client = new InstagramClient({
      accessToken: token.accessToken,
      userId: token.userId,
      apiVersion: requiredEnv('INSTAGRAM_GRAPH_API_VERSION'),
    })
    const account = await client.getAccount()
    await saveSocialConnection({
      platform: 'instagram',
      accountId: account.id,
      accountUsername: account.username ?? null,
      accessToken: token.accessToken,
      refreshToken: null,
      accessExpiresAt: token.expiresIn ? new Date(Date.now() + token.expiresIn * 1000).toISOString() : null,
      refreshExpiresAt: null,
      scopes: ['instagram_business_basic', 'instagram_business_content_publish'],
      metadata: { accountType: account.account_type ?? null },
    })
    const response = NextResponse.redirect(adminRedirect(request, 'connected'))
    response.cookies.set(stateCookie.name, '', { ...stateCookie.options, maxAge: 0 })
    return response
  } catch {
    return NextResponse.redirect(adminRedirect(request, 'failed'))
  }
}
