import { expect, test } from '@playwright/test'
import { portfolioProjects } from '../data/portfolio'

test('work page renders the new cases, live links and structured data on the server', async ({ page }) => {
  const response = await page.goto('/werk')
  const html = await response!.text()
  expect(html).not.toMatch(/WIA Management|AIbouwers|wia-management|wiamanagement/i)
  for (const project of portfolioProjects.slice(1)) {
    const article = page.locator(`#${project.slug}`)
    await expect(article.getByRole('heading', { name: project.name, exact: true })).toBeVisible()
    await expect(article.getByRole('link', { name: 'Bekijk live website', exact: true })).toHaveAttribute('href', project.url)
    expect(html).toContain(project.url)
    const image = article.getByRole('img', { name: project.imageAlt, exact: true })
    await image.scrollIntoViewIfNeeded()
    await expect.poll(() => image.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true)
  }
})

for (const width of [390, 768, 1440]) {
  test(`new desktop and mobile project previews render at ${width}px`, async ({ page }, testInfo) => {
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    await page.setViewportSize({ width, height: 1000 })
    await page.goto('/')
    const preview = page.locator('.project-preview')
    for (const project of portfolioProjects.slice(1)) {
      await preview.getByRole('button', { name: project.name, exact: true }).click()
      for (const [label, alt, device] of [
        ['Desktopweergave', project.imageAlt, 'desktop'],
        ['Mobiele weergave', project.mobileImageAlt, 'mobile'],
      ]) {
        await preview.getByRole('button', { name: label, exact: true }).click()
        const image = preview.getByRole('img', { name: alt, exact: true })
        await expect.poll(() => image.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true)
        await preview.scrollIntoViewIfNeeded()
        await preview.screenshot({ path: testInfo.outputPath(`${project.slug}-${device}-${width}.png`), animations: 'disabled' })
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true)
      }
    }
    expect(errors).toEqual([])
    await page.goto('/werk')
    for (const project of portfolioProjects.slice(1)) {
      const article = page.locator(`#${project.slug}`)
      await article.scrollIntoViewIfNeeded()
      const title = article.getByRole('heading', { name: project.name, exact: true })
      expect(await title.evaluate(element => element.getBoundingClientRect().height <= parseFloat(getComputedStyle(element).lineHeight) + 1)).toBe(true)
      await expect.poll(() => article.getByRole('img', { name: project.imageAlt, exact: true }).evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true)
      await article.screenshot({ path: testInfo.outputPath(`${project.slug}-case-${width}.png`), animations: 'disabled' })
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true)
  })
}
