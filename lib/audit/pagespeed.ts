import 'server-only'
import { assertPublicHttpUrl } from '@/lib/compliance/safe-fetch'

type LighthouseAudit = { numericValue?: number; score?: number; details?: { data?: string } }
type PageSpeedResponse = {
  lighthouseResult?: {
    categories?: Record<string, { score?: number }>
    audits?: Record<string, LighthouseAudit>
  }
  loadingExperience?: { metrics?: Record<string, { percentile?: number }> }
  originLoadingExperience?: { metrics?: Record<string, { percentile?: number }> }
}

export type PageSpeedResult = {
  performance: number | null
  seo: number | null
  accessibility: number | null
  bestPractices: number | null
  lcpMs: number | null
  cls: number | null
  inpMs: number | null
  screenshotDataUrl: string | null
}

const categoryScore = (data: PageSpeedResponse, category: string) => {
  const score = data.lighthouseResult?.categories?.[category]?.score
  return typeof score === 'number' ? Math.round(score * 100) : null
}

export async function runPageSpeed(urlValue: string): Promise<PageSpeedResult | null> {
  await assertPublicHttpUrl(urlValue)
  const endpoint = new URL('https://pagespeedonline.googleapis.com/pagespeedonline/v5/runPagespeed')
  endpoint.searchParams.set('url', urlValue)
  endpoint.searchParams.set('strategy', 'mobile')
  endpoint.searchParams.set('locale', 'nl')
  for (const category of ['PERFORMANCE', 'SEO', 'ACCESSIBILITY', 'BEST_PRACTICES']) endpoint.searchParams.append('category', category)
  if (process.env.GOOGLE_PAGESPEED_API_KEY) endpoint.searchParams.set('key', process.env.GOOGLE_PAGESPEED_API_KEY)
  const response = await fetch(endpoint, { signal: AbortSignal.timeout(60_000), cache: 'no-store' })
  if (!response.ok) return null
  const data = await response.json() as PageSpeedResponse
  const metrics = data.loadingExperience?.metrics ?? data.originLoadingExperience?.metrics ?? {}
  const audits = data.lighthouseResult?.audits ?? {}
  const lcp = metrics.LARGEST_CONTENTFUL_PAINT_MS?.percentile ?? audits['largest-contentful-paint']?.numericValue
  const clsMetric = metrics.CUMULATIVE_LAYOUT_SHIFT_SCORE?.percentile
  const cls = clsMetric !== undefined ? clsMetric / 100 : audits['cumulative-layout-shift']?.numericValue
  const inp = metrics.INTERACTION_TO_NEXT_PAINT?.percentile ?? audits['interaction-to-next-paint']?.numericValue
  return {
    performance: categoryScore(data, 'performance'),
    seo: categoryScore(data, 'seo'),
    accessibility: categoryScore(data, 'accessibility'),
    bestPractices: categoryScore(data, 'best-practices'),
    lcpMs: typeof lcp === 'number' ? Math.round(lcp) : null,
    cls: typeof cls === 'number' ? Number(cls.toFixed(3)) : null,
    inpMs: typeof inp === 'number' ? Math.round(inp) : null,
    screenshotDataUrl: audits['final-screenshot']?.details?.data ?? null,
  }
}
