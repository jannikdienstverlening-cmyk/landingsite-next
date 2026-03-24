import Stripe from 'stripe'

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export const PAKKETTEN = {
  starter: {
    naam: 'Starter',
    prijs: 29900,
    prijs_label: '€299',
    stripe_product_id: 'prod_UCtBzIGf8CWhF2',
  },
  pro: {
    naam: 'Pro',
    prijs: 49900,
    prijs_label: '€499',
    stripe_product_id: 'prod_UCtBBzeNbtApt2',
  },
  premium: {
    naam: 'Premium',
    prijs: 89900,
    prijs_label: '€899',
    stripe_product_id: 'prod_UCtB0VJcXDEokK',
  },
}
