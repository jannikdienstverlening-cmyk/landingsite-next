import assert from 'node:assert/strict'
import { readFile, readdir } from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'
import { commercialConfig } from '../config/commercial'
import { pricingConfig } from '../config/pricing'
import { verifiedClaims } from '../config/verified-claims'

test('60 minuten beheer blijft consistent zonder prijs- of afkoopbedrag te verzinnen', () => {
  assert.equal(commercialConfig.management.includedChangeMinutes, 60)
  assert.equal(pricingConfig.websiteManagement.includedChangeMinutes, 60)
  assert.equal(verifiedClaims.management.value.includedChangeMinutes, 60)
  assert.ok(commercialConfig.management.features.includes('Maximaal 60 minuten kleine tekst- of beeldwijzigingen per maand'))
  assert.equal(commercialConfig.management.monthlyPrice, 79)
  assert.equal(commercialConfig.websiteRights.buyoutPricing, 'on-request')
  assert.equal('buyoutPrice' in commercialConfig.websiteRights, false)
  assert.equal(verifiedClaims.websiteRights.publish, true)
  assert.equal(verifiedClaims.websiteRights.verifiedAt, '2026-10-30')
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
  assert.doesNotMatch(terms, /afkoopprijs.{0,40}€\d/)
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
