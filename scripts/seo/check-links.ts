import { publishedSeoPages, seoPages } from '../../content/seo-pages'

const failures: string[] = []
const knownRoutes = new Set([...seoPages.map((page) => page.slug), '/start', '/partner', '/partnervoorwaarden', '/verwerkersovereenkomst'])
const incoming = new Map(publishedSeoPages.map((page) => [page.slug, 0]))

for (const page of publishedSeoPages) {
  for (const related of page.relatedPages) {
    if (!related.startsWith('/') || related.includes('?')) failures.push(`${page.slug}: ongeschikte interne SEO-link ${related}`)
    if (!knownRoutes.has(related)) failures.push(`${page.slug}: onbekende route ${related}`)
    if (incoming.has(related)) incoming.set(related, (incoming.get(related) ?? 0) + 1)
  }
}
for (const [slug, count] of incoming) if (slug !== '/' && count === 0) failures.push(`${slug}: orphan indexable page`)

if (failures.length) {
  console.error(`Interne-linkcontrole mislukt:\n${failures.map((failure) => `- ${failure}`).join('\n')}`)
  process.exit(1)
}
console.log(`Interne-linkcontrole geslaagd; ${incoming.size} indexeerbare routes hebben een inkomende route.`)
