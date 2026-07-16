import { createHash, createHmac, randomBytes, timingSafeEqual } from 'node:crypto'

const ADMIN_COOKIE = 'landingsite_admin'
const TOKEN_VERSION = 'v1'

function secretFor(purpose: 'admin' | 'order') {
  const secret = purpose === 'admin'
    ? process.env.ADMIN_SESSION_SECRET ?? process.env.ADMIN_PASSWORD
    : process.env.ORDER_TOKEN_SECRET ?? process.env.STRIPE_WEBHOOK_SECRET ?? process.env.ADMIN_PASSWORD

  if (!secret) throw new Error(`${purpose.toUpperCase()} token secret ontbreekt.`)
  return secret
}

function sign(value: string, purpose: 'admin' | 'order') {
  return createHmac('sha256', secretFor(purpose)).update(value).digest('base64url')
}

function safeEqual(left: string, right: string) {
  const a = Buffer.from(left)
  const b = Buffer.from(right)
  return a.length === b.length && timingSafeEqual(a, b)
}

function issueToken(subject: string, purpose: 'admin' | 'order', ttlSeconds: number) {
  const payload = Buffer.from(JSON.stringify({
    sub: subject,
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
    nonce: randomBytes(8).toString('hex'),
  })).toString('base64url')
  const signed = `${TOKEN_VERSION}.${purpose}.${payload}`
  return `${signed}.${sign(signed, purpose)}`
}

function verifyToken(token: string | undefined, subject: string | null, purpose: 'admin' | 'order') {
  if (!token) return false
  const [version, tokenPurpose, payload, signature, ...rest] = token.split('.')
  if (rest.length || version !== TOKEN_VERSION || tokenPurpose !== purpose || !payload || !signature) return false
  const signed = `${version}.${tokenPurpose}.${payload}`
  if (!safeEqual(signature, sign(signed, purpose))) return false

  try {
    const decoded = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as { sub?: string; exp?: number }
    return Boolean(decoded.sub && decoded.exp && decoded.exp > Math.floor(Date.now() / 1000) && (!subject || decoded.sub === subject))
  } catch {
    return false
  }
}

export function passwordMatches(candidate: string) {
  const expected = process.env.ADMIN_PASSWORD
  return Boolean(expected && safeEqual(candidate, expected))
}

export function createAdminSession() {
  return issueToken('admin', 'admin', 60 * 60 * 12)
}

export function verifyAdminSession(token: string | undefined) {
  return verifyToken(token, 'admin', 'admin')
}

export function createOrderToken(orderId: string) {
  return issueToken(orderId, 'order', 60 * 60 * 24 * 7)
}

export function verifyOrderToken(token: string | undefined, orderId: string) {
  return verifyToken(token, orderId, 'order')
}

export function hashIp(ip: string) {
  const salt = process.env.IP_HASH_SALT ?? secretFor('order')
  return createHash('sha256').update(`${salt}:${ip}`).digest('hex')
}

export const adminCookie = {
  name: ADMIN_COOKIE,
  options: {
    httpOnly: true,
    sameSite: 'strict' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 60 * 60 * 12,
  },
}
