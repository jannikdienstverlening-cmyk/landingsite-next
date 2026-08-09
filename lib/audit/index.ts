import type { AuditScores, WebsiteAudit } from '@/lib/lead-engine/types'
import { inspectWebsiteHtml } from './html'
import { runPageSpeed } from './pagespeed'

const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)))

export async function auditWebsite(url: string): Promise<{ audit: WebsiteAudit; screenshotDataUrl: string | null }> {
  const [html, pageSpeed] = await Promise.all([
    inspectWebsiteHtml(url),
    runPageSpeed(url).catch(() => null),
  ])
  const currentYear = new Date().getFullYear()
  const looksOutdated = html.signals.isResponsive === false
    || Boolean(html.signals.copyrightYear && html.signals.copyrightYear < currentYear - 3)
    || (pageSpeed?.bestPractices ?? 100) < 45
  const scores: AuditScores = {
    design: clamp(72
      - (html.signals.isResponsive ? 0 : 22)
      - (looksOutdated ? 18 : 0)
      - (html.signals.brokenLinks ? Math.min(15, html.signals.brokenLinks * 5) : 0)
      + (pageSpeed?.accessibility !== null && pageSpeed?.accessibility !== undefined ? (pageSpeed.accessibility - 70) * 0.2 : 0)),
    seo: clamp(pageSpeed?.seo ?? (35
      + (html.signals.hasTitle ? 15 : 0)
      + (html.signals.hasMetaDescription ? 12 : 0)
      + (html.signals.hasH1 ? 12 : 0)
      + (html.signals.hasStructuredData ? 10 : 0)
      + (html.signals.hasSitemap ? 8 : 0)
      + (html.signals.hasRobotsTxt ? 8 : 0))),
    performance: clamp(pageSpeed?.performance ?? (html.signals.responseTimeMs && html.signals.responseTimeMs < 1_000 ? 74 : html.signals.responseTimeMs && html.signals.responseTimeMs < 2_500 ? 55 : 35)),
    conversion: clamp(20
      + (html.signals.hasAboveFoldCta ? 20 : 0)
      + (html.signals.hasContactOption ? 15 : 0)
      + (html.signals.hasQuoteForm ? 15 : 0)
      + (html.signals.hasAppointmentOption ? 12 : 0)
      + (html.signals.hasWhatsapp ? 8 : 0)
      + (html.signals.hasReviews ? 10 : 0)),
    trust: clamp(25
      + (html.signals.isHttps ? 20 : 0)
      + (html.signals.hasContactDetails ? 18 : 0)
      + (html.signals.hasReviews ? 15 : 0)
      + (html.signals.hasCookieBanner ? 8 : 0)
      + (html.signals.hasSocialLinks ? 8 : 0)),
  }
  const weak = Object.entries(scores).sort((left, right) => left[1] - right[1]).slice(0, 2).map(([key]) => key)
  return {
    audit: {
      url: html.finalUrl,
      scores,
      signals: {
        ...html.signals,
        pageSpeedScore: pageSpeed?.performance ?? null,
        largestContentfulPaintMs: pageSpeed?.lcpMs ?? null,
        cumulativeLayoutShift: pageSpeed?.cls ?? null,
        interactionToNextPaintMs: pageSpeed?.inpMs ?? null,
        looksOutdated,
      },
      summary: `De grootste kansen liggen bij ${weak.join(' en ')}. De scan controleerde techniek, vindbaarheid, vertrouwen en conversie-elementen.`,
      visualAssessment: null,
      auditedAt: new Date().toISOString(),
    },
    screenshotDataUrl: pageSpeed?.screenshotDataUrl ?? null,
  }
}

export * from './html'
export * from './pagespeed'
