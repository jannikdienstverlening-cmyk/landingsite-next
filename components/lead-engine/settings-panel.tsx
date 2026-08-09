'use client'

import { useState } from 'react'
import type { ScoringWeight } from '@/lib/scoring/config'

export function SettingsPanel({ initialWeights }: { initialWeights: ScoringWeight[] }) {
  const [weights, setWeights] = useState(initialWeights)
  const [status, setStatus] = useState('')
  const [busy, setBusy] = useState(false)
  function update(index: number, patch: Partial<ScoringWeight>) { setWeights((current) => current.map((weight, itemIndex) => itemIndex === index ? { ...weight, ...patch } : weight)) }
  async function save() {
    setBusy(true); setStatus('')
    try {
      const response = await fetch('/api/lead-engine/settings', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ weights }) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error ?? 'Opslaan mislukt.')
      setStatus('Scoregewichten opgeslagen. Nieuwe en opnieuw gescoorde leads gebruiken deze configuratie.')
    } catch (error) { setStatus(error instanceof Error ? error.message : 'Opslaan mislukt.') }
    finally { setBusy(false) }
  }
  return <div className="settings-list">{weights.map((weight, index) => <div className="setting-row" key={weight.key}>
    <input type="checkbox" checked={weight.enabled} onChange={(event) => update(index, { enabled: event.target.checked })} aria-label={`${weight.label} inschakelen`} />
    <label htmlFor={`weight-${weight.key}`}>{weight.label}<small style={{ display: 'block', color: '#8b929a' }}>{weight.key}</small></label>
    <input id={`weight-${weight.key}`} className="settings-input" type="number" min={-100} max={100} value={weight.value} onChange={(event) => update(index, { value: Number(event.target.value) })} />
  </div>)}<div className="engine-head-actions"><button className="engine-button primary" type="button" onClick={save} disabled={busy}>{busy ? 'OPSLAAN…' : 'GEWICHTEN OPSLAAN'}</button>{status && <span className="form-status" role="status">{status}</span>}</div></div>
}
