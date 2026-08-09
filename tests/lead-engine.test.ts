import test from 'node:test'
import assert from 'node:assert/strict'
import { candidateConfidence, normalizeBusinessName, normalizePhone } from '../lib/enrichment/fuzzy'
import { websiteCandidateDomains, websiteMatchConfidence } from '../lib/enrichment/website-candidates'
import { calculateOpportunityScore, classifyScore } from '../lib/scoring/calculate'
import { buildOverpassQuery, standardizeOsmElement } from '../lib/discovery/openstreetmap'

test('opportunity scoring is clamped and classifies a strong no-website lead', () => {
  const result = calculateOpportunityScore({
    registrationDate: '2026-03-01',
    sbiCodes: [{ code: '4334' }],
    websiteUrl: null,
    websiteDiscoveryStatus: 'CONFIRMED_NONE',
    googleReviewCount: 32,
    instagramActive: true,
    hasAnySocial: true,
    audit: null,
  }, undefined, new Date('2026-08-07T10:00:00Z'))
  assert.equal(result.score, 100)
  assert.equal(result.scoreClass, 'VERY_HOT')
  assert.ok(result.breakdown.some(({ key, matched }) => key === 'no_website' && matched))
})

test('digital agencies receive the configured exclusion penalty', () => {
  const result = calculateOpportunityScore({
    registrationDate: null,
    sbiCodes: [{ code: '6201' }],
    websiteUrl: null,
    websiteDiscoveryStatus: 'UNVERIFIED',
    googleReviewCount: 0,
    instagramActive: false,
    hasAnySocial: false,
    audit: null,
  })
  assert.equal(result.score, 0)
  assert.equal(result.scoreClass, 'LOW')
  assert.ok(result.breakdown.some(({ key, matched }) => key === 'no_website' && !matched))
})

test('OSM computer businesses receive the digital-business exclusion penalty', () => {
  const result = calculateOpportunityScore({
    registrationDate: null,
    sbiCodes: [{ code: 'OSM:shop:computer' }],
    websiteUrl: 'https://voorbeeld.nl',
    websiteDiscoveryStatus: 'FOUND',
    googleReviewCount: 0,
    instagramActive: false,
    hasAnySocial: false,
    audit: null,
  })
  assert.ok(result.breakdown.some(({ key, matched }) => key === 'digital_agency' && matched))
  assert.equal(result.score, 0)
})

test('missing OSM website data is not treated as confirmed absence', () => {
  const result = calculateOpportunityScore({
    registrationDate: null,
    sbiCodes: [{ code: 'OSM:shop:hairdresser' }],
    websiteUrl: null,
    websiteDiscoveryStatus: 'UNVERIFIED',
    googleReviewCount: null,
    instagramActive: false,
    hasAnySocial: false,
    audit: null,
  })
  assert.equal(result.score, 0)
  assert.ok(result.breakdown.some(({ key, matched }) => key === 'no_website' && !matched))
})

test('score boundaries match the documented classifications', () => {
  assert.equal(classifyScore(39), 'LOW')
  assert.equal(classifyScore(40), 'MEDIUM')
  assert.equal(classifyScore(60), 'GOOD')
  assert.equal(classifyScore(75), 'HOT')
  assert.equal(classifyScore(85), 'VERY_HOT')
})

test('business matching normalizes Dutch legal suffixes and phone notation', () => {
  assert.equal(normalizeBusinessName('Janssen Schilderwerken B.V.'), 'janssen schilderwerken')
  assert.equal(normalizePhone('+31 (0)318 12 34 56'), '0318123456')
  const strong = candidateConfidence({
    companyName: 'Janssen Schilderwerken B.V.',
    candidateName: 'Janssen Schilderwerken',
    place: 'Veenendaal',
    candidateAddress: 'Voorbeeldstraat 12, 3905 AB Veenendaal',
    address: 'Voorbeeldstraat 12',
  })
  const weak = candidateConfidence({
    companyName: 'Janssen Schilderwerken B.V.',
    candidateName: 'De Groene Tuin',
    place: 'Veenendaal',
    candidateAddress: 'Markt 8, Ede',
    address: 'Voorbeeldstraat 12',
  })
  assert.ok(strong > 0.75)
  assert.ok(weak < 0.3)
})

test('website discovery generates likely Dutch domains and requires matching evidence', () => {
  assert.deepEqual(websiteCandidateDomains('Autobedrijf Bijkerk').slice(0, 4), [
    'autobedrijfbijkerk.nl',
    'autobedrijfbijkerk.com',
    'autobijkerk.nl',
    'autobijkerk.com',
  ])
  assert.ok(websiteCandidateDomains('Brandhof dier & ruiter').includes('brandhofdierenruiter.nl'))
  const result = websiteMatchConfidence({
    companyName: 'Autobedrijf Bijkerk',
    candidateDomain: 'autobijkerk.nl',
    title: 'Autobedrijf Bijkerk Ede',
    heading: 'Autobedrijf Bijkerk',
    pageText: 'Autobedrijf Bijkerk Ede Kelvinstraat 4 6716 BW Ede',
    place: 'Ede',
    postcode: '6716BW',
    address: 'Kelvinstraat 4',
  })
  assert.equal(result.accepted, true)
  assert.ok(result.confidence > 0.75)
})

test('OpenStreetMap discovery maps public business tags without inventing KVK data', () => {
  const company = standardizeOsmElement({
    type: 'node',
    id: 123,
    lat: 52.0263,
    lon: 5.5544,
    tags: {
      name: 'Kapsalon Voorbeeld',
      shop: 'hairdresser',
      'addr:street': 'Markt',
      'addr:housenumber': '1',
      'addr:postcode': '3901 AA',
      'addr:city': 'Veenendaal',
      website: 'voorbeeld.nl',
      'contact:instagram': '@kapsalonvoorbeeld',
    },
  }, 'Veenendaal')

  assert.ok(company)
  assert.equal(company.source, 'OPENSTREETMAP')
  assert.equal(company.kvkNumber, null)
  assert.equal(company.websiteUrl, 'https://voorbeeld.nl/')
  assert.equal(company.address, 'Markt 1')
  assert.ok(company.urls.some(({ kind, url }) => kind === 'INSTAGRAM' && url === 'https://instagram.com/kapsalonvoorbeeld'))
  assert.equal(company.sourcePayload.license, 'ODbL 1.0')
})

test('Overpass query is bounded to local commercial categories', () => {
  const query = buildOverpassQuery(52.0263, 5.5544, 5_000, 100)
  assert.match(query, /around:5000,52\.02630,5\.55440/)
  assert.match(query, /\["craft"\]/)
  assert.match(query, /out center tags 100/)
})
