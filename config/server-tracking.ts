import 'server-only'

export function serverTrackingConfig() {
  return {
    enabled: process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === 'true',
    baseUrl: (process.env.NEXT_PUBLIC_BASE_URL ?? 'https://www.landingsite.nl').replace(/\/$/, ''),
    google: {
      measurementId: process.env.NEXT_PUBLIC_GOOGLE_MEASUREMENT_ID ?? '',
      apiSecret: process.env.GOOGLE_ANALYTICS_API_SECRET ?? '',
    },
    meta: {
      pixelId: process.env.NEXT_PUBLIC_META_PIXEL_ID ?? '',
      accessToken: process.env.META_CONVERSIONS_API_TOKEN ?? '',
      apiVersion: process.env.META_GRAPH_API_VERSION ?? '',
    },
  }
}
