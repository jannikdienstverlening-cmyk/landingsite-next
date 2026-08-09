import { OutreachQueue, type OutreachQueueProspect } from '@/components/lead-engine/outreach-queue'
import { listProspects } from '@/lib/crm'

export default async function OutreachPage({ searchParams }: { searchParams: Promise<{ lead?: string }> }) {
  const { lead } = await searchParams
  const prospects = await listProspects()
  const filtered = lead ? prospects.filter(({ id }) => id === lead) : prospects
  const queueProspects: OutreachQueueProspect[] = filtered.map(({ id, companyName, place, opportunityScore, scoreClass, drafts }) => ({ id, companyName, place, opportunityScore, scoreClass, drafts }))
  const ready = filtered.reduce((count, prospect) => count + prospect.drafts.filter(({ status }) => ['READY','SNOOZED'].includes(status)).length, 0)
  return <>
    <header className="engine-page-head"><div><span className="engine-kicker">Human approval queue</span><h1>Outreach</h1><p>Concepten worden nooit automatisch naar socialmedia gestuurd. “Versturen” kopieert het bericht en opent het officiële kanaal; jij voert de laatste controle en verzending uit.</p></div><div className="engine-head-actions"><span className="status-pill CONTACT_READY">{ready} klaar</span></div></header>
    <OutreachQueue prospects={queueProspects} />
  </>
}
