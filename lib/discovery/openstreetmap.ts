import type { DiscoveredCompany } from '@/lib/kvk/types'
import { PHASE_ONE_PLACE_CENTERS, PHASE_ONE_PLACES } from '@/lib/lead-engine/market'

const DEFAULT_OVERPASS_URL = 'https://overpass.private.coffee/api/interpreter'
const DEFAULT_RADIUS_METERS = 5_000

const SHOP_TYPES = [
  'bakery', 'beauty', 'bicycle', 'butcher', 'car_repair', 'carpet', 'clothes', 'computer',
  'confectionery', 'copyshop', 'curtain', 'dry_cleaning', 'electronics', 'florist',
  'funeral_directors', 'furniture', 'garden_centre', 'hairdresser', 'hardware', 'hearing_aids',
  'interior_decoration', 'jewelry', 'kitchen', 'laundry', 'massage', 'mobile_phone', 'optician',
  'paint', 'pet', 'photo', 'shoes', 'tailor', 'trade', 'tyres', 'window_blind',
] as const

const OFFICE_TYPES = [
  'accountant', 'architect', 'consulting', 'employment_agency', 'estate_agent',
  'financial_advisor', 'insurance', 'lawyer', 'notary', 'tax_advisor', 'therapist',
] as const

const AMENITY_TYPES = ['cafe', 'clinic', 'dentist', 'doctors', 'driving_school', 'restaurant', 'veterinary'] as const
const EXCLUDED_DIGITAL_CATEGORIES = new Set(['advertising', 'graphic_design', 'it', 'software', 'telecommunication', 'web_design'])

const CATEGORY_LABELS: Record<string, string> = {
  accountant: 'Accountant', architect: 'Architect', bakery: 'Bakkerij', beauty: 'Schoonheidssalon',
  bicycle: 'Fietsenwinkel', butcher: 'Slagerij', cafe: 'Café', car_repair: 'Autogarage',
  clinic: 'Kliniek', consulting: 'Adviesbureau', dentist: 'Tandarts', doctors: 'Huisartsenpraktijk',
  driving_school: 'Rijschool', employment_agency: 'Uitzendbureau', estate_agent: 'Makelaar',
  financial_advisor: 'Financieel adviseur', florist: 'Bloemist', funeral_directors: 'Uitvaartonderneming',
  furniture: 'Meubelzaak', garden_centre: 'Tuincentrum', hairdresser: 'Kapper', insurance: 'Verzekeringsadviseur',
  interior_decoration: 'Interieurzaak', lawyer: 'Advocatenkantoor', massage: 'Massagepraktijk',
  notary: 'Notaris', optician: 'Opticien', restaurant: 'Restaurant', tailor: 'Kleermaker',
  tax_advisor: 'Belastingadviseur', therapist: 'Therapiepraktijk', veterinary: 'Dierenarts',
}

export type OsmElement = {
  type: 'node' | 'way' | 'relation'
  id: number
  lat?: number
  lon?: number
  center?: { lat?: number; lon?: number }
  tags?: Record<string, string>
}

type OverpassResponse = { elements?: OsmElement[] }

export class OverpassApiError extends Error {
  constructor(message: string, readonly status: number, readonly retryable: boolean) {
    super(message)
    this.name = 'OverpassApiError'
  }
}

function overpassRegex(values: readonly string[]) {
  return `^(${values.join('|')})$`
}

export function buildOverpassQuery(latitude: number, longitude: number, radiusMeters = DEFAULT_RADIUS_METERS, outputLimit = 250) {
  const around = `(around:${Math.max(500, Math.min(radiusMeters, 10_000))},${latitude.toFixed(5)},${longitude.toFixed(5)})`
  const limit = Math.max(25, Math.min(outputLimit, 500))
  return `[out:json][timeout:25];(
  nwr${around}["name"]["craft"];
  nwr${around}["name"]["shop"~"${overpassRegex(SHOP_TYPES)}"];
  nwr${around}["name"]["office"~"${overpassRegex(OFFICE_TYPES)}"];
  nwr${around}["name"]["amenity"~"${overpassRegex(AMENITY_TYPES)}"];
);out center tags ${limit};`
}

