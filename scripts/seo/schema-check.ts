import { readFile } from 'node:fs/promises'
import { commercialConfig } from '../../config/commercial'

async function main() {
  const files = ['app/page.tsx', 'app/werk/page.tsx', 'lib/seo.ts']
  const source = (await Promise.all(files.map((file) => readFile(file, 'utf8')))).join('\n')
  const failures: string[] = []
  if (/(AggregateRating|Review)/.test(source)) failures.push('fictief of ongeverifieerd reviewschema gevonden')
  if (/localhost|127\.0\.0\.1|vercel\.app/.test(source)) failures.push('stagingdomein in schema gevonden')
  if (!/commercialConfig\.packages/.test(source)) failures.push('schema gebruikt de centrale pakketconfiguratie niet')
  if (!/commercialConfig\.currency/.test(source)) failures.push('schemavaluta komt niet uit centrale configuratie')
  for (const price of [commercialConfig.packages.starter.oneTimePrice, commercialConfig.packages.pro.oneTimePrice, commercialConfig.packages.premium.oneTimePrice]) {
    if (!Number.isInteger(price)) failures.push(`ongeldige prijs ${price}`)
  }
  if (failures.length) {
    console.error(`Schemacontrole mislukt:\n${failures.map((failure) => `- ${failure}`).join('\n')}`)
    process.exit(1)
  }
  console.log('Structured-data broncontrole geslaagd.')
}

main().catch((error) => { console.error(error); process.exit(1) })
