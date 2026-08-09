import { fetchPublicUrl, readLimitedText, robotsAllows } from '@/lib/compliance/safe-fetch'
import type { UrlKind, WebsiteAuditSignals } from '@/lib/lead-engine/types'
import { classifySocialUrl } from '@/lib/enrichment/social'

const CTA_TERMS = /offerte|afspraak|bel\s+(ons|mij)|neem contact|contact opnemen|plan\s+(een|je)|start vandaag|vraag aan|direct regelen|gratis advies/i
const REVIEW_TERMS = /review|beoordeling|ervaringen|klanten vertellen|trustpilot|google reviews|sterren/i

function has(pattern: RegExp, value: string) {
  return pattern.test(value)
}

function decodeHtmlAttribute(value: string) {
  return value.replace(/&amp;/g, '&').replace(/&#x27;|&#39;/g, "'").replace(/&quot;/g, '"')
}

function hrefs(html: string, base: URL) {
  const results: string[] = []
  for (const match of html.matchAll(/<a\b[^>]*\bhref\s*=\s*["']([^"']+)["'][^>]*>/gi)) {
    const raw = decodeHtmlAttribute(match[1]).trim()
    if (!raw || /^(#|mailto:|tel:|javascript:)/i.test(raw)) continue
    try { results.push(new URL(raw, base).toString()) } catch { continue }
  }
  return [...new Set(results)]
}

function publicEmail(html: string) {
  const mailto = html.match(/mailto:([a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})/i)?.[1]
  const generic = mailto?.match(/^(info|contact|hello|hallo|sales|office|receptie|service|zakelijk)@/i) ? mailto : null
  return generic?.toLowerCase() ?? null
}

function publicPhone(html: string) {
  const raw = html.match(/tel:([+()0-9 .-]{7,25})/i)?.[1]
  return raw?.replace(/\s+/g, ' ').trim() ?? null
}

function socialLinks(allHrefs: string[]) {
  const links: Partial<Record<UrlKind, string>> = {}
  for (const href of allHrefs) {
    const kind = classifySocialUrl(href)
    if (kind && !links[kind]) links[kind] = href
  }
  return links
}

async function endpointExists(value: string) {
  try {
    const { response } = await fetchPublicUrl(value, { method: 'GET', headers: { Range: 'bytes=0-1024' } })
    return response.ok
  } catch {
    return false
  }
}

async function brokenLinkCount(allHrefs: string[], root: URL) {
  const internal = allHrefs
    .filter((href) => {
      try { return new URL(href).origin === root.origin } catch { return false }
    })
    .slice(0, 10)
  const checks = await Promise.all(internal.map(async (href) => ({ href, ok: await endpointExists(href) })))
  return { broken: checks.filter(({ ok }) => !ok).length, checked: checks.length }
}

export async function inspectWebsiteHtml(urlValue: string): Promise<{
  finalUrl: string
  signals: Omit<WebsiteAuditSignals, 'pageSpeedScore' | 'largestContentfulPaintMs' | 'cumulativeLayoutShift' | 'interactionToNextPaintMs' | 'looksOutdated'>
  raw: { title: string | null; description: string | null; h1: string | null }
}> {
  const robots = await robotsAllows(urlValue)
  if (!robots.allowed) throw new Error('Website-audit overgeslagen: robots.txt staat crawling niet toe.')
  const started = Date.now()
  const { response, finalUrl } = await fetchPublicUrl(urlValue, { headers: { Accept: 'text/html,application/xhtml+xml' } })
  if (!response.ok) throw new Error(`Website gaf status ${response.status}.`)
  const contentType = response.headers.get('content-type') ?? ''
  if (!contentType.includes('text/html') && !contentType.includes('application/xhtml+xml')) throw new Error('Website retourneert geen HTML.')
  const html = await readLimitedText(response)
  const responseTimeMs = Date.now() - started
  const root = new URL(finalUrl)
  const allHrefs = hrefs(html, root)
  const links = socialLinks(allHrefs)
  const top = html.slice(0, 80_000)
  const title = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.replace(/<[^>]+>/g, '').trim() ?? null
  const description = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i)?.[1]
    ?? html.match(/<meta[^>]+content=["']([^"']*)["'][^>]+name=["']description["']/i)?.[1]
    ?? null
  const h1 = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i)?.[1]?.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() ?? null
  const copyrightYears = [...html.matchAll(/(?:©|&copy;|copyright)\s*((?:19|20)\d{2})/gi)].map((match) => Number(match[1]))
  const linkHealth = await brokenLinkCount(allHrefs, root)
  const sitemapUrl = new URL('/sitemap.xml', root).toString()

  return {
    finalUrl: finalUrl.toString(),
    raw: { title, description, h1 },
    signals: {
      hasWebsite: true,
      isHttps: root.protocol === 'https:',
      isResponsive: has(/<meta[^>]+name=["']viewport["']/i, html) && (has(/@media\s*\(/i, html) || has(/\b(grid|flex)\b/i, html)),
      hasTitle: Boolean(title && title.length >= 8),
      hasMetaDescription: Boolean(description && description.length >= 50),
      hasH1: Boolean(h1),
      hasAboveFoldCta: has(CTA_TERMS, top),
      hasContactOption: has(/href=["'](?:tel:|mailto:)|contact/i, html),
      hasQuoteForm: has(/<form\b/i, html) && has(/offerte|aanvraag|project|bericht/i, html),
      hasAppointmentOption: has(/calendly|cal\.com|afspraak|boek\s+(een|je)|plan\s+(een|je)/i, html),
      hasWhatsapp: has(/wa\.me|api\.whatsapp\.com|whatsapp/i, html),
      hasReviews: has(REVIEW_TERMS, html),
      hasStructuredData: has(/application\/ld\+json/i, html),
      hasSitemap: await endpointExists(sitemapUrl),
      hasRobotsTxt: robots.exists,
      hasAnalytics: has(/google-analytics\.com|googletagmanager\.com\/gtag|plausible\.io|matomo|analytics\.js/i, html),
      hasGoogleTagManager: has(/googletagmanager\.com\/gtm\.js|GTM-[A-Z0-9]+/i, html),
      hasMetaPixel: has(/connect\.facebook\.net|fbq\s*\(/i, html),
      hasCookieBanner: has(/cookiebot|cookieyes|complianz|cookie consent|cookies accepteren|voorkeuren/i, html),
      hasContactDetails: Boolean(publicEmail(html) || publicPhone(html) || has(/contact|adres|kvk/i, html)),
      hasSocialLinks: Object.keys(links).length > 0,
      copyrightYear: copyrightYears.length ? Math.max(...copyrightYears) : null,
      brokenLinks: linkHealth.broken,
      totalLinksChecked: linkHealth.checked,
      responseTimeMs,
      socialLinks: links,
      publicEmail: publicEmail(html),
      publicPhone: publicPhone(html),
    },
  }
}
