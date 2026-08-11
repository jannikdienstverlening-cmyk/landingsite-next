import { expect, test } from '@playwright/test'

const viewports = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 1000 },
]

for (const viewport of viewports) {
  test(`blog is leesbaar zonder overflow op ${viewport.name}`, async ({ page }) => {
    const consoleErrors: string[] = []
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text())
    })
    await page.setViewportSize(viewport)
    await page.goto('/blog')
    await expect(page.getByRole('heading', { level: 1, name: /Vrijdagblog over websites/ })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Wat moet er bovenaan je website staan?', exact: true })).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)

    if (viewport.width < 820) {
      await page.getByRole('button', { name: 'Menu openen' }).click()
      await expect(page.locator('#studio-mobile-nav a[href="/blog"]')).toBeVisible()
      await page.getByRole('button', { name: 'Menu sluiten' }).click()
    }

    await page.goto('/blog/wat-moet-er-bovenaan-je-website-staan')
    await expect(page.getByRole('heading', { level: 1, name: 'Wat moet er bovenaan je website staan?' })).toBeVisible()
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
    expect(consoleErrors).toEqual([])
  })
}
