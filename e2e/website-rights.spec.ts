import { expect, test } from '@playwright/test'
import { commercialConfig } from '../config/commercial'
import AxeBuilder from '@axe-core/playwright'

for (const width of [390, 1440]) {
  test(`60 minuten en eigendomsafspraken zijn vóór betaling leesbaar op ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 1000 })
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto('/start')
    await expect(page.locator('.start-simple-specs')).toContainText('60 minuten')
    const note = page.getByTestId('website-rights-note')
    await note.scrollIntoViewIfNeeded()
    await expect(note).toContainText('binnen het abonnement')
    await expect(note).toContainText('Afkoop kan op aanvraag')
    await expect(note).toHaveCSS('font-size', '16px')
    await expect(note.locator('a')).toHaveAttribute('href', '/algemene-voorwaarden#website-rechten')
    await expect(page.getByRole('checkbox')).not.toBeChecked()
    await expect(page.locator('.order-summary__total')).toContainText('79,00')
    const audit = await new AxeBuilder({ page }).include('.start-page').withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()
    expect(audit.violations).toEqual([])
    await page.screenshot({ path: testInfo.outputPath(`bestelling-rechten-${width}.png`), fullPage: true })

    await page.goto('/algemene-voorwaarden#website-rechten')
    await expect(page.locator('.updated')).toContainText('30 oktober 2026')
    await expect(page.locator('.legal-content')).toContainText('60 minuten')
    await expect(page.locator('#website-rechten')).toContainText('Aanlevering draagt deze rechten niet over')
    await expect(page.getByRole('heading', { name: '11a. Websitecode en ontwerp binnen het abonnement' })).toBeVisible()
    const heading = page.getByRole('heading', { name: '11b. Zelfstandig verdergaan en afkoop' })
    await heading.scrollIntoViewIfNeeded()
    await expect(heading).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    await page.screenshot({ path: testInfo.outputPath(`voorwaarden-rechten-${width}.png`), fullPage: true })
    expect(errors).toEqual([])
  })
}

test('checkout stuurt de getoonde voorwaardenversie mee en blokkeert verdergaan na een versieconflict', async ({ page }) => {
  let body: Record<string, unknown> = {}
  await page.route('**/api/stripe/checkout', route => {
    body = route.request().postDataJSON()
    return route.fulfill({ status: 409, json: { code: 'terms_changed', error: 'Bekijk eerst de bijgewerkte afspraken.' } })
  })
  await page.goto('/start')
  await page.getByRole('checkbox').check()
  await page.locator('.start-checkout button').click()
  expect(body.termsVersion).toBe(commercialConfig.version)
  expect(body.termsAccepted).toBe(true)
  await expect(page.locator('.start-checkout [role="alert"]')).toHaveText('Bekijk eerst de bijgewerkte afspraken.')
  await expect(page.getByRole('checkbox')).not.toBeChecked()
  await expect(page.locator('.start-checkout button')).toBeDisabled()
  await page.getByRole('link', { name: 'Bekijk de bijgewerkte bestelling' }).click()
  await expect(page.getByRole('checkbox')).toBeEnabled()
  await expect(page.getByRole('checkbox')).not.toBeChecked()
})

test('homepage toont 60 minuten en maakt afkoop op aanvraag duidelijk', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('#beheer')).toContainText('60 minuten')
  const question = page.getByText('Wat valt onder de 60 minuten wijzigingen?', { exact: true })
  await question.click()
  await expect(question.locator('..').locator('..')).toContainText('niet overdraagbaar')
  await page.getByText('Kan ik de website later overnemen?', { exact: true }).click()
  await expect(page.locator('#faq')).toContainText('eenmalige afkoopofferte')
  expect(await page.locator('main').innerText()).not.toMatch(/20 minuten/)
})
