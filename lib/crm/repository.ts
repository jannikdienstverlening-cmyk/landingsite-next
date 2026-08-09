import 'server-only'
import { randomBytes, randomUUID } from 'node:crypto'
import type { DemoConcept } from '@/lib/ai/demo'
import type { GeneratedSalesPackage } from '@/lib/ai/sales-analysis'
import type { DiscoveredCompany, KvkMutationSignal } from '@/lib/kvk/types'
import type {
  DashboardData,
  OutreachChannel,
  OutreachDraft,
  PipelineStatus,
  Prospect,
  ProspectUrl,
  SalesAnalysis,
  ScoreBreakdownItem,
  WebsiteAudit,
  WebsiteAuditSignals,
} from '@/lib/lead-engine/types'
import type { ScoringWeight } from '@/lib/scoring/config'
import { DEFAULT_SCORING_WEIGHTS } from '@/lib/scoring/config'
import { getSupabase } from '@/lib/supabase'
import { demoDashboard, DEMO_PROSPECTS } from './demo-data'

type Row = Record<string, unknown>
const row = (value: unknown): Row => value && typeof value === 'object' && !Array.isArray(value) ? value as Row : {}
const rows = (value: unknown) => Array.isArray(value) ? value.map(row) : []
const latest = (value: unknown, dateField: string) => rows(value).sort((left, right) => string(right[dateField]).localeCompare(string(left[dateField])))[0] ?? {}
const string = (value: unknown, fallback = '') => typeof value === 'string' ? value : fallback
const nullableString = (value: unknown) => typeof value === 'string' && value ? value : null
const number = (value: unknown, fallback = 0) => typeof value === 'number' ? value : typeof value === 'string' && value ? Number(value) : fallback
function assertNoDbError(context: string, results: Array<{ error: { message: string } | null }>) {
  const failure = results.find(({ error }) => error)?.error
  if (failure) throw new Error(`${context}: ${failure.message}`)
}

export function leadEngineDemoMode() {
  return process.env.LEAD_ENGINE_DEMO_MODE === 'true'
    || (!process.env.NEXT_PUBLIC_SUPABASE_URL && !process.env.SUPABASE_SERVICE_ROLE_KEY)
}

function mapAudit(value: unknown): WebsiteAudit | null {
  const audit = latest(value, 'audited_at')
  if (!audit.id) return null
  return {
    id: string(audit.id),
    url: string(audit.url),
    scores: {
      design: number(audit.design_score),
      seo: number(audit.seo_score),
      performance: number(audit.performance_score),
      conversion: number(audit.conversion_score),
      trust: number(audit.trust_score),
    },
    signals: row(audit.signals) as WebsiteAuditSignals,
    summary: string(audit.summary),
    visualAssessment: nullableString(audit.visual_assessment),
    auditedAt: string(audit.audited_at),
  }
}

function mapAnalysis(value: unknown): SalesAnalysis | null {
  const analysis = latest(value, 'created_at')
  if (!analysis.id) return null
  return {
    whyInteresting: string(analysis.why_interesting),
    biggestProblem: string(analysis.biggest_problem),
    recommendedImprovement: string(analysis.recommended_improvement),
    recommendedService: string(analysis.recommended_service),
    openingLine: string(analysis.opening_line),
  }
}

function mapUrls(value: unknown): ProspectUrl[] {
  return rows(value).map((url) => ({
    kind: string(url.kind) as ProspectUrl['kind'],
    url: string(url.url),
    confidence: number(url.confidence),
    source: string(url.source),
  }))
}

function mapDrafts(value: unknown): OutreachDraft[] {
  return rows(value).map((draft) => ({
    id: string(draft.id),
    channel: string(draft.channel) as OutreachDraft['channel'],
    body: string(draft.body),
    status: string(draft.status) as OutreachDraft['status'],
    sendMode: string(draft.send_mode, 'MANUAL') as OutreachDraft['sendMode'],
    profileUrl: nullableString(draft.profile_url),
    scheduledFor: nullableString(draft.scheduled_for),
  }))
}

function mapNotes(value: unknown): Prospect['notes'] {
  return rows(value).map((note) => ({ id: string(note.id), body: string(note.body), createdAt: string(note.created_at) }))
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))
}

function mapActivities(value: unknown): Prospect['activities'] {
  return rows(value).map((activity) => ({
    id: string(activity.id), type: string(activity.type), outcome: nullableString(activity.outcome),
    occurredAt: string(activity.occurred_at), details: row(activity.details),
  })).sort((left, right) => right.occurredAt.localeCompare(left.occurredAt))
}

