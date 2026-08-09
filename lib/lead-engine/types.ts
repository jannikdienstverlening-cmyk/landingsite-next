export const PIPELINE_STATUSES = [
  'NEW',
  'RESEARCHED',
  'HOT',
  'CONTACT_READY',
  'CONTACTED',
  'REPLIED',
  'INTERESTED',
  'APPOINTMENT',
  'PROPOSAL',
  'WON',
  'LOST',
  'DO_NOT_CONTACT',
] as const

export type PipelineStatus = (typeof PIPELINE_STATUSES)[number]
export type ScoreClass = 'LOW' | 'MEDIUM' | 'GOOD' | 'HOT' | 'VERY_HOT'
export type OutreachChannel = 'EMAIL' | 'INSTAGRAM' | 'LINKEDIN' | 'WHATSAPP' | 'PHONE'
export type OutreachStatus = 'READY' | 'APPROVED' | 'SENT' | 'SKIPPED' | 'SNOOZED' | 'FAILED'
export type UrlKind = 'WEBSITE' | 'GOOGLE_BUSINESS' | 'INSTAGRAM' | 'FACEBOOK' | 'TIKTOK' | 'LINKEDIN'

export type ScoreBreakdownItem = {
  key: string
  label: string
  points: number
  matched: boolean
}

export type AuditScores = {
  design: number
  seo: number
  performance: number
  conversion: number
  trust: number
}

export type WebsiteAuditSignals = {
  hasWebsite: boolean
  isHttps: boolean
  isResponsive: boolean | null
  hasTitle: boolean | null
  hasMetaDescription: boolean | null
  hasH1: boolean | null
  hasAboveFoldCta: boolean | null
  hasContactOption: boolean | null
  hasQuoteForm: boolean | null
  hasAppointmentOption: boolean | null
  hasWhatsapp: boolean | null
  hasReviews: boolean | null
  hasStructuredData: boolean | null
  hasSitemap: boolean | null
  hasRobotsTxt: boolean | null
  hasAnalytics: boolean | null
  hasGoogleTagManager: boolean | null
  hasMetaPixel: boolean | null
  hasCookieBanner: boolean | null
  hasContactDetails: boolean | null
  hasSocialLinks: boolean | null
  copyrightYear: number | null
  brokenLinks: number | null
  totalLinksChecked: number | null
  responseTimeMs: number | null
  largestContentfulPaintMs: number | null
  cumulativeLayoutShift: number | null
  interactionToNextPaintMs: number | null
  pageSpeedScore: number | null
  looksOutdated: boolean | null
  socialLinks: Partial<Record<UrlKind, string>>
  publicEmail: string | null
  publicPhone: string | null
}

export type WebsiteAudit = {
  id?: string
  url: string
  scores: AuditScores
  signals: WebsiteAuditSignals
  summary: string
  visualAssessment: string | null
  auditedAt: string
}

export type ProspectUrl = {
  kind: UrlKind
  url: string
  confidence: number
  source: string
}

export type SalesAnalysis = {
  whyInteresting: string
  biggestProblem: string
  recommendedImprovement: string
  recommendedService: string
  openingLine: string
}

export type OutreachDraft = {
  id: string
  channel: OutreachChannel
  body: string
  status: OutreachStatus
  sendMode: 'MANUAL' | 'OFFICIAL_API'
  profileUrl: string | null
  scheduledFor: string | null
}

export type Prospect = {
  id: string
  source: 'KVK' | 'OPENSTREETMAP'
  sourceRecordId: string
  kvkNumber: string | null
  establishmentNumber: string | null
  companyName: string
  tradeNames: string[]
  place: string
  postcode: string | null
  address: string | null
  legalForm: string | null
  registrationDate: string | null
  active: boolean
  employeeCount: number | null
  sbiCodes: Array<{ code: string; description: string; main: boolean }>
  websiteUrl: string | null
  phone: string | null
  email: string | null
  googleRating: number | null
  googleReviewCount: number | null
  opportunityScore: number
  scoreClass: ScoreClass
  scoreBreakdown: ScoreBreakdownItem[]
  pipelineStatus: PipelineStatus
  recommendedChannel: OutreachChannel
  nextAction: string | null
  nextActionAt: string | null
  estimatedValue: number
  urls: ProspectUrl[]
  audit: WebsiteAudit | null
  analysis: SalesAnalysis | null
  drafts: OutreachDraft[]
  notes: Array<{ id: string; body: string; createdAt: string }>
  activities: Array<{ id: string; type: string; outcome: string | null; occurredAt: string; details: Record<string, unknown> }>
  discoveredAt: string
  lastActivityAt: string | null
  suppressed: boolean
}

export type DashboardMetrics = {
  newToday: number
  veryHot: number
  hot: number
  draftsReady: number
  contactedToday: number
  replies: number
  appointments: number
  won: number
  conversionRate: number
  pipelineValue: number
  averageScore: number
}

export type DashboardData = {
  metrics: DashboardMetrics
  hotLeads: Prospect[]
  topPlaces: Array<{ label: string; value: number }>
  topBranches: Array<{ label: string; value: number }>
  bestChannel: string
  bestOpening: string
  source: 'database' | 'demo'
}
