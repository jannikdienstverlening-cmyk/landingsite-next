import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import robots from '../app/robots'
import sitemap from '../app/sitemap'
import { commercialConfig } from '../config/commercial'
import { publishedSeoPages, seoPages } from '../content/seo-pages'

test("indexeerbare pagina's hebben unieke metadata, hoofdterm en absolute canonical", () => {
  for (const field of ['title', 'description', 'canonical', 'primaryKeyword'] as const) {
    const values = publishedSeoPages.map((page) => page[field].toLocaleLowerCase('nl-NL'))
    assert.equal(new Set(values).size, values.length, `${field} moet uniek zijn`)
  }
  for (const page of publishedSeoPages) {
    assert.match(page.canonical, /^https:\/\/www\.landingsite\.nl\//)
    assert.ok(page.h1)
    assert.ok(page.author)
    assert.ok(page.reviewer)
    assert.ok(page.verifiedAt)
    assert.ok(['approved', 'published'].includes(page.status))
  }
})

test('sitemap bevat exact de goedgekeurde indexeerbare routes', () => {
  const expected = publishedSeoPages.filter((page) => page.includedInSitemap).map((page) => page.canonical).sort()
  const actual = sitemap().map((entry) => entry.url).sort()
  assert.deepEqual(actual, expected)
  assert.equal(actual.some((url) => /start|intake|beheer|preview/.test(url)), false)
  assert.equal(actual.some((url) => url.includes('?')), false)
})

test('robots verwijst naar sitemap en sluit private funnels uit', () => {
  const value = JSON.stringify(robots())
  assert.match(value, /https:\/\/www\.landingsite\.nl\/sitemap\.xml/)
  for (const route of ['/start', '/intake/', '/beheer/', '/preview/', '/admin/']) assert.match(value, new RegExp(route.replaceAll('/', '\\/')))
})

test('schemahelper gebruikt dezelfde commerciële prijzen en geen reviewschema', async () => {
  const source = await readFile('lib/seo.ts', 'utf8')
  assert.match(source, /commercialConfig\.packages/)
  assert.match(source, /commercialConfig\.currency/)
  assert.doesNotMatch(source, /AggregateRating|Review/)
  assert.deepEqual(Object.values(commercialConfig.packages).map((item) => item.oneTimePrice), [299, 499, 899])
})

test('snelle 48-uursroute is bewust niet gepubliceerd', () => {
  assert.equal(seoPages.some((page) => page.slug === '/website-laten-maken-binnen-48-uur'), false)
})

test('startflow forceert geen standaardpakket', async () => {
  const source = await readFile('app/start/page.tsx', 'utf8')
  assert.match(source, /CommercialPackageId \| null/)
  assert.match(source, /: null/)
  assert.doesNotMatch(source, /return .*\? .*: 'pro'/)
})
