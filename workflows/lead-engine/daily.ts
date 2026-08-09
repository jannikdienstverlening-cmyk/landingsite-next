import { auditWebsite } from '@/lib/audit'
import { assessWebsiteVisual, generateSalesPackage } from '@/lib/ai'
import {
  getProspect,
  getScoringWeights,
  leadEngineDemoMode,
  listProspects,
  logLeadEngineSystemError,
  logProspectProcessingError,
  markMutationProcessed,
  purgeExpiredUncontactedProspects,
  recordJobRun,
  saveEnrichment,
  saveMutationEvent,
  saveProspectScore,
  saveSalesPackage,
  saveWebsiteAudit,
  upsertDiscoveredCompanies,
} from '@/lib/crm'
import { discoverCompanyWebsite, findGoogleBusiness, socialUrlsFromWebsite } from '@/lib/enrichment'
import { discoverOpenStreetMapCompanies } from '@/lib/discovery'
import { PHASE_ONE_MARKET } from '@/lib/lead-engine/market'
import type { ProspectUrl } from '@/lib/lead-engine/types'
import { discoverKvkCompanies, discoverKvkCompanyByNumber, pullKvkMutations } from '@/lib/kvk'
import { buildOutreachDrafts, recommendedOutreachChannel } from '@/lib/outreach'
import { calculateOpportunityScore } from '@/lib/scoring'

type JobCounters = { discovered: number; mutations: number; processed: number; failed: number; purged: number }

function errorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message
  if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') return error.message
  if (typeof error === 'string' && error) return error
  return fallback
}

async function startJob(jobId: string) {
  'use step'
  await recordJobRun({ workflowRunId: jobId, jobType: 'DAILY_LEAD_PIPELINE', status: 'RUNNING' })
}

async function discoverCompanies() {
  'use step'
  if (leadEngineDemoMode()) return { count: 0 }
  const configuredProvider = process.env.LEAD_DISCOVERY_PROVIDER?.trim().toUpperCase()
  const provider = configuredProvider || (process.env.KVK_API_KEY ? 'KVK' : 'OPENSTREETMAP')
  try {
    const companies = provider === 'KVK'
      ? await discoverKvkCompanies({
        places: PHASE_ONE_MARKET.places,
        includeInactive: false,
        maxResultsPerPlace: Number(process.env.KVK_DISCOVERY_LIMIT_PER_PLACE ?? 20),
      })
      : provider === 'OPENSTREETMAP'
        ? await discoverOpenStreetMapCompanies({
          places: PHASE_ONE_MARKET.places,
          maxResultsPerPlace: Number(process.env.OSM_DISCOVERY_LIMIT_PER_PLACE ?? 25),
        })
        : (() => { throw new Error(`Onbekende discovery-provider: ${provider}.`) })()
    return upsertDiscoveredCompanies(companies)
  } catch (error) {
    await logLeadEngineSystemError('DISCOVERY', errorMessage(error, 'Discovery-bron tijdelijk niet beschikbaar.'))
    return { count: 0 }
  }
}
discoverCompanies.maxRetries = 2

async function ingestMutations() {
  'use step'
  if (leadEngineDemoMode() || !process.env.KVK_MUTATION_ENABLED || process.env.KVK_MUTATION_ENABLED === 'false') return { count: 0 }
  const until = new Date().toISOString()
  const from = new Date(Date.now() - 26 * 60 * 60_000).toISOString()
  const signals = await pullKvkMutations({ from, until })
  let count = 0
  for (const signal of signals) {
    const inserted = await saveMutationEvent(signal)
    if (!inserted) continue
    if (signal.kvkNumber && /nieuw|inschrijving/i.test(signal.signalType)) {
      const company = await discoverKvkCompanyByNumber(signal.kvkNumber)
      if (company && PHASE_ONE_MARKET.places.some((place) => place.toLocaleLowerCase('nl-NL') === company.place.toLocaleLowerCase('nl-NL'))) {
        await upsertDiscoveredCompanies([company])
      }
    }
    await markMutationProcessed(signal.eventId)
    count += 1
  }
  return { count }
}
ingestMutations.maxRetries = 4

async function loadBatch() {
  'use step'
  const prospects = await listProspects()
  return prospects.filter((prospect) => ['NEW', 'RESEARCHED'].includes(prospect.pipelineStatus)
    && !prospect.drafts.some(({ status }) => status === 'READY'))
    .slice(0, Number(process.env.LEAD_ENGINE_DAILY_BATCH_SIZE ?? 25)).map(({ id }) => id)
}

async function enrichProspect(prospectId: string) {
  'use step'
  const prospect = await getProspect(prospectId)
  if (!prospect || prospect.suppressed || !prospect.active) return null
  const [google, directWebsite] = await Promise.all([
    findGoogleBusiness({
      companyName: prospect.companyName,
      place: prospect.place,
      address: prospect.address,
      phone: prospect.phone,
      website: prospect.websiteUrl,
    }),
    prospect.websiteUrl ? Promise.resolve(null) : discoverCompanyWebsite({
      companyName: prospect.companyName,
      place: prospect.place,
      postcode: prospect.postcode,
      address: prospect.address,
      phone: prospect.phone,
    }),
  ])
  const websiteUrl = google?.website ?? prospect.websiteUrl ?? directWebsite?.website ?? null
  const urls: ProspectUrl[] = [...prospect.urls]
  if (google?.website) urls.push({ kind: 'WEBSITE', url: google.website, confidence: google.confidence, source: 'Google Places API' })
  if (!google?.website && directWebsite) urls.push({
    kind: 'WEBSITE',
    url: directWebsite.website,
    confidence: directWebsite.confidence,
    source: 'Directe domeinverificatie op bedrijfsnaam en locatie',
  })
  if (google?.googleMapsUrl) urls.push({ kind: 'GOOGLE_BUSINESS', url: google.googleMapsUrl, confidence: google.confidence, source: 'Google Places API' })
  await saveEnrichment(prospectId, {
    websiteUrl,
    phone: google?.phone ?? prospect.phone,
    email: prospect.email,
    googlePlaceId: google?.placeId ?? null,
    googleRating: google?.rating ?? prospect.googleRating,
    googleReviewCount: google?.reviewCount ?? prospect.googleReviewCount,
    urls,
  })
  return websiteUrl
}
enrichProspect.maxRetries = 3

