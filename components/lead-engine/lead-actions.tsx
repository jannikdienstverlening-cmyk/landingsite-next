'use client'

import Link from 'next/link'
import { useState } from 'react'
import type { OutreachDraft } from '@/lib/lead-engine/types'

export function LeadActions({ prospectId, draft, canDemo }: { prospectId: string; draft?: OutreachDraft; canDemo: boolean }) {
  const [busy, setBusy] = useState('')
  const [notice, setNotice] = useState('')

  async function action(body: Record<string, unknown>) {
    const response = await fetch(`/api/lead-engine/prospects/${prospectId}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
    const data = await response.json()
    if (!response.ok) throw new Error(data.error ?? 'Actie mislukt.')
    return data
  }

  async function generateDemo() {
    const popup = window.open('about:blank', '_blank')
    setBusy('demo'); setNotice('')
    try {
      const data = await action({ action: 'GENERATE_DEMO' })
      if (popup) { popup.opener = null; popup.location.href = data.previewUrl }
      setNotice('Demo staat klaar in een nieuw tabblad.')
    } catch (error) { popup?.close(); setNotice(error instanceof Error ? error.message : 'Demo maken mislukt.') }
    finally { setBusy('') }
  }

  async function skip() {
    if (!draft) return
    setBusy('skip'); setNotice('')
    try { await action({ action: 'SKIP', draftId: draft.id }); setNotice('Concept overgeslagen.') }
    catch (error) { setNotice(error instanceof Error ? error.message : 'Overslaan mislukt.') }
    finally { setBusy('') }
  }

  return <>
    <div className="lead-card-actions">
      <Link className="engine-button" href={`/leads/${prospectId}`}>BEKIJK</Link>
      {canDemo && <button className="engine-button" type="button" onClick={generateDemo} disabled={Boolean(busy)}>{busy === 'demo' ? 'MAKEN…' : 'MAAK DEMO'}</button>}
      <Link className="engine-button primary" href={`/outreach?lead=${encodeURIComponent(prospectId)}`}>CONTACT</Link>
      {draft && <button className="engine-button ghost" type="button" onClick={skip} disabled={Boolean(busy)}>{busy === 'skip' ? '…' : 'OVERSLAAN'}</button>}
    </div>
    {notice && <p className="queue-notice" role="status">{notice}</p>}
  </>
}
