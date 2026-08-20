import { expect, test } from '@playwright/test'

const forbidden = [
  '+38% conversie',
  'Performance 98',
  'Lisa van Studio Noord',
  'Premium AI-webbureau',
  'Live in 48 uur',
]

test('homepage toont echte projecten en een consistente hoofdactie', async ({ page }) => {
  const consoleErrors: string[] = []
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text())
  })
  await page.goto('/')

  await expect(page.locator('h1')).toHaveCount(1)
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Website laten maken? Bekijk binnen 48 uur eerst de werkende versie.')
  await expect(page.getByRole('link', { name: 'Start mijn website' }).first()).toBeVisible()
  await expect(page.getByRole('link', { name: /Bekijk live werk/ }).first()).toBeVisible()
  await expect(page.getByText('Ontwikkelbegeleiding.nl', { exact: true }).first()).toBeVisible()
  await expect(page.getByRole('heading', { name: 'De bezoeker krijgt eerst antwoord.' })).toBeVisible()
  await expect(page.locator('.pricing-row')).toHaveCount(3)
  await expect(page.locator('.launch-schedule')).toContainText('Binnen 48 uur')
  await expect(page.locator('footer')).toContainText('Jannik Dienstverlening')

  const body = await page.locator('body').innerText()
  for (const claim of forbidden) expect(body).not.toContain(claim)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true)
  expect(consoleErrors).toEqual([])
})

test('chat kan het gesprek veilig overdragen naar WhatsApp', async ({ page }) => {
  await page.goto('/')

  const consentDialog = page.getByRole('dialog', { name: 'Alleen meten met jouw toestemming.' })
  const consentVisible = await consentDialog.waitFor({ state: 'visible', timeout: 2_000 })
    .then(() => true)
    .catch(() => false)
  if (consentVisible) {
    await page.getByRole('button', { name: 'Alles weigeren' }).click()
    await expect(consentDialog).toBeHidden()
  }

  await page.getByRole('button', { name: 'Chat met de digitale assistent openen' }).click()

  const whatsappLink = page.getByRole('link', { name: /Verder via WhatsApp/ })
  await expect(whatsappLink).toBeVisible()
  await expect(whatsappLink).toHaveAttribute('href', /https:\/\/wa\.me\/31612345678\?text=/)
  await expect(whatsappLink).not.toHaveAttribute('data-analytics-message')
})

for (const viewport of [
  { width: 320, height: 800 },
  { width: 360, height: 800 },
  { width: 375, height: 812 },
  { width: 390, height: 844 },
  { width: 412, height: 915 },
  { width: 768, height: 1024 },
  { width: 1024, height: 768 },
  { width: 1440, height: 1000 },
  { width: 1920, height: 1080 },
]) {
  test(`homepage heeft geen horizontale overflow op ${viewport.width}px`, async ({ page }) => {
    await page.setViewportSize(viewport)
    await page.goto('/')
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true)
  })
}
