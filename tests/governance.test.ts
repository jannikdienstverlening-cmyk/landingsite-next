import assert from 'node:assert/strict'
import { readFile, stat } from 'node:fs/promises'
import test from 'node:test'
import sharp from 'sharp'
import { consentConfig } from '../config/consent'
import { activeVendors, customerDataSubprocessors } from '../config/vendors'

test('marketing en externe analytics blijven uit zonder afzonderlijke toestemming', async () => {
  assert.equal(consentConfig.marketing.enabled, false)
  assert.equal(consentConfig.marketing.bundledWithOrder, false)
  assert.equal(consentConfig.analytics.externalCollectionEnabled, false)
  const analytics = await readFile('lib/analytics.ts', 'utf8')
  assert.match(analytics, /hasExternalAnalyticsConsent/)
  assert.match(analytics, /externalCollectionEnabled && hasExternalAnalyticsConsent/)
})

test('leveranciersregister voedt privacy en verwerkersovereenkomst', async () => {
  assert.deepEqual(activeVendors.map((vendor) => vendor.name).sort(), ['Anthropic', 'Netlify', 'Resend', 'Stripe', 'Supabase', 'Vercel'])
  assert.equal(customerDataSubprocessors.some((vendor) => vendor.name === 'Stripe'), false)
  const privacy = await readFile('app/privacybeleid/page.tsx', 'utf8')
  const dpa = await readFile('app/verwerkersovereenkomst/page.tsx', 'utf8')
  assert.match(privacy, /activeVendors\.map/)
  assert.match(dpa, /customerDataSubprocessors\.map/)
})

test('woordmerken bestaan uit vectorpaden zonder extern font', async () => {
  for (const path of ['public/brand/landingsite-wordmark-dark.svg', 'public/brand/landingsite-wordmark-light.svg']) {
    const svg = await readFile(path, 'utf8')
    assert.match(svg, /<path /)
    assert.doesNotMatch(svg, /<text|font-family|<image/i)
  }
})

test('merkassets gebruiken het afgesproken inkt-, kobalt- en signaalpalet', async () => {
  const dark = await readFile('public/brand/landingsite-wordmark-dark.svg', 'utf8')
  const mark = await readFile('public/brand/landingsite-mark.svg', 'utf8')
  assert.match(dark, /#0b1220/)
  assert.match(dark, /#246bfd/)
  assert.match(dark, /#ff6a2a/)
  assert.match(mark, /#0b1220/)
  assert.match(mark, /#246bfd/)
  assert.doesNotMatch(mark, /<(?:rect|circle|text|image)\b/i)
})

test('favicon-, app- en OG-assets hebben de afgesproken maten', async () => {
  const assets = [
    ['public/favicon-16x16.png', 16, 16],
    ['public/favicon-32x32.png', 32, 32],
    ['public/apple-touch-icon.png', 180, 180],
    ['public/icon-192.png', 192, 192],
    ['public/icon-512.png', 512, 512],
    ['public/og/default.png', 1200, 630],
  ] as const
  for (const [path, width, height] of assets) {
    await stat(path)
    const metadata = await sharp(path).metadata()
    assert.equal(metadata.width, width, path)
    assert.equal(metadata.height, height, path)
  }
})
