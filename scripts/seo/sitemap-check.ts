import sitemap from '../../app/sitemap'
import robots from '../../app/robots'
import { publishedSeoPages } from '../../content/seo-pages'

const entries = sitemap()
const expected = publishedSeoPages.filter((page) => page.includedInSitemap).map((page) => page.canonical).sort()
const actual = entries.map((entry) => entry.url).sort()
const failures: string[] = []
if (JSON.stringify(expected) !== JSON.stringify(actual)) failures.push('sitemap en contentregister verschillen')
for (const entry of entries) {
  if (!entry.url.startsWith('https://www.landingsite.nl/')) failures.push(`ongeldig domein: ${entry.url}`)
  if (entry.url.includes('?')) failures.push(`queryparameter in sitemap: ${entry.url}`)
}
if (!robots().sitemap?.toString().includes('https://www.landingsite.nl/sitemap.xml')) failures.push('robots.txt verwijst niet naar de canonical sitemap')
if (failures.length) {
  console.error(`Sitemapcontrole mislukt:\n${failures.map((failure) => `- ${failure}`).join('\n')}`)
  process.exit(1)
}
console.log(`Sitemapcontrole geslaagd met ${entries.length} canonical URL's.`)
