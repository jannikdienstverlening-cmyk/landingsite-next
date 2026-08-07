import { cents, commercialConfig, euro } from './commercial'

/**
 * Compatibiliteitslaag voor bestaande serverroutes. Nieuwe code gebruikt
 * commercialConfig rechtstreeks, zodat prijzen en scope één bron hebben.
 */
export const pricingConfig = {
  vatIncluded: commercialConfig.pricesIncludeVat,
  currency: commercialConfig.currency,
  websiteManagement: {
    name: commercialConfig.management.name,
    monthlyPrice: commercialConfig.management.monthlyPrice,
    billingInterval: commercialConfig.management.billingInterval,
    includedChangeMinutes: commercialConfig.management.includedChangeMinutes,
    startsAt: commercialConfig.management.startsAt,
  },
  buildPackages: commercialConfig.packages,
} as const

export type BuildPackageId = keyof typeof commercialConfig.packages

export { cents, euro }
