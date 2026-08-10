import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { chromium } from '@playwright/test'

const baseUrl = process.env.SEO_SCREENSHOT_BASE_URL || 'http://127.0.0.1:3001'
const outputDir = path.join(process.cwd(), 'reports', 'seo', 'screenshots')

const routes = [
  { name: 'homepage', path: '/' },
  { name: 'landingspagina-laten-maken', path: '/landingspagina-laten-maken' },
  { name: 'website-laten-maken-zzp', path: '/website-laten-maken-zzp' },
  { name: 'kosten-website-laten-maken', path: '/kosten-website-laten-maken' },
  { name: 'werk', path: '/werk' },
  { name: 'start', path: '/start' },
] as const

const viewports = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 1000 },
] as const

async function main() {
  await mkdir(outputDir, { recursive: true })
  const browser = await chromium.launch()

  try {
    for (const viewport of viewports) {
      const context = await browser.newContext({ viewport })
      const page = await context.newPage()
      await page.emulateMedia({ reducedMotion: 'reduce' })

      for (const route of routes) {
        await page.goto(new URL(route.path, baseUrl).toString(), { waitUntil: 'networkidle' })
        await page.evaluate(() => document.fonts.ready)
        const horizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
        if (horizontalOverflow) throw new Error(`Horizontale overflow op ${route.path} bij ${viewport.width}px`)

        await page.screenshot({
          path: path.join(outputDir, `${route.name}-${viewport.name}.png`),
          fullPage: true,
          animations: 'disabled',
        })
      }

      await context.close()
    }
  } finally {
    await browser.close()
  }

  console.log(`18 screenshots opgeslagen in ${outputDir}`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
