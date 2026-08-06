export const pricingConfig = {
  vatIncluded: false,
  currency: 'EUR',
  websiteManagement: {
    name: 'Websitebeheer Compleet',
    monthlyPrice: 79,
    billingInterval: 'month',
    includedChangeMinutes: 30,
    startsAt: 'go-live',
  },
  buildPackages: {
    starter: {
      name: 'Starter',
      oneTimePrice: 299,
    },
    pro: {
      name: 'Pro',
      oneTimePrice: 499,
    },
    premium: {
      name: 'Premium',
      oneTimePrice: 899,
    },
  },
} as const

export type BuildPackageId = keyof typeof pricingConfig.buildPackages

export function euro(amount: number) {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: pricingConfig.currency,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function cents(amount: number) {
  return Math.round(amount * 100)
}
