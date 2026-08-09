import { BarList } from '@/components/lead-engine/bar-list'
import { listProspects } from '@/lib/crm'

export default async function InsightsPage() {
  const prospects = await listProspects()
  const counts = (values: string[]) => [...values.reduce((map, value) => map.set(value, (map.get(value) ?? 0) + 1), new Map<string, number>())]
    .map(([label, value]) => ({ label, value })).sort((left, right) => right.value - left.value).slice(0, 6)
  const branches = counts(prospects.map((prospect) => prospect.sbiCodes.find(({ main }) => main)?.description ?? 'Onbekend'))
  const problems = counts(prospects.flatMap((prospect) => prospect.scoreBreakdown.filter(({ matched, points }) => matched && points > 0).map(({ label }) => label)))
  const outcomeSample = prospects.filter((prospect) => ['CONTACTED','REPLIED','INTERESTED','APPOINTMENT','WON','LOST'].includes(prospect.pipelineStatus)).length
  return <>
    <header className="engine-page-head"><div><span className="engine-kicker">Learning loop</span><h1>Wat werkt?</h1><p>Resultaten worden gekoppeld aan branche, plaats, websiteprobleem, score, kanaal, openingszin en aanbod. Nieuwe ranking blijft uitlegbaar.</p></div></header>
    <section className="learning-hero">
      <div className="learning-main"><span>Datakwaliteit</span><strong>{outcomeSample >= 30 ? 'Voldoende uitkomstdata voor eerste vergelijkingen.' : `Nog ${Math.max(0, 30 - outcomeSample)} contactuitkomsten nodig voor betrouwbare optimalisatie.`}</strong></div>
      <article className="metric-card"><span>Uitkomsten vastgelegd</span><strong>{outcomeSample}</strong><small>Minimumdoel: 30</small></article>
      <article className="metric-card"><span>Positieve signalen</span><strong>{prospects.filter(({ pipelineStatus }) => ['REPLIED','INTERESTED','APPOINTMENT','WON'].includes(pipelineStatus)).length}</strong><small>Reactie of verder</small></article>
      <article className="metric-card"><span>Klanten</span><strong>{prospects.filter(({ pipelineStatus }) => pipelineStatus === 'WON').length}</strong><small>Attributie in CRM</small></article>
    </section>
    <section className="engine-section engine-two-col">
      <div className="panel"><h2>Meest voorkomende kansen</h2><p className="panel-sub">Welke concrete websiteproblemen komen in de huidige leadset het vaakst voor?</p><BarList items={problems} /></div>
      <div className="panel"><h2>Brancheverdeling</h2><p className="panel-sub">Basis voor latere conversievergelijking per SBI-cluster.</p><BarList items={branches} /></div>
    </section>
    <section className="engine-section panel"><h2>Methodiek</h2><p className="panel-sub">De learning loop verhoogt geen score op basis van profielkenmerken zonder concrete uitkomstdata. Suppression, negatieve reacties en opt-outs blijven harde uitsluitingen; modeloptimalisatie kan die nooit overrulen.</p></section>
  </>
}
