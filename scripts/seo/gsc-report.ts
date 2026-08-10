import { mkdir, writeFile } from 'node:fs/promises'

type SearchRow = { keys?: string[]; clicks: number; impressions: number; ctr: number; position: number }
const token = process.env.GOOGLE_SEARCH_CONSOLE_ACCESS_TOKEN
const siteUrl = process.env.GOOGLE_SEARCH_CONSOLE_SITE_URL

function date(offsetDays: number) {
  const value = new Date()
  value.setUTCDate(value.getUTCDate() + offsetDays)
  return value.toISOString().slice(0, 10)
}

async function query(startDate: string, endDate: string): Promise<SearchRow[]> {
  const endpoint = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl!)}/searchAnalytics/query`
  const response = await fetch(endpoint, {
    method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ startDate, endDate, dimensions: ['query', 'page'], rowLimit: 25000, aggregationType: 'auto', dataState: 'final' }),
  })
  if (!response.ok) throw new Error(`Search Console API ${response.status}: ${await response.text()}`)
  return ((await response.json()) as { rows?: SearchRow[] }).rows ?? []
}

function totals(rows: SearchRow[]) {
  const clicks = rows.reduce((sum, row) => sum + row.clicks, 0)
  const impressions = rows.reduce((sum, row) => sum + row.impressions, 0)
  return { clicks, impressions, ctr: impressions ? clicks / impressions : 0 }
}

const row = (item: SearchRow) => `| ${item.keys?.[0] ?? ''} | ${item.keys?.[1] ?? ''} | ${item.clicks} | ${item.impressions} | ${(item.ctr * 100).toFixed(1)}% | ${item.position.toFixed(1)} |`

async function main() {
  if (!token || !siteUrl) throw new Error('Search Console-rapport niet uitgevoerd. Stel GOOGLE_SEARCH_CONSOLE_ACCESS_TOKEN en GOOGLE_SEARCH_CONSOLE_SITE_URL in. Gebruik OAuth met webmasters.readonly; credentials horen niet in Git.')
  const currentRange = { start: date(-30), end: date(-3) }
  const previousRange = { start: date(-58), end: date(-31) }
  const [current, previous] = await Promise.all([query(currentRange.start, currentRange.end), query(previousRange.start, previousRange.end)])
  const currentTotals = totals(current)
  const previousTotals = totals(previous)
  const lowCtr = current.filter((item) => item.impressions >= 20 && item.ctr < .03).sort((a, b) => b.impressions - a.impressions).slice(0, 20)
  const strikingDistance = current.filter((item) => item.position >= 8 && item.position <= 20).sort((a, b) => b.impressions - a.impressions).slice(0, 20)
  const queryPages = new Map<string, Set<string>>()
  for (const item of current) {
    const [queryText = '', page = ''] = item.keys ?? []
    if (!queryPages.has(queryText)) queryPages.set(queryText, new Set())
    queryPages.get(queryText)?.add(page)
  }
  const cannibalization = [...queryPages].filter(([, pages]) => pages.size > 1).slice(0, 20)
  const brandRows = current.filter((item) => /landingsite/i.test(item.keys?.[0] ?? ''))
  const nonBrandRows = current.filter((item) => !/landingsite/i.test(item.keys?.[0] ?? ''))
  const markdown = `# Search Console-rapport\n\nGegenereerd: ${new Date().toISOString()}\n\n## Periode\n\n- Huidig: ${currentRange.start} t/m ${currentRange.end}\n- Vorig: ${previousRange.start} t/m ${previousRange.end}\n- Clicks: ${currentTotals.clicks} (vorig ${previousTotals.clicks})\n- Impressions: ${currentTotals.impressions} (vorig ${previousTotals.impressions})\n- CTR: ${(currentTotals.ctr * 100).toFixed(1)}% (vorig ${(previousTotals.ctr * 100).toFixed(1)}%)\n- Brand clicks: ${totals(brandRows).clicks}\n- Non-brand clicks: ${totals(nonBrandRows).clicks}\n\n## Veel impressions, lage CTR\n\n| Query | Pagina | Clicks | Impressions | CTR | Positie |\n|---|---|---:|---:|---:|---:|\n${lowCtr.map(row).join('\n') || '| Geen signalen | | | | | |'}\n\n## Positie 8-20\n\n| Query | Pagina | Clicks | Impressions | CTR | Positie |\n|---|---|---:|---:|---:|---:|\n${strikingDistance.map(row).join('\n') || '| Geen signalen | | | | | |'}\n\n## Mogelijke cannibalisatie\n\n${cannibalization.map(([queryText, pages]) => `- **${queryText}**: ${[...pages].join(', ')}`).join('\n') || 'Geen query met meerdere pagina’s in deze export.'}\n`
  await mkdir('reports/seo', { recursive: true })
  const path = `reports/seo/${new Date().toISOString().slice(0, 10)}.md`
  await writeFile(path, markdown)
  console.log(`Search Console-rapport geschreven naar ${path}.`)
}

main().catch((error) => { console.error(error instanceof Error ? error.message : error); process.exit(1) })
