import assert from 'node:assert/strict'
import test from 'node:test'
import { chatSchema } from '../lib/validation'

test('chat accepteert een korte afwisselende conversatie', () => {
  const parsed = chatSchema.safeParse({ messages: [
    { role: 'user', content: 'Wat kost een landingspagina?' },
    { role: 'assistant', content: 'De bouwprijs start bij 299 euro inclusief btw.' },
    { role: 'user', content: 'Wanneer is de eerste versie klaar?' },
  ] })
  assert.equal(parsed.success, true)
})

test('chat blokkeert te lange, dubbele en verkeerd afgesloten conversaties', () => {
  assert.equal(chatSchema.safeParse({ messages: [{ role: 'user', content: 'x'.repeat(801) }] }).success, false)
  assert.equal(chatSchema.safeParse({ messages: [
    { role: 'user', content: 'Eerste vraag' },
    { role: 'user', content: 'Tweede vraag' },
  ] }).success, false)
  assert.equal(chatSchema.safeParse({ messages: [
    { role: 'user', content: 'Vraag' },
    { role: 'assistant', content: 'Antwoord' },
  ] }).success, false)
})
