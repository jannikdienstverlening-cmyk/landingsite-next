import AxeBuilder from '@axe-core/playwright'
import { expect, test, type Page } from '@playwright/test'

async function rejectOptionalCookies(page: Page) {
  const dialog = page.getByRole('dialog', { name: 'Alleen meten met jouw toestemming.' })
  const reject = page.getByRole('button', { name: 'Alles weigeren' })
  const promptAppeared = await dialog.waitFor({ state: 'visible', timeout: 2_000 }).then(() => true).catch(() => false)
  if (promptAppeared) {
    await reject.click()
    await expect(dialog).toBeHidden()
  }
}

for (const path of ['/', '/start?pakket=pro', '/werk', '/landingspagina-laten-maken', '/website-laten-maken-zzp', '/kosten-website-laten-maken', '/over-landingsite']) {
  test(`${path} heeft geen ernstige axe-overtredingen`, async ({ page }) => {
    await page.goto(path)
    await rejectOptionalCookies(page)
    const result = await new AxeBuilder({ page }).analyze()
    const serious = result.violations.filter((violation) => ['critical', 'serious'].includes(violation.impact || ''))
    expect(serious).toEqual([])
  })
}

test('mobiele navigatie vangt focus en sluit met Escape', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  await rejectOptionalCookies(page)
  const trigger = page.locator('.studio-menu')
  await trigger.press('Enter')
  await expect(trigger).toHaveAttribute('aria-expanded', 'true')
  await expect(page.locator('#studio-mobile-nav a').first()).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  await expect(trigger).toBeFocused()
})

test('FAQ is zonder muis te bedienen', async ({ page }) => {
  await page.goto('/#faq')
  await rejectOptionalCookies(page)
  const secondQuestion = page.locator('.studio-faq-list details').nth(1)
  const summary = secondQuestion.locator('summary')
  await summary.press('Enter')
  await expect(secondQuestion).toHaveAttribute('open', '')
})
