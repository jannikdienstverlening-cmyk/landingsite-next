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
    externalCollectionEnabled: process.env.NEXT_PUBLIC_ANALYTICS_ENABLED === 'true',
    consentCookie: 'landingsite_consent',
    consentVersion: 'consent-v2',
    maxAgeDays: 180,
  },
  categories: {
    necessary: true,
    analytics: false,
    marketing: false,
    preferences: false,
  },
  referral: {
    persistenceVersion: 'referral-30d-v1',
    persistentDays: 30,
    fingerprinting: false,
  },
} as const
