import { commercialConfig, packageFirstPayment } from './commercial'

export type VerifiedClaim<T> = {
  value: T | null
  publish: boolean
  verifiedAt: string | null
  evidence: string | null
}

const verifiedAt = '2026-08-10'

export const verifiedClaims = {
  prices: {
    value: {
      starter: commercialConfig.packages.starter.oneTimePrice,
      pro: commercialConfig.packages.pro.oneTimePrice,
      premium: commercialConfig.packages.premium.oneTimePrice,
      management: commercialConfig.management.monthlyPrice,
      pricesIncludeVat: commercialConfig.pricesIncludeVat,
      firstPayments: {
        starter: packageFirstPayment('starter'),
        pro: packageFirstPayment('pro'),
        premium: packageFirstPayment('premium'),
      },
    },
    publish: true,
    verifiedAt,
    evidence: 'config/commercial.ts en tests/commercial-config.test.ts',
  },
  firstVersion: {
    value: {
      hours: commercialConfig.firstVersion.hours,
      startsAfter: commercialConfig.firstVersion.startsAfter,
      isFinalGoLivePromise: false,
    },
    publish: true,
    verifiedAt,
    evidence: 'config/commercial.ts en algemene voorwaarden artikel 8',
  },
  management: {
    value: {
      includedChangeMinutes: commercialConfig.management.includedChangeMinutes,
      cancellation: commercialConfig.management.cancellation,
      domainRemainsCustomerProperty: true,
    },
    publish: true,
    verifiedAt,
    evidence: 'config/commercial.ts en algemene voorwaarden artikelen 4, 6 en 12',
  },
  organization: {
    value: {
      brandName: 'Landingsite.nl',
      legalName: 'Jannik Dienstverlening',
      chamberOfCommerceNumber: '65549430',
      responsiblePerson: 'Jannik',
    },
    publish: true,
    verifiedAt,
    evidence: 'lib/business.ts en publieke juridische pagina\'s',
  },
  measuredResults: {
    value: null,
    publish: false,
    verifiedAt: null,
    evidence: null,
  },
  publicReviews: {
    value: null,
    publish: false,
    verifiedAt: null,
    evidence: null,
  },
} satisfies Record<string, VerifiedClaim<unknown>>

export function publishedClaim<T>(claim: VerifiedClaim<T>): T | null {
  if (!claim.publish || claim.value === null || !claim.verifiedAt || !claim.evidence) return null
  return claim.value
}
