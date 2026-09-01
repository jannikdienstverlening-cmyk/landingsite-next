import { responseJson, type FetchLike } from './common'

export type InstagramToken = {
  accessToken: string
  userId: string
  expiresIn: number | null
}

export type TikTokToken = {
  accessToken: string
  refreshToken: string
  openId: string
  scope: string[]
  expiresIn: number
  refreshExpiresIn: number
}

function requireString(value: unknown, label: string) {
  if (typeof value !== 'string' || !value) throw new Error(`${label} ontbreekt in het OAuth-antwoord.`)
  return value
}

function requireNumber(value: unknown, label: string) {
  if (typeof value !== 'number' || !Number.isFinite(value)) throw new Error(`${label} ontbreekt in het OAuth-antwoord.`)
  return value
}

export function instagramAuthorizeUrl(input: {
  clientId: string
  redirectUri: string
  state: string
}) {
  const url = new URL('https://www.instagram.com/oauth/authorize')
  url.search = new URLSearchParams({
    client_id: input.clientId,
    redirect_uri: input.redirectUri,
    response_type: 'code',
    scope: 'instagram_business_basic,instagram_business_content_publish',
    state: input.state,
    enable_fb_login: '0',
    force_authentication: '1',
  }).toString()
  return url.toString()
}

export async function exchangeInstagramCode(input: {
  clientId: string
  clientSecret: string
  redirectUri: string
  code: string
  fetchImpl?: FetchLike
}): Promise<InstagramToken> {
  const fetchImpl = input.fetchImpl ?? fetch
  const shortResponse = await fetchImpl('https://api.instagram.com/oauth/access_token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: input.clientId,
      client_secret: input.clientSecret,
      grant_type: 'authorization_code',
      redirect_uri: input.redirectUri,
      code: input.code,
    }),
  })
  const shortBody = await responseJson(shortResponse)
  if (!shortResponse.ok) throw new Error('Instagram kon de autorisatiecode niet omwisselen.')
  const shortToken = requireString(shortBody.access_token, 'Instagram access_token')
  const userId = String(shortBody.user_id ?? '')
  if (!userId) throw new Error('Instagram user_id ontbreekt in het OAuth-antwoord.')

  const longUrl = new URL('https://graph.instagram.com/access_token')
  longUrl.search = new URLSearchParams({
    grant_type: 'ig_exchange_token',
    client_secret: input.clientSecret,
    access_token: shortToken,
  }).toString()
  const longResponse = await fetchImpl(longUrl)
  const longBody = await responseJson(longResponse)
  if (!longResponse.ok) throw new Error('Instagram kon geen langlevend toegangstoken maken.')
  return {
    accessToken: requireString(longBody.access_token, 'Instagram langlevend access_token'),
    userId,
    expiresIn: typeof longBody.expires_in === 'number' ? longBody.expires_in : null,
  }
}

export async function refreshInstagramToken(input: {
  accessToken: string
  fetchImpl?: FetchLike
}): Promise<{ accessToken: string; expiresIn: number }> {
  const url = new URL('https://graph.instagram.com/refresh_access_token')
  url.search = new URLSearchParams({
    grant_type: 'ig_refresh_token',
    access_token: input.accessToken,
  }).toString()
  const response = await (input.fetchImpl ?? fetch)(url)
  const body = await responseJson(response)
  if (!response.ok) throw new Error('Instagram-token kon niet worden vernieuwd.')
  return {
    accessToken: requireString(body.access_token, 'Instagram access_token'),
    expiresIn: requireNumber(body.expires_in, 'Instagram expires_in'),
  }
}

export function tiktokAuthorizeUrl(input: {
  clientKey: string
  redirectUri: string
  state: string
}) {
  const url = new URL('https://www.tiktok.com/v2/auth/authorize/')
  url.search = new URLSearchParams({
    client_key: input.clientKey,
    redirect_uri: input.redirectUri,
    response_type: 'code',
    scope: 'user.info.basic,video.publish',
    state: input.state,
    disable_auto_auth: '1',
  }).toString()
  return url.toString()
}

async function tiktokTokenRequest(values: Record<string, string>, fetchImpl: FetchLike) {
  const response = await fetchImpl('https://open.tiktokapis.com/v2/oauth/token/', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Cache-Control': 'no-cache',
    },
    body: new URLSearchParams(values),
  })
  const body = await responseJson(response)
  if (!response.ok || typeof body.error === 'string') {
    throw new Error(typeof body.error_description === 'string'
      ? body.error_description
      : 'TikTok-tokenaanvraag is mislukt.')
  }
  return body
}

function parseTikTokToken(body: Record<string, unknown>): TikTokToken {
  return {
    accessToken: requireString(body.access_token, 'TikTok access_token'),
    refreshToken: requireString(body.refresh_token, 'TikTok refresh_token'),
    openId: requireString(body.open_id, 'TikTok open_id'),
    scope: requireString(body.scope, 'TikTok scope').split(',').filter(Boolean),
    expiresIn: requireNumber(body.expires_in, 'TikTok expires_in'),
    refreshExpiresIn: requireNumber(body.refresh_expires_in, 'TikTok refresh_expires_in'),
  }
}

export async function exchangeTikTokCode(input: {
  clientKey: string
  clientSecret: string
  redirectUri: string
  code: string
  fetchImpl?: FetchLike
}) {
  return parseTikTokToken(await tiktokTokenRequest({
    client_key: input.clientKey,
    client_secret: input.clientSecret,
    code: input.code,
    grant_type: 'authorization_code',
    redirect_uri: input.redirectUri,
  }, input.fetchImpl ?? fetch))
}

export async function refreshTikTokToken(input: {
  clientKey: string
  clientSecret: string
  refreshToken: string
  fetchImpl?: FetchLike
}) {
  return parseTikTokToken(await tiktokTokenRequest({
    client_key: input.clientKey,
    client_secret: input.clientSecret,
    grant_type: 'refresh_token',
    refresh_token: input.refreshToken,
  }, input.fetchImpl ?? fetch))
}
