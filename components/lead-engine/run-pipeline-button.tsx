'use client'

import { useState } from 'react'

export function RunPipelineButton() {
  const [status, setStatus] = useState('')
  async function run() {
    setStatus('starten')
    try {
      const response = await fetch('/api/lead-engine/jobs', { method: 'POST' })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error ?? 'Job starten mislukt.')
      setStatus('gestart')
    } catch { setStatus('fout') }
  }
  return <button className="engine-button primary" type="button" onClick={run} disabled={status === 'starten'}>
    {status === 'starten' ? 'PIPELINE STARTEN…' : status === 'gestart' ? 'PIPELINE GESTART' : status === 'fout' ? 'OPNIEUW PROBEREN' : 'NIEUWE LEADS OPHALEN'}
  </button>
}
