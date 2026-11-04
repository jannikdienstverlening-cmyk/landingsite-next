import { expect, test } from '@playwright/test'

test('nieuw groen favicon en app-iconen zijn bereikbaar en gekoppeld aan de pagina', async ({ page, request }) => {
  await page.goto('/')
  const icon = page.locator('link[rel="icon"][type="image/svg+xml"]')
  await expect(icon).toHaveAttribute('href', /\/icon\.svg\?/)
  const response = await request.get((await icon.getAttribute('href'))!)
  expect(response.ok()).toBe(true)
  const svg = await response.text()
  expect(svg).toContain('#203f35')
  expect(svg).toContain('#f6f7f2')
  expect(svg).not.toMatch(/#246bfd|#0b1220|<script/)
  for (const file of ['/favicon.svg', '/favicon-16x16.png', '/favicon-32x32.png', '/apple-touch-icon.png', '/icon-192.png', '/icon-512.png']) {
    expect((await request.get(file)).ok()).toBe(true)
  }
  const appleIcon = page.locator('link[rel="apple-touch-icon"]')
  expect((await request.get((await appleIcon.getAttribute('href'))!)).ok()).toBe(true)
  const manifest = await (await request.get('/manifest.webmanifest')).json()
  expect(manifest.theme_color).toBe('#203f35')
  expect(manifest.icons.map((icon: { src: string }) => icon.src)).toEqual(['/icon-192.png', '/icon-512.png'])
})
