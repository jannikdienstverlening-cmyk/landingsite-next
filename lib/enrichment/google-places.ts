import 'server-only'
import { PHASE_ONE_MARKET } from '@/lib/lead-engine/market'
import { candidateConfidence } from './fuzzy'

type GooglePlace = {
  id: string
  displayName?: { text?: string }
  formattedAddress?: string
  websiteUri?: string
  nationalPhoneNumber?: string
  googleMapsUri?: string
  rating?: number
  userRatingCount?: number
  businessStatus?: string
  primaryType?: string
}

type GooglePlacesResponse = { places?: GooglePlace[] }

export type BusinessLookup = {
  placeId: string
  name: string
  address: string | null
  website: string | null
  phone: string | null
  googleMapsUrl: string | null
  rating: number | null
  reviewCount: number | null
  confidence: number
}

export async function findGoogleBusiness(input: {
  companyName: string
  place: string
  address?: string | null
  phone?: string | null
  website?: string | null
}): Promise<BusinessLookup | null> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  if (!apiKey) return null
  const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': apiKey,
      'X-Goog-FieldMask': [
        'places.id',
        'places.displayName',
        'places.formattedAddress',
        'places.websiteUri',
        'places.nationalPhoneNumber',
        'places.googleMapsUri',
        'places.rating',
        'places.userRatingCount',
        'places.businessStatus',
        'places.primaryType',
      ].join(','),
    },
    body: JSON.stringify({
      textQuery: `${input.companyName}, ${input.address ? `${input.address}, ` : ''}${input.place}, Nederland`,
      languageCode: 'nl',
      regionCode: 'NL',
      pageSize: 5,
      includePureServiceAreaBusinesses: true,
      locationBias: {
        circle: {
          center: PHASE_ONE_MARKET.center,
          radius: PHASE_ONE_MARKET.radiusKm * 1_000,
        },
      },
    }),
    signal: AbortSignal.timeout(20_000),
    cache: 'no-store',
  })
  if (!response.ok) throw new Error(`Google Places gaf status ${response.status}.`)
  const data = await response.json() as GooglePlacesResponse
  const candidates = (data.places ?? [])
    .filter((place) => place.businessStatus !== 'CLOSED_PERMANENTLY')
    .map((place) => ({
      place,
      confidence: candidateConfidence({
        companyName: input.companyName,
        candidateName: place.displayName?.text ?? '',
        place: input.place,
        candidateAddress: place.formattedAddress,
        address: input.address,
        phone: input.phone,
        candidatePhone: place.nationalPhoneNumber,
        website: input.website,
        candidateWebsite: place.websiteUri,
      }),
    }))
    .sort((left, right) => right.confidence - left.confidence)

  const best = candidates[0]
  const runnerUp = candidates[1]
  if (!best || best.confidence < 0.68 || (runnerUp && best.confidence - runnerUp.confidence < 0.08)) return null
  return {
    placeId: best.place.id,
    name: best.place.displayName?.text ?? input.companyName,
    address: best.place.formattedAddress ?? null,
    website: best.place.websiteUri ?? null,
    phone: best.place.nationalPhoneNumber ?? null,
    googleMapsUrl: best.place.googleMapsUri ?? null,
    rating: best.place.rating ?? null,
    reviewCount: best.place.userRatingCount ?? null,
    confidence: best.confidence,
  }
}
