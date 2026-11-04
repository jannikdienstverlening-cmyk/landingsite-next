import assert from 'node:assert/strict'
import { randomUUID } from 'node:crypto'
import test from 'node:test'
import { NextRequest } from 'next/server'
import { POST } from '../../app/api/partners/apply/route'
import { getSupabase } from '../../lib/supabase'
import { getResend } from '../../lib/resend'

process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://database.example.com'
process.env.SUPABASE_SERVICE_ROLE_KEY = 'local-mock-key'
process.env.RESEND_API_KEY = 're_localmock'
process.env.ADMIN_EMAIL = 'admin@example.com'

const valid = { voornaam: 'Test', achternaam: 'Voorbeeld', email: 'partner-test@example.com', telefoon: '', type: 'particulier', bedrijfsnaam: '', kvkNummer: '', btwNummer: '', termsAccepted: true, privacyAccepted: true, website: '' }
function request(body: unknown, origin = 'https://www.landingsite.nl') {
  return new NextRequest('https://www.landingsite.nl/api/partners/apply', { method: 'POST', headers: { origin, 'content-type': 'application/json', 'x-forwarded-for': randomUUID() }, body: JSON.stringify(body) })
}

test('geldige partneraanvraag blijft pending en verzendt alleen de bestaande bevestigingen', async context => {
  let inserted: Record<string, unknown> = {}
  context.mock.method(getSupabase(), 'from', ((table: string) => {
    assert.equal(table, 'partners')
    return {
      select() { return this }, eq() { return this },
      maybeSingle: async () => ({ data: null, error: null }),
      insert(value: Record<string, unknown>) { inserted = value; return this },
      single: async () => ({ data: { id: 'partner-local-test' }, error: null }),
    }
  }) as never)
  const send = context.mock.method(getResend().emails, 'send', async () => ({ data: { id: 'mail-local-test' }, error: null }))
  const response = await POST(request({ ...valid, requestId: randomUUID() }))
  assert.equal(response.status, 201)
  assert.deepEqual(await response.json(), { ok: true, status: 'pending' })
  assert.equal(inserted.status, 'pending')
  assert.equal(inserted.terms_version, '2026-08-01')
  assert.equal('referral_code' in inserted, false)
  assert.equal('iban' in inserted, false)
  assert.equal(send.mock.callCount(), 2)
})

test('ontbrekende toestemming, spam, ongeldige bedrijfsgegevens en andere origin bereiken geen providers', async context => {
  const from = context.mock.method(getSupabase(), 'from', () => { throw new Error('Unexpected database access') })
  for (const input of [
    { ...valid, termsAccepted: false }, { ...valid, privacyAccepted: false },
    { ...valid, website: 'spam' }, { ...valid, type: 'ondernemer', kvkNummer: '123' },
  ]) {
    const response = await POST(request({ ...input, requestId: randomUUID() }))
    assert.equal(response.status, 400)
  }
  assert.equal((await POST(request({ ...valid, requestId: randomUUID() }, 'https://example.com'))).status, 403)
  assert.equal(from.mock.callCount(), 0)
})

test('bestaande partneraanvraag maakt geen tweede partner of bevestigingsmail aan', async context => {
  context.mock.method(getSupabase(), 'from', (() => ({
    select() { return this }, eq() { return this },
    maybeSingle: async () => ({ data: { id: 'existing-partner', status: 'approved' }, error: null }),
  })) as never)
  const send = context.mock.method(getResend().emails, 'send', async () => { throw new Error('Unexpected email') })
  const response = await POST(request({ ...valid, requestId: randomUUID() }))
  assert.equal(response.status, 200)
  assert.deepEqual(await response.json(), { ok: true, status: 'approved' })
  assert.equal(send.mock.callCount(), 0)
})

test('een e-mailfout verandert de opgeslagen aanvraag niet en logt geen persoonsgegevens', async context => {
  context.mock.method(getSupabase(), 'from', (() => ({
    select() { return this }, eq() { return this }, insert() { return this },
    maybeSingle: async () => ({ data: null, error: null }),
    single: async () => ({ data: { id: 'partner-local-test' }, error: null }),
  })) as never)
  context.mock.method(getResend().emails, 'send', async () => { throw new Error('private-customer@example.com token=do-not-log') })
  const log = context.mock.method(console, 'error', () => {})
  const response = await POST(request({ ...valid, requestId: randomUUID() }))
  assert.equal(response.status, 201)
  assert.deepEqual(await response.json(), { ok: true, status: 'pending' })
  assert.equal(log.mock.callCount(), 1)
  assert.doesNotMatch(JSON.stringify(log.mock.calls), /private-customer|token=|partner-local-test|partner-test@example/)
})
