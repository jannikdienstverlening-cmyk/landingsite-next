export const trackingConfig = {
  googleMeasurementId: process.env.NEXT_PUBLIC_GOOGLE_MEASUREMENT_ID ?? '',
  googleAdsId: process.env.NEXT_PUBLIC_GOOGLE_ADS_ID ?? '',
  metaPixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID ?? '',
  enabled: process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === 'true',
  campaignKeys: [
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_content',
    'utm_term',
    'gclid',
    'gbraid',
    'wbraid',
    'fbclid',
  ],
} as const

export type ConsentChoice = {
  analytics: boolean
  marketing: boolean
  preferences: boolean
  version: string
}
