import Link from 'next/link'
import { BarList } from '@/components/lead-engine/bar-list'
import { LeadCard } from '@/components/lead-engine/lead-card'
import { MetricCard } from '@/components/lead-engine/metric-card'
import { RunPipelineButton } from '@/components/lead-engine/run-pipeline-button'
import { getDashboardData } from '@/lib/crm'

export default async function DashboardPage() {
  const data = await getDashboardData()
  const { metrics } = data
  return <>
    <header className="engine-page-head">
      <div><span className="engine-kicker">Lead intelligence</span><h1>Goedemorgen, Jannik.</h1><p>De interessantste lokale bedrijven staan bovenaan. Controleer de onderbouwing voordat je contact opneemt.</p></div>
      <div className="engine-head-actions"><RunPipelineButton /></div>
    </header>
    {data.source === 'demo' && <div className="demo-banner">Demodata is actief. Configureer Supabase, voer de Lead Engine-migratie uit en zet <code>LEAD_ENGINE_DEMO_MODE=false</code> voor live data.</div>}
    <section className="metric-grid" aria-label="Kerncijfers">
      <MetricCard label="Nieuwe leads vandaag" value={metrics.newToday} note="Open data discovery" />
      <MetricCard label="Very hot" value={metrics.veryHot} note="Score 85–100" accent />
      <MetricCard label="Hot leads" value={metrics.hot} note="Score 75–84" />
      <MetricCard label="Concepten klaar" value={metrics.draftsReady} note="Wachten op controle" />
      <MetricCard label="Benaderd vandaag" value={metrics.contactedToday} note="Handmatig bevestigd" />
      <MetricCard label="Reacties" value={metrics.replies} note="Alle positieve en open reacties" />
      <MetricCard label="Afspraken" value={metrics.appointments} note="In CRM-pipeline" />
      <MetricCard label="Gewonnen" value={metrics.won} note={`${metrics.conversionRate}% conversie`} />
      <MetricCard label="Pipelinewaarde" value={new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(metrics.pipelineValue)} note="Geschatte open waarde" />
      <MetricCard label="Gemiddelde score" value={metrics.averageScore} note="Van alle actieve leads" />
    </section>

    <section className="engine-section">
      <div className="engine-section-head"><div><h2>Hot leads</h2><p>Gesorteerd op opportunity score en suppression-check.</p></div><Link href="/leads">Alle leads bekijken →</Link></div>
      {data.hotLeads.length ? <div className="lead-grid">{data.hotLeads.slice(0, 6).map((prospect) => <LeadCard prospect={prospect} key={prospect.id} />)}</div> : <div className="panel empty-state"><strong>Nog geen hot leads</strong><p>Start de discovery-pipeline om openbare lokale bedrijfsvermeldingen te onderzoeken.</p><RunPipelineButton /></div>}
    </section>

    <section className="engine-section engine-two-col">
      <div className="panel"><h2>Waar de kansen liggen</h2><p className="panel-sub">Leads per plaats binnen de eerste markt.</p><BarList items={data.topPlaces} /></div>
      <aside className="panel"><h2>Snelle inzichten</h2><p className="panel-sub">Uit outreach-uitkomsten, zonder black-box ranking.</p><div className="insight-stack">
        <div className="mini-insight"><span>Beste acquisitiekanaal</span><strong>{data.bestChannel}</strong></div>
        <div className="mini-insight"><span>Beste openingsbericht</span><strong>{data.bestOpening}</strong></div>
        <div className="mini-insight"><span>Topbranche</span><strong>{data.topBranches[0]?.label ?? 'Nog geen data'}</strong></div>
      </div></aside>
    </section>
  </>
}
