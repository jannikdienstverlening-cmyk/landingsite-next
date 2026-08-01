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

export const SUBSCRIPTION_INTERVAL = 'month' as const
export const TERMS_VERSION = '2026-08-01'
