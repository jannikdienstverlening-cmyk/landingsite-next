import type { Prospect } from '@/lib/lead-engine/types'
import { LeadActions } from './lead-actions'
import { ScoreBadge } from './score-badge'

function signals(prospect: Prospect) {
  const items: Array<{ positive: boolean; text: string }> = []
  if ((prospect.googleReviewCount ?? 0) > 0) items.push({ positive: true, text: `${prospect.googleReviewCount} Google-reviews` })
  if (prospect.urls.some(({ kind }) => kind === 'INSTAGRAM')) items.push({ positive: true, text: 'Instagram-bedrijfspagina gevonden' })
  if (!prospect.websiteUrl) items.push({ positive: false, text: 'Website nog niet bevestigd' })
  if (prospect.audit?.signals.isResponsive === false) items.push({ positive: false, text: 'Website niet mobielvriendelijk' })
  if (prospect.audit?.signals.hasQuoteForm === false) items.push({ positive: false, text: 'Geen offerteformulier' })
  if (prospect.audit?.signals.hasAboveFoldCta === false) items.push({ positive: false, text: 'Geen duidelijke CTA boven de fold' })
  return items.slice(0, 4)
}

export function LeadCard({ prospect }: { prospect: Prospect }) {
  const draft = prospect.drafts.find(({ channel, status }) => channel === prospect.recommendedChannel && status === 'READY')
    ?? prospect.drafts.find(({ status }) => status === 'READY')
  return <article className="lead-card">
    <div className="lead-card-top"><div><h3>{prospect.companyName}</h3><span className="lead-card-location">{prospect.place} · {prospect.sbiCodes[0]?.description ?? 'Branche onbekend'}</span></div><ScoreBadge score={prospect.opportunityScore} scoreClass={prospect.scoreClass} /></div>
    <span className="score-label">{prospect.scoreClass.replace('_', ' ')}</span>
    <ul className="signal-list">{signals(prospect).map((item) => <li className={item.positive ? '' : 'negative'} key={item.text}><i>{item.positive ? '✓' : '×'}</i>{item.text}</li>)}</ul>
    <div className="recommended"><span>Aanbevolen actie</span><strong>{prospect.recommendedChannel === 'PHONE' ? 'Bel met persoonlijk script' : `Stuur ${prospect.recommendedChannel.toLowerCase()}-bericht`}</strong></div>
    <LeadActions prospectId={prospect.id} draft={draft} canDemo={prospect.scoreClass === 'VERY_HOT'} />
  </article>
}
