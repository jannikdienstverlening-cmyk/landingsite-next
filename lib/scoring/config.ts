export type ScoringWeight = {
  key: string
  label: string
  value: number
  enabled: boolean
}

export const DEFAULT_SCORING_WEIGHTS: ScoringWeight[] = [
  { key: 'no_website', label: 'Geen website', value: 35, enabled: true },
  { key: 'outdated_website', label: 'Zeer slechte of verouderde website', value: 25, enabled: true },
  { key: 'not_mobile_friendly', label: 'Niet mobielvriendelijk', value: 20, enabled: true },
  { key: 'young_business', label: 'Bedrijf jonger dan 12 maanden', value: 20, enabled: true },
  { key: 'active_instagram_bad_site', label: 'Actief Instagram en slechte/geen website', value: 20, enabled: true },
  { key: 'google_reviews_20', label: '20+ Google-reviews', value: 15, enabled: true },
  { key: 'slow_website', label: 'Website langzaam', value: 10, enabled: true },
  { key: 'no_cta', label: 'Geen duidelijke CTA', value: 10, enabled: true },
  { key: 'no_quote_or_booking', label: 'Geen offerte- of afspraakfunctie', value: 10, enabled: true },
  { key: 'social_only', label: 'Alleen socialmedia-aanwezigheid', value: 15, enabled: true },
  { key: 'modern_professional', label: 'Moderne professionele website', value: -35, enabled: true },
  { key: 'digital_agency', label: 'Marketing-, webdesign- of IT-bedrijf', value: -50, enabled: true },
]
