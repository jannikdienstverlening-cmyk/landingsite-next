export const consentConfig = {
  marketing: {
    enabled: process.env.MARKETING_EMAIL_ENABLED === 'true',
    version: 'marketing-v1',
    bundledWithOrder: false,
    confirmationTtlHours: 24,
    proofRetentionYears: 5,
    consentText: 'Ik ontvang per e-mail praktische informatie en aanbiedingen van Landingsite.nl. Afmelden kan altijd.',
  },
  analytics: {
    externalCollectionEnabled: false,
    consentCookie: '__Host-landingsite_analytics',
    consentVersion: 'analytics-v1',
  },
  referral: {
    persistenceVersion: 'referral-30d-v1',
    persistentDays: 30,
    fingerprinting: false,
  },
} as const
