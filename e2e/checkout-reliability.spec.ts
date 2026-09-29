import { expect, test } from '@playwright/test'

test('retrying a lost checkout response keeps the same payment attempt', async ({ page }) => {
  const requests: Array<{ requestId: string; pakket: string }> = []
  await page.route('**/api/stripe/checkout', async route => {
    requests.push(route.request().postDataJSON())
    if (requests.length === 1) await route.abort('failed')
    else await route.fulfill({ status: 503, json: { error: 'Tijdelijk niet beschikbaar.' } })
  })
  await page.goto('/start?pakket=pro')
  await page.getByRole('checkbox').check()
  const button = page.locator('.start-checkout button')
  await button.click()
  await expect(page.locator('.start-checkout [role="alert"]')).toBeVisible()
  await button.click()
  await expect(page.locator('.start-checkout [role="alert"]')).toHaveText('Tijdelijk niet beschikbaar.')
  expect(requests).toHaveLength(2)
  expect(requests[0].requestId).toBe(requests[1].requestId)
  expect(requests[1].pakket).toBe('pro')
  await expect(button).toBeEnabled()
})

test('changing packages resets consent and rejects inherited object keys', async ({ page }) => {
  await page.goto('/start?pakket=pro')
  await page.getByRole('checkbox').check()
  await page.locator('.start-package-tabs a[href="/start?pakket=premium"]').click()
  await expect(page.getByRole('checkbox')).not.toBeChecked()
  await expect(page.locator('.start-checkout button')).toBeDisabled()
  const response = await page.goto('/start?pakket=constructor')
  expect(response?.status()).toBe(200)
  await expect(page.getByRole('heading', { name: 'Nog geen pakket gekozen' })).toBeVisible()
})

test('intake stays locked after an unavailable payment and can retry', async ({ page }) => {
  let paid = false
  await page.route('**/api/order?*', route => route.fulfill(paid
    ? { status: 200, json: { order: { id: 'test-order', status: 'paid', pakket: 'pro' } } }
    : { status: 503, json: { error: 'Unavailable' } }))
  await page.goto('/intake/cs_test_browsercheck')
  await expect(page.getByRole('heading', { name: 'Je betaalbevestiging' })).toBeVisible()
  await expect(page.locator('#intake-form')).toHaveCount(0)
  paid = true
  await page.getByRole('button', { name: 'Opnieuw controleren' }).click()
  await expect(page.getByLabel('Bedrijfsnaam')).toBeVisible()
})

test('intake waits for payment confirmation before showing any form', async ({ page }) => {
  let checks = 0
  await page.clock.install()
  await page.route('**/api/order?*', route => route.fulfill({ json: { order: {
    id: 'test-order', status: ++checks === 1 ? 'pending' : 'paid', pakket: 'starter',
  } } }))
  await page.goto('/intake/cs_test_browsercheck')
  await expect(page.getByText('Betaling veilig controleren…')).toBeVisible()
  await expect(page.locator('#intake-form')).toHaveCount(0)
  await page.clock.runFor(3500)
  await expect(page.getByLabel('Bedrijfsnaam')).toBeVisible()
  expect(checks).toBe(2)
})

test('intake works when browser storage is blocked', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.addInitScript(() => Object.defineProperty(window, 'sessionStorage', { get() { throw new DOMException('Blocked', 'SecurityError') } }))
  await page.route('**/api/order?*', route => route.fulfill({ json: { order: { id: 'test-order', status: 'paid', pakket: 'starter' } } }))
  await page.goto('/intake/cs_test_browsercheck')
  await page.getByLabel('Bedrijfsnaam').fill('Browser test')
  await expect(page.getByLabel('Bedrijfsnaam')).toHaveValue('Browser test')
  expect(errors).toEqual([])
})

for (const width of [390, 1440]) {
  test(`checkout and blocked intake fit on ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/start?pakket=pro')
    await expect(page.locator('.start-checkout button')).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width)
    await page.screenshot({ path: testInfo.outputPath(`checkout-${width}.png`), fullPage: true })
    await page.route('**/api/order?*', route => route.fulfill({ status: 404, json: { error: 'Not found' } }))
    await page.goto('/intake/cs_test_browsercheck')
    await expect(page.getByRole('heading', { name: 'Je betaalbevestiging' })).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(width)
    await page.screenshot({ path: testInfo.outputPath(`payment-status-${width}.png`) })
  })
}
