import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { consentConfig } from '../config/consent'
import {
  createMarketingConfirmationToken,
  hashMarketingToken,
  marketingConfirmationExpiresAt,
  maySendMarketing,
  normalizeMarketingEmail,
} from '../lib/marketing-consent'
import { validateCommercialRuntime } from '../lib/runtime-config'
import { expectedStripeCatalog, validateStripeCatalogPrice } from '../lib/stripe-catalog'
import { shouldApplyStripeEvent } from '../lib/stripe-event-order'

const validPriceEnvironment: NodeJS.ProcessEnv = {
  ...process.env,
  STRIPE_BUILD_PRICE_STARTER: 'price_starter123',
  STRIPE_BUILD_PRICE_PRO: 'price_pro123',
  STRIPE_BUILD_PRICE_PREMIUM: 'price_premium123',
  STRIPE_PRICE_WEBSITE_MANAGEMENT: 'price_management123',
}

test('productieconfiguratie blokkeert ontbrekende of ongeldige Stripe Price IDs', () => {
  assert.doesNotThrow(() => validateCommercialRuntime(validPriceEnvironment))
  assert.throws(() => validateCommercialRuntime({ ...validPriceEnvironment, STRIPE_BUILD_PRICE_PRO: '' }), /STRIPE_BUILD_PRICE_PRO ontbreekt/)
  assert.throws(() => validateCommercialRuntime({ ...validPriceEnvironment, STRIPE_PRICE_WEBSITE_MANAGEMENT: 'prod_79' }), /geen geldige Stripe Price ID/)
})

test('Stripe-catalogus verwacht drie eenmalige prijzen en één maandprijs', () => {
  assert.deepEqual(expectedStripeCatalog.map((entry) => [entry.key, entry.catalogKey, entry.amount, entry.recurring]), [
    ['starter', 'landingsite_build_starter', 299, false],
    ['pro', 'landingsite_build_pro', 499, false],
    ['premium', 'landingsite_build_premium', 899, false],
    ['management', 'landingsite_website_management_monthly', 79, true],
  ])
  for (const entry of expectedStripeCatalog) {
    assert.doesNotThrow(() => validateStripeCatalogPrice(entry, {
      id: `price_${entry.key}`,
      active: true,
      currency: 'eur',
      unit_amount: entry.amount * 100,
      tax_behavior: 'inclusive',
      type: entry.recurring ? 'recurring' : 'one_time',
      recurring: entry.recurring ? { interval: 'month', interval_count: 1 } : null,
    } as never))
  }
  const management = expectedStripeCatalog.find((entry) => entry.key === 'management')!
  assert.throws(() => validateStripeCatalogPrice(management, {
    id: 'price_wrong', active: true, currency: 'eur', unit_amount: 1500,
    tax_behavior: 'inclusive', type: 'recurring', recurring: { interval: 'month', interval_count: 1 },
  } as never), /verwacht 7900 cent/)
})

test('marketingtoestemming is apart, dubbel bevestigd en suppressie-veilig', () => {
  const token = createMarketingConfirmationToken()
  assert.equal(token.length >= 40, true)
  assert.equal(hashMarketingToken(token), hashMarketingToken(token))
  assert.notEqual(hashMarketingToken(token), token)
  assert.equal(normalizeMarketingEmail('  TEST@Example.COM '), 'test@example.com')
  assert.equal(marketingConfirmationExpiresAt(new Date('2026-01-01T00:00:00Z')).toISOString(), '2026-01-02T00:00:00.000Z')
  assert.equal(consentConfig.marketing.bundledWithOrder, false)
  assert.equal(maySendMarketing({ status: 'unsubscribed', consentVersion: consentConfig.marketing.version, suppressed: false }), false)
  assert.equal(maySendMarketing({ status: 'active', consentVersion: consentConfig.marketing.version, suppressed: true }), false)
})

test('marketingdatabase bewaart verzoek, bewijs, abonnee en suppressie apart', async () => {
  const migration = await readFile('supabase-migration.sql', 'utf8')
  for (const table of ['marketing_consent_requests', 'marketing_subscribers', 'marketing_suppressions', 'marketing_consent_audit']) {
    assert.match(migration, new RegExp(`CREATE TABLE IF NOT EXISTS ${table}`))
    assert.match(migration, new RegExp(`ALTER TABLE ${table} ENABLE ROW LEVEL SECURITY`))
  }
})

test('klantportaal is on-demand en begrensd', async () => {
  const portal = await readFile('app/api/stripe/portal/route.ts', 'utf8')
  assert.match(portal, /billingPortal\.sessions\.create/)
  assert.match(portal, /checkRateLimit\(`customer-portal:/)
  assert.doesNotMatch(portal, /customer_portal_url/)
})

test('oudere Stripe-events kunnen een nieuwere abonnementsstatus niet terugdraaien', () => {
  assert.equal(shouldApplyStripeEvent(null, 100), true)
  assert.equal(shouldApplyStripeEvent(100, 100), true)
  assert.equal(shouldApplyStripeEvent(100, 101), true)
  assert.equal(shouldApplyStripeEvent(101, 100), false)
})

test('oude interactieve projectcarousel en zijn CSS zijn verwijderd', async () => {
  const homepage = await readFile('components/studio-site.tsx', 'utf8')
  const css = await readFile('app/homepage.css', 'utf8')
  assert.doesNotMatch(homepage, /ProjectShowcase|project-showcase/)
  assert.doesNotMatch(css, /project-showcase/)
})
