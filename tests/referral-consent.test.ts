import assert from 'node:assert/strict'
import test from 'node:test'
import { referralCaptureSchema } from '../lib/validation'

const base = {
  code: 'PARTNER123',
  landingPath: '/?ref=PARTNER123',
  utmSource: '',
  utmMedium: '',
  utmCampaign: '',
}

test('referraltracking blijft standaard beperkt tot de browsersessie', () => {
  const parsed = referralCaptureSchema.parse(base)
  assert.equal(parsed.persistence, 'session')
  assert.equal(parsed.consentVersion, '')
})

test('langdurige referraltracking vereist een expliciete toestemmingsversie in de route', () => {
  const parsed = referralCaptureSchema.parse({ ...base, persistence: 'persistent', consentVersion: 'referral-30d-v1' })
  assert.equal(parsed.persistence, 'persistent')
  assert.equal(parsed.consentVersion, 'referral-30d-v1')
})

