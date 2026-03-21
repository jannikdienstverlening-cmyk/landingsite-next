'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'

const styles = `
  body { font-family: var(--font-dm-mono), monospace; }
  .gen-wrap { min-height: 100vh; display: flex; align-items: center; justify-content: center; flex-direction: column; text-align: center; padding: 2rem; }
  .gen-icon { font-size: 3.5rem; margin-bottom: 1.5rem; animation: pulse 2s ease-in-out infinite; }
  @keyframes pulse { 0%,100% { transform: scale(1); } 50% { transform: scale(1.1); } }
  .gen-title { font-family: var(--font-syne), sans-serif; font-size: 2rem; font-weight: 800; letter-spacing: -0.03em; margin-bottom: 0.75rem; }
  .gen-sub { font-size: 0.9rem; color: var(--muted); max-width: 40ch; margin: 0 auto 2rem; }
  .gen-steps { list-style: none; text-align: left; display: inline-block; }
  .gen-steps li { font-size: 0.8rem; color: var(--muted); padding: 0.4rem 0; display: flex; gap: 0.75rem; align-items: center; }
  .gen-steps li.done { color: var(--green, #1a7a4a); }
  .gen-steps li.active { color: var(--ink); }
  .result-box { margin-top: 2.5rem; padding: 2rem; background: var(--surface); border: 1px solid var(--rule); max-width: 500px; width: 100%; }
  .result-url { font-size: 0.85rem; color: var(--accent); word-break: break-all; margin: 0.5rem 0 1.5rem; }
  .result-btn { display: inline-block; background: var(--accent); color: #fff; font-family: var(--font-dm-mono), monospace; font-size: 0.75rem; letter-spacing: 0.08em; text-transform: uppercase; padding: 0.9rem 2rem; text-decoration: none; box-shadow: 3px 3px 0 var(--ink); transition: background 0.2s; }
  .result-btn:hover { background: var(--accent-light); }
  nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; padding: 1rem 2rem; display: flex; justify-content: space-between; align-items: center; background: rgba(245,242,235,0.95); backdrop-filter: blur(8px); border-bottom: 1px solid var(--rule); }
  .nav-logo { font-family: var(--font-syne), sans-serif; font-weight: 800; font-size: 1.1rem; color: var(--ink); text-decoration: none; }
  .nav-logo span { color: var(--accent); }
`

type Status = 'generating' | 'completed' | 'failed' | 'unknown'

export default function GeneratingPage() {
  const { id } = useParams<{ id: string }>()
  const [status, setStatus] = useState<Status>('generating')
  const [netlifyUrl, setNetlifyUrl] = useState<string | null>(null)

  useEffect(() => {
    const interval = setInterval(async () => {
      const { data } = await supabase
        .from('generated_pages')
        .select('status, netlify_url')
        .eq('order_id', id)
        .single()

      if (data) {
        setStatus(data.status as Status)
        if (data.netlify_url) setNetlifyUrl(data.netlify_url)
        if (data.status === 'completed' || data.status === 'failed') {
          clearInterval(interval)
        }
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [id])

  const steps = [
    { label: 'Betaling bevestigd', done: true },
    { label: 'Intake ontvangen', done: true },
    { label: 'Claude genereert je pagina...', done: status === 'completed', active: status === 'generating' },
    { label: 'Pagina deployen naar Netlify', done: status === 'completed', active: false },
    { label: 'E-mail versturen', done: status === 'completed', active: false },
  ]

  return (
    <>
      <style>{styles}</style>
      <nav><a href="/" className="nav-logo">landing<span>site</span>.nl</a></nav>

      <div className="gen-wrap">
        {status === 'completed' ? (
          <>
            <div className="gen-icon">✅</div>
            <h1 className="gen-title">Jouw pagina is live!</h1>
            <p className="gen-sub">Je ontvangt ook een e-mail met de link en DNS-instructies voor je eigen domein.</p>
            {netlifyUrl && (
              <div className="result-box">
                <p style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted)', marginBottom: '0.5rem' }}>Jouw preview URL</p>
                <p className="result-url">{netlifyUrl}</p>
                <a href={netlifyUrl} target="_blank" rel="noopener noreferrer" className="result-btn">
                  Bekijk pagina →
                </a>
              </div>
            )}
          </>
        ) : status === 'failed' ? (
          <>
            <div className="gen-icon">❌</div>
            <h1 className="gen-title">Er ging iets mis</h1>
            <p className="gen-sub">Geen zorgen — we hebben dit geregistreerd. Stuur een mail naar <a href="mailto:info@landingsite.nl" style={{ color: 'var(--accent)' }}>info@landingsite.nl</a> en we lossen het snel op.</p>
          </>
        ) : (
          <>
            <div className="gen-icon">🤖</div>
            <h1 className="gen-title">Claude is aan het werk...</h1>
            <p className="gen-sub">Je landingspagina wordt nu automatisch gegenereerd. Dit duurt maximaal 1-2 minuten.</p>
            <ul className="gen-steps">
              {steps.map((step, i) => (
                <li key={i} className={step.done ? 'done' : step.active ? 'active' : ''}>
                  <span>{step.done ? '✓' : step.active ? '⏳' : '○'}</span>
                  {step.label}
                </li>
              ))}
            </ul>
          </>
        )}
      </div>
    </>
  )
}
