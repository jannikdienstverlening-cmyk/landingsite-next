import { readFile } from 'node:fs/promises'
import process from 'node:process'

const baseUrl = (process.env.SMOKE_BASE_URL || 'http://127.0.0.1:3001').replace(/\/$/, '')
const claims = JSON.parse(await readFile(new URL('../config/banned-public-claims.json', import.meta.url), 'utf8'))
const htmlRoutes = [
  { path: '/', canonical: 'https://www.landingsite.nl' },
  { path: '/werk', canonical: 'https://www.landingsite.nl/werk' },
  { path: '/blog', canonical: 'https://www.landingsite.nl/blog' },
  { path: '/blog/wat-moet-er-bovenaan-je-website-staan', canonical: 'https://www.landingsite.nl/blog/wat-moet-er-bovenaan-je-website-staan' },
  { path: '/start', noindex: true },
  { path: '/partner', noindex: true },
  { path: '/partnervoorwaarden', noindex: true },
  { path: '/verwerkersovereenkomst', noindex: true },
  { path: '/algemene-voorwaarden', canonical: 'https://www.landingsite.nl/algemene-voorwaarden' },
  { path: '/privacybeleid', canonical: 'https://www.landingsite.nl/privacybeleid' },
  { path: '/marketing/bevestigen', noindex: true },
  { path: '/marketing/afmelden', noindex: true },
]

function assertClean(contents, path) {
  for (const claim of claims.exact) {
    if (contents.toLocaleLowerCase('nl-NL').includes(claim.toLocaleLowerCase('nl-NL'))) {
      throw new Error(`${path} bevat verboden claim "${claim}".`)
    }
  }
  for (const source of claims.patterns) {
    if (new RegExp(source, 'iu').test(contents)) throw new Error(`${path} matcht verboden patroon /${source}/.`)
  }
}

for (const route of htmlRoutes) {
  const response = await fetch(`${baseUrl}${route.path}`, { redirect: 'follow' })
  if (!response.ok) throw new Error(`${route.path} antwoordt met ${response.status}.`)
  if (route.path === '/') {
    for (const header of ['content-security-policy', 'strict-transport-security', 'x-content-type-options']) {
      if (!response.headers.get(header)) throw new Error(`Homepage mist security header ${header}.`)
    }
  }
  const html = await response.text()
  if (!html.toLocaleLowerCase('nl-NL').includes('landingsite')) throw new Error(`${route.path} bevat het merk niet.`)
  assertClean(html, route.path)
  if (route.noindex && !/<meta[^>]+name=["']robots["'][^>]+content=["'][^"']*noindex/iu.test(html)) {
    throw new Error(`${route.path} mist noindex.`)
  }
  if (route.canonical) {
    const canonical = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)/iu)?.[1]
    if (canonical !== route.canonical) throw new Error(`${route.path} heeft canonical ${canonical || 'ontbreekt'}.`)
  }
  console.log(`OK ${route.path}`)
}

const robotsResponse = await fetch(`${baseUrl}/robots.txt`)
if (!robotsResponse.ok) throw new Error(`/robots.txt antwoordt met ${robotsResponse.status}.`)
const robots = await robotsResponse.text()
if (!robots.includes('https://www.landingsite.nl/sitemap.xml')) throw new Error('/robots.txt mist de canonieke sitemap.')
console.log('OK /robots.txt')

const sitemapResponse = await fetch(`${baseUrl}/sitemap.xml`)
if (!sitemapResponse.ok) throw new Error(`/sitemap.xml antwoordt met ${sitemapResponse.status}.`)
const sitemap = await sitemapResponse.text()
for (const expected of ['https://www.landingsite.nl', 'https://www.landingsite.nl/werk', 'https://www.landingsite.nl/blog', 'https://www.landingsite.nl/blog/wat-moet-er-bovenaan-je-website-staan']) {
  if (!sitemap.includes(`<loc>${expected}</loc>`)) throw new Error(`/sitemap.xml mist ${expected}.`)
}
for (const excluded of ['/start', '/partner', '/intake', '/beheer']) {
  if (sitemap.includes(`<loc>https://www.landingsite.nl${excluded}`)) throw new Error(`/sitemap.xml bevat transactionele route ${excluded}.`)
}
assertClean(sitemap, '/sitemap.xml')
console.log('OK /sitemap.xml')

const manifestResponse = await fetch(`${baseUrl}/manifest.webmanifest`)
if (!manifestResponse.ok) throw new Error(`/manifest.webmanifest antwoordt met ${manifestResponse.status}.`)
const manifest = await manifestResponse.json()
if (manifest.name !== 'Landingsite.nl' || !Array.isArray(manifest.icons) || manifest.icons.length < 2) {
  throw new Error('/manifest.webmanifest bevat niet de complete merkconfiguratie.')
}
console.log('OK /manifest.webmanifest')

for (const asset of ['/favicon.svg', '/icon-192.png', '/icon-512.png', '/og/default.png']) {
  const response = await fetch(`${baseUrl}${asset}`)
  if (!response.ok) throw new Error(`${asset} antwoordt met ${response.status}.`)
  if (!response.headers.get('content-type')?.startsWith('image/')) throw new Error(`${asset} heeft geen image content-type.`)
  console.log(`OK ${asset}`)
}
