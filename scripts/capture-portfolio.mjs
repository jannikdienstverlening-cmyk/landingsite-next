import { chromium } from '@playwright/test'
import sharp from 'sharp'
import { mkdir } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'

const args = process.argv.slice(2)
const stamp = args.find(arg => arg.startsWith('--stamp='))?.slice(8) ?? new Date().toISOString().slice(0, 10).replaceAll('-', '')
if (!/^\d{8}$/.test(stamp)) throw new Error('Gebruik --stamp=YYYYMMDD voor de opnamedatum.')
const selected = args.filter(arg => !arg.startsWith('--'))
const projects = [
  ['dippingpools', 'https://dippingpools.com/'],
  ['ontwikkelbegeleiding', 'https://ontwikkelbegeleiding.nl/'],
  ['hadak', 'https://hadak.nl/nl'],
  ['jhszwembaden', 'https://www.jhszwembaden.nl/'],
  ['happyhug', 'https://happyhug.nl/'],
]
if (selected.some(slug => !projects.some(([name]) => name === slug))) throw new Error('Onbekend portfolioproject.')
const output = new URL('../public/images/portfolio/', import.meta.url)
await mkdir(output, { recursive: true })
const browser = await chromium.launch({ headless: true })
try {
  for (const [slug, url] of projects.filter(([name]) => !selected.length || selected.includes(name))) {
    for (const [device, width, height] of [['desktop', 1440, 1000], ['mobile', 390, 844]]) {
      const context = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1 })
      const page = await context.newPage()
      const response = await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 })
      if (!response?.ok()) throw new Error(`Project niet bereikbaar: ${slug}`)
      await page.evaluate(async () => {
        await document.fonts.ready
        await Promise.all([...document.images].filter(image => image.loading !== 'lazy').map(image => image.decode().catch(() => {})))
      })
      const buffer = await page.screenshot({ animations: 'disabled' })
      const filename = `${slug}-${device}-${stamp}.webp`
      await sharp(buffer).webp({ quality: 85 }).toFile(fileURLToPath(new URL(filename, output)))
      console.log(`${filename}: ${width} x ${height}`)
      await context.close()
    }
  }
} finally {
  await browser.close()
}
