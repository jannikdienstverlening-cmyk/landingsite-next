import 'server-only'
import { fetchPublicUrl, readLimitedText, robotsAllows } from '@/lib/compliance/safe-fetch'
import { websiteCandidateDomains, websiteMatchConfidence } from './website-candidates'

const DISCOVERY_TIMEOUT_MS = 7_000

function textContent(html: string) {
  return html
    .replace(/<script\b[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style\b[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&(?:amp|nbsp|quot|#39|#x27);/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function tagText(html: string, tag: 'title' | 'h1') {
  return html.match(new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'))?.[1]
    ?.replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim() ?? null
}

async function inspectCandidate(domain: string, input: WebsiteDiscoveryInput) {
  for (const protocol of ['https:', 'http:']) {
    try {
      const target = `${protocol}//${domain}`
      const robots = await robotsAllows(target, DISCOVERY_TIMEOUT_MS)
      if (!robots.allowed) return null
      const { response, finalUrl } = await fetchPublicUrl(target, {
        headers: { Accept: 'text/html,application/xhtml+xml' },
        signal: AbortSignal.timeout(DISCOVERY_TIMEOUT_MS),
      })
      if (!response.ok) continue
      const contentType = response.headers.get('content-type') ?? ''
      if (!contentType.includes('text/html') && !contentType.includes('application/xhtml+xml')) continue
      const html = await readLimitedText(response, 600_000)
      const pageText = textContent(html)
      const match = websiteMatchConfidence({
        ...input,
        candidateDomain: new URL(finalUrl).hostname.replace(/^www\./, ''),
        title: tagText(html, 'title'),
        heading: tagText(html, 'h1'),
        pageText,
      })
      if (match.accepted) return { website: finalUrl.toString(), confidence: match.confidence, evidence: match.evidence }
    } catch {
      continue
    }
  }
  return null
}

export type WebsiteDiscoveryInput = {
  companyName: string
  place: string
  postcode?: string | null
  address?: string | null
  phone?: string | null
}

export async function discoverCompanyWebsite(input: WebsiteDiscoveryInput) {
  const candidates = websiteCandidateDomains(input.companyName, Number(process.env.WEBSITE_DISCOVERY_MAX_CANDIDATES ?? 8))
  for (let offset = 0; offset < candidates.length; offset += 4) {
    const batch = candidates.slice(offset, offset + 4)
    const results = await Promise.all(batch.map((domain) => inspectCandidate(domain, input).catch(() => null)))
    const best = results.filter((result): result is NonNullable<typeof result> => Boolean(result))
      .sort((left, right) => right.confidence - left.confidence)[0]
    if (best) return best
  }
  return null
}
