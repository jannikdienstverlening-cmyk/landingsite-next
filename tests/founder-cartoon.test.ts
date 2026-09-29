import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import test from 'node:test'
import sharp from 'sharp'

test('public founder uses the approved cartoon, never the retired portrait', () => {
  for (const directory of ['app', 'components']) {
    const files = readdirSync(directory, { recursive: true }) as string[]
    for (const file of files.filter(name => /\.[jt]sx?$/.test(name))) {
      assert.doesNotMatch(readFileSync(path.join(directory, file), 'utf8'), /jannik-founder-studio\.webp/, `${directory}/${file}`)
    }
  }
  assert.match(readFileSync('components/studio-site.tsx', 'utf8'), /<FounderPortrait\s*\/>/)
  assert.match(readFileSync('components/founder-portrait.tsx', 'utf8'), /jannik-cartoon-builder\.webp/)
  assert.match(readFileSync('components/founder-portrait.tsx', 'utf8'), /AI-illustratie/)
  assert.match(readFileSync('app/layout.tsx', 'utf8'), /import '\.\/founder-portrait\.css'/)
})

test('cartoon asset is a small full-height WebP', async () => {
  const data = readFileSync('public/images/jannik-cartoon-builder.webp')
  const metadata = await sharp(data).metadata()
  assert.equal(metadata.format, 'webp')
  assert.equal(metadata.width, 900)
  assert.equal(metadata.height, 1200)
  assert.ok(data.length < 100_000)
})