function mapProspect(value: unknown, suppressionValues = new Set<string>()): Prospect {
  const source = row(value)
  const sourcePayload = row(source.source_payload)
  const latestScore = latest(source.prospect_scores, 'created_at')
  const storedUrls = mapUrls(source.prospect_urls)
  const payloadUrls = Array.isArray(sourcePayload.publicUrls) ? sourcePayload.publicUrls.map((entry) => row(entry)).map((url) => ({
    kind: string(url.kind) as ProspectUrl['kind'],
    url: string(url.url),
    confidence: number(url.confidence),
    source: string(url.source),
  })).filter((url) => url.kind && url.url) : []
  const urls = [...new Map([...storedUrls, ...payloadUrls].map((url) => [`${url.kind}:${url.url}`, url])).values()]
  const discoverySource = string(source.source, 'KVK') as Prospect['source']
  const sourceRecordId = string(source.source_record_id, nullableString(source.kvk_number) ?? string(source.dedupe_key))
  return {
    id: string(source.id),
    source: discoverySource,
    sourceRecordId,
    kvkNumber: nullableString(source.kvk_number),
    establishmentNumber: nullableString(source.establishment_number),
    companyName: string(source.company_name),
    tradeNames: Array.isArray(source.trade_names) ? source.trade_names.filter((entry): entry is string => typeof entry === 'string') : [],
    place: string(source.place),
    postcode: nullableString(source.postcode),
    address: nullableString(source.address),
    legalForm: nullableString(source.legal_form),
    registrationDate: nullableString(source.registration_date),
    active: source.active !== false,
    employeeCount: source.employee_count === null || source.employee_count === undefined ? null : number(source.employee_count),
    sbiCodes: Array.isArray(source.sbi_codes) ? source.sbi_codes as Prospect['sbiCodes'] : [],
    websiteUrl: nullableString(source.website_url) ?? nullableString(sourcePayload.publicWebsite),
    phone: nullableString(source.phone) ?? nullableString(sourcePayload.publicPhone),
    email: nullableString(source.email) ?? nullableString(sourcePayload.publicEmail),
    googleRating: source.google_rating === null || source.google_rating === undefined ? null : number(source.google_rating),
    googleReviewCount: source.google_review_count === null || source.google_review_count === undefined ? null : number(source.google_review_count),
    opportunityScore: number(source.opportunity_score),
    scoreClass: string(source.score_class, 'LOW') as Prospect['scoreClass'],
    scoreBreakdown: Array.isArray(latestScore.breakdown) ? latestScore.breakdown as ScoreBreakdownItem[] : [],
    pipelineStatus: string(source.pipeline_status, 'NEW') as PipelineStatus,
    recommendedChannel: string(source.recommended_channel, 'PHONE') as OutreachChannel,
    nextAction: nullableString(source.next_action),
    nextActionAt: nullableString(source.next_action_at),
    estimatedValue: number(source.estimated_value_cents) / 100,
    urls,
    audit: mapAudit(source.website_audits),
    analysis: mapAnalysis(source.sales_analyses),
    drafts: mapDrafts(source.outreach_drafts),
    notes: mapNotes(source.crm_notes),
    activities: mapActivities(source.crm_activities),
    discoveredAt: string(source.discovered_at),
    lastActivityAt: nullableString(source.last_activity_at),
    suppressed: Boolean(source.kvk_number && suppressionValues.has(`KVK:${string(source.kvk_number)}`))
      || suppressionValues.has(`SOURCE:${discoverySource}:${sourceRecordId}`)
      || Boolean(source.email && suppressionValues.has(`EMAIL:${string(source.email).toLowerCase()}`))
      || string(source.pipeline_status) === 'DO_NOT_CONTACT',
  }
}

const prospectSelect = `
  *,
  prospect_urls(*),
  website_audits(*),
  prospect_scores(*),
  sales_analyses(*),
  outreach_drafts(*),
  crm_notes(*),
  crm_activities(*)
`

async function suppressionSet() {
  const { data, error } = await getSupabase().from('suppression_list').select('kind,normalized_value')
  if (error) throw new Error(`Suppressionlijst ophalen mislukt: ${error.message}`)
  return new Set((data ?? []).map((entry) => `${entry.kind}:${entry.normalized_value}`))
}

export type ProspectFilters = {
  place?: string
  score?: string
  website?: 'yes' | 'no'
  social?: string
  status?: string
  query?: string
  branch?: string
  age?: 'lt12' | '12to36' | 'gt36'
}

