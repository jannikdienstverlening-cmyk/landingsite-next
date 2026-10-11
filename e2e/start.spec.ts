import { expect, test } from '@playwright/test'
import { effectiveFirstPayment } from '../config/commercial'

const packages = [
  { code: 'starter' as const, name: 'Starter' },
  { code: 'pro' as const, name: 'Pro' },
  { code: 'premium' as const, name: 'Premium' },
]

test('/start toont direct één aanbod zonder pakketkeuze', async ({ page }) => {
  await page.goto('/start')
  await expect(page.locator('.start-package-tabs a.is-active')).toHaveCount(0)
  await expect(page.getByRole('heading', { name: 'Dit wordt jouw nieuwe website.' })).toBeVisible()
  await expect(page.locator('.start-checkout button')).toBeDisabled()
})

for (const item of packages) {
  test(`/start toont de serverprijs van ${item.name}`, async ({ page }) => {
    const initial = effectiveFirstPayment(item.code)
    await page.goto(`/start?pakket=${item.code}`)
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/i)
    await expect(page).toHaveURL(/\/start$/)
    await expect(page.locator('.start-package-tabs')).toHaveCount(0)
    await expect(page.locator('main')).not.toContainText(item.name)

    const summary = page.locator('.order-summary')
    await expect(summary.locator('dl > div').first()).toContainText('Inbegrepen')
    await expect(summary.getByText('Vandaag incl. btw').locator('..')).toContainText(
      new RegExp(`\\u20ac\\s*${initial}`),
    )
    await expect(summary.getByText('Btw inbegrepen (21%)')).toBeVisible()
    await expect(summary.getByText('Eerste maand website en beheer').locator('..')).toContainText(/\u20ac\s*79/)
    await expect(page.getByRole('checkbox')).not.toBeChecked()
    await expect(page.getByRole('button', { name: /Betaal veilig via Stripe|Start voor €\d+ via Stripe/ })).toBeDisabled()
  })
}

test('oude annuleringslink behoudt de betaalmelding zonder pakketkeuze', async ({ page }) => {
  await page.goto('/start?pakket=starter&status=geannuleerd')
  await expect(page).toHaveURL(/\/start\?status=geannuleerd$/)
  await expect(page.getByRole('status')).toContainText('Er is niets afgeschreven')
  await expect(page.locator('.start-checkout button')).toBeDisabled()
})
