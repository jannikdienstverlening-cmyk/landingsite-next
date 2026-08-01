import { pricingConfig } from './pricing'

export const partnerProgramConfig = {
  enabled: true,
  participationIsFree: true,
  subscriptionPrice: pricingConfig.websiteManagement.monthlyPrice,
  minimumPayout: 25,
  waitingPeriodDays: 30,
  attributionWindowDays: 30,
  maximumPaidLevels: 3,
  commissions: {
    level1: 20,
    level2: 5,
    level3: 2,
  },
  example: {
    referralsPerPartner: 5,
    level1Customers: 5,
    level2Customers: 25,
    level3Customers: 125,
  },
} as const
