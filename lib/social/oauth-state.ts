import { randomBytes, timingSafeEqual } from 'node:crypto'

export type OAuthPlatform = 'instagram' | 'tiktok'

export function oauthStateCookie(platform: OAuthPlatform) {
  return {
    name: `__Host-landingsite_${platform}_oauth_state`,
    options: {
      httpOnly: true,
      sameSite: 'lax' as const,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: 10 * 60,
    },
  }
}

export function createOAuthState() {
  return randomBytes(32).toString('base64url')
}

export function validOAuthState(expected: string | undefined, received: string | null) {
  if (!expected || !received) return false
  const left = Buffer.from(expected)
  const right = Buffer.from(received)
  return left.length === right.length && timingSafeEqual(left, right)
}
