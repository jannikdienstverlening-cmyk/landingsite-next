import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { commercialConfig } from '../config/commercial'

for (const viewport of [
  { width: 360, height: 800 }, { width: 390, height: 844 },
  { width: 768, height: 1024 }, { width: 1024, height: 768 },
  { width: 1440, height: 1000 }, { width: 1920, height: 1080 },
]) {
  test(`intro, blog en echte projectbeelden passen op ${viewport.width}px`, async ({ page }, testInfo) => {
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })
    for (const path of ['/', '/werk', '/blog']) {
      await page.setViewportSize(viewport)
      const response = await page.goto(path)
      expect(response?.status()).toBe(200)
      await page.evaluate(() => document.fonts.ready)
      await expect(page.locator('main h1')).toHaveCount(1)
      expect(await page.locator('main').innerText()).not.toMatch(/€\s*(?:299|499|899|378|578|978)\b/)
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
      for (const image of await page.locator('main img').all()) {
        await image.scrollIntoViewIfNeeded()
        await expect.poll(() => image.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth > 0)).toBe(true)
      }
      if (path === '/werk') {
        for (const title of await page.locator('.work-detail__meta h2').all()) {
          expect(await title.evaluate(element => element.scrollWidth <= element.clientWidth)).toBe(true)
        }
      }
      await page.evaluate(() => scrollTo(0, 0))
      if ([390, 768, 1440].includes(viewport.width)) {
        await page.screenshot({ path: testInfo.outputPath(`${path === '/' ? 'home' : path.slice(1)}-${viewport.width}.png`), fullPage: true, animations: 'disabled' })
      }
    }
    expect(errors).toEqual([])
  })
}

test('ook oude pakketlinks openen het ene aanbod met correcte btw', async ({ page }) => {
  for (const pakket of ['starter', 'pro', 'premium']) {
    await page.goto(`/start?pakket=${pakket}`)
    await expect(page).toHaveURL(/\/start$/)
    await expect(page.locator('.start-package-tabs')).toHaveCount(0)
    await expect(page.locator('.order-summary__total')).toContainText('€ 79,00')
    await expect(page.locator('.order-summary__subtotal')).toContainText('€ 65,29')
    await expect(page.locator('.order-summary dl')).toContainText('€ 13,71')
    await expect(page.locator('.order-summary dl')).toContainText('WebsitebouwInbegrepen')
    await expect(page.locator('.start-checkout button')).toBeDisabled()
    await page.getByRole('checkbox').check()
    await expect(page.locator('.start-checkout button')).toBeEnabled()
  }
})

test('schema noemt het maandbedrag en geen gratis totale website', async ({ page }) => {
  await page.goto('/')
  const graph = JSON.parse(await page.locator('script[type="application/ld+json"]').first().innerText())
  const service = graph['@graph'].find((item: { '@type': string }) => item['@type'] === 'Service')
  expect(service.hasOfferCatalog.itemListElement).toHaveLength(1)
  for (const offer of service.hasOfferCatalog.itemListElement) {
    expect(offer.price).toBe(commercialConfig.management.monthlyPrice)
    expect(offer.priceSpecification.unitText).toBe('maand')
    expect(offer.priceSpecification.valueAddedTaxIncluded).toBe(true)
  }
})

test('start, kosten en diensten bieden nergens drie pakketten aan', async ({ page }) => {
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 1000 })
    for (const path of ['/start', '/kosten-website-laten-maken', '/landingspagina-laten-maken', '/website-laten-maken-zzp', '/algemene-voorwaarden', '/over-landingsite']) {
      const response = await page.goto(path)
      expect(response?.status()).toBe(200)
      const content = await page.locator('main').innerText()
      expect(content).not.toMatch(/\b(?:Starter|Pro|Premium)\b|Kies je pakket|Vergelijk de pakketten/)
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    }
  }
})

test('blog is toegankelijk en blijft leesbaar met minder beweging', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/blog')
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()
  expect(results.violations).toEqual([])
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Handige tips voor je website.')
})
