import { chromium } from '@playwright/test'
import sharp from 'sharp'
import { mkdir } from 'node:fs/promises'

const stamp = '20261011'
const output = new URL('../public/images/portfolio/', import.meta.url)
await mkdir(output, { recursive: true })
const browser = await chromium.launch({ headless: true })
try {
  for (const [slug, url] of [
    ['ontwikkelbegeleiding', 'https://ontwikkelbegeleiding.nl/'],
    ['hadak', 'https://hadak.nl/nl'],
    ['happyhug', 'https://happyhug.nl/'],
  ]) {
    for (const [device, width, height] of [['desktop', 1440, 1000], ['mobile', 390, 844]]) {
      const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1 })
      const page = await context.newPage()
      await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 })
      await page.evaluate(async () => {
        await document.fonts.ready
        await Promise.all([...document.images].filter(image => image.loading !== 'lazy').map(image => image.decode().catch(() => {})))
      })
      const buffer = await page.screenshot({ animations: 'disabled' })
      const filename = `${slug}-${device}-${stamp}.webp`
      await sharp(buffer).webp({ quality: 85 }).toFile(new URL(filename, output).pathname.replace(/^\/(\w:)/, '$1'))
      console.log(`${filename}: ${width} x ${height}`)
      await context.close()
    }
  }
} finally {
  await browser.close()
}
