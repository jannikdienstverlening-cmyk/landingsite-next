import fs from 'node:fs/promises'
import path from 'node:path'
import { chromium } from '@playwright/test'

const outputDir = path.resolve('public/images/portfolio')
const stamp = '20260819'

const targets = [
  { slug: 'ontwikkelbegeleiding', url: 'https://www.ontwikkelbegeleiding.nl/' },
  { slug: 'wiamanagement', url: 'https://www.wiamanagement.nl/' },
  { slug: 'aibouwers', url: 'https://aibouwers.nl/' },
]

const viewports = [
  { name: 'desktop', width: 1440, height: 1000, isMobile: false },
  { name: 'mobile', width: 390, height: 844, isMobile: true },
]

async function dismissConsent(page) {
  const buttons = page.getByRole('button', { name: /alles accepteren|accepteren|akkoord|accept all|allow all/i })
  if (await buttons.count()) await buttons.first().click().catch(() => {})
}

await fs.mkdir(outputDir, { recursive: true })
const browser = await chromium.launch({ headless: true })

try {
  for (const target of targets) {
    for (const viewport of viewports) {
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        isMobile: viewport.isMobile,
        deviceScaleFactor: 1,
        reducedMotion: 'reduce',
      })
      const page = await context.newPage()
      await page.goto(target.url, { waitUntil: 'networkidle', timeout: 45_000 })
      await dismissConsent(page)
      await page.evaluate(() => window.scrollTo(0, 0))
      await page.waitForTimeout(700)
      const outputPath = path.join(outputDir, `${target.slug}-${viewport.name}-${stamp}.webp`)
      await page.screenshot({ path: outputPath, type: 'webp', quality: 82 })
      console.log(`Captured ${target.url} (${viewport.name}) -> ${outputPath}`)
      await context.close()
    }
  }
} finally {
  await browser.close()
}
