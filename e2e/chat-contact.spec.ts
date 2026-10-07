import { expect, test } from '@playwright/test'
import { BUSINESS } from '../lib/business'

test('WhatsApp blijft bereikbaar als de assistent geen antwoord kan ophalen', async ({ page }) => {
  await page.route('**/api/chat', route => route.fulfill({
    status: 503,
    contentType: 'application/json',
    body: JSON.stringify({ error: 'Antwoord ophalen lukt nu niet.' }),
  }))
  for (const width of [390, 1440]) {
    await page.setViewportSize({ width, height: 844 })
    await page.goto('/')
    await page.getByRole('button', { name: 'Chat met de digitale assistent openen' }).click()
    const panel = page.locator('#site-chat-panel')
    const whatsapp = panel.getByRole('link', { name: /App Jannik via WhatsApp/ })
    await expect(whatsapp).toBeInViewport()
    await expect(whatsapp).toHaveAttribute('href', BUSINESS.whatsappUrl)
    await expect(panel).not.toContainText('06 5392 8832')
    await panel.getByLabel('Stel je vraag').fill('Welke pagina past bij een schilder?')
    await panel.getByRole('button', { name: 'Vraag versturen' }).click()
    await expect(panel.getByRole('alert')).toContainText('Antwoord ophalen lukt nu niet.')
    await expect(whatsapp).toHaveAttribute('href', BUSINESS.whatsappUrl)
    await panel.getByLabel('Stel je vraag').press('Escape')
    await expect(panel).toHaveCount(0)
  }
})
