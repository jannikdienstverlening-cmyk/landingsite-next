import { readFile } from 'node:fs/promises'
import Stripe from 'stripe'
import { expectedStripeCatalog, validateStripeCatalogPrice } from '../lib/stripe-catalog'

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

async function main() {
  await loadLocalEnvironment()
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) throw new Error('STRIPE_SECRET_KEY ontbreekt.')
  const stripe = new Stripe(secretKey)
  const checked: Record<string, string> = {}
  const activePrices = await stripe.prices.list({ active: true, limit: 100 })

  for (const entry of expectedStripeCatalog) {
    const configuredPriceId = process.env[entry.environmentName]?.trim()
    const discoveredPrice = configuredPriceId ? null : activePrices.data.find((price) => (
      price.lookup_key === entry.catalogKey || price.metadata.landingsite_catalog_key === entry.catalogKey
    ))
    const priceId = configuredPriceId ?? discoveredPrice?.id
    if (!priceId) throw new Error(`${entry.environmentName} ontbreekt en lookup_key ${entry.catalogKey} is niet gevonden.`)
    const price = discoveredPrice ?? await stripe.prices.retrieve(priceId)
    validateStripeCatalogPrice(entry, price)
    checked[entry.key] = price.id
  }

  console.log(JSON.stringify({
    mode: secretKey.startsWith('sk_live_') ? 'live' : 'test',
    checked,
    environment: Object.fromEntries(expectedStripeCatalog.map((entry) => [entry.environmentName, checked[entry.key]])),
  }, null, 2))
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
