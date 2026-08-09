import { normalizeBusinessName, stringSimilarity } from './fuzzy'

const CONNECTOR_TOKENS = new Set(['de', 'den', 'der', 'het', 'en', 'and', 'van', 'voor'])
const LEGAL_TOKENS = new Set(['bv', 'nv', 'vof', 'cv', 'stichting', 'vereniging'])
const DESCRIPTOR_TOKENS = new Set([
  'accountants', 'adviseurs', 'advies', 'administratie', 'autobedrijf', 'bouwbedrijf',
  'computers', 'dierenarts', 'installatiebedrijf', 'kapsalon', 'makelaars', 'makelaar',
  'schildersbedrijf', 'zonwering',
])

function tokens(value: string) {
  return normalizeBusinessName(value).split(' ').filter(Boolean)
}

function addBase(target: string[], value: string) {
  const clean = value.replace(/[^a-z0-9]/g, '')
  if (clean.length >= 3 && clean.length <= 63 && !target.includes(clean)) target.push(clean)
}

export function websiteCandidateDomains(companyName: string, maxCandidates = 12) {
  const bases: string[] = []
  const segments = companyName.split(/[\/|–—]+/).map((part) => part.trim()).filter(Boolean)
  for (const segment of [...segments, companyName]) {
    const all = tokens(segment).filter((token) => !LEGAL_TOKENS.has(token))
    const meaningful = all.filter((token) => !CONNECTOR_TOKENS.has(token))
    if (!meaningful.length) continue
    addBase(bases, meaningful.join(''))
    addBase(bases, meaningful.slice(0, 3).join(''))
    addBase(bases, meaningful.slice(0, 2).join(''))
    if (segment.includes('&')) addBase(bases, tokens(segment.replaceAll('&', ' en ')).filter((token) => !LEGAL_TOKENS.has(token)).join(''))

    if (meaningful[0] === 'autobedrijf' && meaningful.length > 1) addBase(bases, `auto${meaningful.slice(1).join('')}`)
    const descriptorFree = meaningful.filter((token) => !DESCRIPTOR_TOKENS.has(token))
    addBase(bases, descriptorFree.join(''))
    if (meaningful[0]?.length >= 4 && !DESCRIPTOR_TOKENS.has(meaningful[0])) addBase(bases, meaningful[0])
  }

  const domains: string[] = []
  for (const base of bases) {
    for (const tld of ['nl', 'com']) {
      domains.push(`${base}.${tld}`)
      if (domains.length >= maxCandidates) return domains
    }
  }
  return domains
}

function foldedText(value: string) {
  return normalizeBusinessName(value).replace(/\s/g, '')
}

export function websiteMatchConfidence(input: {
  companyName: string
  candidateDomain: string
  title?: string | null
  heading?: string | null
  pageText: string
  place: string
  postcode?: string | null
  address?: string | null
  phone?: string | null
}) {
  const company = normalizeBusinessName(input.companyName)
  const pageText = normalizeBusinessName(input.pageText)
  const names = [input.title, input.heading].filter((value): value is string => Boolean(value))
  const nameScore = pageText.includes(company)
    ? 1
    : Math.max(0, ...names.map((value) => stringSimilarity(input.companyName, value)))
  const domainLabel = input.candidateDomain.split('.')[0].replace(/[-_]/g, ' ')
  const domainScore = stringSimilarity(input.companyName, domainLabel)
  const placeHit = pageText.includes(normalizeBusinessName(input.place))
  const postcodeHit = Boolean(input.postcode && foldedText(input.pageText).includes(foldedText(input.postcode)))
  const street = input.address?.replace(/\s+\d.*$/, '').trim()
  const addressHit = Boolean(street && pageText.includes(normalizeBusinessName(street)))
  const phoneDigits = input.phone?.replace(/\D/g, '').replace(/^31/, '0')
  const phoneHit = Boolean(phoneDigits && input.pageText.replace(/\D/g, '').includes(phoneDigits))
  const locationScore = postcodeHit ? 1 : addressHit ? 0.8 : placeHit ? 0.45 : 0
  const confidence = nameScore * 0.5 + domainScore * 0.25 + locationScore * 0.2 + Number(phoneHit) * 0.05
  const independentlyVerified = postcodeHit || addressHit || phoneHit || (placeHit && domainScore >= 0.48)
  return {
    confidence: Math.max(0, Math.min(1, confidence)),
    accepted: nameScore >= 0.62 && confidence >= 0.67 && independentlyVerified,
    evidence: { nameScore, domainScore, placeHit, postcodeHit, addressHit, phoneHit },
  }
}
