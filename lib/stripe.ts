import Stripe from 'stripe'
import { cents, pricingConfig, type BuildPackageId } from '@/config/pricing'

let stripe: Stripe | null = null

export function getStripe() {
  const secretKey = process.env.STRIPE_SECRET_KEY

  if (!secretKey) {
    throw new Error('STRIPE_SECRET_KEY is missing.')
  }

  if (!stripe) {
    stripe = new Stripe(secretKey)
  }

  return stripe
}

export const PAKKETTEN = {
  starter: {
    naam: pricingConfig.buildPackages.starter.name,
    prijs: cents(pricingConfig.buildPackages.starter.oneTimePrice),
    prijs_label: `€${pricingConfig.buildPackages.starter.oneTimePrice}`,
  },
  pro: {
    naam: pricingConfig.buildPackages.pro.name,
    prijs: cents(pricingConfig.buildPackages.pro.oneTimePrice),
    prijs_label: `€${pricingConfig.buildPackages.pro.oneTimePrice}`,
  },
  premium: {
    naam: pricingConfig.buildPackages.premium.name,
    prijs: cents(pricingConfig.buildPackages.premium.oneTimePrice),
    prijs_label: `€${pricingConfig.buildPackages.premium.oneTimePrice}`,
  },
} as const

export type PakketId = BuildPackageId

export const STRIPE_BUILD_PRICE_ENV = {
  starter: 'STRIPE_BUILD_PRICE_STARTER',
  pro: 'STRIPE_BUILD_PRICE_PRO',
  premium: 'STRIPE_BUILD_PRICE_PREMIUM',
} as const satisfies Record<PakketId, string>

function validatePriceId(value: string | undefined, environmentName: string) {
  if (!value) return null
  if (!/^price_[A-Za-z0-9]+$/.test(value)) {
    throw new Error(`${environmentName} bevat geen geldige Stripe Price ID.`)
  }
  return value
}

export function configuredBuildPriceId(pakket: PakketId) {
  const environmentName = STRIPE_BUILD_PRICE_ENV[pakket]
  return validatePriceId(process.env[environmentName]?.trim(), environmentName)
}

export const STRIPE_MANAGEMENT_PRICE_ENV = 'STRIPE_PRICE_WEBSITE_MANAGEMENT'

export function configuredManagementPriceId() {
  return validatePriceId(process.env[STRIPE_MANAGEMENT_PRICE_ENV]?.trim(), STRIPE_MANAGEMENT_PRICE_ENV)
}

export const SUBSCRIPTION_INTERVAL = 'month' as const
export const TERMS_VERSION = '2026-08-01'
