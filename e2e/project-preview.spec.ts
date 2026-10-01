import { expect, test } from '@playwright/test'
import { portfolioProjects } from '../data/portfolio'

test('projectkeuze verandert beeld, naam en live link zonder navigatie', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', error => errors.push(error.message))
  await page.goto('/')
  const preview = page.locator('.project-preview')
  for (const project of portfolioProjects) {
    await preview.getByRole('button', { name: project.name, exact: true }).click()
    await expect(preview.getByRole('heading')).toHaveText(project.name)
    await expect(preview.getByRole('img')).toHaveAttribute('alt', project.imageAlt)
    await expect(preview.getByRole('link').first()).toHaveAttribute('href', project.url)
    await expect(preview.getByRole('button', { name: project.name, exact: true })).toHaveAttribute('aria-pressed', 'true')
    await expect(preview.getByRole('img')).toBeVisible()
    await expect.poll(() => preview.getByRole('img').evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true)
  }
  expect(errors).toEqual([])
})

test('projectweergave werkt met toetsenbord en behoudt het gekozen project', async ({ page }) => {
  await page.goto('/')
  const preview = page.locator('.project-preview')
  const choice = preview.getByRole('button', { name: 'WIA Management', exact: true })
  await choice.focus()
  await page.keyboard.press('Enter')
  await expect(choice).toBeFocused()
  const mobile = preview.getByRole('button', { name: 'Mobiele weergave', exact: true })
  await mobile.focus()
  await page.keyboard.press('Space')
  await expect(mobile).toHaveAttribute('aria-pressed', 'true')
  await expect(preview.getByRole('img')).toHaveAttribute('alt', portfolioProjects[1].mobileImageAlt)
  await expect(preview.getByRole('heading')).toHaveText('WIA Management')
  await preview.getByRole('button', { name: 'Desktopweergave' }).click()
  await expect(preview.getByRole('img')).toHaveAttribute('alt', portfolioProjects[1].imageAlt)
})

test('hoofdcase en live links blijven beschikbaar zonder JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false })
  try {
    const page = await context.newPage()
    await page.goto(test.info().project.use.baseURL!)
    await expect(page.locator('.project-preview').getByRole('heading')).toHaveText(portfolioProjects[0].name)
    await expect(page.locator('.project-preview').getByRole('img')).toBeVisible()
    await expect(page.locator('.project-preview__choices')).toBeHidden()
    for (const project of portfolioProjects.slice(1)) {
      await expect(page.locator('.project-proof').getByRole('link', { name: new RegExp(project.name) })).toHaveAttribute('href', project.url)
    }
  } finally {
    await context.close()
  }
})

test('projectviewer stuurt alleen toegestane case-informatie naar de eventlaag', async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => {
    const events: unknown[] = []
    Object.assign(window, { previewEvents: events })
    window.addEventListener('landingsite:analytics', event => events.push((event as CustomEvent).detail))
  })
  await page.locator('.project-preview').getByRole('button', { name: 'WIA Management', exact: true }).click()
  const events = await page.evaluate(() => (window as typeof window & { previewEvents: Array<Record<string, unknown>> }).previewEvents)
  const event = events.find(event => event.event === 'case_view')
  expect(event).toMatchObject({ project: 'wia-management', location: 'hero-preview' })
  for (const key of ['email', 'name', 'phone', 'message']) expect(event).not.toHaveProperty(key)
})

for (const width of [360, 390, 768, 1440]) {
  test(`mobiele projectweergave past op ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 })
    await page.goto('/')
    await page.locator('.project-preview').getByRole('button', { name: 'Mobiele weergave', exact: true }).click()
    const stage = await page.locator('.project-preview__stage').boundingBox()
    const phone = await page.locator('.project-preview__phone').boundingBox()
    expect(phone!.height).toBeGreaterThan(200)
    expect(phone!.y).toBeGreaterThanOrEqual(stage!.y)
    expect(phone!.y + phone!.height).toBeLessThanOrEqual(stage!.y + stage!.height + 1)
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true)
  })
}
