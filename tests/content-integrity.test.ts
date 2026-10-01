import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import { portfolioProjects } from '../data/portfolio'

const publicSources = [
  'app/page.tsx',
  'app/layout.tsx',
  'app/start/page.tsx',
  'app/werk/page.tsx',
  'app/landingspagina-laten-maken/page.tsx',
  'app/website-laten-maken-zzp/page.tsx',
  'app/kosten-website-laten-maken/page.tsx',
  'app/over-landingsite/page.tsx',
  'components/studio-site.tsx',
  'components/project-preview.tsx',
  'components/site-interactions.tsx',
  'config/commercial.ts',
  'data/portfolio.ts',
]

test('publieke funnel bevat geen fictieve data, oude prijs of oude CTA-varianten', async () => {
  const source = (await Promise.all(publicSources.map(path => readFile(path, 'utf8')))).join('\n')
  for (const forbidden of [
    '+38% conversie', 'Performance 98', 'Lisa van Studio Noord', 'jouwcampagne.nl',
    'Veilige AI-assistentie', 'Premium AI-webbureau', '€15', 'Plan gesprek',
    'Start vandaag', 'Bespreek mijn landingspagina', 'portfolio_case_open', 'contact_form_submit',
  ]) {
    assert.doesNotMatch(source, new RegExp(forbidden.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'))
  }
})

test('publieke funnel gebruikt de vaste hoofdacties', async () => {
  const source = await readFile('components/studio-site.tsx', 'utf8')
  assert.match(source, /Start mijn website/)
  assert.match(source, /Bekijk live werk/)
  assert.match(source, /Kies \{item\.name\}/)
})

test('homepage begint met de echte hoofdcase en wisselt niet automatisch', async () => {
  const homepage = await readFile('components/studio-site.tsx', 'utf8')
  const preview = await readFile('components/project-preview.tsx', 'utf8')
  const page = await readFile('app/page.tsx', 'utf8')
  assert.match(homepage, /ProjectPreview projects=\{portfolioProjects\}/)
  assert.equal(portfolioProjects[0].domain, 'ontwikkelbegeleiding.nl')
  assert.match(preview, /useState\(0\)/)
  assert.doesNotMatch(preview, /setInterval|setTimeout|requestAnimationFrame/)
  assert.doesNotMatch(homepage, /ProjectShowcase/)
  assert.doesNotMatch(page, /FAQPage/)
})

test('nieuwe intentpagina’s gebruiken echte prijzen en geen resultaatgaranties', async () => {
  const source = (await Promise.all(publicSources.map(path => readFile(path, 'utf8')))).join('\n')
  assert.match(source, /commercialConfig/)
  assert.doesNotMatch(source, /gegarandeerd(?:e)? (?:leads|omzet|top 10)/i)
  assert.doesNotMatch(source, /AggregateRating|Review-schema/i)
})
