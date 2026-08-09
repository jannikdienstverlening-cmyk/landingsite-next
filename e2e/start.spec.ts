import { expect, test } from '@playwright/test'

const packages = [
  { code: 'starter', name: 'Starter', build: 299, initial: 378 },
  { code: 'pro', name: 'Pro', build: 499, initial: 578 },
  { code: 'premium', name: 'Premium', build: 899, initial: 978 },
]

for (const item of packages) {
  test(`/start toont de serverprijs van ${item.name}`, async ({ page }) => {
    await page.goto(`/start?pakket=${item.code}`)
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/i)
    await expect(page.locator('.start-package-tabs a.is-active')).toContainText(item.name)

    const summary = page.locator('.order-summary')
    await expect(summary.getByText('Eenmalige bouwprijs').locator('..')).toContainText(
      new RegExp(`\\u20ac\\s*${item.build}`),
    )
    await expect(summary.getByText('Totaal excl. btw').locator('..')).toContainText(
      new RegExp(`\\u20ac\\s*${item.initial}`),
    )
    await expect(summary.getByText('Eerste maand beheer').locator('..')).toContainText(/\u20ac\s*79/)
    await expect(page.getByRole('checkbox')).not.toBeChecked()
    await expect(page.getByRole('button', { name: 'Betaal veilig via Stripe' })).toBeDisabled()
  })
}

test('pakketkeuze blijft behouden in de URL', async ({ page }) => {
  await page.goto('/start?pakket=starter')
  await page.getByRole('link', { name: /Premium \u20ac\s*899/ }).click()
  await expect(page).toHaveURL(/pakket=premium/)
  await expect(page.locator('.start-package-tabs a.is-active')).toContainText('Premium')
})
