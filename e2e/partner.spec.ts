import { expect, test, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { commercialConfig } from '../config/commercial'
import { partnerProgramConfig } from '../config/partner-program'
import { calculatePartnerExample } from '../lib/partner'

async function fillApplication(page: Page) {
  const form = page.locator('#aanmelden')
  await form.getByLabel('Voornaam', { exact: true }).fill('Test')
  await form.getByLabel('Achternaam', { exact: true }).fill('Voorbeeld')
  await form.getByLabel('E-mailadres', { exact: true }).fill('partner-test@example.com')
  for (const checkbox of await form.getByRole('checkbox').all()) await checkbox.check()
  return form
}

for (const viewport of [
  { width: 360, height: 800 }, { width: 390, height: 844 },
  { width: 768, height: 1024 }, { width: 1024, height: 768 },
  { width: 1440, height: 1000 }, { width: 1920, height: 1080 },
]) {
  test(`partnerpagina is leesbaar en volledig op ${viewport.width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize(viewport)
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto('/partner')
    await page.evaluate(() => document.fonts.ready)
    await expect(page.locator('h1')).toHaveCount(1)
    await expect(page.locator('h1')).toHaveText('Partner worden bij Landingsite.nl.')
    await expect(page.locator('.hero-actions').getByRole('link', { name: 'Meld me aan als partner' })).toBeInViewport()
    await expect.poll(() => page.locator('.browser-frame img').evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true)
    await expect(page.locator('.partner-details')).not.toHaveAttribute('open')
    await expect(page.locator('.partner-how')).toContainText(`€${commercialConfig.management.monthlyPrice} per maand inclusief btw`)
    await expect(page.locator('.partner-how')).toContainText('60 minuten')

    for (const element of await page.locator('main h1, main h2, main h3, main p, main table, main button').all()) {
      const bounds = await element.evaluate(node => ({ width: node.clientWidth, scrollWidth: node.scrollWidth, rect: node.getBoundingClientRect().toJSON() }))
      if (!bounds.width || !bounds.rect.height) continue
      expect(bounds.scrollWidth).toBeLessThanOrEqual(bounds.width + 1)
      expect(bounds.rect.left).toBeGreaterThanOrEqual(0)
      expect(bounds.rect.right).toBeLessThanOrEqual(viewport.width + 1)
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
    if ([390, 768, 1440].includes(viewport.width)) {
      await page.screenshot({ path: testInfo.outputPath(`partner-viewport-${viewport.width}.png`), animations: 'disabled' })
      await page.screenshot({ path: testInfo.outputPath(`partner-full-${viewport.width}.png`), fullPage: true, animations: 'disabled' })
    }
    expect(errors).toEqual([])
  })
}

test('partnervergoedingen, wachttijd en rekenvoorbeeld blijven uit de configuratie komen', async ({ page }) => {
  await page.goto('/partner')
  const amounts = await page.locator('.partner-reward-table tbody td').allTextContents()
  expect(amounts).toEqual(Object.values(partnerProgramConfig.commissions).map(amount => `€${amount}`))
  await expect(page.locator('.partner-payout-facts')).toContainText(`${partnerProgramConfig.waitingPeriodDays} dagen`)
  await expect(page.locator('.partner-payout-facts')).toContainText(`€${partnerProgramConfig.minimumPayout}`)
  await page.locator('.partner-details > summary').focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('.partner-details')).toHaveAttribute('open')
  await expect(page.locator('.example-total')).toContainText(`€${calculatePartnerExample().totalMonthlyEarnings}`)
  await expect(page.locator('.example-disclaimer')).toContainText('geen inkomensgarantie')
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, follow')
})

test('aanmelding wordt eenmaal verstuurd, blijft handmatig en activeert geen partnercode', async ({ page }) => {
  const requests: Record<string, unknown>[] = []
  await page.route('**/api/partners/apply', async route => {
    requests.push(route.request().postDataJSON())
    await new Promise(resolve => setTimeout(resolve, 250))
    await route.fulfill({ status: 201, json: { ok: true, status: 'pending' } })
  })
  await page.goto('/partner')
  await page.locator('.hero-actions').getByRole('link', { name: 'Meld me aan als partner' }).click()
  await expect(page).toHaveURL(/#aanmelden$/)
  const form = await fillApplication(page)
  const button = form.getByRole('button', { name: 'Verstuur mijn aanmelding' })
  await button.click()
  await expect(form.getByRole('status')).toContainText('na handmatige controle', { ignoreCase: true })
  expect(requests).toHaveLength(1)
  expect(requests[0]).toMatchObject({ type: 'particulier', termsAccepted: true, privacyAccepted: true })
  await expect(form.getByRole('status')).toContainText('Er is nog geen partnercode of uitbetaling geactiveerd')
  await expect(form.getByLabel('Voornaam', { exact: true })).toHaveValue('')
  await expect(form.getByRole('checkbox').first()).not.toBeChecked()
})

test('ondernemersvelden zijn verplicht en een herpoging behoudt dezelfde aanvraag', async ({ page }) => {
  const requests: Record<string, unknown>[] = []
  await page.route('**/api/partners/apply', route => {
    requests.push(route.request().postDataJSON())
    return route.fulfill(requests.length === 1
      ? { status: 503, json: { error: 'Probeer het opnieuw.' } }
      : { status: 201, json: { ok: true, status: 'pending' } })
  })
  await page.goto('/partner')
  const form = await fillApplication(page)
  await form.getByRole('radio', { name: 'Ondernemer', exact: true }).check()
  await expect(form.getByLabel('Bedrijfsnaam', { exact: true })).toHaveJSProperty('required', true)
  await expect(form.getByLabel('KvK-nummer', { exact: true })).toHaveJSProperty('required', true)
  const button = form.getByRole('button', { name: 'Verstuur mijn aanmelding' })
  await button.click()
  expect(requests).toHaveLength(0)
  await form.getByLabel('Bedrijfsnaam', { exact: true }).fill('Voorbeeldbedrijf')
  await form.getByLabel('KvK-nummer', { exact: true }).fill('12345678')
  await button.click()
  await expect(form.getByRole('alert')).toHaveText('Probeer het opnieuw.')
  await button.click()
  await expect(form.getByRole('status')).toBeVisible()
  expect(requests).toHaveLength(2)
  expect(requests[1].requestId).toBe(requests[0].requestId)
})

test('bestaande aanmelding wordt niet als nieuwe goedkeuring gepresenteerd', async ({ page }) => {
  await page.route('**/api/partners/apply', route => route.fulfill({ status: 200, json: { ok: true, status: 'approved' } }))
  await page.goto('/partner')
  const form = await fillApplication(page)
  await form.getByRole('button', { name: 'Verstuur mijn aanmelding' }).click()
  await expect(form.getByRole('status')).toContainText('bestaat al een aanmelding')
  await expect(form.getByRole('status')).not.toContainText('Je partnercode is')
})

for (const width of [390, 1440]) {
  test(`partnerpagina en formulier hebben geen WCAG AA-overtredingen op ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 1000 })
    await page.goto('/partner')
    await page.locator('.partner-details > summary').click()
    await page.getByRole('radio', { name: 'Ondernemer', exact: true }).check()
    const audit = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']).analyze()
    expect(audit.violations).toEqual([])
    await page.getByRole('checkbox').first().focus()
    await page.keyboard.press('Space')
    await expect(page.getByRole('checkbox').first()).toBeChecked()
  })
}
