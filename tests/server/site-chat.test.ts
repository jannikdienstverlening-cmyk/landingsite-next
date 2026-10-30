import assert from 'node:assert/strict'
import test from 'node:test'
import { answerSiteQuestion } from '../../lib/site-chat'

test('beheerantwoord noemt 60 minuten en de ongewijzigde maandprijs', async () => {
  const answer = await answerSiteQuestion([{ role: 'user', content: 'Hoeveel minuten wijzigingen zitten bij het beheer?' }])
  assert.match(answer, /60 minuten/)
  assert.match(answer, /€79/)
  assert.doesNotMatch(answer, /20 minuten/)
})

test('afkoopprijs wordt niet met de maandprijs verward en rechten worden niet verzonnen', async () => {
  const answer = await answerSiteQuestion([{ role: 'user', content: 'Wat kost de afkoopprijs en word ik eigenaar van de broncode?' }])
  assert.match(answer, /geen vast afkoopbedrag/)
  assert.match(answer, /schriftelijk/)
  assert.match(answer, /Eerder overeengekomen rechten blijven gelden/)
  assert.doesNotMatch(answer, /€\d/)
})
