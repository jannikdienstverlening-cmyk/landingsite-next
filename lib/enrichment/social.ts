import type { ProspectUrl, UrlKind } from '@/lib/lead-engine/types'

const PLATFORM_HOSTS: Array<{ kind: UrlKind; hosts: string[] }> = [
  { kind: 'INSTAGRAM', hosts: ['instagram.com'] },
  { kind: 'FACEBOOK', hosts: ['facebook.com', 'fb.com'] },
  { kind: 'TIKTOK', hosts: ['tiktok.com'] },
  { kind: 'LINKEDIN', hosts: ['linkedin.com'] },
]

export function classifySocialUrl(value: string): UrlKind | null {
  try {
    const host = new URL(value).hostname.replace(/^www\./, '').toLowerCase()
    return PLATFORM_HOSTS.find(({ hosts }) => hosts.some((candidate) => host === candidate || host.endsWith(`.${candidate}`)))?.kind ?? null
  } catch {
    return null
  }
}

export function socialUrlsFromWebsite(urls: string[], sourceUrl: string): ProspectUrl[] {
  const unique = new Map<string, ProspectUrl>()
  for (const value of urls) {
    const kind = classifySocialUrl(value)
    if (!kind) continue
    try {
      const normalized = new URL(value)
      normalized.search = ''
      normalized.hash = ''
      const key = `${kind}:${normalized.toString().replace(/\/$/, '')}`
      unique.set(key, { kind, url: normalized.toString(), confidence: 0.92, source: `Link op ${sourceUrl}` })
    } catch {
      continue
    }
  }
  return [...unique.values()]
}
