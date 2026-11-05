import assert from 'node:assert/strict'
import test from 'node:test'
import { answerSiteQuestion } from '../../lib/site-chat'

test('beheerantwoord noemt 60 minuten en de ongewijzigde maandprijs', async () => {
  const answer = await answerSiteQuestion([{ role: 'user', content: 'Hoeveel minuten wijzigingen zitten bij het beheer?' }])
  assert.match(answer, /60 minuten/)
  assert.match(answer, /€79/)
  assert.doesNotMatch(answer, /20 minuten/)
})

test('overnamebedragen zijn eenmalig en worden niet met opzegkosten of de maandprijs verward', async () => {
  const answer = await answerSiteQuestion([{ role: 'user', content: 'Wat kost de overname?' }])
  assert.match(answer, /overname na opzegging vrijwillig/)
  assert.match(answer, /korter dan 12 maanden: €\s*750; 12 tot 18 maanden: €\s*500; 18 tot 24 maanden: €\s*250; vanaf 24 maanden: gratis/)
  assert.match(answer, /inclusief btw/)
  assert.match(answer, /Zonder overname betaal je geen overnamebedrag/)
  assert.match(answer, /schriftelijk/)
  assert.match(answer, /Eerder overeengekomen rechten blijven gelden/)
  assert.doesNotMatch(answer, /€\s*79\b/)
})
