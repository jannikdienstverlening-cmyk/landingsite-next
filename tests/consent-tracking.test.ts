import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { consentConfig } from '../config/consent'
import { trackingConfig } from '../config/tracking'

test('niet-noodzakelijke toestemming staat standaard uit', () => {
  assert.equal(consentConfig.categories.necessary, true)
  assert.equal(consentConfig.categories.analytics, false)
  assert.equal(consentConfig.categories.marketing, false)
  assert.equal(consentConfig.categories.preferences, false)
  assert.equal(consentConfig.analytics.consentVersion, 'consent-v2')
})

test('Consent Mode v2 staat standaard op denied', async () => {
  const layout = await readFile(new URL('../app/layout.tsx', import.meta.url), 'utf8')
  for (const signal of ['analytics_storage', 'ad_storage', 'ad_user_data', 'ad_personalization']) {
    assert.match(layout, new RegExp(`${signal}: 'denied'`))
  }
})

test('externe analytics vereist configuratie en expliciete toestemming', async () => {
  const analytics = await readFile(new URL('../lib/analytics.ts', import.meta.url), 'utf8')
  assert.match(analytics, /externalCollectionEnabled && hasExternalAnalyticsConsent/)
  assert.match(analytics, /choice\?\.marketing && window\.fbq/)
  assert.doesNotMatch(analytics, /email|phone|naam|bericht|intake_answer|upload/i)
})

test('campagnecontext bevat alleen de afgesproken sleutels', () => {
  assert.deepEqual([...trackingConfig.campaignKeys], [
    'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term',
    'gclid', 'gbraid', 'wbraid', 'fbclid',
  ])
})
