import { expect, test } from '@playwright/test'

async function settle(page: import('@playwright/test').Page, imageScope: string) {
  await page.addStyleTag({ content: 'nextjs-portal { display: none !important; }' })
  await page.evaluate(async (scope) => {
    await document.fonts.ready
    const images = Array.from(document.querySelectorAll<HTMLImageElement>(`${scope} img`))
    await Promise.all(images.map((image) => image.complete ? Promise.resolve() : new Promise((resolve) => {
      image.addEventListener('load', resolve, { once: true })
      image.addEventListener('error', resolve, { once: true })
    })))
  }, imageScope)
}

for (const viewport of [
  { width: 390, height: 844, name: 'mobile' },
  { width: 768, height: 1024, name: 'tablet' },
  { width: 1440, height: 1000, name: 'desktop' },
]) {
  test(`hero visuele regressie ${viewport.name}`, async ({ page }) => {
    await page.setViewportSize(viewport)
    await page.goto('/')
    await settle(page, '.studio-hero')
    await expect(page.locator('.studio-hero')).toHaveScreenshot(`home-hero-${viewport.name}.png`)
  })
}

test('bestelsamenvatting visuele regressie', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 })
  await page.goto('/start?pakket=pro')
  await settle(page, '.start-page__grid')
  await expect(page.locator('.start-page__grid')).toHaveScreenshot('start-pro-tablet.png')
})

test('pakketvergelijking visuele regressie desktop', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/#pakketten')
  await settle(page, '.studio-pricing')
  await expect(page.locator('.studio-pricing')).toHaveScreenshot('home-pricing-desktop.png')
})

test('beheerblok visuele regressie mobiel', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/#beheer')
  await settle(page, '.studio-management')
  await expect(page.locator('.studio-management')).toHaveScreenshot('home-management-mobile.png')
})

test('hoofdcase op werkpagina visuele regressie tablet', async ({ page }) => {
  await page.setViewportSize({ width: 768, height: 1024 })
  await page.goto('/werk')
  await settle(page, '.work-detail')
  await expect(page.locator('.work-detail').first()).toHaveScreenshot('work-maincase-tablet.png')
})

test('mobiel menu visuele regressie', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await page.locator('.studio-menu').click()
  await expect(page.locator('#studio-mobile-nav')).toHaveScreenshot('mobile-menu.png')
})
