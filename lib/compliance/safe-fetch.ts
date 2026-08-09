import 'server-only'
import { isIP } from 'node:net'
import { resolve4, resolve6 } from 'node:dns/promises'

const USER_AGENT = 'LandingsiteLeadEngine/1.0 (+https://landingsite.nl; compliance-contact: privacy@landingsite.nl)'

function blockedIpv4(address: string) {
  const parts = address.split('.').map(Number)
  if (parts.length !== 4 || parts.some((part) => !Number.isInteger(part) || part < 0 || part > 255)) return true
  const [a, b] = parts
  return a === 0
    || a === 10
    || a === 127
    || (a === 100 && b >= 64 && b <= 127)
    || (a === 169 && b === 254)
    || (a === 172 && b >= 16 && b <= 31)
    || (a === 192 && b === 168)
    || (a === 198 && (b === 18 || b === 19))
    || a >= 224
}

function blockedIpv6(address: string) {
  const normalized = address.toLowerCase().split('%')[0]
  if (normalized.startsWith('::ffff:')) return blockedIpv4(normalized.slice(7))
  return normalized === '::'
    || normalized === '::1'
    || normalized.startsWith('fc')
    || normalized.startsWith('fd')
    || /^fe[89ab]/.test(normalized)
    || normalized.startsWith('2001:db8')
}

async function assertPublicHostname(hostname: string) {
  const normalized = hostname.toLowerCase().replace(/\.$/, '')
  if (normalized === 'localhost' || normalized.endsWith('.localhost') || normalized.endsWith('.local')) {
    throw new Error('Lokale netwerkdoelen zijn niet toegestaan.')
  }
  const literalType = isIP(normalized)
  if (literalType === 4 && blockedIpv4(normalized)) throw new Error('Privé-IP-adressen zijn niet toegestaan.')
  if (literalType === 6 && blockedIpv6(normalized)) throw new Error('Privé-IP-adressen zijn niet toegestaan.')
  if (literalType) return
  const [ipv4, ipv6] = await Promise.race([
    Promise.all([
      resolve4(normalized).catch(() => []),
      resolve6(normalized).catch(() => []),
    ]),
    new Promise<never>((_resolve, reject) => setTimeout(() => reject(new Error('Domeincontrole duurde te lang.')), 4_000)),
  ])
  if (!ipv4.length && !ipv6.length) throw new Error('Domeinnaam kon niet openbaar worden opgelost.')
  if (ipv4.some(blockedIpv4) || ipv6.some(blockedIpv6)) throw new Error('Domeinnaam verwijst naar een niet-openbaar netwerkdoel.')
}

export async function assertPublicHttpUrl(value: string) {
  const url = new URL(value)
  if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Alleen http- en https-websites zijn toegestaan.')
  if (url.username || url.password) throw new Error('URL-inloggegevens zijn niet toegestaan.')
  if (url.port && !['80', '443'].includes(url.port)) throw new Error('Alleen standaard webpoorten zijn toegestaan.')
  await assertPublicHostname(url.hostname)
  return url
}

export async function fetchPublicUrl(value: string, init: RequestInit = {}, maxRedirects = 4) {
  let url = await assertPublicHttpUrl(value)
  for (let redirect = 0; redirect <= maxRedirects; redirect += 1) {
    const response = await fetch(url, {
      ...init,
      headers: { 'User-Agent': USER_AGENT, Accept: '*/*', ...init.headers },
      redirect: 'manual',
      signal: init.signal ?? AbortSignal.timeout(15_000),
      cache: 'no-store',
    })
    if (![301, 302, 303, 307, 308].includes(response.status)) return { response, finalUrl: url }
    const location = response.headers.get('location')
    if (!location) return { response, finalUrl: url }
    url = await assertPublicHttpUrl(new URL(location, url).toString())
  }
  throw new Error('Te veel redirects bij het ophalen van de website.')
}

export async function readLimitedText(response: Response, maxBytes = 2_000_000) {
  const declared = Number(response.headers.get('content-length') ?? 0)
  if (declared > maxBytes) throw new Error('Website-response is groter dan de ingestelde auditlimiet.')
  const reader = response.body?.getReader()
  if (!reader) return ''
  const decoder = new TextDecoder()
  let total = 0
  let output = ''
  while (true) {
    const { done, value } = await reader.read()
    if (done) break
    total += value.byteLength
    if (total > maxBytes) {
      await reader.cancel()
      throw new Error('Website-response overschrijdt de ingestelde auditlimiet.')
    }
    output += decoder.decode(value, { stream: true })
  }
  return output + decoder.decode()
}

export async function robotsAllows(rootUrl: string, timeoutMs = 15_000) {
  const root = new URL(rootUrl)
  const robotsUrl = new URL('/robots.txt', root).toString()
  try {
    const { response } = await fetchPublicUrl(robotsUrl, { signal: AbortSignal.timeout(timeoutMs) })
    if (response.status === 404) return { allowed: true, exists: false }
    if (!response.ok) return { allowed: true, exists: false }
    const text = await readLimitedText(response, 250_000)
    const groups = text.split(/(?=^user-agent\s*:)/gim)
    const relevant = groups.filter((group) => /user-agent\s*:\s*(\*|landingsiteleadengine)/i.test(group))
    const disallowRoot = relevant.some((group) => /^disallow\s*:\s*\/\s*(?:#.*)?$/im.test(group))
    return { allowed: !disallowRoot, exists: true }
  } catch {
    return { allowed: true, exists: false }
  }
}
