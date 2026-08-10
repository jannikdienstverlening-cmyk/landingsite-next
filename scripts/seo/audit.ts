import { mkdir, writeFile } from 'node:fs/promises'
import { publishedSeoPages, seoPages } from '../../content/seo-pages'

async function main() {
  const report = {
    generatedAt: new Date().toISOString(),
    indexableRoutes: publishedSeoPages.map(({ slug, title, primaryKeyword, canonical }) => ({ slug, title, primaryKeyword, canonical })),
    nonIndexableOrUnregisteredRoutes: ['/start', '/partner', '/partnervoorwaarden', '/verwerkersovereenkomst', '/intake/*', '/beheer/*', '/preview/*', '/admin/*', '/dashboard', '/leads', '/outreach', '/crm', '/insights', '/settings'],
    draftRoutes: seoPages.filter((page) => page.status === 'draft' || page.status === 'awaiting-review').map((page) => page.slug),
    decision: { fastDeliveryPagePublished: false, reason: 'De 48-uursintentie overlapt te sterk met homepage en pakketuitleg.' },
  }
  await mkdir('reports/seo', { recursive: true })
  await writeFile('reports/seo/latest-audit.json', `${JSON.stringify(report, null, 2)}\n`)
  console.log(`SEO-audit geschreven: ${report.indexableRoutes.length} indexeerbare routes, ${report.draftRoutes.length} concepten.`)
}

main().catch((error) => { console.error(error); process.exit(1) })
