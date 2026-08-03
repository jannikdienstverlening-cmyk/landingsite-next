import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const publicSources = [
  'app/page.tsx',
  'app/algemene-voorwaarden/page.tsx',
  'app/privacybeleid/page.tsx',
  'app/partnervoorwaarden/page.tsx',
  'app/genereren/[id]/page.tsx',
  'app/intake/[session_id]/page.tsx',
  'components/home-redesign.tsx',
  'lib/business.ts',
]

test('persoonlijk e-mailadres wordt niet in publieke pagina’s opgenomen', async () => {
  const source = (await Promise.all(publicSources.map((path) => readFile(path, 'utf8')))).join('\n')

  assert.doesNotMatch(source, /jannikklumpenaar@gmail\.com/i)
  assert.doesNotMatch(source, /BUSINESS\.email/)
})
