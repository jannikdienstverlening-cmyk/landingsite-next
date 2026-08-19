import { readFile, readdir } from 'node:fs/promises'
import { extname, join, relative } from 'node:path'
import process from 'node:process'

const root = process.cwd()
const config = JSON.parse(await readFile(join(root, 'config', 'banned-public-claims.json'), 'utf8'))
const scanBuilt = process.argv.includes('--built')
const roots = scanBuilt
  ? ['.next/server/app', '.next/static/chunks']
  : ['app', 'components', 'content', 'config', 'data', 'lib', 'public']
const extensions = new Set(['.ts', '.tsx', '.js', '.jsx', '.json', '.html', '.txt', '.svg'])
const ignore = new Set([
  'config/banned-public-claims.json',
  'scripts/content-lint.mjs',
])
const ignoredDirectoryParts = new Set(['.git', '.next', 'node_modules', '_remotion'])

async function collect(directory) {
  if (directory.split(/[\\/]/).some((part) => ignoredDirectoryParts.has(part))) return []
  const entries = await readdir(join(root, directory), { withFileTypes: true }).catch(() => [])
  const files = []
  for (const entry of entries) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) files.push(...await collect(path))
    else if (extensions.has(extname(entry.name))) files.push(path)
  }
  return files
}

const failures = []
for (const directory of roots) {
  for (const file of await collect(directory)) {
    const portable = relative(root, join(root, file)).replaceAll('\\', '/')
    if (ignore.has(portable)) continue
    const contents = await readFile(join(root, file), 'utf8')
    for (const claim of config.exact) {
      if (contents.toLocaleLowerCase('nl-NL').includes(claim.toLocaleLowerCase('nl-NL'))) {
        failures.push(`${portable}: bevat verboden claim "${claim}"`)
      }
    }
    for (const source of config.patterns) {
      if (new RegExp(source, 'iu').test(contents)) failures.push(`${portable}: matcht verboden patroon /${source}/`)
    }
  }
}

if (failures.length) {
  console.error(`Contentcontrole mislukt:\n${failures.map((failure) => `- ${failure}`).join('\n')}`)
  process.exit(1)
}

console.log(`Contentcontrole geslaagd (${scanBuilt ? 'productie-output' : 'broncode'}).`)
