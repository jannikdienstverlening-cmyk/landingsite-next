import { expect, test } from '@playwright/test'
import { effectiveBuildPrice, effectiveFirstPayment } from '../config/commercial'

const packages = [
  { code: 'starter' as const, name: 'Starter' },
  { code: 'pro' as const, name: 'Pro' },
  { code: 'premium' as const, name: 'Premium' },
]

test('/start forceert geen pakketkeuze', async ({ page }) => {
  await page.goto('/start')
  await expect(page.locator('.start-package-tabs a.is-active')).toHaveCount(0)
  await expect(page.getByRole('heading', { name: 'Nog geen pakket gekozen' })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Betaal veilig via Stripe' })).toHaveCount(0)
})

for (const item of packages) {
  test(`/start toont de serverprijs van ${item.name}`, async ({ page }) => {
    const build = effectiveBuildPrice(item.code)
    const initial = effectiveFirstPayment(item.code)
    await page.goto(`/start?pakket=${item.code}`)
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/i)
    await expect(page.locator('.start-package-tabs a.is-active')).toContainText(item.name)

    const summary = page.locator('.order-summary')
    await expect(summary.locator('dl > div').first()).toContainText(
      new RegExp(`\\u20ac\\s*${build}`),
    )
    await expect(summary.getByText('Vandaag incl. btw').locator('..')).toContainText(
      new RegExp(`\\u20ac\\s*${initial}`),
    )
    await expect(summary.getByText('Btw (21%)')).toBeVisible()
    await expect(summary.getByText('Eerste maand beheer').locator('..')).toContainText(/\u20ac\s*79/)
    await expect(page.getByRole('checkbox')).not.toBeChecked()
    await expect(page.getByRole('button', { name: /Betaal veilig via Stripe|Start voor €\d+ via Stripe/ })).toBeDisabled()
  })
}

test('pakketkeuze blijft behouden in de URL', async ({ page }) => {
  await page.goto('/start?pakket=starter')
  await page.getByRole('link', { name: new RegExp(`Premium.*€\\s*${effectiveBuildPrice('premium')}`) }).click()
  await expect(page).toHaveURL(/pakket=premium/)
  await expect(page.locator('.start-package-tabs a.is-active')).toContainText('Premium')
})
