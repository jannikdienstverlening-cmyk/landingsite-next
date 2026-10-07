import { expect, test } from '@playwright/test'
import { activePromotion, amountExcludingVat, commercialConfig, euro, packageFirstPayment } from '../config/commercial'

test('home laat werk, pakketkeuze en daarna de werkwijze zien', async ({ page }) => {
  await page.goto('/')
  const order = await page.locator('main > section').evaluateAll(sections => sections.map(section => section.id || section.className))
  expect(order.indexOf('pakketten')).toBeLessThan(order.indexOf('aanpak'))
  await expect(page.locator('.studio-problem, .studio-delivery')).toHaveCount(0)
  await expect(page.locator('.process-steps > li')).toHaveCount(3)
  await expect(page.locator('.hero-case img').first()).toBeVisible()
})

test('pakketprijzen en btw volgen dezelfde configuratie als de checkout', async ({ page }) => {
  await page.goto('/')
  const promotion = activePromotion()
  for (const [id, item] of Object.entries(commercialConfig.packages)) {
    const build = promotion ? promotion.buildPrices[id as keyof typeof promotion.buildPrices] : item.oneTimePrice
    const payment = promotion ? build + commercialConfig.management.monthlyPrice : packageFirstPayment(id as keyof typeof commercialConfig.packages)
    const option = page.locator('.pricing-option').filter({ has: page.getByRole('heading', { name: item.name, exact: true }) })
    await expect(option).toContainText(`Eerste betaling: €${payment} incl. btw`)
    await expect(option).toContainText(`${euro(amountExcludingVat(payment), 2)} excl. btw`)
    await expect(option.getByRole('link', { name: `Kies ${item.name}` })).toHaveAttribute('href', item.ctaHref)
    const details = option.locator('details')
    await expect(details).not.toHaveAttribute('open', '')
    await details.locator('summary').focus()
    await page.keyboard.press('Enter')
    await expect(details).toHaveAttribute('open', '')
    await expect(details).toContainText(item.features[0])
  }
})

test('desktop hero blijft compact en pakketregels staan gelijk', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.goto('/')
  await page.locator('.hero-case').waitFor()
  await page.evaluate(() => document.fonts.ready)
  const project = await page.locator('.hero-case').boundingBox()
  expect(project!.y).toBeLessThan(650)
  await expect(page.locator('.studio-hero__offer').getByRole('link', { name: 'Start mijn website', exact: true })).toBeInViewport()
  for (const selector of ['.pricing-option__price', '.pricing-option__today', '.pricing-specs', '.pricing-option > .button']) {
    const positions = await page.locator(selector).evaluateAll(elements => elements.map(element => element.getBoundingClientRect().top))
    expect(Math.max(...positions) - Math.min(...positions)).toBeLessThan(2)
  }
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

test('de pakketknop opent dezelfde prijs en eenvoudige uitleg in de bestelpagina', async ({ page }) => {
  await page.goto('/')
  await page.getByRole('link', { name: 'Kies Pro', exact: true }).click()
  await expect(page).toHaveURL(/\/start\?pakket=pro$/)
  await expect(page.locator('h1')).toHaveText('Dit wordt jouw Pro-website.')
  await expect(page.locator('.start-simple-specs')).toContainText(`Tot ${commercialConfig.packages.pro.pages} pagina’s`)
  const build = activePromotion()?.buildPrices.pro ?? commercialConfig.packages.pro.oneTimePrice
  await expect(page.locator('.order-summary__total')).toContainText(euro(build + commercialConfig.management.monthlyPrice, 2))
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