function clean(value: unknown) {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function normalizeUrl(value: string | null) {
  if (!value) return null
  try {
    const candidate = /^https?:\/\//i.test(value) ? value : `https://${value}`
    const url = new URL(candidate)
    if (!['http:', 'https:'].includes(url.protocol)) return null
    return url.toString()
  } catch {
    return null
  }
}

function socialUrl(platform: 'instagram' | 'facebook' | 'linkedin' | 'tiktok', value: string | null) {
  if (!value) return null
  const hostRoots = { instagram: 'instagram.com', facebook: 'facebook.com', linkedin: 'linkedin.com', tiktok: 'tiktok.com' }
  if (/^https?:\/\//i.test(value) || /\.[a-z]{2,}(?:\/|$)/i.test(value)) {
    const normalized = normalizeUrl(value)
    if (normalized) {
      const hostname = new URL(normalized).hostname.toLowerCase()
      const hostRoot = hostRoots[platform]
      if (hostname === hostRoot || hostname.endsWith(`.${hostRoot}`)) return normalized
    }
  }
  const handle = value.replace(/^@/, '').replace(/^\/+|\/+$/g, '')
  if (!handle || /\s/.test(handle)) return null
  const hosts = { instagram: 'instagram.com', facebook: 'facebook.com', linkedin: 'linkedin.com/company', tiktok: 'tiktok.com/@' }
  return `https://${hosts[platform]}/${handle}`
}

function addressLine(tags: Record<string, string>) {
  const line = [clean(tags['addr:street']), clean(tags['addr:housenumber']), clean(tags['addr:unit'])].filter(Boolean).join(' ')
  return line || null
}

function category(tags: Record<string, string>) {
  if (clean(tags.craft)) return { group: 'craft', value: tags.craft }
  if (clean(tags.shop)) return { group: 'shop', value: tags.shop }
  if (clean(tags.office)) return { group: 'office', value: tags.office }
  if (clean(tags.amenity)) return { group: 'amenity', value: tags.amenity }
  return null
}

function slug(value: string) {
  return value.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

function publicUrls(tags: Record<string, string>, websiteUrl: string | null): DiscoveredCompany['urls'] {
  const candidates: Array<[DiscoveredCompany['urls'][number]['kind'], string | null]> = [
    ['WEBSITE', websiteUrl],
    ['INSTAGRAM', socialUrl('instagram', clean(tags['contact:instagram']) ?? clean(tags.instagram))],
    ['FACEBOOK', socialUrl('facebook', clean(tags['contact:facebook']) ?? clean(tags.facebook))],
    ['LINKEDIN', socialUrl('linkedin', clean(tags['contact:linkedin']) ?? clean(tags.linkedin))],
    ['TIKTOK', socialUrl('tiktok', clean(tags['contact:tiktok']) ?? clean(tags.tiktok))],
  ]
  return candidates.filter((entry): entry is [DiscoveredCompany['urls'][number]['kind'], string] => Boolean(entry[1]))
    .map(([kind, url]) => ({ kind, url, confidence: kind === 'WEBSITE' ? 0.82 : 0.72, source: 'OpenStreetMap ODbL' }))
}

export function standardizeOsmElement(element: OsmElement, fallbackPlace: string): DiscoveredCompany | null {
  const tags = element.tags ?? {}
  const companyName = clean(tags.name)
  const businessCategory = category(tags)
  if (!companyName || !businessCategory) return null
  if (tags.disused || tags.abandoned || tags['brand:wikidata'] || tags.network || tags['operator:wikidata']) return null
  if (EXCLUDED_DIGITAL_CATEGORIES.has(businessCategory.value)) return null

  const sourceRecordId = `${element.type}/${element.id}`
  const postcode = clean(tags['addr:postcode'])
  const address = addressLine(tags)
  const place = clean(tags['addr:city']) ?? clean(tags['addr:place']) ?? fallbackPlace
  const websiteUrl = normalizeUrl(clean(tags.website) ?? clean(tags['contact:website']) ?? clean(tags.url))
  const phone = clean(tags.phone) ?? clean(tags['contact:phone'])
  const email = clean(tags.email) ?? clean(tags['contact:email'])
  const dedupeLocation = postcode ?? address ?? sourceRecordId
  const latitude = element.lat ?? element.center?.lat ?? null
  const longitude = element.lon ?? element.center?.lon ?? null

  return {
    dedupeKey: `OPENSTREETMAP:${slug(companyName)}:${slug(dedupeLocation)}`,
    source: 'OPENSTREETMAP',
    sourceRecordId,
    kvkNumber: null,
    establishmentNumber: null,
    companyName,
    tradeNames: [],
    place,
    postcode,
    address,
    legalForm: null,
    registrationDate: null,
    active: true,
    employeeCount: null,
    nonMailing: false,
    sbiCodes: [{
      code: `OSM:${businessCategory.group}:${businessCategory.value}`,
      description: CATEGORY_LABELS[businessCategory.value] ?? businessCategory.value.replaceAll('_', ' '),
      main: true,
    }],
    websiteUrl,
    phone,
    email,
    urls: publicUrls(tags, websiteUrl),
    sourcePayload: {
      source: 'OpenStreetMap',
      license: 'ODbL 1.0',
      attribution: '© OpenStreetMap contributors',
      element: sourceRecordId,
      elementUrl: `https://www.openstreetmap.org/${sourceRecordId}`,
      category: businessCategory,
      coordinates: latitude !== null && longitude !== null ? { latitude, longitude } : null,
      retrievedAt: new Date().toISOString(),
    },
  }
}

async function fetchPlaceElements(place: string, maxResults: number, endpoint: string) {
  const center = PHASE_ONE_PLACE_CENTERS[place as keyof typeof PHASE_ONE_PLACE_CENTERS]
  if (!center) return []
  const radius = Number(process.env.OSM_DISCOVERY_RADIUS_METERS ?? DEFAULT_RADIUS_METERS)
  const query = buildOverpassQuery(center.latitude, center.longitude, radius, Math.min(500, maxResults * 6))
  const body = new URLSearchParams({ data: query })
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
      'User-Agent': `Landingsite-Lead-Engine/1.0 (${process.env.CONTACT_EMAIL ?? 'contact@landingsite.nl'})`,
    },
    body,
    signal: AbortSignal.timeout(Number(process.env.OSM_REQUEST_TIMEOUT_MS ?? 35_000)),
    cache: 'no-store',
  })
  if (!response.ok) {
    throw new OverpassApiError(`Overpass API gaf status ${response.status} voor ${place}.`, response.status, response.status === 429 || response.status >= 500)
  }
  const payload = await response.json() as OverpassResponse
  return payload.elements ?? []
}

