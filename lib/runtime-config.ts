import { commercialConfig, type CommercialPackageId } from '@/config/commercial'

const PRICE_ID = /^price_[A-Za-z0-9]+$/

export function validateCommercialRuntime(environment: NodeJS.ProcessEnv = process.env) {
  const errors: string[] = []
  const required = [
    commercialConfig.management.stripePriceEnv,
    ...Object.values(commercialConfig.packages).map((item) => item.stripePriceEnv),
  ]

  for (const name of required) {
    const value = environment[name]?.trim()
    if (!value) errors.push(`${name} ontbreekt`)
    else if (!PRICE_ID.test(value)) errors.push(`${name} is geen geldige Stripe Price ID`)
  }

  if (commercialConfig.management.monthlyPrice !== 79) errors.push('Websitebeheer moet €79 per maand zijn')
  const expected: Record<CommercialPackageId, number> = { starter: 299, pro: 499, premium: 899 }
  for (const [packageId, amount] of Object.entries(expected) as [CommercialPackageId, number][]) {
    if (commercialConfig.packages[packageId].oneTimePrice !== amount) errors.push(`${packageId} heeft een onjuiste bouwprijs`)
  }

  if (errors.length) throw new Error(`Ongeldige commerciële runtimeconfiguratie: ${errors.join('; ')}.`)
}
