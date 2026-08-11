export const commercialConfig = {
  currency: 'EUR',
  vatRate: 0.21,
  pricesIncludeVat: true,
  stripeTaxBehavior: 'inclusive',
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
    stripePriceEnv: 'STRIPE_PRICE_WEBSITE_MANAGEMENT',
    features: [
      'Managed hosting en SSL',
      'Technische en beveiligingsupdates',
      'Back-ups en herstelmogelijkheden',
      'Uptime-monitoring en technische foutopvolging',
      'Controle van het aanvraagformulier',
      'Ondersteuning per e-mail',
      'Maximaal 20 minuten kleine tekst- of beeldwijzigingen per maand',
    ],
  },
  packages: {
    starter: {
      name: 'Starter',
      oneTimePrice: 299,
      audience: 'Voor één duidelijke dienst, product of aanbod.',
      pages: 1,
      sectionLimit: 7,
      correctionRounds: 1,
      copyScope: 'Aangeleverde teksten worden aangescherpt',
      formScope: 'Eén werkend formulier',
      recommended: false,
      stripePriceEnv: 'STRIPE_BUILD_PRICE_STARTER',
      ctaHref: '/start?pakket=starter',
      features: [
        'Eén landingspagina met één primaire actie',
        'Maximaal zeven inhoudelijke secties',
        'Aangeleverde teksten worden aangescherpt',
        'Werkend contact- of leadformulier',
        'Mobiel ontwerp, basis-SEO en metadata',
        'Eén gebundelde correctieronde',
      ],
    },
    pro: {
      name: 'Pro',
      oneTimePrice: 499,
      audience: 'Voor een onderneming die meer uitleg, bewijs en inhoud nodig heeft.',
      pages: 4,
      sectionLimit: null,
      correctionRounds: 2,
      copyScope: 'Teksten uitgewerkt op basis van de intake',
      formScope: 'Eén uitgebreider aanvraagformulier',
      recommended: true,
      stripePriceEnv: 'STRIPE_BUILD_PRICE_PRO',
      ctaHref: '/start?pakket=pro',
      features: [
        'Alles uit Starter',
        'Maximaal vier kernpagina’s',
        'Teksten uitgewerkt op basis van de intake',
        'Uitgebreidere positionering en formuliersegmentatie',
        'Portfolio-, diensten- of referentiesectie',
        'FAQ, interne links en uitgebreidere SEO-basis',
        'Twee gebundelde correctierondes',
      ],
    },
    premium: {
      name: 'Premium',
      oneTimePrice: 899,
      audience: 'Voor een onderneming die de volledige website wil laten uitwerken.',
      pages: 8,
      sectionLimit: null,
      correctionRounds: 3,
      copyScope: 'Volledige websitecopy op basis van de intake',
      formScope: 'Maximaal twee formulieren',
      recommended: false,
      stripePriceEnv: 'STRIPE_BUILD_PRICE_PREMIUM',
      ctaHref: '/start?pakket=premium',
      features: [
        'Alles uit Pro',
        'Maximaal acht kernpagina’s',
        'Volledige websitecopy op basis van de intake',
        'Eigen visuele richting en maatwerksecties',
        'Uitgebreid portfolio of cases',
        'Meerdere aanvraagroutes en maximaal twee formulieren',
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
  return commercialConfig.packages[packageId].oneTimePrice + commercialConfig.management.monthlyPrice
}

export function packageSpecs(packageId: CommercialPackageId) {
  const item = commercialConfig.packages[packageId]
  return [
    { label: 'Omvang', value: item.pages === 1 ? '1 landingspagina' : `Maximaal ${item.pages} kernpagina’s` },
    { label: 'Teksten', value: item.copyScope },
    { label: 'Correcties', value: `${item.correctionRounds} gebundelde correctieronde${item.correctionRounds === 1 ? '' : 's'}` },
    { label: 'Formulier', value: item.formScope },
  ]
}

export function vatFor(amount: number) {
  const vat = commercialConfig.pricesIncludeVat
    ? amount - (amount / (1 + commercialConfig.vatRate))
    : amount * commercialConfig.vatRate
  return Math.round(vat * 100) / 100
}

export function amountExcludingVat(amount: number) {
  if (!commercialConfig.pricesIncludeVat) return Math.round(amount * 100) / 100
  return Math.round((amount - vatFor(amount)) * 100) / 100
}

export function amountIncludingVat(amount: number) {
  if (commercialConfig.pricesIncludeVat) return Math.round(amount * 100) / 100
  return Math.round((amount + vatFor(amount)) * 100) / 100
}
