import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { chromium } from '@playwright/test'
import { commercialConfig } from '../config/commercial'
import { portfolioProjects } from '../data/portfolio'

async function main() {
  const project = portfolioProjects[0]
  const screenshot = await readFile(`public${project.image}`)
  const browser = await chromium.launch()
  try {
    const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 })
    await page.setContent(`<!doctype html><html lang="nl"><head><meta charset="utf-8"><style>
      * { box-sizing: border-box; }
      body { margin: 0; padding: 48px 56px; background: #f7f8f4; color: #122d27; font-family: Arial, sans-serif; }
      header { display: flex; align-items: center; justify-content: space-between; font-size: 30px; font-weight: 700; }
      header span { font-size: 18px; font-weight: 400; }
      main { display: grid; grid-template-columns: 1fr 480px; gap: 48px; align-items: center; margin-top: 64px; }
      h1 { margin: 0 0 28px; font-size: 54px; line-height: 1.1; font-weight: 700; }
      p { margin: 0; font-size: 22px; line-height: 1.5; }
      .price { margin-bottom: 18px; font-size: 32px; font-weight: 700; color: #17664d; }
      .price span { display: block; font-size: 17px; font-weight: 400; }
      figure { margin: 0; }
      img { display: block; width: 480px; height: 333px; object-fit: cover; border: 1px solid #c5d2cb; }
      figcaption { margin-top: 14px; font-size: 16px; }
    </style></head><body><header>landingsite.nl<span>Voor zzp'ers en kleine bedrijven</span></header>
    <main><div><h1>Een goede website<br>voor jouw bedrijf.</h1><p class="price">&euro;${commercialConfig.management.monthlyPrice} per maand<span>inclusief btw</span></p><p>Websitebouw, hosting en beheer inbegrepen.<br>Geen eenmalige bouwkosten.</p></div>
    <figure><img src="data:image/webp;base64,${screenshot.toString('base64')}" alt=""><figcaption>Uit ons werk: ${project.name}</figcaption></figure></main></body></html>`)
    await page.locator('img').evaluate((image: HTMLImageElement) => image.decode())
    const image = await page.screenshot({ type: 'png' })
    await mkdir('public/og', { recursive: true })
    await writeFile('public/og/default.png', image)
    console.log('Social image vernieuwd: 1200 x 630, maandbedrag uit commercial.ts.')
  } finally {
    await browser.close()
  }
}

main().catch(() => {
  console.error('Social image genereren mislukt.')
  process.exitCode = 1
})
