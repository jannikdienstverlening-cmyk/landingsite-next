import type { OutreachChannel } from '@/lib/lead-engine/types'

export const OUTREACH_POLICY: Record<OutreachChannel, { automatic: boolean; reason: string }> = {
  EMAIL: { automatic: false, reason: 'Alleen na menselijke controle en met passende opt-out; een officiële provider kan later worden gekoppeld.' },
  INSTAGRAM: { automatic: false, reason: 'Geen automatische DM; open het bedrijfsprofiel voor handmatige verzending.' },
  LINKEDIN: { automatic: false, reason: 'Geen scraping, connectie- of DM-automatisering.' },
  WHATSAPP: { automatic: false, reason: 'Alleen handmatig en wanneer het zakelijke nummer en doel passend zijn.' },
  PHONE: { automatic: false, reason: 'Handmatige belactie met vastgelegde grondslag en suppression-check.' },
}

export function automaticOutreachAllowed(channel: OutreachChannel) {
  return OUTREACH_POLICY[channel].automatic
}
