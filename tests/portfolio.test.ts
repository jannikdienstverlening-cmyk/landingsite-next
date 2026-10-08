import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'
import sharp from 'sharp'
import { portfolioProjects } from '../data/portfolio'
import { seoPage } from '../content/seo-pages'

test('portfolio keeps the main case and replaces the two additional projects', () => {
  assert.deepEqual(portfolioProjects.map(project => project.domain), [
    'ontwikkelbegeleiding.nl', 'hadak.nl', 'happyhug.nl',
  ])
  assert.equal(portfolioProjects[1].url, 'https://hadak.nl/nl')
  assert.equal(portfolioProjects[2].url, 'https://happyhug.nl/')
  assert.equal(new Set(portfolioProjects.map(project => project.slug)).size, 3)
})

test('replacement projects have actual local desktop and mobile WebP screenshots', async () => {
  for (const project of portfolioProjects.slice(1)) {
    for (const [file, alt, width, height] of [
      [project.image, project.imageAlt, 1440, 1000],
      [project.mobileImage, project.mobileImageAlt, 390, 844],
    ] as const) {
      assert.match(file, /^\/images\/portfolio\/[a-z]+-(?:desktop|mobile)-20261007\.webp$/)
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
