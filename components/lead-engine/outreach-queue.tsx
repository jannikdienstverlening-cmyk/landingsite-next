'use client'

import Link from 'next/link'
import { useState } from 'react'
import type { OutreachDraft, Prospect } from '@/lib/lead-engine/types'

export type OutreachQueueProspect = Pick<Prospect, 'id' | 'companyName' | 'place' | 'opportunityScore' | 'scoreClass' | 'drafts'>
type QueueItem = { prospect: OutreachQueueProspect; draft: OutreachDraft }

function contactUrl(draft: OutreachDraft) {
  if (!draft.profileUrl) return null
  if (draft.channel === 'EMAIL') {
    const separator = draft.profileUrl.includes('?') ? '&' : '?'
    return `${draft.profileUrl}${separator}subject=${encodeURIComponent('Een idee voor jullie website')}&body=${encodeURIComponent(draft.body)}`
  }
  if (draft.channel === 'WHATSAPP') return `${draft.profileUrl}?text=${encodeURIComponent(draft.body)}`
  return draft.profileUrl
}

export function OutreachQueue({ prospects }: { prospects: OutreachQueueProspect[] }) {
  const [items, setItems] = useState<QueueItem[]>(() => prospects.flatMap((prospect) => prospect.drafts
    .filter(({ status }) => ['READY','SNOOZED'].includes(status))
    .map((draft) => ({ prospect, draft })))
    .sort((left, right) => right.prospect.opportunityScore - left.prospect.opportunityScore))
  const [editing, setEditing] = useState('')
  const [busy, setBusy] = useState('')
  const [opened, setOpened] = useState('')
  const [messages, setMessages] = useState<Record<string, string>>({})

  async function action(item: QueueItem, body: Record<string, unknown>) {
    setBusy(item.draft.id)
    try {
      const response = await fetch(`/api/lead-engine/prospects/${item.prospect.id}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error ?? 'Actie mislukt.')
      return data
    } finally { setBusy('') }
  }

  function remove(id: string) { setItems((current) => current.filter(({ draft }) => draft.id !== id)) }

  async function save(item: QueueItem) {
    const body = messages[item.draft.id] ?? item.draft.body
    try { await action(item, { action: 'UPDATE_DRAFT', draftId: item.draft.id, body }); setEditing('') }
    catch (error) { setMessages((current) => ({ ...current, [item.draft.id]: error instanceof Error ? error.message : 'Opslaan mislukt.' })) }
  }

  async function openChannel(item: QueueItem) {
    const body = messages[item.draft.id] ?? item.draft.body
    const url = contactUrl({ ...item.draft, body })
    if (url) window.open(url, '_blank', 'noopener,noreferrer')
    await navigator.clipboard.writeText(body).catch(() => undefined)
    setOpened(item.draft.id)
  }

  async function markSent(item: QueueItem) {
    await action(item, { action: 'SEND', draftId: item.draft.id })
    remove(item.draft.id)
  }

  async function createDemo(item: QueueItem) {
    const popup = window.open('about:blank', '_blank')
    setBusy(item.draft.id)
    try {
      const response = await fetch(`/api/lead-engine/prospects/${item.prospect.id}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'GENERATE_DEMO' }) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error ?? 'Demo maken mislukt.')
      if (popup) { popup.opener = null; popup.location.href = data.previewUrl }
    } catch (error) {
      popup?.close()
      setMessages((current) => ({ ...current, [item.draft.id]: error instanceof Error ? error.message : 'Demo maken mislukt.' }))
    } finally { setBusy('') }
  }

  return <div className="data-table-wrap"><table className="data-table"><thead><tr><th>Bedrijf</th><th>Score</th><th>Kanaal</th><th>Conceptbericht</th><th>Status</th><th>Acties</th></tr></thead><tbody>
    {items.map((item) => {
      const body = messages[item.draft.id] ?? item.draft.body
      return <tr key={item.draft.id}>
        <td><Link className="table-company" href={`/leads/${item.prospect.id}`}>{item.prospect.companyName}</Link><span>{item.prospect.place}</span></td>
        <td><strong>{item.prospect.opportunityScore}</strong><br /><span className={`status-pill ${item.prospect.scoreClass}`}>{item.prospect.scoreClass.replace('_', ' ')}</span></td>
        <td><strong>{item.draft.channel}</strong><br /><span>{item.draft.sendMode === 'MANUAL' ? 'Handmatige verzending' : 'Officiële API'}</span></td>
        <td>{editing === item.draft.id ? <textarea className="draft-editor" value={body} onChange={(event) => setMessages((current) => ({ ...current, [item.draft.id]: event.target.value }))} /> : <div className="draft-editor" style={{ height: 'auto' }}>{body}</div>}</td>
        <td><span className={`status-pill ${item.draft.status}`}>{item.draft.status}</span>{item.draft.scheduledFor && <><br /><span>{new Date(item.draft.scheduledFor).toLocaleDateString('nl-NL')}</span></>}</td>
        <td><div className="queue-actions">
          {editing === item.draft.id ? <button className="engine-button dark" type="button" disabled={busy === item.draft.id} onClick={() => void save(item)}>OPSLAAN</button> : <button className="engine-button" type="button" onClick={() => setEditing(item.draft.id)}>BEWERKEN</button>}
          {opened === item.draft.id ? <button className="engine-button primary" type="button" disabled={busy === item.draft.id} onClick={() => void markSent(item)}>IK HEB VERSTUURD</button> : <button className="engine-button primary" type="button" onClick={() => void openChannel(item)}>VERSTUREN</button>}
          <button className="engine-button" type="button" disabled={busy === item.draft.id} onClick={() => void action(item, { action: 'LATER', draftId: item.draft.id }).then(() => remove(item.draft.id))}>LATER</button>
          {item.prospect.scoreClass === 'VERY_HOT' ? <button className="engine-button" type="button" disabled={busy === item.draft.id} onClick={() => void createDemo(item)}>DEMO MAKEN</button> : null}
          <button className="engine-button ghost" type="button" disabled={busy === item.draft.id} onClick={() => void action(item, { action: 'SKIP', draftId: item.draft.id }).then(() => remove(item.draft.id))}>OVERSLAAN</button>
        </div>{opened === item.draft.id && <p className="queue-notice">Bericht gekopieerd en kanaal geopend. De app verstuurt niets automatisch; bevestig pas nadat je zelf hebt verzonden.</p>}</td>
      </tr>
    })}
    {!items.length && <tr><td colSpan={6}><div className="empty-state"><strong>Approval queue is leeg</strong><p>Nieuwe concepten verschijnen hier na enrichment, scoring en analyse.</p></div></td></tr>}
  </tbody></table></div>
}
