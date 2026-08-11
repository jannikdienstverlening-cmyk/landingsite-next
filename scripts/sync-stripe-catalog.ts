import { readFile } from 'node:fs/promises'
import Stripe from 'stripe'
import { cents, pricingConfig, type BuildPackageId } from '../config/pricing'
import { STRIPE_BUILD_PRICE_ENV, STRIPE_MANAGEMENT_PRICE_ENV, SUBSCRIPTION_INTERVAL } from '../lib/stripe'

const PACKAGE_IDS = Object.keys(pricingConfig.buildPackages) as BuildPackageId[]
const ALLOW_LIVE = process.argv.includes('--allow-live')
const ARCHIVE_OLD = process.argv.includes('--archive-old')

async function loadLocalEnvironment() {
  try {
    const text = await readFile('.env.local', 'utf8')
    for (const rawLine of text.split(/\r?\n/)) {
      const line = rawLine.trim()
      if (!line || line.startsWith('#')) continue
      const separator = line.indexOf('=')
      if (separator < 1) continue
      const key = line.slice(0, separator).trim()
      const value = line.slice(separator + 1).trim().replace(/^['"]|['"]$/g, '')
      if (!(key in process.env)) process.env[key] = value
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
  }
}

async function productFor(stripe: Stripe, catalogKey: string, name: string, description: string) {
  const products = await stripe.products.list({ active: true, limit: 100 })
  const existing = products.data.find((product) => product.metadata.landingsite_catalog_key === catalogKey)
    ?? products.data.find((product) => product.name === name)
  const data = { name, description, metadata: { landingsite_catalog_key: catalogKey } }
  return existing ? stripe.products.update(existing.id, data) : stripe.products.create(data)
}

async function syncPrice(stripe: Stripe, options: {
  catalogKey: string
  productName: string
  description: string
  amount: number
  recurring: boolean
  nickname: string
}) {
  const product = await productFor(stripe, options.catalogKey, options.productName, options.description)
  const prices = await stripe.prices.list({ product: product.id, active: true, limit: 100 })
  let price = prices.data.find((candidate) => candidate.currency === 'eur'
    && candidate.unit_amount === cents(options.amount)
    && candidate.tax_behavior === (pricingConfig.vatIncluded ? 'inclusive' : 'exclusive')
    && (options.recurring ? candidate.recurring?.interval === SUBSCRIPTION_INTERVAL : candidate.type === 'one_time'))

  if (!price) {
    price = await stripe.prices.create({
      product: product.id,
      currency: 'eur',
      unit_amount: cents(options.amount),
      tax_behavior: pricingConfig.vatIncluded ? 'inclusive' : 'exclusive',
      ...(options.recurring ? { recurring: { interval: SUBSCRIPTION_INTERVAL } } : {}),
      nickname: options.nickname,
      lookup_key: options.catalogKey,
      transfer_lookup_key: true,
      metadata: { landingsite_catalog_key: options.catalogKey },
    })
  }

  await stripe.products.update(product.id, { default_price: price.id })
  if (ARCHIVE_OLD) {
    for (const oldPrice of prices.data) if (oldPrice.id !== price.id) await stripe.prices.update(oldPrice.id, { active: false })
  }
  return price.id
}

async function main() {
  await loadLocalEnvironment()
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) throw new Error('STRIPE_SECRET_KEY ontbreekt.')
  const liveMode = secretKey.startsWith('sk_live_')
  if (liveMode && !ALLOW_LIVE) throw new Error('Live Stripe-catalogus niet gewijzigd. Herhaal bewust met --allow-live.')

  const stripe = new Stripe(secretKey)
  const account = await stripe.accounts.retrieve(null)
  const prices: Record<string, string> = {}

  for (const packageId of PACKAGE_IDS) {
    const details = pricingConfig.buildPackages[packageId]
    prices[STRIPE_BUILD_PRICE_ENV[packageId]] = await syncPrice(stripe, {
      catalogKey: `landingsite_build_${packageId}`,
      productName: `Landingsite.nl ${details.name}`,
      description: 'Eenmalige bouwprijs voor het gekozen websitepakket. De eerste maand Hosting & Websitebeheer wordt in dezelfde checkout afgerekend.',
      amount: details.oneTimePrice,
      recurring: false,
      nickname: `${details.name} eenmalige bouwprijs`,
    })
  }

  prices[STRIPE_MANAGEMENT_PRICE_ENV] = await syncPrice(stripe, {
    catalogKey: 'landingsite_website_management_monthly',
    productName: pricingConfig.websiteManagement.name,
    description: 'Managed hosting, SSL, back-ups, beveiligingsupdates, monitoring, ondersteuning en kleine wijzigingen.',
    amount: pricingConfig.websiteManagement.monthlyPrice,
    recurring: true,
    nickname: 'Websitebeheer maandelijks',
  })

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, '')
  let webhookEndpoint: string | null = null
  if (baseUrl) {
    const expectedUrl = `${baseUrl}/api/stripe/webhook`
    const endpoints = await stripe.webhookEndpoints.list({ limit: 100 })
    const endpoint = endpoints.data.find((candidate) => candidate.url === expectedUrl)
    if (endpoint) {
      await stripe.webhookEndpoints.update(endpoint.id, { enabled_events: [
        'checkout.session.completed',
        'checkout.session.async_payment_succeeded',
        'checkout.session.expired',
        'invoice.paid',
        'invoice.payment_failed',
        'invoice.voided',
        'charge.refunded',
        'charge.dispute.created',
        'charge.dispute.closed',
        'customer.subscription.created',
        'customer.subscription.updated',
        'customer.subscription.deleted',
      ] })
      webhookEndpoint = endpoint.id
    }
  }

  console.log(JSON.stringify({ mode: liveMode ? 'live' : 'test', accountId: account.id, prices, webhookEndpoint, archivedOldPrices: ARCHIVE_OLD }, null, 2))
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
