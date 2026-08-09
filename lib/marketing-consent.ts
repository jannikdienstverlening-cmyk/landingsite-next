import { createHash, randomBytes } from 'node:crypto'
import { consentConfig } from '@/config/consent'

export type MarketingConsentSource = 'newsletter' | 'download' | 'customer-preferences' | 'manual-import'
export type MarketingSubscriberStatus = 'active' | 'unsubscribed'

export function normalizeMarketingEmail(email: string) {
  return email.trim().toLowerCase()
}

export function createMarketingConfirmationToken() {
  return randomBytes(32).toString('base64url')
}

export function hashMarketingToken(token: string) {
  return createHash('sha256').update(token).digest('hex')
}

export function marketingConfirmationExpiresAt(now = new Date()) {
  return new Date(now.getTime() + consentConfig.marketing.confirmationTtlHours * 60 * 60_000)
}

export function maySendMarketing(input: {
  status: MarketingSubscriberStatus
  consentVersion: string
  suppressed: boolean
}) {
  return consentConfig.marketing.enabled
    && input.status === 'active'
    && input.consentVersion === consentConfig.marketing.version
    && !input.suppressed
}

export function assertMarketingEnabled() {
  if (!consentConfig.marketing.enabled) {
    throw new Error('MARKETING_DISABLED')
  }
}
