import { mkdir } from 'node:fs/promises'
import path from 'node:path'
import { chromium } from '@playwright/test'
import { consentConfig } from '../../config/consent'

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
      const target = new URL(baseUrl)
      await context.addCookies([{
        name: consentConfig.analytics.consentCookie,
        value: encodeURIComponent(JSON.stringify({
          analytics: false,
          marketing: false,
          preferences: false,
          version: consentConfig.analytics.consentVersion,
        })),
        domain: target.hostname,
        path: '/',
        sameSite: 'Lax',
        secure: target.protocol === 'https:',
      }])
      const page = await context.newPage()
      await page.emulateMedia({ reducedMotion: 'reduce' })

      for (const route of routes) {
        await page.goto(new URL(route.path, baseUrl).toString(), { waitUntil: 'domcontentloaded' })
        await page.waitForLoadState('load')
        await page.evaluate(() => document.fonts.ready)
        await page.evaluate(async () => {
          const pageHeight = document.documentElement.scrollHeight
          for (let y = 0; y < pageHeight; y += window.innerHeight) {
            window.scrollTo(0, y)
            await new Promise((resolve) => window.setTimeout(resolve, 35))
          }
          const images = Array.from(document.images)
          await Promise.race([
            Promise.all(images.map((image) => image.complete ? Promise.resolve() : new Promise((resolve) => {
              image.addEventListener('load', resolve, { once: true })
              image.addEventListener('error', resolve, { once: true })
            }))),
            new Promise((resolve) => window.setTimeout(resolve, 5_000)),
          ])
          window.scrollTo(0, 0)
        })
        const horizontalOverflow = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth)
        if (horizontalOverflow) throw new Error(`Horizontale overflow op ${route.path} bij ${viewport.width}px`)

        await page.screenshot({
          path: path.join(outputDir, `${route.name}-${viewport.name}.png`),
          fullPage: true,
          animations: 'disabled',
        })
        console.log(`Screenshot: ${route.path} @ ${viewport.width}px`)
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
