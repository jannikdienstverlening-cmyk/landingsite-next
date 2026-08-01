import Stripe from 'stripe'

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
    naam: 'Starter',
    prijs: 7900,
    prijs_label: '€79',
  },
  pro: {
    naam: 'Groei',
    prijs: 12900,
    prijs_label: '€129',
  },
  premium: {
    naam: 'Premium',
    prijs: 19900,
    prijs_label: '€199',
  },
} as const

export type PakketId = keyof typeof PAKKETTEN

export const STRIPE_PRICE_ENV = {
  starter: 'STRIPE_PRICE_STARTER',
  pro: 'STRIPE_PRICE_GROEI',
  premium: 'STRIPE_PRICE_PREMIUM',
} as const satisfies Record<PakketId, string>

export function configuredStripePriceId(pakket: PakketId) {
  const value = process.env[STRIPE_PRICE_ENV[pakket]]?.trim()
  if (!value) return null
  if (!/^price_[A-Za-z0-9]+$/.test(value)) {
    throw new Error(`${STRIPE_PRICE_ENV[pakket]} bevat geen geldige Stripe Price ID.`)
  }
  return value
}

export const SUBSCRIPTION_INTERVAL = 'month' as const
export const TERMS_VERSION = '2026-08-01'
