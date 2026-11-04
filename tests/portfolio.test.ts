import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'
import sharp from 'sharp'
import { portfolioProjects } from '../data/portfolio'
import { seoPage } from '../content/seo-pages'

test('portfolio zet Dippingpools eerst en JHS Zwembaden als vierde, zonder bestaande projecten te verwijderen', () => {
  assert.deepEqual(portfolioProjects.map(project => project.domain), [
    'dippingpools.com', 'ontwikkelbegeleiding.nl', 'hadak.nl', 'jhszwembaden.nl', 'happyhug.nl',
  ])
  assert.equal(portfolioProjects[0].url, 'https://dippingpools.com/')
  assert.equal(portfolioProjects[2].url, 'https://hadak.nl/nl')
  assert.equal(portfolioProjects[3].url, 'https://www.jhszwembaden.nl/')
  assert.equal(portfolioProjects[4].url, 'https://happyhug.nl/')
  assert.equal(new Set(portfolioProjects.map(project => project.slug)).size, 5)
})

test('replacement projects have actual local desktop and mobile WebP screenshots', async () => {
  for (const project of portfolioProjects) {
    for (const [file, alt, width, height] of [
      [project.image, project.imageAlt, 1440, 1000],
      [project.mobileImage, project.mobileImageAlt, 390, 844],
    ] as const) {
      assert.match(file, /^\/images\/portfolio\/[a-z]+-(?:desktop|mobile)-\d{8}\.webp$/)
      assert.ok(alt.length > 20)
      const bytes = await readFile(path.join(process.cwd(), 'public', file))
      assert.ok(bytes.length < 500_000)
      const metadata = await sharp(bytes).metadata()
      assert.equal(metadata.format, 'webp')
      assert.equal(metadata.width, width)
      assert.equal(metadata.height, height)
    }
  }
})

test('work metadata and chat use the central portfolio without old examples', async () => {
  const metadata = seoPage('/werk')
  for (const project of portfolioProjects) assert.ok(metadata.description.includes(project.name))
  const chat = await readFile('lib/site-chat.ts', 'utf8')
  assert.match(chat, /portfolioProjects\.map/)
  for (const file of ['data/portfolio.ts', 'content/seo-pages.ts', 'lib/site-chat.ts', 'app/landingspagina-laten-maken/page.tsx']) {
    assert.doesNotMatch(await readFile(file, 'utf8'), /wia-management|wiamanagement|WIA Management|aibouwers/i)
  }
})
