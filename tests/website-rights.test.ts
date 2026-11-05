import assert from 'node:assert/strict'
import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'
import { commercialConfig, websiteBuyoutRates } from '../config/commercial'
import { pricingConfig } from '../config/pricing'
import { verifiedClaims } from '../config/verified-claims'

test('60 minuten beheer en de maandprijs blijven ongewijzigd bij optionele overname', () => {
  assert.equal(commercialConfig.management.includedChangeMinutes, 60)
  assert.equal(pricingConfig.websiteManagement.includedChangeMinutes, 60)
  assert.equal(verifiedClaims.management.value.includedChangeMinutes, 60)
  assert.ok(commercialConfig.management.features.includes('Maximaal 60 minuten kleine tekst- of beeldwijzigingen per maand'))
  assert.equal(commercialConfig.management.monthlyPrice, 79)
  assert.equal(verifiedClaims.websiteRights.publish, true)
  assert.equal(verifiedClaims.websiteRights.verifiedAt, commercialConfig.terms.updatedAt)
})

test('overname is geprijsd op basis van 0, 12, 18 en 24 volledige betaalmaanden', () => {
  assert.deepEqual(websiteBuyoutRates.map(({ fromPaidMonths, amount, period }) => [fromPaidMonths, amount, period]), [
    [0, 750, 'Korter dan 12 maanden'],
    [12, 500, '12 tot 18 maanden'],
    [18, 250, '18 tot 24 maanden'],
    [24, 0, 'Vanaf 24 maanden'],
  ])
  assert.equal(websiteBuyoutRates.at(-1)?.priceLabel, 'Gratis')
})

test('eigen materiaal, abonnementslicentie, afkoop en eerdere rechten staan apart vast', async () => {
  const terms = await readFile('app/algemene-voorwaarden/page.tsx', 'utf8')
  assert.match(terms, /id="website-rechten"/)
  assert.match(terms, /Aanlevering draagt deze rechten niet over/)
  assert.match(terms, /geen automatische levering van broncode/)
  assert.match(terms, /schriftelijke, ondertekende akte/)
  assert.match(terms, /Opzeggen verplicht je niet tot afkoop/)
  assert.match(terms, /niet met terugwerkende kracht/)
  assert.match(terms, /onder hun eigen licenties/)
  assert.match(terms, /maximaal \{websiteManagement.includedChangeMinutes\} minuten/)
  assert.match(terms, /websiteBuyoutRates\.map/)
  assert.match(terms, /Er wordt niets automatisch geïncasseerd voor overname/)
  assert.match(terms, /ook als de overname gratis is/)
})

test('actieve bronteksten bevatten de oude maandelijkse wijzigingstijd niet meer', async () => {
  async function checkDirectory(directory: string): Promise<void> {
    for (const entry of await readdir(directory, { withFileTypes: true })) {
      const file = path.join(directory, entry.name)
      if (entry.isDirectory()) await checkDirectory(file)
      else if (/\.(tsx?|jsx?)$/.test(entry.name)) {
        const source = await readFile(file, 'utf8')
        assert.doesNotMatch(source, /\b20\s*min(?:uut|uten)?\b|\btwintig minuten\b/i, file)
      }
    }
  }
  for (const directory of ['app', 'components', 'config', 'lib']) await checkDirectory(directory)
})
