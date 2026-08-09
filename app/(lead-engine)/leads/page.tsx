import Link from 'next/link'
import { LeadCard } from '@/components/lead-engine/lead-card'
import { PHASE_ONE_PLACES } from '@/lib/lead-engine/market'
import { PIPELINE_STATUSES } from '@/lib/lead-engine/types'
import { listProspects } from '@/lib/crm'

type Search = Promise<Record<string, string | string[] | undefined>>
const one = (value: string | string[] | undefined) => typeof value === 'string' ? value : ''

export default async function LeadsPage({ searchParams }: { searchParams: Search }) {
  const params = await searchParams
  const values = {
    query: one(params.q),
    place: one(params.place),
    score: one(params.score),
    website: one(params.website) as 'yes' | 'no' | '',
    social: one(params.social),
    status: one(params.status),
    branch: one(params.branch),
    age: one(params.age) as 'lt12' | '12to36' | 'gt36' | '',
  }
  const prospects = await listProspects({
    query: values.query || undefined,
    place: values.place || undefined,
    score: values.score || undefined,
    website: values.website || undefined,
    social: values.social || undefined,
    status: values.status || undefined,
    branch: values.branch || undefined,
    age: values.age || undefined,
  })
  return <>
    <header className="engine-page-head"><div><span className="engine-kicker">Prioriteiten</span><h1>Hot leads</h1><p>Filter op concrete koopsignalen. Een hoge score is een onderzoeksprioriteit, geen toestemming om automatisch te benaderen.</p></div><div className="engine-head-actions"><Link className="engine-button" href="/outreach">OPEN OUTREACH</Link></div></header>
    <form className="filter-bar" action="/leads">
      <input name="q" defaultValue={values.query} placeholder="Zoek bedrijf…" aria-label="Zoek bedrijf" />
      <select name="place" defaultValue={values.place} aria-label="Plaats"><option value="">Alle plaatsen</option>{PHASE_ONE_PLACES.map((place) => <option key={place}>{place}</option>)}</select>
      <select name="radius" defaultValue="30" aria-label="Straal" disabled><option value="30">Straal: 30 km</option></select>
      <input name="branch" defaultValue={values.branch} placeholder="SBI of branche…" aria-label="Branche of SBI-code" />
      <select name="age" defaultValue={values.age} aria-label="Bedrijfsleeftijd"><option value="">Leeftijd: alle</option><option value="lt12">Jonger dan 12 mnd</option><option value="12to36">1–3 jaar</option><option value="gt36">Ouder dan 3 jaar</option></select>
      <select name="score" defaultValue={values.score} aria-label="Score"><option value="">Alle scores</option>{['VERY_HOT','HOT','GOOD','MEDIUM','LOW'].map((score) => <option value={score} key={score}>{score.replace('_', ' ')}</option>)}</select>
      <select name="website" defaultValue={values.website} aria-label="Website"><option value="">Website: alle</option><option value="no">Website nog niet gevonden</option><option value="yes">Website gevonden</option></select>
      <select name="social" defaultValue={values.social} aria-label="Sociaal platform"><option value="">Social: alle</option>{['INSTAGRAM','FACEBOOK','TIKTOK','LINKEDIN'].map((social) => <option key={social}>{social}</option>)}</select>
      <select name="status" defaultValue={values.status} aria-label="CRM-status"><option value="">Status: alle</option>{PIPELINE_STATUSES.map((status) => <option key={status}>{status}</option>)}</select>
      <button className="engine-button dark" type="submit">FILTER</button>
    </form>
    <div className="engine-section-head"><div><h2>{prospects.length} leads</h2><p>Score, websitekwaliteit, social signalen en bedrijfscontext gecombineerd.</p></div></div>
    {prospects.length ? <div className="lead-grid">{prospects.map((prospect) => <LeadCard key={prospect.id} prospect={prospect} />)}</div> : <div className="panel empty-state"><strong>Geen leads gevonden</strong><p>Verruim de filters of start een nieuwe discovery-run.</p><Link className="engine-button" href="/leads">WIS FILTERS</Link></div>}
  </>
}
