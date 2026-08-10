import { readFile, readdir } from 'node:fs/promises'
import { extname, join, relative } from 'node:path'
import { publishedSeoPages, seoPages } from '../../content/seo-pages'

const root = process.cwd()
const failures: string[] = []
const publicStatuses = new Set(['approved', 'published'])

function duplicateValues(field: 'title' | 'description' | 'canonical' | 'primaryKeyword') {
  const seen = new Map<string, string>()
  for (const page of publishedSeoPages) {
    const value = page[field].trim().toLocaleLowerCase('nl-NL')
    const previous = seen.get(value)
    if (previous) failures.push(`${field} is dubbel: ${previous} en ${page.slug}`)
    seen.set(value, page.slug)
  }
}

for (const field of ['title', 'description', 'canonical', 'primaryKeyword'] as const) duplicateValues(field)
for (const page of seoPages) {
  if (!page.slug.startsWith('/')) failures.push(`${page.slug}: slug moet met / beginnen`)
  if (!page.title || !page.description || !page.canonical || !page.h1) failures.push(`${page.slug}: metadata of H1 ontbreekt`)
  if (!page.author || !page.reviewer || !page.verifiedAt || !page.updatedAt) failures.push(`${page.slug}: auteur, reviewer of controledatum ontbreekt`)
  if (page.indexable && !publicStatuses.has(page.status)) failures.push(`${page.slug}: ${page.status} mag niet indexeerbaar zijn`)
  if (page.includedInSitemap && (!page.indexable || !publicStatuses.has(page.status))) failures.push(`${page.slug}: ongeldige sitemapstatus`)
  if (!page.canonical.startsWith('https://www.landingsite.nl/')) failures.push(`${page.slug}: canonical is niet absoluut of gebruikt het verkeerde domein`)
}

const pageRoutes = new Set(seoPages.map((page) => page.slug))
const knownNonIndexRoutes = new Set(['/start', '/partner', '/partnervoorwaarden', '/privacybeleid', '/algemene-voorwaarden', '/verwerkersovereenkomst'])
for (const page of publishedSeoPages) {
  for (const related of page.relatedPages) {
    if (!pageRoutes.has(related) && !knownNonIndexRoutes.has(related)) failures.push(`${page.slug}: onbekende gerelateerde route ${related}`)
  }
}

const forbidden = [
  /€\s*15\s*(?:per maand|p\/m)/iu,
  /hosting (?:van|voor) €\s*15/iu,
  /optionele hosting/iu,
  /gegarandeerd(?:e)? (?:top 10|meer leads|omzet)/iu,
  /binnen 48 uur definitief live[.!]/iu,
  /AggregateRating/iu,
  /100% tevredenheid/iu,
]
const extensions = new Set(['.ts', '.tsx', '.js', '.jsx', '.json', '.md', '.html'])
const ignored = new Set(['config/banned-public-claims.json'])

async function filesIn(directory: string): Promise<string[]> {
  const entries = await readdir(join(root, directory), { withFileTypes: true }).catch(() => [])
  const files: string[] = []
  for (const entry of entries) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) files.push(...await filesIn(path))
    else if (extensions.has(extname(entry.name))) files.push(path)
  }
  return files
}

async function main() {
  for (const directory of ['app', 'components', 'content', 'data']) {
    for (const file of await filesIn(directory)) {
      const portable = relative(root, join(root, file)).replaceAll('\\', '/')
      if (ignored.has(portable)) continue
      const source = await readFile(join(root, file), 'utf8')
      for (const pattern of forbidden) if (pattern.test(source)) failures.push(`${portable}: verboden publieke claim ${pattern}`)
    }
  }

  if (failures.length) {
    console.error(`SEO-contentlint mislukt:\n${failures.map((failure) => `- ${failure}`).join('\n')}`)
    process.exit(1)
  }
  console.log(`SEO-contentlint geslaagd voor ${publishedSeoPages.length} indexeerbare pagina's.`)
}

main().catch((error) => { console.error(error); process.exit(1) })
