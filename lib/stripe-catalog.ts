import type Stripe from 'stripe'
import { cents, commercialConfig, type CommercialPackageId } from '@/config/commercial'

export type StripeCatalogPrice = Pick<Stripe.Price, 'id' | 'active' | 'currency' | 'unit_amount' | 'tax_behavior' | 'type' | 'recurring'>

export type StripeCatalogEntry = {
  key: CommercialPackageId | 'management'
  catalogKey: string
  environmentName: string
  amount: number
  recurring: boolean
}

export const expectedStripeCatalog: StripeCatalogEntry[] = [
  ...Object.entries(commercialConfig.packages).map(([key, item]) => ({
    key: key as CommercialPackageId,
    catalogKey: `landingsite_build_${key}`,
    environmentName: item.stripePriceEnv,
    amount: item.oneTimePrice,
    recurring: false,
  })),
  {
    key: 'management' as const,
    catalogKey: 'landingsite_website_management_monthly',
    environmentName: commercialConfig.management.stripePriceEnv,
    amount: commercialConfig.management.monthlyPrice,
    recurring: true,
  },
]

export function validateStripeCatalogPrice(entry: StripeCatalogEntry, price: StripeCatalogPrice) {
  const errors: string[] = []
  if (!price.active) errors.push('prijs is niet actief')
  if (price.currency !== 'eur') errors.push(`valuta is ${price.currency}, verwacht eur`)
  if (price.unit_amount !== cents(entry.amount)) errors.push(`bedrag is ${price.unit_amount}, verwacht ${cents(entry.amount)} cent`)
  if (price.tax_behavior !== commercialConfig.stripeTaxBehavior) errors.push(`tax_behavior is ${price.tax_behavior}, verwacht ${commercialConfig.stripeTaxBehavior}`)
  if (entry.recurring) {
    if (price.type !== 'recurring') errors.push(`type is ${price.type}, verwacht recurring`)
    if (price.recurring?.interval !== 'month' || price.recurring.interval_count !== 1) errors.push('beheerinterval is niet exact één maand')
  } else if (price.type !== 'one_time' || price.recurring) {
    errors.push('bouwprijs is niet one_time')
  }
  if (errors.length) throw new Error(`${entry.environmentName} (${price.id}): ${errors.join('; ')}`)
}
