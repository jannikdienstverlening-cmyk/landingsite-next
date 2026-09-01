import { createCipheriv, createDecipheriv, randomBytes } from 'node:crypto'
import { getSupabase } from '@/lib/supabase'
import { requiredEnv } from './common'
import { refreshInstagramToken, refreshTikTokToken } from './oauth'

export type SocialPlatform = 'instagram' | 'tiktok'

export type SocialConnection = {
  platform: SocialPlatform
  accountId: string
  accountUsername: string | null
  accessToken: string
  refreshToken: string | null
  accessExpiresAt: string | null
  refreshExpiresAt: string | null
  scopes: string[]
  metadata: Record<string, unknown>
}

function encryptionKey() {
  const raw = Buffer.from(requiredEnv('SOCIAL_TOKEN_ENCRYPTION_KEY'), 'base64')
  if (raw.length !== 32) throw new Error('SOCIAL_TOKEN_ENCRYPTION_KEY moet exact 32 bytes base64 zijn.')
  return raw
}

function encrypt(value: string) {
  const iv = randomBytes(12)
  const cipher = createCipheriv('aes-256-gcm', encryptionKey(), iv)
  const ciphertext = Buffer.concat([cipher.update(value, 'utf8'), cipher.final()])
  return [iv, cipher.getAuthTag(), ciphertext].map((part) => part.toString('base64url')).join('.')
}

function decrypt(value: string) {
  const [iv, tag, ciphertext, ...rest] = value.split('.')
  if (!iv || !tag || !ciphertext || rest.length) throw new Error('Ongeldig versleuteld social-token.')
  const decipher = createDecipheriv('aes-256-gcm', encryptionKey(), Buffer.from(iv, 'base64url'))
  decipher.setAuthTag(Buffer.from(tag, 'base64url'))
  return Buffer.concat([
    decipher.update(Buffer.from(ciphertext, 'base64url')),
    decipher.final(),
  ]).toString('utf8')
}

export async function saveSocialConnection(connection: SocialConnection) {
  const { error } = await getSupabase().from('social_api_connections').upsert({
    platform: connection.platform,
    account_id: connection.accountId,
    account_username: connection.accountUsername,
    access_token_ciphertext: encrypt(connection.accessToken),
    refresh_token_ciphertext: connection.refreshToken ? encrypt(connection.refreshToken) : null,
    access_expires_at: connection.accessExpiresAt,
    refresh_expires_at: connection.refreshExpiresAt,
    scopes: connection.scopes,
    metadata: connection.metadata,
    connected_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }, { onConflict: 'platform' })
  if (error) throw new Error(`Social-koppeling kon niet worden opgeslagen: ${error.code ?? 'databasefout'}.`)
}

export async function loadSocialConnection(platform: SocialPlatform): Promise<SocialConnection | null> {
  const { data, error } = await getSupabase()
    .from('social_api_connections')
    .select('platform,account_id,account_username,access_token_ciphertext,refresh_token_ciphertext,access_expires_at,refresh_expires_at,scopes,metadata')
    .eq('platform', platform)
    .maybeSingle()
  if (error) throw new Error(`Social-koppeling kon niet worden geladen: ${error.code ?? 'databasefout'}.`)
  if (!data) return null
  return {
    platform,
    accountId: data.account_id,
    accountUsername: data.account_username,
    accessToken: decrypt(data.access_token_ciphertext),
    refreshToken: data.refresh_token_ciphertext ? decrypt(data.refresh_token_ciphertext) : null,
    accessExpiresAt: data.access_expires_at,
    refreshExpiresAt: data.refresh_expires_at,
    scopes: Array.isArray(data.scopes) ? data.scopes : [],
    metadata: data.metadata && typeof data.metadata === 'object' ? data.metadata : {},
  }
}

export async function publicConnectionStatuses() {
  const { data, error } = await getSupabase()
    .from('social_api_connections')
    .select('platform,account_id,account_username,access_expires_at,refresh_expires_at,scopes,connected_at,updated_at')
    .order('platform')
  if (error) throw new Error(`Social-status kon niet worden geladen: ${error.code ?? 'databasefout'}.`)
  return data ?? []
}

function expiresSoon(value: string | null, marginMs: number) {
  return Boolean(value && new Date(value).getTime() <= Date.now() + marginMs)
}

export async function loadActiveSocialConnection(platform: SocialPlatform) {
  const connection = await loadSocialConnection(platform)
  if (!connection) throw new Error(`${platform} is nog niet officieel gekoppeld.`)

  if (platform === 'instagram' && expiresSoon(connection.accessExpiresAt, 7 * 86_400_000)) {
    const refreshed = await refreshInstagramToken({ accessToken: connection.accessToken })
    connection.accessToken = refreshed.accessToken
    connection.accessExpiresAt = new Date(Date.now() + refreshed.expiresIn * 1000).toISOString()
    await saveSocialConnection(connection)
  }

  if (platform === 'tiktok' && expiresSoon(connection.accessExpiresAt, 10 * 60_000)) {
    if (!connection.refreshToken) throw new Error('TikTok-refresh_token ontbreekt.')
    const refreshed = await refreshTikTokToken({
      clientKey: requiredEnv('TIKTOK_CLIENT_KEY'),
      clientSecret: requiredEnv('TIKTOK_CLIENT_SECRET'),
      refreshToken: connection.refreshToken,
    })
    connection.accessToken = refreshed.accessToken
    connection.refreshToken = refreshed.refreshToken
    connection.accessExpiresAt = new Date(Date.now() + refreshed.expiresIn * 1000).toISOString()
    connection.refreshExpiresAt = new Date(Date.now() + refreshed.refreshExpiresIn * 1000).toISOString()
    connection.scopes = refreshed.scope
    await saveSocialConnection(connection)
  }

  return connection
}
