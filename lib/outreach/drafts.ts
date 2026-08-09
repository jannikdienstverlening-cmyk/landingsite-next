import { randomUUID } from 'node:crypto'
import type { GeneratedSalesPackage } from '@/lib/ai/sales-analysis'
import { automaticOutreachAllowed } from '@/lib/compliance/policy'
import type { OutreachChannel, OutreachDraft, Prospect, UrlKind } from '@/lib/lead-engine/types'

const socialKind: Partial<Record<OutreachChannel, UrlKind>> = {
  INSTAGRAM: 'INSTAGRAM',
  LINKEDIN: 'LINKEDIN',
}

function profileFor(prospect: Prospect, channel: OutreachChannel) {
  const kind = socialKind[channel]
  if (kind) return prospect.urls.find((entry) => entry.kind === kind)?.url ?? null
  if (channel === 'EMAIL' && prospect.email) return `mailto:${prospect.email}`
  if (channel === 'WHATSAPP' && prospect.phone) return `https://wa.me/${prospect.phone.replace(/\D/g, '').replace(/^0/, '31')}`
  if (channel === 'PHONE' && prospect.phone) return `tel:${prospect.phone}`
  return null
}

export function recommendedOutreachChannel(prospect: Pick<Prospect, 'urls' | 'email' | 'phone' | 'audit' | 'websiteUrl'>): OutreachChannel {
  const instagram = prospect.urls.some(({ kind }) => kind === 'INSTAGRAM')
  if (instagram && (!prospect.websiteUrl || (prospect.audit?.scores.design ?? 100) < 55)) return 'INSTAGRAM'
  if (prospect.email) return 'EMAIL'
  if (prospect.phone) return 'PHONE'
  if (prospect.urls.some(({ kind }) => kind === 'LINKEDIN')) return 'LINKEDIN'
  return 'PHONE'
}

export function buildOutreachDrafts(prospect: Prospect, salesPackage: GeneratedSalesPackage): OutreachDraft[] {
  return (Object.keys(salesPackage.drafts) as OutreachChannel[]).map((channel) => ({
    id: randomUUID(),
    channel,
    body: salesPackage.drafts[channel],
    status: 'READY',
    sendMode: automaticOutreachAllowed(channel) ? 'OFFICIAL_API' : 'MANUAL',
    profileUrl: profileFor(prospect, channel),
    scheduledFor: null,
  }))
}

export function manualContactUrl(draft: OutreachDraft) {
  if (!draft.profileUrl) return null
  if (draft.channel === 'EMAIL') {
    const url = new URL(draft.profileUrl)
    url.searchParams.set('subject', 'Een idee voor jullie website')
    url.searchParams.set('body', draft.body)
    return url.toString()
  }
  if (draft.channel === 'WHATSAPP') {
    const url = new URL(draft.profileUrl)
    url.searchParams.set('text', draft.body)
    return url.toString()
  }
  return draft.profileUrl
}
