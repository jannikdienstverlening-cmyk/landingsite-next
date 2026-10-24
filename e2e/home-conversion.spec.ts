import { expect, test } from '@playwright/test'
import { commercialConfig, euro, websiteOffer } from '../config/commercial'

test('home laat werk, het ene aanbod en daarna de werkwijze zien', async ({ page }) => {
  await page.goto('/')
  const order = await page.locator('main > section').evaluateAll(sections => sections.map(section => section.id || section.className))
  expect(order.indexOf('pakketten')).toBeLessThan(order.indexOf('aanpak'))
  await expect(page.locator('.studio-problem, .studio-delivery')).toHaveCount(0)
  await expect(page.locator('.process-steps > li')).toHaveCount(3)
  await expect(page.locator('.hero-case img').first()).toBeVisible()
})

test('er is één prijs, één aanbod en één startknop in de prijssectie', async ({ page }) => {
  await page.goto('/')
  await expect(page.locator('.subscription-offer')).toContainText(`€${commercialConfig.management.monthlyPrice}`)
  await expect(page.locator('.subscription-offer')).toContainText('Geen eenmalige bouwkosten')
  await expect(page.locator('.pricing-option, .pricing-grid')).toHaveCount(0)
  await expect(page.locator('#pakketten').getByRole('link', { name: 'Start mijn website', exact: true })).toHaveCount(1)
  await expect(page.locator('#pakketten').getByRole('link', { name: 'Start mijn website', exact: true })).toHaveAttribute('href', websiteOffer.ctaHref)
  await expect(page.locator('#pakketten')).not.toContainText(/Starter|Premium|Aanbevolen|Kies Pro/)
})

test('desktop hero en het ene prijsaanbod blijven compact', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/')
  await page.locator('.hero-case').waitFor()
  await page.evaluate(() => document.fonts.ready)
  const project = await page.locator('.hero-case').boundingBox()
  expect(project!.y).toBeLessThan(650)
  await expect(page.locator('.studio-hero__offer').getByRole('link', { name: 'Start mijn website', exact: true })).toBeInViewport()
  const offer = await page.locator('.website-offer').boundingBox()
  expect(offer!.height).toBeLessThan(650)
})

test('mobiele hoofdactie is zichtbaar en het menu sluit met Escape', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/')
  const action = page.locator('.studio-hero__offer').getByRole('link', { name: 'Start mijn website', exact: true })
  await expect(action).toBeInViewport()
  const toggle = page.getByRole('button', { name: 'Menu openen', exact: true })
  await toggle.click()
  await expect(page.getByRole('navigation', { name: 'Mobiele navigatie' })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(toggle).toHaveAttribute('aria-expanded', 'false')
  await expect(toggle).toBeFocused()
})

test('het menu blijft bereikbaar tijdens scrollen', async ({ page }) => {
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 844 })
    await page.goto('/')
    await page.locator('#pakketten').scrollIntoViewIfNeeded()
    await expect(page.locator('.studio-header')).toBeInViewport({ ratio: 1 })
  }
})

test('de aanbodknop opent direct de bestelling met dezelfde prijs', async ({ page }) => {
  await page.goto('/')
  await page.locator('#pakketten').getByRole('link', { name: 'Start mijn website', exact: true }).click()
  await expect(page).toHaveURL(/\/start$/)
  await expect(page.locator('h1')).toHaveText('Dit wordt jouw nieuwe website.')
  await expect(page.locator('.start-simple-specs')).toContainText(`Tot ${websiteOffer.pages} pagina’s`)
  await expect(page.locator('.order-summary__total')).toContainText(euro(commercialConfig.management.monthlyPrice, 2))
  await expect(page.locator('.order-summary')).toContainText('WebsitebouwInbegrepen')
  await expect(page.locator('.start-checkout button')).toBeDisabled()
  await expect(page.getByRole('checkbox')).not.toBeChecked()
})

test('hoofdactie, prijs en echt werk zijn op kleine schermen snel te vinden', async ({ page }) => {
  for (const width of [360, 390]) {
    await page.setViewportSize({ width, height: 844 })
    await page.goto('/')
    await page.evaluate(() => document.fonts.ready)
    await expect(page.locator('.studio-hero__offer .button--primary')).toBeInViewport()
    await expect(page.locator('.studio-hero__micro')).toBeInViewport()
    const project = await page.locator('.project-preview__stage').boundingBox()
    expect(project!.y).toBeLessThan(844)
    const mobileView = page.getByRole('button', { name: 'Mobiele weergave', exact: true })
    await mobileView.click()
    await expect(mobileView).toHaveAttribute('aria-pressed', 'true')
  }
})
