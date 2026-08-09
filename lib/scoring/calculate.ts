import { isExcludedDigitalBusiness } from '@/lib/lead-engine/market'
import type { ScoreBreakdownItem, ScoreClass, WebsiteAudit } from '@/lib/lead-engine/types'
import { DEFAULT_SCORING_WEIGHTS, type ScoringWeight } from './config'

export type ScoringInput = {
  registrationDate: string | null
  sbiCodes: Array<{ code: string }>
  websiteUrl: string | null
  websiteDiscoveryStatus: 'FOUND' | 'UNVERIFIED' | 'CONFIRMED_NONE'
  googleReviewCount: number | null
  instagramActive: boolean
  hasAnySocial: boolean
  audit: WebsiteAudit | null
}

export function classifyScore(score: number): ScoreClass {
  if (score >= 85) return 'VERY_HOT'
  if (score >= 75) return 'HOT'
  if (score >= 60) return 'GOOD'
  if (score >= 40) return 'MEDIUM'
  return 'LOW'
}

function youngerThanMonths(date: string | null, months: number, now: Date) {
  if (!date) return false
  const parsed = new Date(date)
  if (Number.isNaN(parsed.getTime())) return false
  const threshold = new Date(now)
  threshold.setMonth(threshold.getMonth() - months)
  return parsed >= threshold
}

export function calculateOpportunityScore(
  input: ScoringInput,
  weights: ScoringWeight[] = DEFAULT_SCORING_WEIGHTS,
  now = new Date(),
) {
  const audit = input.audit
  const noWebsite = !input.websiteUrl && input.websiteDiscoveryStatus === 'CONFIRMED_NONE'
  const poorSite = Boolean(audit && (audit.scores.design < 45 || audit.signals.looksOutdated))
  const modernSite = Boolean(audit && audit.scores.design >= 78 && audit.scores.performance >= 70 && audit.scores.conversion >= 70)
  const rules: Record<string, boolean> = {
    no_website: noWebsite,
    outdated_website: poorSite,
    not_mobile_friendly: audit?.signals.isResponsive === false,
    young_business: youngerThanMonths(input.registrationDate, 12, now),
    active_instagram_bad_site: input.instagramActive && (noWebsite || poorSite),
    google_reviews_20: (input.googleReviewCount ?? 0) >= 20,
    slow_website: Boolean(audit && (audit.scores.performance < 50 || (audit.signals.largestContentfulPaintMs ?? 0) > 4_000)),
    no_cta: audit?.signals.hasAboveFoldCta === false,
    no_quote_or_booking: Boolean(audit && !audit.signals.hasQuoteForm && !audit.signals.hasAppointmentOption),
    social_only: noWebsite && input.hasAnySocial,
    modern_professional: modernSite,
    digital_agency: isExcludedDigitalBusiness(input.sbiCodes),
  }

  const breakdown: ScoreBreakdownItem[] = weights.map((weight) => ({
    key: weight.key,
    label: weight.label,
    points: weight.value,
    matched: weight.enabled && Boolean(rules[weight.key]),
  }))
  const raw = breakdown.reduce((total, item) => total + (item.matched ? item.points : 0), 0)
  const score = Math.max(0, Math.min(100, raw))
  return { score, scoreClass: classifyScore(score), breakdown }
}
