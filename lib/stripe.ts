import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export const PAKKETTEN = {
  starter: {
    naam: 'Starter',
    prijs: 29900, // in cents
    prijs_label: '€299',
    stripe_price_id: null as string | null,
  },
  pro: {
    naam: 'Pro',
    prijs: 49900,
    prijs_label: '€499',
    stripe_price_id: null as string | null,
  },
  premium: {
    naam: 'Premium',
    prijs: 89900,
    prijs_label: '€899',
    stripe_price_id: null as string | null,
  },
}
