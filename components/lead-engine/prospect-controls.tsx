'use client'

import { useState } from 'react'
import { PIPELINE_STATUSES, type OutreachChannel, type PipelineStatus } from '@/lib/lead-engine/types'

export function ProspectControls({ prospectId, status, channel }: { prospectId: string; status: PipelineStatus; channel: OutreachChannel }) {
  const [current, setCurrent] = useState(status)
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState('')
  const [outcome, setOutcome] = useState('POSITIVE')

  async function post(body: Record<string, unknown>) {
    setBusy(true); setMessage('')
    try {
      const response = await fetch(`/api/lead-engine/prospects/${prospectId}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error ?? 'Bijwerken mislukt.')
      setMessage('Opgeslagen.')
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Bijwerken mislukt.') }
    finally { setBusy(false) }
  }

  async function changeStatus(value: PipelineStatus) {
    setCurrent(value)
    await post({ action: 'PIPELINE', pipelineStatus: value })
  }

  async function deleteData() {
    if (!window.confirm('Alle prospect-, audit-, concept- en CRM-data definitief verwijderen? Dit kan niet ongedaan worden gemaakt.')) return
    await post({ action: 'DELETE_DATA', confirmation: 'VERWIJDER' })
    window.location.assign('/leads')
  }

  async function addNote() {
    if (!note.trim()) return
    await post({ action: 'ADD_NOTE', body: note.trim() })
    setNote('')
  }

  async function saveOutcome() {
    await post({ action: 'OUTCOME', outcome, channel })
  }

  return <div className="detail-stack">
    <label><span className="engine-kicker">Pipeline-status</span><select className="settings-input" value={current} disabled={busy} onChange={(event) => void changeStatus(event.target.value as PipelineStatus)}>{PIPELINE_STATUSES.map((item) => <option key={item}>{item}</option>)}</select></label>
    <button className="engine-button danger" type="button" disabled={busy || current === 'DO_NOT_CONTACT'} onClick={() => void post({ action: 'DO_NOT_CONTACT' }).then(() => setCurrent('DO_NOT_CONTACT'))}>NIET MEER BENADEREN</button>
    <label><span className="engine-kicker">Notitie</span><textarea className="draft-editor" style={{ minWidth: 0 }} value={note} maxLength={4000} onChange={(event) => setNote(event.target.value)} placeholder="Voeg een concrete observatie of afspraak toe…" /></label>
    <button className="engine-button" type="button" disabled={busy || !note.trim()} onClick={() => void addNote()}>NOTITIE OPSLAAN</button>
    <label><span className="engine-kicker">Outreach-uitkomst</span><select className="settings-input" value={outcome} onChange={(event) => setOutcome(event.target.value)}><option value="NO_RESPONSE">Geen reactie</option><option value="POSITIVE">Positieve reactie</option><option value="NEGATIVE">Negatieve reactie</option><option value="APPOINTMENT">Afspraak</option><option value="CUSTOMER">Klant</option></select></label>
    <button className="engine-button" type="button" disabled={busy} onClick={() => void saveOutcome()}>UITKOMST VASTLEGGEN</button>
    <button className="engine-button ghost danger" type="button" disabled={busy} onClick={() => void deleteData()}>PROSPECTDATA VERWIJDEREN</button>
    {message && <span className="form-status" role="status">{message}</span>}
  </div>
}
