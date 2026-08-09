import Link from 'next/link'
import { listProspects } from '@/lib/crm'
import { PIPELINE_STATUSES } from '@/lib/lead-engine/types'

export default async function CrmPage() {
  const prospects = await listProspects()
  return <>
    <header className="engine-page-head"><div><span className="engine-kicker">Pipeline</span><h1>CRM</h1><p>Van nieuwe lead tot gewonnen klant, inclusief volgende actie en volledige statushistorie in PostgreSQL.</p></div></header>
    <div className="pipeline-board">{PIPELINE_STATUSES.map((status) => {
      const items = prospects.filter((prospect) => prospect.pipelineStatus === status)
      return <section className="pipeline-column" key={status}><div className="pipeline-column-head">{status.replaceAll('_', ' ')}<span>{items.length}</span></div>{items.map((prospect) => <Link className="pipeline-item" href={`/leads/${prospect.id}`} key={prospect.id}><strong>{prospect.companyName}</strong><small><span>{prospect.place}</span><span>Score {prospect.opportunityScore}</span></small>{prospect.nextAction && <small><span>{prospect.nextAction}</span></small>}</Link>)}</section>
    })}</div>
  </>
}