export async function discoverOpenStreetMapCompanies(input: { places?: string[]; maxResultsPerPlace?: number } = {}) {
  const endpoint = (process.env.OVERPASS_API_URL ?? DEFAULT_OVERPASS_URL).replace(/\/$/, '')
  const maxResults = Math.max(1, Math.min(input.maxResultsPerPlace ?? Number(process.env.OSM_DISCOVERY_LIMIT_PER_PLACE ?? 25), 100))
  const allowedPlaces = new Set(PHASE_ONE_PLACES)
  const canonicalPlaces = new Map(PHASE_ONE_PLACES.map((place) => [place.toLocaleLowerCase('nl-NL'), place]))
  const configuredPlaces = process.env.OSM_DISCOVERY_PLACES?.split(',').map((place) => place.trim()).filter(Boolean)
  const places = (configuredPlaces?.length ? configuredPlaces : input.places ?? [...PHASE_ONE_PLACES])
    .filter((place) => allowedPlaces.has(place as (typeof PHASE_ONE_PLACES)[number]))
  const companies = new Map<string, DiscoveredCompany>()
  const failures: unknown[] = []
  let consecutiveFailures = 0

  for (const place of places) {
    let elements: OsmElement[]
    try {
      elements = await fetchPlaceElements(place, maxResults, endpoint)
    } catch (error) {
      failures.push(error)
      consecutiveFailures += 1
      if (consecutiveFailures >= 2) break
      continue
    }
    consecutiveFailures = 0
    const candidates: DiscoveredCompany[] = elements.flatMap((element) => {
      const company = standardizeOsmElement(element, place)
      if (!company) return []
      const canonicalPlace = canonicalPlaces.get(company.place.toLocaleLowerCase('nl-NL'))
      return canonicalPlace ? [{ ...company, place: canonicalPlace }] : []
    })
    candidates.sort((left, right) => Number(Boolean(left.websiteUrl)) - Number(Boolean(right.websiteUrl))
        || Number(Boolean(right.phone || right.email)) - Number(Boolean(left.phone || left.email))
        || left.companyName.localeCompare(right.companyName, 'nl-NL'))
    let accepted = 0
    for (const company of candidates) {
      if (companies.has(company.dedupeKey)) continue
      companies.set(company.dedupeKey, company)
      accepted += 1
      if (accepted >= maxResults) break
    }
  }
  if (!companies.size && failures.length === places.length && failures.length > 0) {
    throw new AggregateError(failures, 'Alle geconfigureerde Overpass-plaatsqueries zijn mislukt.')
  }
  return [...companies.values()]
}
