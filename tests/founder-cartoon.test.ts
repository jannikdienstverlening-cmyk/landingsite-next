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
  assert.match(readFileSync('components/founder-portrait.tsx', 'utf8'), /jannik-cartoon-story-v2\.webp/)
  assert.doesNotMatch(readFileSync('components/founder-portrait.tsx', 'utf8'), /jannik-cartoon-builder\.webp|founder-portrait__tile/)
  assert.match(readFileSync('components/founder-portrait.tsx', 'utf8'), /AI-illustratie/)
  assert.match(readFileSync('app/layout.tsx', 'utf8'), /import '\.\/founder-portrait\.css'/)
})

test('cartoon atlas has eight portrait frames and stays below 100 kB', async () => {
  const data = readFileSync('public/images/jannik-cartoon-story-v2.webp')
  const metadata = await sharp(data).metadata()
  assert.equal(metadata.format, 'webp')
  assert.equal(metadata.width, 1536)
  assert.equal(metadata.height, 1024)
  assert.equal((metadata.width! / 4) / (metadata.height! / 2), .75)
  assert.ok(data.length < 100_000)
})

test('cartoon animation is finite, visibility-aware and has a static final-pose fallback', () => {
  const component = readFileSync('components/founder-portrait.tsx', 'utf8')
  const css = readFileSync('app/founder-portrait.css', 'utf8')
  assert.match(component, /useMotionVisibility/)
  assert.match(component, /imageReady/)
  assert.match(component, /onAnimationEnd/)
  assert.match(css, /6\.4s steps\(1, end\)/)
  assert.match(css, /prefers-reduced-motion/)
  assert.match(css, /transform: translate\(-75%, -50%\)/)
  assert.doesNotMatch(`${component}\n${css}`, /setInterval|requestAnimationFrame|infinite/)
})
