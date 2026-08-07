export const commercialConfig = {
  currency: 'EUR',
  vatRate: 0.21,
  pricesIncludeVat: false,
  firstVersion: {
    hours: 48,
    startsAfter: 'payment-and-complete-intake',
  },
  management: {
    name: 'Hosting & Websitebeheer',
    shortName: 'Websitebeheer',
    monthlyPrice: 79,
    billingInterval: 'month',
    includedChangeMinutes: 20,
    startsAt: 'checkout',
    cancellation: 'end-of-current-billing-period',
  },
  packages: {
    starter: {
      name: 'Starter',
      oneTimePrice: 299,
      firstPayment: 378,
      audience: 'Voor één duidelijke dienst, campagne of aanbod.',
      pages: 1,
      correctionRounds: 1,
      features: [
        'Eén conversiegerichte landingspagina',
        'Maximaal zeven inhoudelijke secties',
        'Werkend contact- of leadformulier',
        'Mobiel ontwerp en technische basisoptimalisatie',
        'Title en meta description',
        'Eén gebundelde correctieronde',
      ],
    },
    pro: {
      name: 'Pro',
      oneTimePrice: 499,
      firstPayment: 578,
      audience: 'Voor meer uitleg, vertrouwen en vindbaarheid.',
      pages: 4,
      correctionRounds: 2,
      features: [
        'Alles uit Starter',
        'Maximaal vier kernpagina’s',
        'Aanscherping van aangeleverde teksten',
        'Portfolio-, diensten- of referentiesectie',
        'Uitgebreidere SEO-basis en interne links',
        'Twee gebundelde correctierondes',
      ],
    },
    premium: {
      name: 'Premium',
      oneTimePrice: 899,
      firstPayment: 978,
      audience: 'Voor volledige uitwerking en een eigen visuele richting.',
      pages: 8,
      correctionRounds: 3,
      features: [
        'Alles uit Pro',
        'Maximaal acht kernpagina’s',
        'Volledige conversiecopy op basis van de intake',
        'Eigen visuele richting en maatwerksecties',
        'Meerdere aanvraagroutes wanneer nodig',
        'Drie gebundelde correctierondes',
      ],
    },
  },
} as const

export type CommercialPackageId = keyof typeof commercialConfig.packages

export function euro(amount: number, decimals = 0) {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: commercialConfig.currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount)
}

export function cents(amount: number) {
  return Math.round(amount * 100)
}

export function packageFirstPayment(packageId: CommercialPackageId) {
  const item = commercialConfig.packages[packageId]
  return item.oneTimePrice + commercialConfig.management.monthlyPrice
}

export function vatFor(amount: number) {
  return Math.round(amount * commercialConfig.vatRate * 100) / 100
}

export function amountIncludingVat(amount: number) {
  return Math.round((amount + vatFor(amount)) * 100) / 100
}
