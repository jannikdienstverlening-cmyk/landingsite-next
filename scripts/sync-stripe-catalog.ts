import { readFile } from 'node:fs/promises'
import Stripe from 'stripe'
import { PAKKETTEN, STRIPE_PRICE_ENV, SUBSCRIPTION_INTERVAL, type PakketId } from '../lib/stripe'

const PACKAGE_IDS = Object.keys(PAKKETTEN) as PakketId[]
const ALLOW_LIVE = process.argv.includes('--allow-live')

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

async function findProduct(stripe: Stripe, pakket: PakketId) {
  const expectedNames = new Set([
    `Landingsite.nl ${PAKKETTEN[pakket].naam}`,
    `Landingsite ${PAKKETTEN[pakket].naam}`,
    pakket === 'pro' ? 'Landingsite Pro' : '',
  ])
  const products = await stripe.products.list({ active: true, limit: 100 })
  return products.data.find((product) => product.metadata.landingsite_package === pakket)
    ?? products.data.find((product) => expectedNames.has(product.name))
    ?? null
}

async function syncPackage(stripe: Stripe, pakket: PakketId) {
  const details = PAKKETTEN[pakket]
  const product = await findProduct(stripe, pakket)
  const productData = {
    name: `Landingsite.nl ${details.naam}`,
    description: 'Websiteabonnement inclusief hosting, SSL, onderhoud, updates, backups en support volgens het gekozen pakket.',
    metadata: { landingsite_package: pakket, billing_model: 'monthly_subscription' },
  }
  const syncedProduct = product
    ? await stripe.products.update(product.id, productData)
    : await stripe.products.create(productData)

  const prices = await stripe.prices.list({ product: syncedProduct.id, active: true, limit: 100 })
  let price = prices.data.find((candidate) => (
    candidate.currency === 'eur'
    && candidate.unit_amount === details.prijs
    && candidate.recurring?.interval === SUBSCRIPTION_INTERVAL
    && candidate.recurring.interval_count === 1
    && candidate.tax_behavior === 'exclusive'
  ))

  if (!price) {
    price = await stripe.prices.create({
      product: syncedProduct.id,
      currency: 'eur',
      unit_amount: details.prijs,
      recurring: { interval: SUBSCRIPTION_INTERVAL },
      tax_behavior: 'exclusive',
      nickname: `${details.naam} maandelijks`,
      lookup_key: `landingsite_${pakket}_monthly`,
      transfer_lookup_key: true,
      metadata: { landingsite_package: pakket, billing_model: 'monthly_subscription' },
    })
  }

  await stripe.products.update(syncedProduct.id, { default_price: price.id })
  for (const oldPrice of prices.data) {
    if (oldPrice.id !== price.id) await stripe.prices.update(oldPrice.id, { active: false })
  }

  return { pakket, productId: syncedProduct.id, priceId: price.id, amount: details.prijs }
}

async function main() {
  await loadLocalEnvironment()
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) throw new Error('STRIPE_SECRET_KEY ontbreekt.')
  const liveMode = secretKey.startsWith('sk_live_')
  if (liveMode && !ALLOW_LIVE) {
    throw new Error('Live Stripe-catalogus niet gewijzigd. Herhaal bewust met --allow-live.')
  }

  const stripe = new Stripe(secretKey)
  const account = await stripe.accounts.retrieve(null)
  const results = []
  for (const pakket of PACKAGE_IDS) results.push(await syncPackage(stripe, pakket))

  console.log(JSON.stringify({
    mode: liveMode ? 'live' : 'test',
    accountId: account.id,
    prices: Object.fromEntries(results.map((result) => [STRIPE_PRICE_ENV[result.pakket], result.priceId])),
  }, null, 2))
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
