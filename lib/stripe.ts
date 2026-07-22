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
    prijs: 29900,
    prijs_label: '€299',
  },
  pro: {
    naam: 'Pro',
    prijs: 49900,
    prijs_label: '€499',
  },
  premium: {
    naam: 'Premium',
    prijs: 89900,
    prijs_label: '€899',
  },
}
