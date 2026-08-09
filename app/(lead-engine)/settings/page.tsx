import { SettingsPanel } from '@/components/lead-engine/settings-panel'
import { getScoringWeights } from '@/lib/crm'
import { OUTREACH_POLICY } from '@/lib/compliance'

export default async function SettingsPage() {
  const weights = await getScoringWeights()
  return <>
    <header className="engine-page-head"><div><span className="engine-kicker">Admin</span><h1>Instellingen</h1><p>Scoring, kanalen en compliancebeleid blijven expliciet configureerbaar en controleerbaar.</p></div></header>
    <section className="panel"><h2>Opportunity score</h2><p className="panel-sub">De totaalscore wordt na optelling begrensd op 0–100. Digitale bureaus krijgen standaard een sterke negatieve weging.</p><SettingsPanel initialWeights={weights} /></section>
    <section className="engine-section panel"><h2>Outreachbeleid</h2><p className="panel-sub">Geen kanaal is in fase 1 geconfigureerd voor automatische verzending.</p><div className="settings-list">{Object.entries(OUTREACH_POLICY).map(([channel, policy]) => <div className="setting-row" style={{ gridTemplateColumns: '120px 1fr 110px' }} key={channel}><strong>{channel}</strong><span style={{ fontSize: '.68rem', color: '#6f7885' }}>{policy.reason}</span><span className="status-pill">{policy.automatic ? 'API ACTIEF' : 'HANDMATIG'}</span></div>)}</div></section>
    <section className="engine-section engine-two-col"><div className="panel"><h2>Bewaartermijnen</h2><p className="panel-sub">Standaard: 180 dagen voor niet-benaderde prospects, 365 dagen voor verloren leads en 730 dagen voor auditlogs. Wijzig productie-instellingen in <code>lead_engine_settings</code> na juridische beoordeling.</p></div><div className="panel"><h2>Markt en bron</h2><p className="panel-sub">Veenendaal + circa 30 km. Discovery gebruikt standaard OpenStreetMap/Overpass met lage requestvolumes en zichtbare ODbL-bronvermelding. KVK blijft een optionele provider.</p></div></section>
  </>
}
