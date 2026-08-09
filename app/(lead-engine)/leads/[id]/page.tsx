import Link from 'next/link'
import { notFound } from 'next/navigation'
import { LeadActions } from '@/components/lead-engine/lead-actions'
import { ProspectControls } from '@/components/lead-engine/prospect-controls'
import { ScoreBadge } from '@/components/lead-engine/score-badge'
import { getProspect } from '@/lib/crm'

export default async function ProspectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const prospect = await getProspect(id)
  if (!prospect) notFound()
  const draft = prospect.drafts.find(({ status }) => status === 'READY')
  return <>
    <header className="engine-page-head"><div><span className="engine-kicker">Lead dossier · {prospect.kvkNumber ? `KVK ${prospect.kvkNumber}` : `OpenStreetMap ${prospect.sourceRecordId}`}</span><h1>{prospect.companyName}</h1><p>{prospect.place} · {prospect.sbiCodes.find(({ main }) => main)?.description ?? prospect.sbiCodes[0]?.description ?? 'Branche onbekend'}</p></div><div className="engine-head-actions"><Link className="engine-button" href="/leads">← TERUG</Link></div></header>
    {prospect.suppressed && <div className="demo-banner">Deze lead staat op de suppressionlijst en mag niet worden benaderd.</div>}
    <div className="detail-grid">
      <div className="detail-stack">
        <section className="panel">
          <div className="lead-card-top"><div><span className="engine-kicker">Opportunity score</span><h2>{prospect.scoreClass.replace('_', ' ')}</h2></div><ScoreBadge score={prospect.opportunityScore} scoreClass={prospect.scoreClass} /></div>
          <ul className="signal-list">{prospect.scoreBreakdown.filter(({ matched }) => matched).map((item) => <li className={item.points < 0 ? 'negative' : ''} key={item.key}><i>{item.points > 0 ? '+' : ''}{item.points}</i>{item.label}</li>)}</ul>
        </section>
        <section className="panel"><h2>Website-audit</h2><p className="panel-sub">Techniek en conversie, aangevuld met visuele AI-beoordeling wanneer een PageSpeed-screenshot beschikbaar was.</p>
          {prospect.audit ? <><div className="score-row">{Object.entries(prospect.audit.scores).map(([label, value]) => <div className="score-mini" key={label}><span>{label}</span><strong>{value}</strong></div>)}</div><div className="analysis-list"><div className="analysis-item"><span>Samenvatting</span><p>{prospect.audit.summary}</p></div>{prospect.audit.visualAssessment && <div className="analysis-item"><span>Visuele beoordeling</span><p>{prospect.audit.visualAssessment}</p></div>}</div></> : <div className="empty-state"><strong>Nog geen website-audit</strong><p>De website is nog niet bevestigd of de audit is nog niet uitgevoerd.</p></div>}
        </section>
        <section className="panel"><h2>AI-salesanalyse</h2><p className="panel-sub">Gebaseerd op de opgeslagen, concrete bedrijfs- en auditfeiten.</p>
          {prospect.analysis ? <div className="analysis-list">
            <div className="analysis-item"><span>Waarom interessant?</span><p>{prospect.analysis.whyInteresting}</p></div>
            <div className="analysis-item"><span>Grootste probleem</span><p>{prospect.analysis.biggestProblem}</p></div>
            <div className="analysis-item"><span>Aanbevolen verbetering</span><p>{prospect.analysis.recommendedImprovement}</p></div>
            <div className="analysis-item"><span>Beste dienst</span><p>{prospect.analysis.recommendedService}</p></div>
            <div className="analysis-item"><span>Openingszin</span><p>“{prospect.analysis.openingLine}”</p></div>
          </div> : <p className="panel-sub">Analyse wordt gemaakt nadat enrichment, audit en scoring zijn afgerond.</p>}
        </section>
      </div>
      <aside className="detail-stack">
        <section className="panel"><h2>Actie</h2><p className="panel-sub">Outreach blijft handmatig totdat een toegestane officiële integratie is geconfigureerd.</p><div className="recommended"><span>Aanbevolen</span><strong>{prospect.recommendedChannel}</strong></div><LeadActions prospectId={prospect.id} draft={draft} canDemo={prospect.scoreClass === 'VERY_HOT'} /></section>
        <section className="panel"><h2>Bedrijfsgegevens</h2><div className="facts-list">
          <div className="fact"><span>Bron</span><strong>{prospect.source === 'OPENSTREETMAP' ? 'OpenStreetMap' : 'KVK Handelsregister'}</strong></div><div className="fact"><span>KVK</span><strong>{prospect.kvkNumber ?? 'Niet beschikbaar'}</strong></div><div className="fact"><span>Rechtsvorm</span><strong>{prospect.legalForm ?? 'Onbekend'}</strong></div>
          <div className="fact"><span>Registratie</span><strong>{prospect.registrationDate ? new Date(prospect.registrationDate).toLocaleDateString('nl-NL') : 'Onbekend'}</strong></div><div className="fact"><span>Werknemers</span><strong>{prospect.employeeCount ?? 'Onbekend'}</strong></div>
          <div className="fact"><span>Adres</span><strong>{prospect.address ?? 'Niet opgeslagen'}</strong></div><div className="fact"><span>Postcode</span><strong>{prospect.postcode ?? 'Onbekend'}</strong></div>
          <div className="fact"><span>Website</span>{prospect.websiteUrl ? <a href={prospect.websiteUrl} target="_blank" rel="noreferrer">Open ↗</a> : <strong>Nog niet gevonden</strong>}</div><div className="fact"><span>Google reviews</span><strong>{prospect.googleReviewCount ?? 'Onbekend'}</strong></div>
        </div></section>
        <section className="panel"><h2>CRM</h2><p className="panel-sub">Status, notities en outreach-uitkomsten worden in de tijdlijn en auditlog vastgelegd.</p><ProspectControls prospectId={prospect.id} status={prospect.pipelineStatus} channel={prospect.recommendedChannel} />
          {(prospect.notes.length > 0 || prospect.activities.length > 0) && <div className="analysis-list">{prospect.notes.map((note) => <div className="analysis-item" key={note.id}><span>Notitie · {new Date(note.createdAt).toLocaleDateString('nl-NL')}</span><p>{note.body}</p></div>)}{prospect.activities.map((activity) => <div className="analysis-item" key={activity.id}><span>{activity.type.replaceAll('_', ' ')} · {new Date(activity.occurredAt).toLocaleDateString('nl-NL')}</span><p>{activity.outcome ?? 'Vastgelegd in tijdlijn'}</p></div>)}</div>}
        </section>
        <section className="panel"><h2>Gevonden profielen</h2><div className="analysis-list">{prospect.urls.map((url) => <div className="analysis-item" key={`${url.kind}-${url.url}`}><span>{url.kind} · {Math.round(url.confidence * 100)}%</span><p><a href={url.url} target="_blank" rel="noreferrer">{url.url}</a></p></div>)}{!prospect.urls.length && <p className="panel-sub">Nog geen bevestigde profielen.</p>}</div></section>
      </aside>
    </div>
  </>
}
