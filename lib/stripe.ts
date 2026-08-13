import Stripe from 'stripe'
import { cents, commercialConfig, type CommercialPackageId } from '@/config/commercial'

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

export const STRIPE_CHECKOUT_BRAND = {
  backgroundColor: '#f7f4ec',
  buttonColor: '#1d4ed8',
  displayName: 'Landingsite.nl',
  fontFamily: 'inter',
  borderStyle: 'rounded',
} as const

export function stripeCheckoutBranding(baseUrl: string): Stripe.Checkout.SessionCreateParams.BrandingSettings {
  const iconUrl = `${baseUrl.replace(/\/$/, '')}/images/stripe-icon.png`

  return {
    background_color: STRIPE_CHECKOUT_BRAND.backgroundColor,
    button_color: STRIPE_CHECKOUT_BRAND.buttonColor,
    display_name: STRIPE_CHECKOUT_BRAND.displayName,
    font_family: STRIPE_CHECKOUT_BRAND.fontFamily,
    border_style: STRIPE_CHECKOUT_BRAND.borderStyle,
    ...(iconUrl.startsWith('https://') ? { icon: { type: 'url' as const, url: iconUrl } } : {}),
  }
}

export const STRIPE_BUILD_PAYMENT_METHODS = ['ideal', 'card'] as const satisfies readonly Stripe.Checkout.SessionCreateParams.PaymentMethodType[]
export const STRIPE_MANAGEMENT_PAYMENT_METHODS = ['ideal', 'card', 'sepa_debit'] as const satisfies readonly Stripe.Checkout.SessionCreateParams.PaymentMethodType[]
export const STRIPE_COMBINED_PAYMENT_METHODS = STRIPE_MANAGEMENT_PAYMENT_METHODS

export function stripePaymentMethods(
  methods: readonly Stripe.Checkout.SessionCreateParams.PaymentMethodType[],
): Stripe.Checkout.SessionCreateParams.PaymentMethodType[] {
  return [...methods]
}

export const PAKKETTEN = {
  starter: {
    naam: commercialConfig.packages.starter.name,
    prijs: cents(commercialConfig.packages.starter.oneTimePrice),
    prijs_label: `€${commercialConfig.packages.starter.oneTimePrice}`,
  },
  pro: {
    naam: commercialConfig.packages.pro.name,
    prijs: cents(commercialConfig.packages.pro.oneTimePrice),
    prijs_label: `€${commercialConfig.packages.pro.oneTimePrice}`,
  },
  premium: {
    naam: commercialConfig.packages.premium.name,
    prijs: cents(commercialConfig.packages.premium.oneTimePrice),
    prijs_label: `€${commercialConfig.packages.premium.oneTimePrice}`,
  },
} as const

export type PakketId = CommercialPackageId

export const STRIPE_BUILD_PRICE_ENV = {
  starter: commercialConfig.packages.starter.stripePriceEnv,
  pro: commercialConfig.packages.pro.stripePriceEnv,
  premium: commercialConfig.packages.premium.stripePriceEnv,
} as const satisfies Record<PakketId, string>

function validatePriceId(value: string | undefined, environmentName: string) {
  if (!value) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(`${environmentName} ontbreekt in productie.`)
    }
    return null
  }
  if (!/^price_[A-Za-z0-9]+$/.test(value)) {
    throw new Error(`${environmentName} bevat geen geldige Stripe Price ID.`)
  }
  return value
}

export function configuredBuildPriceId(pakket: PakketId) {
  const environmentName = STRIPE_BUILD_PRICE_ENV[pakket]
  return validatePriceId(process.env[environmentName]?.trim(), environmentName)
}

export const STRIPE_MANAGEMENT_PRICE_ENV = commercialConfig.management.stripePriceEnv

export function configuredManagementPriceId() {
  return validatePriceId(process.env[STRIPE_MANAGEMENT_PRICE_ENV]?.trim(), STRIPE_MANAGEMENT_PRICE_ENV)
}

export const SUBSCRIPTION_INTERVAL = 'month' as const
export const TERMS_VERSION = '2026-08-13-zomeractie'
