import assert from 'node:assert/strict'
import test from 'node:test'
import { buildWhatsAppHandoffMessage, createWhatsAppUrl, normalizeWhatsAppNumber } from '../lib/whatsapp'

test('WhatsApp-nummers worden naar internationaal formaat genormaliseerd', () => {
  assert.equal(normalizeWhatsAppNumber('06 12 34 56 78'), '31612345678')
  assert.equal(normalizeWhatsAppNumber('+31 (0)6 12 34 56 78'), '31612345678')
  assert.equal(normalizeWhatsAppNumber('0031 6 12 34 56 78'), '31612345678')
  assert.equal(normalizeWhatsAppNumber('geen nummer'), null)
})

test('WhatsApp-overdracht bevat alleen de laatste drie bezoekersvragen', () => {
  const message = buildWhatsAppHandoffMessage([
    { role: 'assistant', content: 'Waar kan ik mee helpen?' },
    { role: 'user', content: 'Vraag één' },
    { role: 'user', content: 'Vraag twee' },
    { role: 'assistant', content: 'Een antwoord' },
    { role: 'user', content: 'Vraag drie' },
    { role: 'user', content: 'Vraag vier' },
  ])

  assert.doesNotMatch(message, /Vraag één/)
  assert.doesNotMatch(message, /Een antwoord/)
  assert.match(message, /Vraag twee/)
  assert.match(message, /Vraag drie/)
  assert.match(message, /Vraag vier/)
})

test('WhatsApp-link bevat het vooraf ingevulde bericht en faalt veilig zonder nummer', () => {
  const url = createWhatsAppUrl('31612345678', 'Hoi Jannik')
  assert.equal(url, 'https://wa.me/31612345678?text=Hoi+Jannik')
  assert.equal(createWhatsAppUrl('', 'Hoi Jannik'), null)
})
