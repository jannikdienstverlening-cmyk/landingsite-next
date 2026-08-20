import { chromium } from '@playwright/test'
import { mkdir, rename, rm } from 'node:fs/promises'
import path from 'node:path'

const root = process.cwd()
const temporaryDirectory = path.join(root, 'output', 'project-tour-video')
const outputDirectory = path.join(root, 'public', 'videos')
const outputPath = path.join(outputDirectory, 'ontwikkelbegeleiding-site-tour.webm')

await rm(temporaryDirectory, { recursive: true, force: true })
await mkdir(temporaryDirectory, { recursive: true })
await mkdir(outputDirectory, { recursive: true })

const browser = await chromium.launch({ headless: true })
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  deviceScaleFactor: 1,
  colorScheme: 'light',
  recordVideo: { dir: temporaryDirectory, size: { width: 1280, height: 720 } },
})
const page = await context.newPage()

await page.goto('https://www.ontwikkelbegeleiding.nl/', { waitUntil: 'networkidle', timeout: 60_000 })
await page.emulateMedia({ reducedMotion: 'reduce' })
await page.evaluate(() => document.fonts.ready)
await page.waitForTimeout(1_200)

const scrollHeight = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight)
const target = Math.min(scrollHeight, 4_800)

await page.waitForTimeout(1_200)
for (let step = 0; step <= 120; step += 1) {
  const eased = 0.5 - Math.cos((step / 120) * Math.PI) / 2
  await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), target * eased)
  await page.waitForTimeout(70)
}
await page.waitForTimeout(1_000)

const video = page.video()
await page.close()
const recordedPath = await video.path()
await context.close()
await browser.close()

await rm(outputPath, { force: true })
await rename(recordedPath, outputPath)
await rm(temporaryDirectory, { recursive: true, force: true })

console.log(`Site-tour opgeslagen: ${outputPath}`)
