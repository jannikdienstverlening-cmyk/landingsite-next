import { expect, test } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { commercialConfig } from '../config/commercial'

for (const viewport of [
  { width: 360, height: 800 },
  { width: 390, height: 844 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1440, height: 1000 },
  { width: 1920, height: 1080 },
]) {
  test(`rustige homepage houdt tekst, beelden en acties binnen ${viewport.width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize(viewport)
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto('/')
    await page.evaluate(() => document.fonts.ready)
    await expect(page.locator('h1')).toHaveCount(1)
    await expect(page.locator('.studio-hero__offer .button--primary')).toBeInViewport()
    await expect(page.locator('.studio-hero__micro')).toContainText(`€${commercialConfig.management.monthlyPrice} per maand`)

    const bounds = await page.locator('main h1, main h2, main h3, main p, main .button').evaluateAll(elements => elements.map(element => {
      const rect = element.getBoundingClientRect()
      return { text: element.textContent?.slice(0, 70), left: rect.left, right: rect.right, width: element.clientWidth, scrollWidth: element.scrollWidth }
    }).filter(element => element.width > 0))
    for (const element of bounds) {
      expect(element.left, element.text).toBeGreaterThanOrEqual(0)
      expect(element.right, element.text).toBeLessThanOrEqual(viewport.width + 1)
      expect(element.scrollWidth, element.text).toBeLessThanOrEqual(element.width + 1)
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)

    // Scroll each section so lazy images load before capturing the entire page.
    for (const section of await page.locator('main > section').all()) await section.scrollIntoViewIfNeeded()
    for (const image of await page.locator('main img').all()) {
      await expect.poll(() => image.evaluate((node: HTMLImageElement) => node.complete && node.naturalWidth > 0)).toBe(true)
    }
    await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }))
    if ([390, 768, 1440].includes(viewport.width)) {
      await page.screenshot({ path: testInfo.outputPath(`calm-home-${viewport.width}.png`), fullPage: true, animations: 'disabled' })
      await page.screenshot({ path: testInfo.outputPath(`calm-viewport-${viewport.width}.png`), animations: 'disabled' })
    }
    expect(errors).toEqual([])
  })
}

test('rustige vormgeving blijft leesbaar en dekt de homepage op WCAG AA', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/')
  await page.evaluate(() => document.fonts.ready)
  await expect(page.locator('.studio-hero__copy h1')).toHaveCSS('font-weight', '500')
  await expect(page.locator('.studio-hero__intro')).toHaveCSS('font-size', '17px')
  await expect(page.locator('.pricing-after')).toHaveCSS('border-style', 'none')
  expect(await page.locator('#pakketten h2').evaluate(element => getComputedStyle(element).fontFamily)).toContain('Lora')
  const audit = await new AxeBuilder({ page }).include('main').withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()
  expect(audit.violations).toEqual([])
})

test('homepage-stijl lekt niet naar de bestelling, ook niet na terugnavigeren', async ({ page }) => {
  await page.goto('/start')
  const before = await page.locator('.order-summary').evaluate(element => ({ font: getComputedStyle(element).fontFamily, background: getComputedStyle(element).backgroundColor }))
  await page.goto('/')
  await page.locator('.studio-hero__offer .button--primary').click()
  await expect(page).toHaveURL(/\/start$/)
  const after = await page.locator('.order-summary').evaluate(element => ({ font: getComputedStyle(element).fontFamily, background: getComputedStyle(element).backgroundColor }))
  expect(after).toEqual(before)
  await expect(page.locator('.order-summary__total')).toContainText('79')
})

test('rustige homepage werkt zonder bewegende onderdelen bij reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')
  await page.locator('#over').scrollIntoViewIfNeeded()
  await expect(page.locator('.experience-founder')).toHaveAttribute('data-motion', 'false')
  await expect(page.locator('.founder-portrait__story')).toHaveCSS('animation-name', 'none')
  await expect(page.locator('.studio-hero__offer .button--primary')).toHaveAttribute('href', '/start')
})
