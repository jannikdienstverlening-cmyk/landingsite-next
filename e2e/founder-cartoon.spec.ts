import { expect, test, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

async function openFounder(page: Page) {
  await page.goto('/#over')
  const reject = page.getByRole('button', { name: 'Alles weigeren' })
  if (await reject.isVisible()) await reject.click()
  await page.evaluate(() => document.fonts.ready)
  const portrait = page.locator('.experience-founder')
  await portrait.scrollIntoViewIfNeeded()
  await expect.poll(() => portrait.locator('img').evaluate((node: HTMLImageElement) => node.complete && node.naturalWidth > 0)).toBe(true)
  await expect(page.locator('img[src*="jannik-founder-studio"]')).toHaveCount(0)
  return portrait
}

test('cartoon moves, pauses, finishes once and can replay with a keyboard', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()) })
  await page.emulateMedia({ reducedMotion: 'no-preference' })
  const portrait = await openFounder(page)
  await expect(portrait).toHaveAttribute('data-running', 'true')
  await expect(portrait.locator('img')).toHaveCSS('transform', 'none')
  const tile = portrait.locator('.founder-portrait__tile')
  const initial = await tile.evaluate(node => getComputedStyle(node).transform)
  await expect.poll(() => tile.evaluate(node => getComputedStyle(node).transform)).not.toBe(initial)
  await page.getByRole('button', { name: 'Cartoon pauzeren' }).click()
  await expect(tile).toHaveCSS('animation-play-state', 'paused')
  await page.getByRole('button', { name: 'Cartoon afspelen', exact: true }).click()
  await expect(tile).toHaveCSS('animation-play-state', 'running')
  await expect(portrait).toHaveAttribute('data-finished', 'true', { timeout: 10000 })
  await expect(portrait).toHaveAttribute('data-running', 'false')
  await page.getByRole('button', { name: 'Cartoon opnieuw afspelen' }).focus()
  await page.keyboard.press('Enter')
  await expect(portrait).toHaveAttribute('data-finished', 'false')
  await expect(tile).toHaveCSS('animation-play-state', 'running')
  await page.locator('.studio-header').scrollIntoViewIfNeeded()
  await expect(portrait).toHaveAttribute('data-running', 'false')
  await expect(tile).toHaveCSS('animation-play-state', 'paused')
  expect(errors).toEqual([])
})

test('reduced motion shows the full cartoon without animation or controls', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  const portrait = await openFounder(page)
  await expect(portrait).toHaveAttribute('data-motion', 'false')
  await expect(portrait.locator('.founder-portrait__tile')).toHaveCSS('animation-name', 'none')
  await expect(portrait.locator('button')).toHaveCount(0)
  const accessibility = await new AxeBuilder({ page }).include('.experience-founder').analyze()
  expect(accessibility.violations).toEqual([])
})

test('cartoon is server-rendered and remains visible without JavaScript', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, javaScriptEnabled: false, viewport: { width: 390, height: 844 } })
  const page = await context.newPage()
  await page.goto('/#over')
  const portrait = page.locator('.experience-founder')
  await expect(portrait.locator('img')).toBeInViewport()
  await expect.poll(() => portrait.locator('img').evaluate((node: HTMLImageElement) => node.complete && node.naturalWidth > 0)).toBe(true)
  await expect(portrait.locator('.founder-portrait__tile')).toHaveCSS('animation-name', 'none')
  await expect(portrait.locator('button')).toHaveCount(0)
  await context.close()
})

test('mobile touch controls work', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL, viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, reducedMotion: 'no-preference' })
  const page = await context.newPage()
  const portrait = await openFounder(page)
  await expect(portrait).toHaveAttribute('data-running', 'true')
  await page.getByRole('button', { name: 'Cartoon pauzeren' }).tap()
  await expect(portrait).toHaveAttribute('data-running', 'false')
  await page.getByRole('button', { name: 'Cartoon afspelen', exact: true }).tap()
  await expect(portrait).toHaveAttribute('data-running', 'true')
  await context.close()
})

for (const width of [360, 390, 768, 1440]) {
  test(`cartoon is uncropped and fits at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 })
    await page.emulateMedia({ reducedMotion: 'reduce' })
    const portrait = await openFounder(page)
    const bounds = await portrait.locator('img').boundingBox()
    expect(bounds!.width / bounds!.height).toBeCloseTo(.75)
    expect(bounds!.x).toBeGreaterThanOrEqual(0)
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width)
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width)
    await page.screenshot({ path: testInfo.outputPath(`founder-${width}.png`) })
  })
}
