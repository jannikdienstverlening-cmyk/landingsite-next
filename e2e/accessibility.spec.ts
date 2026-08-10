import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

for (const path of ['/', '/start?pakket=pro', '/werk', '/landingspagina-laten-maken', '/website-laten-maken-zzp', '/kosten-website-laten-maken', '/over-landingsite']) {
  test(`${path} heeft geen ernstige axe-overtredingen`, async ({ page }) => {
    await page.goto(path)
    const result = await new AxeBuilder({ page }).analyze()
    const serious = result.violations.filter((violation) => ['critical', 'serious'].includes(violation.impact || ''))
    expect(serious).toEqual([])
  })
}

test('mobiele navigatie vangt focus en sluit met Escape', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  const trigger = page.locator('.studio-menu')
  await trigger.focus()
  await page.keyboard.press('Enter')
  await expect(trigger).toHaveAttribute('aria-expanded', 'true')
  await expect(page.locator('#studio-mobile-nav a').first()).toBeFocused()
  await page.keyboard.press('Escape')
  await expect(trigger).toHaveAttribute('aria-expanded', 'false')
  await expect(trigger).toBeFocused()
})

test('FAQ is zonder muis te bedienen', async ({ page }) => {
  await page.goto('/#faq')
  const secondQuestion = page.locator('.studio-faq-list details').nth(1)
  const summary = secondQuestion.locator('summary')
  await summary.focus()
  await page.keyboard.press('Enter')
  await expect(secondQuestion).toHaveAttribute('open', '')
})