function matchesAge(registrationDate: string | null, age: ProspectFilters['age']) {
  if (!age) return true
  if (!registrationDate) return false
  const date = new Date(registrationDate)
  if (Number.isNaN(date.getTime())) return false
  const months = (new Date().getFullYear() - date.getFullYear()) * 12 + new Date().getMonth() - date.getMonth()
  return age === 'lt12' ? months < 12 : age === '12to36' ? months >= 12 && months <= 36 : months > 36
}

export async function listProspects(filters: ProspectFilters = {}): Promise<Prospect[]> {
  if (leadEngineDemoMode()) return DEMO_PROSPECTS.filter((prospect) => {
    if (filters.place && prospect.place !== filters.place) return false
    if (filters.score && prospect.scoreClass !== filters.score) return false
    if (filters.website === 'yes' && !prospect.websiteUrl) return false
    if (filters.website === 'no' && prospect.websiteUrl) return false
    if (filters.social && !prospect.urls.some(({ kind }) => kind === filters.social)) return false
    if (filters.status && prospect.pipelineStatus !== filters.status) return false
    if (filters.query && !`${prospect.companyName} ${prospect.place}`.toLowerCase().includes(filters.query.toLowerCase())) return false
    if (filters.branch && !prospect.sbiCodes.some(({ code, description }) => code.startsWith(filters.branch!) || description.toLowerCase().includes(filters.branch!.toLowerCase()))) return false
    if (!matchesAge(prospect.registrationDate, filters.age)) return false
    return true
  })

  let query = getSupabase().from('prospects').select(prospectSelect).order('opportunity_score', { ascending: false }).limit(500)
  if (filters.place) query = query.eq('place', filters.place)
  if (filters.score) query = query.eq('score_class', filters.score)
  if (filters.website === 'yes') query = query.not('website_url', 'is', null)
  if (filters.website === 'no') query = query.is('website_url', null)
  if (filters.status) query = query.eq('pipeline_status', filters.status)
  if (filters.query) query = query.ilike('company_name', `%${filters.query.replace(/[%_,]/g, '')}%`)
  const [{ data, error }, suppressed] = await Promise.all([query, suppressionSet()])
  if (error) throw new Error(`Prospects ophalen mislukt: ${error.message}`)
  let prospects = (data ?? []).map((entry) => mapProspect(entry, suppressed))
  if (filters.social) prospects = prospects.filter((prospect) => prospect.urls.some(({ kind }) => kind === filters.social))
  if (filters.branch) prospects = prospects.filter((prospect) => prospect.sbiCodes.some(({ code, description }) => code.startsWith(filters.branch!) || description.toLowerCase().includes(filters.branch!.toLowerCase())))
  if (filters.age) prospects = prospects.filter((prospect) => matchesAge(prospect.registrationDate, filters.age))
  return prospects
}

export async function getProspect(id: string) {
  if (leadEngineDemoMode()) return DEMO_PROSPECTS.find((prospect) => prospect.id === id) ?? null
  const [{ data, error }, suppressed] = await Promise.all([
    getSupabase().from('prospects').select(prospectSelect).eq('id', id).single(),
    suppressionSet(),
  ])
  if (error && error.code !== 'PGRST116') throw new Error(`Prospect ophalen mislukt: ${error.message}`)
  return data ? mapProspect(data, suppressed) : null
}

