import assert from 'node:assert/strict'
import test from 'node:test'
import { commercialConfig, type CommercialPackageId } from '../config/commercial'
import { packagePresentation } from '../content/package-presentation'

for (const id of Object.keys(commercialConfig.packages) as CommercialPackageId[]) {
  test(`${id} display copy preserves configured page count and revision rounds`, () => {
    const item = commercialConfig.packages[id]
    const copy = packagePresentation(id)
    assert.equal(copy.specs.length, 4)
    assert.match(copy.specs[0].value, new RegExp(`\\b${item.pages}\\b`))
    assert.match(copy.specs[2].value, new RegExp(`^${item.correctionRounds} aanpassingsronde`))
    assert.doesNotMatch(copy.audience + copy.specs.map(spec => spec.value).join(' '), /kernpagina|websitecopy|formuliersegmentatie|gebundelde/)
    if (item.sectionLimit) assert.match(copy.specs[0].value, new RegExp(`\\b${item.sectionLimit}\\b`))
  })
}