async function auditProspect(prospectId: string, websiteUrl: string | null) {
  'use step'
  if (!websiteUrl) return null
  const prospect = await getProspect(prospectId)
  if (!prospect) return null
  const result = await auditWebsite(websiteUrl)
  const visual = await assessWebsiteVisual(result.screenshotDataUrl)
  const audit = visual ? {
    ...result.audit,
    scores: { ...result.audit.scores, design: Math.round((result.audit.scores.design + visual.designScore) / 2) },
    signals: { ...result.audit.signals, looksOutdated: visual.looksOutdated || result.audit.signals.looksOutdated },
    visualAssessment: visual.summary,
  } : result.audit
  await saveWebsiteAudit(prospectId, audit)
  const social = socialUrlsFromWebsite(Object.values(audit.signals.socialLinks).filter((value): value is string => Boolean(value)), audit.url)
  await saveEnrichment(prospectId, {
    websiteUrl: audit.url,
    phone: audit.signals.publicPhone ?? prospect.phone,
    email: audit.signals.publicEmail ?? prospect.email,
    googlePlaceId: undefined,
    googleRating: prospect.googleRating,
    googleReviewCount: prospect.googleReviewCount,
    urls: [...prospect.urls, ...social],
  })
  return audit
}
auditProspect.maxRetries = 2

async function scoreProspect(prospectId: string) {
  'use step'
  const [prospect, weights] = await Promise.all([getProspect(prospectId), getScoringWeights()])
  if (!prospect) return null
  const result = calculateOpportunityScore({
    registrationDate: prospect.registrationDate,
    sbiCodes: prospect.sbiCodes,
    websiteUrl: prospect.websiteUrl,
    websiteDiscoveryStatus: prospect.websiteUrl ? 'FOUND' : 'UNVERIFIED',
    googleReviewCount: prospect.googleReviewCount,
    instagramActive: prospect.urls.some(({ kind, source }) => kind === 'INSTAGRAM' && /recente activiteit|activity verified/i.test(source)),
    hasAnySocial: prospect.urls.some(({ kind }) => ['INSTAGRAM','FACEBOOK','TIKTOK','LINKEDIN'].includes(kind)),
    audit: prospect.audit,
  }, weights)
  await saveProspectScore(prospectId, result)
  return result
}

async function analyzeProspect(prospectId: string) {
  'use step'
  const prospect = await getProspect(prospectId)
  if (!prospect || prospect.suppressed || prospect.opportunityScore < 40 || prospect.drafts.some(({ status }) => status === 'READY')) return
  const salesPackage = await generateSalesPackage(prospect)
  const drafts = buildOutreachDrafts(prospect, salesPackage)
  const channel = recommendedOutreachChannel(prospect)
  await saveSalesPackage(prospectId, salesPackage, drafts, channel)
}
analyzeProspect.maxRetries = 2

async function recordProspectFailure(prospectId: string, stage: string, error: string) {
  'use step'
  await logProspectProcessingError(prospectId, stage, error)
}

async function finishJob(jobId: string, status: 'COMPLETED' | 'FAILED', counters: JobCounters, error?: string) {
  'use step'
  await recordJobRun({ workflowRunId: jobId, jobType: 'DAILY_LEAD_PIPELINE', status, counters, error })
}

async function enforceRetention() {
  'use step'
  return purgeExpiredUncontactedProspects()
}

export async function leadEngineDailyWorkflow(jobId: string) {
  'use workflow'
  const counters: JobCounters = { discovered: 0, mutations: 0, processed: 0, failed: 0, purged: 0 }
  await startJob(jobId)
  try {
    const [discovery, mutations] = await Promise.all([discoverCompanies(), ingestMutations()])
    counters.discovered = discovery.count
    counters.mutations = mutations.count
    const prospectIds = await loadBatch()
    for (const prospectId of prospectIds) {
      try {
        const website = await enrichProspect(prospectId)
        try {
          await auditProspect(prospectId, website)
        } catch (error) {
          counters.failed += 1
          await recordProspectFailure(prospectId, 'WEBSITE_AUDIT', errorMessage(error, 'Website-audit kon niet worden afgerond.'))
        }
        await scoreProspect(prospectId)
        await analyzeProspect(prospectId)
        counters.processed += 1
      } catch (error) {
        counters.failed += 1
        await recordProspectFailure(prospectId, 'PIPELINE', errorMessage(error, 'Onbekende fout'))
      }
    }
    counters.purged = await enforceRetention()
    await finishJob(jobId, 'COMPLETED', counters)
    return counters
  } catch (error) {
    const message = errorMessage(error, 'Onbekende workflowfout')
    await finishJob(jobId, 'FAILED', counters, message)
    throw error
  }
}