export async function getDashboardData(): Promise<DashboardData> {
  if (leadEngineDemoMode()) return demoDashboard()
  const prospects = await listProspects()
  const today = new Date().toISOString().slice(0, 10)
  const countBy = (values: string[]) => [...values.reduce((map, value) => map.set(value, (map.get(value) ?? 0) + 1), new Map<string, number>())]
    .map(([label, value]) => ({ label, value })).sort((left, right) => right.value - left.value).slice(0, 5)
  const contactedToday = prospects.filter((prospect) => prospect.pipelineStatus === 'CONTACTED' && prospect.lastActivityAt?.startsWith(today)).length
  const won = prospects.filter((prospect) => prospect.pipelineStatus === 'WON').length
  const contacted = prospects.filter((prospect) => ['CONTACTED','REPLIED','INTERESTED','APPOINTMENT','PROPOSAL','WON','LOST'].includes(prospect.pipelineStatus)).length
  return {
    metrics: {
      newToday: prospects.filter((prospect) => prospect.discoveredAt.startsWith(today)).length,
      veryHot: prospects.filter((prospect) => prospect.scoreClass === 'VERY_HOT').length,
      hot: prospects.filter((prospect) => prospect.scoreClass === 'HOT').length,
      draftsReady: prospects.reduce((total, prospect) => total + prospect.drafts.filter((draft) => draft.status === 'READY').length, 0),
      contactedToday,
      replies: prospects.filter((prospect) => ['REPLIED','INTERESTED','APPOINTMENT','PROPOSAL','WON'].includes(prospect.pipelineStatus)).length,
      appointments: prospects.filter((prospect) => prospect.pipelineStatus === 'APPOINTMENT').length,
      won,
      conversionRate: contacted ? Number(((won / contacted) * 100).toFixed(1)) : 0,
      pipelineValue: prospects.filter((prospect) => !['WON','LOST','DO_NOT_CONTACT'].includes(prospect.pipelineStatus)).reduce((sum, prospect) => sum + prospect.estimatedValue, 0),
      averageScore: prospects.length ? Math.round(prospects.reduce((sum, prospect) => sum + prospect.opportunityScore, 0) / prospects.length) : 0,
    },
    hotLeads: prospects.filter((prospect) => ['VERY_HOT','HOT'].includes(prospect.scoreClass) && !prospect.suppressed).slice(0, 8),
    topPlaces: countBy(prospects.map((prospect) => prospect.place || 'Onbekend')),
    topBranches: countBy(prospects.map((prospect) => prospect.sbiCodes.find(({ main }) => main)?.description ?? 'Onbekend')),
    bestChannel: 'Nog onvoldoende uitkomstdata',
    bestOpening: 'Nog onvoldoende uitkomstdata',
    source: 'database',
  }
}

export async function upsertDiscoveredCompanies(companies: DiscoveredCompany[]) {
  if (leadEngineDemoMode() || !companies.length) return { count: companies.length }
  const now = new Date().toISOString()
  const { error } = await getSupabase().from('prospects').upsert(companies.map((company) => ({
    dedupe_key: company.dedupeKey,
    kvk_number: company.kvkNumber,
    establishment_number: company.establishmentNumber,
    source: company.source,
    source_record_id: company.sourceRecordId,
    company_name: company.companyName,
    trade_names: company.tradeNames,
    place: company.place,
    postcode: company.postcode,
    address: company.address,
    legal_form: company.legalForm,
    registration_date: company.registrationDate,
    active: company.active,
    employee_count: company.employeeCount,
    non_mailing: company.nonMailing,
    sbi_codes: company.sbiCodes,
    source_payload: {
      ...company.sourcePayload,
      publicWebsite: company.websiteUrl,
      publicPhone: company.phone,
      publicEmail: company.email,
      publicUrls: company.urls,
    },
    legitimate_interest_note: company.source === 'OPENSTREETMAP'
      ? 'Openbare bedrijfsvermelding uit OpenStreetMap; identiteit en zakelijk belang handmatig valideren vóór outreach.'
      : 'Bedrijfsgegevens uit het KVK Handelsregister; doelbinding en contractvoorwaarden vóór outreach controleren.',
    retention_until: new Date(Date.now() + 180 * 86_400_000).toISOString(),
    updated_at: now,
  })), { onConflict: 'dedupe_key' })
  if (error) throw new Error(`Ontdekte prospects opslaan mislukt: ${error.message}`)
  return { count: companies.length }
}

