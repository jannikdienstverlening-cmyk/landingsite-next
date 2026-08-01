import assert from 'node:assert/strict'
import test from 'node:test'
import { readJsonBody } from '../lib/request'

test('JSON-body parser weigert payloads boven de routelimiet', async () => {
  const request = new Request('https://landingsite.nl/api/contact', {
    method: 'POST',
    body: JSON.stringify({ bericht: 'te groot' }),
  })
  await assert.rejects(() => readJsonBody(request, 4), /REQUEST_TOO_LARGE/)
})
