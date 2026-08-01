import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

test('database blokkeert dubbele commissie per factuur, partner en niveau', async () => {
  const migration = await readFile(new URL('../supabase-migration.sql', import.meta.url), 'utf8')
  assert.match(migration, /UNIQUE \(stripe_invoice_id, partner_id, level\)/)
  assert.match(migration, /status TEXT NOT NULL DEFAULT 'pending_review'/)
  assert.match(migration, /Handmatige controle vereist/)
})