export async function saveEnrichment(prospectId: string, input: {
  websiteUrl: string | null
  phone: string | null
  email: string | null
  googlePlaceId?: string | null
  googleRating?: number | null
  googleReviewCount?: number | null
  urls: ProspectUrl[]
}) {
  if (leadEngineDemoMode()) return
  const supabase = getSupabase()
  const now = new Date().toISOString()
  const { error } = await supabase.from('prospects').update({
    website_url: input.websiteUrl,
    phone: input.phone,
    email: input.email,
    ...(input.googlePlaceId !== undefined ? { google_place_id: input.googlePlaceId } : {}),
    ...(input.googleRating !== undefined ? { google_rating: input.googleRating } : {}),
    ...(input.googleReviewCount !== undefined ? { google_review_count: input.googleReviewCount } : {}),
    pipeline_status: 'RESEARCHED',
    last_enriched_at: now,
    updated_at: now,
  }).eq('id', prospectId)
  if (error) throw new Error(`Enrichment opslaan mislukt: ${error.message}`)
  if (input.urls.length) {
    const { error: urlError } = await supabase.from('prospect_urls').upsert(input.urls.map((entry) => ({
      prospect_id: prospectId,
      kind: entry.kind,
      url: entry.url,
      normalized_url: entry.url.toLowerCase().replace(/[?#].*$/, '').replace(/\/$/, ''),
      confidence: entry.confidence,
      source: entry.source,
      verified_at: now,
    })), { onConflict: 'prospect_id,kind,normalized_url' })
    if (urlError) throw new Error(`Prospect-URL opslaan mislukt: ${urlError.message}`)
  }
}

export async function saveWebsiteAudit(prospectId: string, audit: WebsiteAudit) {
  if (leadEngineDemoMode()) return
  const now = new Date().toISOString()
  const [{ error }, { error: updateError }] = await Promise.all([
    getSupabase().from('website_audits').insert({
      prospect_id: prospectId, url: audit.url,
      design_score: audit.scores.design, seo_score: audit.scores.seo, performance_score: audit.scores.performance,
      conversion_score: audit.scores.conversion, trust_score: audit.scores.trust,
      signals: audit.signals, summary: audit.summary, visual_assessment: audit.visualAssessment, audited_at: audit.auditedAt,
    }),
    getSupabase().from('prospects').update({ last_audited_at: now, updated_at: now }).eq('id', prospectId),
  ])
  if (error || updateError) throw new Error(`Website-audit opslaan mislukt: ${error?.message ?? updateError?.message}`)
}

export async function getScoringWeights(): Promise<ScoringWeight[]> {
  if (leadEngineDemoMode()) return DEFAULT_SCORING_WEIGHTS
  const { data, error } = await getSupabase().from('score_weights').select('*').order('key')
  if (error) throw new Error(`Scoregewichten ophalen mislukt: ${error.message}`)
  return (data ?? []).map((entry) => ({ key: entry.key, label: entry.label, value: entry.value, enabled: entry.enabled }))
}

export async function updateScoringWeights(weights: ScoringWeight[]) {
  if (leadEngineDemoMode()) return
  const { error } = await getSupabase().from('score_weights').upsert(weights.map((weight) => ({
    key: weight.key,
    label: weight.label,
    value: weight.value,
    enabled: weight.enabled,
    updated_at: new Date().toISOString(),
  })), { onConflict: 'key' })
  if (error) throw new Error(`Scoregewichten bijwerken mislukt: ${error.message}`)
  await getSupabase().from('lead_engine_audit_log').insert({ actor_subject: 'admin', action: 'UPDATE_SCORE_WEIGHTS', entity_type: 'settings', details: { keys: weights.map(({ key }) => key) } })
}

export async function saveProspectScore(prospectId: string, result: { score: number; scoreClass: string; breakdown: ScoreBreakdownItem[] }) {
  if (leadEngineDemoMode()) return
  const status = result.scoreClass === 'VERY_HOT' || result.scoreClass === 'HOT' ? 'HOT' : undefined
  const now = new Date().toISOString()
  const [{ error }, { error: updateError }] = await Promise.all([
    getSupabase().from('prospect_scores').insert({ prospect_id: prospectId, score: result.score, class: result.scoreClass, breakdown: result.breakdown, model_version: 'phase-1' }),
    getSupabase().from('prospects').update({ opportunity_score: result.score, score_class: result.scoreClass, ...(status ? { pipeline_status: status } : {}), updated_at: now }).eq('id', prospectId),
  ])
  if (error || updateError) throw new Error(`Leadscore opslaan mislukt: ${error?.message ?? updateError?.message}`)
}

export async function saveSalesPackage(prospectId: string, salesPackage: GeneratedSalesPackage, drafts: OutreachDraft[], channel: OutreachChannel) {
  if (leadEngineDemoMode()) return
  const supabase = getSupabase()
  const { error } = await supabase.from('sales_analyses').insert({
    prospect_id: prospectId,
    why_interesting: salesPackage.whyInteresting,
    biggest_problem: salesPackage.biggestProblem,
    recommended_improvement: salesPackage.recommendedImprovement,
    recommended_service: salesPackage.recommendedService,
    opening_line: salesPackage.openingLine,
    model: process.env.ANTHROPIC_LEAD_MODEL ?? 'deterministic-fallback',
  })
  if (error) throw new Error(`Salesanalyse opslaan mislukt: ${error.message}`)
  const { error: draftError } = await supabase.from('outreach_drafts').insert(drafts.map((draft) => ({
    id: draft.id, prospect_id: prospectId, channel: draft.channel, body: draft.body, status: draft.status,
    send_mode: draft.sendMode, profile_url: draft.profileUrl, scheduled_for: draft.scheduledFor,
  })))
  if (draftError) throw new Error(`Outreachconcepten opslaan mislukt: ${draftError.message}`)
  const { error: updateError } = await supabase.from('prospects').update({ recommended_channel: channel, pipeline_status: 'CONTACT_READY', updated_at: new Date().toISOString() }).eq('id', prospectId)
  if (updateError) throw new Error(`Prospect na analyse bijwerken mislukt: ${updateError.message}`)
}

export type ProspectAction = 'SEND' | 'SKIP' | 'LATER' | 'UPDATE_DRAFT' | 'PIPELINE' | 'DO_NOT_CONTACT'

export async function applyProspectAction(input: {
  prospectId: string
  action: ProspectAction
  draftId?: string
  body?: string
  pipelineStatus?: PipelineStatus
  scheduledFor?: string
}) {
  if (leadEngineDemoMode()) return { ok: true, demo: true }
  const supabase = getSupabase()
  const now = new Date().toISOString()
  const { data: prospect, error: loadError } = await supabase.from('prospects').select('kvk_number,source,source_record_id,pipeline_status').eq('id', input.prospectId).single()
  if (loadError || !prospect) throw new Error(`Prospectactie voorbereiden mislukt: ${loadError?.message}`)

  if (input.action === 'UPDATE_DRAFT' && input.draftId && input.body) {
    const { error } = await supabase.from('outreach_drafts').update({ body: input.body.slice(0, 4_000), updated_at: now }).eq('id', input.draftId).eq('prospect_id', input.prospectId)
    if (error) throw new Error(`Concept bijwerken mislukt: ${error.message}`)
  } else if (input.action === 'SKIP' && input.draftId) {
    const { error } = await supabase.from('outreach_drafts').update({ status: 'SKIPPED', updated_at: now }).eq('id', input.draftId).eq('prospect_id', input.prospectId)
    if (error) throw new Error(`Concept overslaan mislukt: ${error.message}`)
  } else if (input.action === 'LATER' && input.draftId) {
    const { error } = await supabase.from('outreach_drafts').update({ status: 'SNOOZED', scheduled_for: input.scheduledFor ?? new Date(Date.now() + 3 * 86_400_000).toISOString(), updated_at: now }).eq('id', input.draftId).eq('prospect_id', input.prospectId)
    if (error) throw new Error(`Concept uitstellen mislukt: ${error.message}`)
  } else if (input.action === 'SEND' && input.draftId) {
    const results = await Promise.all([
      supabase.from('outreach_drafts').update({ status: 'SENT', sent_at: now, updated_at: now }).eq('id', input.draftId).eq('prospect_id', input.prospectId),
      supabase.from('prospects').update({ pipeline_status: 'CONTACTED', last_activity_at: now, updated_at: now }).eq('id', input.prospectId),
      supabase.from('crm_activities').insert({ prospect_id: input.prospectId, type: 'OUTREACH_SENT', occurred_at: now }),
    ])
    assertNoDbError('Handmatige verzending vastleggen mislukt', results)
  } else if (input.action === 'PIPELINE' && input.pipelineStatus) {
    const { error } = await supabase.from('prospects').update({ pipeline_status: input.pipelineStatus, last_activity_at: now, updated_at: now }).eq('id', input.prospectId)
    if (error) throw new Error(`Pipelinestatus bijwerken mislukt: ${error.message}`)
  } else if (input.action === 'DO_NOT_CONTACT') {
    const suppressionIdentity = prospect.kvk_number
      ? { kind: 'KVK', normalized_value: prospect.kvk_number }
      : { kind: 'SOURCE', normalized_value: `${prospect.source}:${prospect.source_record_id}` }
    const results = await Promise.all([
      supabase.from('prospects').update({ pipeline_status: 'DO_NOT_CONTACT', last_activity_at: now, updated_at: now }).eq('id', input.prospectId),
      supabase.from('suppression_list').upsert({ ...suppressionIdentity, reason: 'Handmatig gemarkeerd als niet benaderen', scope: 'ALL' }, { onConflict: 'kind,normalized_value' }),
    ])
    assertNoDbError('Suppression instellen mislukt', results)
  }
  const newStatus = input.action === 'SEND' ? 'CONTACTED' : input.action === 'DO_NOT_CONTACT' ? 'DO_NOT_CONTACT' : input.pipelineStatus
  if (newStatus && newStatus !== prospect.pipeline_status) {
    await supabase.from('prospect_status_history').insert({ prospect_id: input.prospectId, from_status: prospect.pipeline_status, to_status: newStatus, actor_subject: 'admin' })
  }
  await supabase.from('lead_engine_audit_log').insert({ actor_subject: 'admin', action: input.action, entity_type: 'prospect', entity_id: input.prospectId, details: { draftId: input.draftId ?? null } })
  return { ok: true }
}

export async function addCrmNote(prospectId: string, body: string) {
  if (leadEngineDemoMode()) return { ok: true, demo: true }
  const { error } = await getSupabase().from('crm_notes').insert({ prospect_id: prospectId, body: body.slice(0, 4_000), author_subject: 'admin' })
  if (error) throw new Error(`CRM-notitie opslaan mislukt: ${error.message}`)
  await getSupabase().from('lead_engine_audit_log').insert({ actor_subject: 'admin', action: 'ADD_NOTE', entity_type: 'prospect', entity_id: prospectId })
  return { ok: true }
}

export async function recordOutreachOutcome(prospectId: string, input: { outcome: 'NO_RESPONSE' | 'POSITIVE' | 'NEGATIVE' | 'APPOINTMENT' | 'CUSTOMER'; channel: OutreachChannel; openingVariant?: string; offer?: string }) {
  if (leadEngineDemoMode()) return { ok: true, demo: true }
  const statusByOutcome: Record<typeof input.outcome, PipelineStatus> = {
    NO_RESPONSE: 'CONTACTED', POSITIVE: 'REPLIED', NEGATIVE: 'LOST', APPOINTMENT: 'APPOINTMENT', CUSTOMER: 'WON',
  }
  const now = new Date().toISOString()
  const supabase = getSupabase()
  const { data: current } = await supabase.from('prospects').select('pipeline_status').eq('id', prospectId).single()
  const nextStatus = statusByOutcome[input.outcome]
  const [{ error }, { error: updateError }, { error: activityError }] = await Promise.all([
    supabase.from('outreach_outcomes').insert({ prospect_id: prospectId, channel: input.channel, outcome: input.outcome, opening_variant: input.openingVariant?.slice(0, 500), offer: input.offer?.slice(0, 500), recorded_at: now }),
    supabase.from('prospects').update({ pipeline_status: nextStatus, last_activity_at: now, updated_at: now }).eq('id', prospectId),
    supabase.from('crm_activities').insert({ prospect_id: prospectId, type: 'OUTREACH_OUTCOME', channel: input.channel, outcome: input.outcome, occurred_at: now }),
  ])
  if (error || updateError || activityError) throw new Error(`Outreach-uitkomst opslaan mislukt: ${error?.message ?? updateError?.message ?? activityError?.message}`)
  if (current?.pipeline_status !== nextStatus) {
    const { error: historyError } = await supabase.from('prospect_status_history').insert({ prospect_id: prospectId, from_status: current?.pipeline_status ?? null, to_status: nextStatus, actor_subject: 'admin', note: `Outreach-uitkomst: ${input.outcome}` })
    if (historyError) throw new Error(`Statushistorie opslaan mislukt: ${historyError.message}`)
  }
  return { ok: true, pipelineStatus: nextStatus }
}

export async function saveMutationEvent(signal: KvkMutationSignal) {
  if (leadEngineDemoMode()) return true
  const { data, error } = await getSupabase().from('kvk_mutation_events').upsert({
    event_id: signal.eventId,
    subscription_id: signal.subscriptionId,
    signal_id: signal.signalId,
    signal_type: signal.signalType,
    kvk_number: signal.kvkNumber,
    establishment_number: signal.establishmentNumber,
    registered_at: signal.registeredAt,
    payload: signal.payload,
  }, { onConflict: 'event_id', ignoreDuplicates: true }).select('event_id')
  if (error) throw new Error(`KVK-mutatie opslaan mislukt: ${error.message}`)
  return Boolean(data?.length)
}

export async function createDemoPreview(prospectId: string, content: DemoConcept) {
  const token = randomBytes(24).toString('base64url')
  if (leadEngineDemoMode()) return { token, previewUrl: `/preview/${token}?demo=${encodeURIComponent(prospectId)}` }
  const { error } = await getSupabase().from('demo_previews').insert({
    id: randomUUID(), prospect_id: prospectId, token, content,
    generated_fields: content.generatedFields,
    expires_at: new Date(Date.now() + 30 * 86_400_000).toISOString(),
  })
  if (error) throw new Error(`Demopreview opslaan mislukt: ${error.message}`)
  return { token, previewUrl: `/preview/${token}` }
}

export async function getDemoPreview(token: string, demoProspectId?: string | null) {
  if (leadEngineDemoMode() && demoProspectId) {
    const prospect = DEMO_PROSPECTS.find((entry) => entry.id === demoProspectId)
    if (!prospect) return null
    const { generateDemoConcept } = await import('@/lib/ai/demo')
    return { prospect, content: await generateDemoConcept(prospect), expiresAt: new Date(Date.now() + 30 * 86_400_000).toISOString() }
  }
  const { data, error } = await getSupabase().from('demo_previews').select('content,expires_at,prospects(*)').eq('token', token).gt('expires_at', new Date().toISOString()).single()
  if (error || !data) return null
  return { prospect: mapProspect(data.prospects), content: data.content as DemoConcept, expiresAt: data.expires_at }
}

export async function recordJobRun(input: { workflowRunId?: string; jobType: string; status: 'RUNNING' | 'COMPLETED' | 'FAILED'; counters?: Record<string, number>; error?: string }) {
  if (leadEngineDemoMode()) return
  const values = {
    workflow_run_id: input.workflowRunId,
    job_type: input.jobType,
    status: input.status,
    counters: input.counters ?? {},
    error_message: input.error?.slice(0, 2_000),
    ...(input.status !== 'RUNNING' ? { finished_at: new Date().toISOString() } : {}),
  }
  if (input.workflowRunId) await getSupabase().from('lead_engine_job_runs').upsert(values, { onConflict: 'workflow_run_id' })
  else await getSupabase().from('lead_engine_job_runs').insert(values)
}

export async function markMutationProcessed(eventId: string) {
  if (leadEngineDemoMode()) return
  const { error } = await getSupabase().from('kvk_mutation_events').update({ processed_at: new Date().toISOString() }).eq('event_id', eventId)
  if (error) throw new Error(`KVK-mutatie afronden mislukt: ${error.message}`)
}

export async function logProspectProcessingError(prospectId: string, stage: string, message: string) {
  if (leadEngineDemoMode()) return
  await getSupabase().from('lead_engine_audit_log').insert({
    actor_subject: 'workflow', action: 'PROCESSING_ERROR', entity_type: 'prospect', entity_id: prospectId,
    details: { stage, message: message.slice(0, 1_000) },
  })
}

export async function logLeadEngineSystemError(stage: string, message: string) {
  if (leadEngineDemoMode()) return
  await getSupabase().from('lead_engine_audit_log').insert({
    actor_subject: 'workflow', action: 'SYSTEM_PROCESSING_ERROR', entity_type: 'lead_engine_job',
    details: { stage, message: message.slice(0, 1_000) },
  })
}

export async function deleteProspectData(prospectId: string, reason = 'Handmatig verwijderverzoek') {
  if (leadEngineDemoMode()) return { deleted: true, demo: true }
  const supabase = getSupabase()
  const { data: prospect, error: loadError } = await supabase.from('prospects').select('id,kvk_number').eq('id', prospectId).single()
  if (loadError || !prospect) throw new Error('Te verwijderen prospect is niet gevonden.')
  await supabase.from('lead_engine_audit_log').insert({
    actor_subject: 'admin', action: 'DELETE_PROSPECT_DATA', entity_type: 'prospect', entity_id: prospectId,
    details: { reason, kvkNumberRetainedInSuppression: false },
  })
  const { error } = await supabase.from('prospects').delete().eq('id', prospectId)
  if (error) throw new Error(`Prospectgegevens verwijderen mislukt: ${error.message}`)
  return { deleted: true }
}

export async function purgeExpiredUncontactedProspects() {
  if (leadEngineDemoMode()) return 0
  const supabase = getSupabase()
  const { data, error } = await supabase.from('prospects').select('id').in('pipeline_status', ['NEW','RESEARCHED']).lt('retention_until', new Date().toISOString()).limit(500)
  if (error) throw new Error(`Verlopen prospects selecteren mislukt: ${error.message}`)
  const ids = (data ?? []).map(({ id }) => id)
  if (!ids.length) return 0
  const { error: deleteError } = await supabase.from('prospects').delete().in('id', ids)
  if (deleteError) throw new Error(`Verlopen prospects verwijderen mislukt: ${deleteError.message}`)
  await supabase.from('lead_engine_audit_log').insert({ actor_subject: 'workflow', action: 'RETENTION_PURGE', entity_type: 'prospect_batch', details: { count: ids.length } })
  return ids.length
}
