'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const styles = `
  body { font-family: var(--font-dm-mono), monospace; }
  .admin-wrap { min-height: 100vh; padding: 5rem 2rem 3rem; max-width: 1100px; margin: 0 auto; }
  nav { position: fixed; top: 0; left: 0; right: 0; z-index: 100; padding: 1rem 2rem; display: flex; justify-content: space-between; align-items: center; background: var(--ink); color: var(--paper); }
  .nav-logo { font-family: var(--font-syne), sans-serif; font-weight: 800; font-size: 1.1rem; color: var(--paper); text-decoration: none; }
  .nav-logo span { color: var(--accent-light); }
  .admin-title { font-family: var(--font-syne), sans-serif; font-size: 2rem; font-weight: 800; margin-bottom: 0.5rem; }
  .admin-sub { font-size: 0.8rem; color: var(--muted); margin-bottom: 2.5rem; }
  .stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; margin-bottom: 2.5rem; }
  @media(max-width: 768px) { .stats { grid-template-columns: repeat(2, 1fr); } }
  .stat-box { background: var(--surface); border: 1px solid var(--rule); padding: 1.25rem; }
  .stat-num { font-family: var(--font-syne), sans-serif; font-size: 2rem; font-weight: 800; color: var(--accent); }
  .stat-label { font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.08em; color: var(--muted); }
  table { width: 100%; border-collapse: collapse; font-size: 0.78rem; }
  th { text-align: left; font-size: 0.65rem; text-transform: uppercase; letter-spacing: 0.1em; color: var(--muted); padding: 0.75rem 1rem; border-bottom: 2px solid var(--rule); }
  td { padding: 0.9rem 1rem; border-bottom: 1px solid var(--rule); vertical-align: top; }
  tr:hover td { background: var(--surface); }
  .status-badge { display: inline-block; font-size: 0.6rem; letter-spacing: 0.08em; text-transform: uppercase; padding: 0.2rem 0.6rem; border: 1px solid; }
  .status-completed { color: #1a7a4a; border-color: #1a7a4a; }
  .status-pending { color: var(--muted); border-color: var(--muted); }
  .status-paid { color: #2563eb; border-color: #2563eb; }
  .status-generating { color: var(--accent); border-color: var(--accent); }
  .status-failed { color: #dc2626; border-color: #dc2626; }
  .link-btn { color: var(--accent); text-decoration: none; font-size: 0.75rem; }
  .link-btn:hover { text-decoration: underline; }
  .regen-btn { font-family: var(--font-dm-mono), monospace; font-size: 0.65rem; letter-spacing: 0.06em; text-transform: uppercase; background: transparent; border: 1px solid var(--ink); color: var(--ink); padding: 0.3rem 0.7rem; cursor: pointer; transition: background 0.2s; }
  .regen-btn:hover { background: var(--ink); color: var(--paper); }
  .login-wrap { min-height: 100vh; display: flex; align-items: center; justify-content: center; }
  .login-box { width: 100%; max-width: 360px; padding: 2.5rem; background: var(--surface); border: 1px solid var(--rule); }
  .login-title { font-family: var(--font-syne), sans-serif; font-size: 1.5rem; font-weight: 800; margin-bottom: 1.5rem; }
  .login-input { width: 100%; background: var(--paper); border: 1px solid var(--rule); padding: 0.9rem 1rem; font-family: var(--font-dm-mono), monospace; font-size: 0.9rem; outline: none; margin-bottom: 1rem; }
  .login-input:focus { border-color: var(--accent); }
  .login-btn { width: 100%; background: var(--ink); color: var(--paper); font-family: var(--font-dm-mono), monospace; font-size: 0.8rem; letter-spacing: 0.08em; text-transform: uppercase; padding: 1rem; border: none; cursor: pointer; transition: background 0.2s; }
  .login-btn:hover { background: var(--accent); }
  .login-err { font-size: 0.8rem; color: #dc2626; margin-bottom: 1rem; }
`

interface OrderRow {
  id: string
  email: string
  pakket: string
  status: string
  created_at: string
  intake_forms: { bedrijfsnaam: string } | null
  generated_pages: { netlify_url: string | null; status: string } | null
}

export default function AdminPage() {
  const [auth, setAuth] = useState(false)
  const [pw, setPw] = useState('')
  const [pwErr, setPwErr] = useState('')
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [regenLoading, setRegenLoading] = useState<string | null>(null)

  function login() {
    if (pw === process.env.NEXT_PUBLIC_ADMIN_PASSWORD || pw === 'admin') {
      setAuth(true)
      laadOrders()
    } else {
      setPwErr('Onjuist wachtwoord')
    }
  }

  async function laadOrders() {
    const { data } = await supabase
      .from('orders')
      .select(`
        id, email, pakket, status, created_at,
        intake_forms ( bedrijfsnaam ),
        generated_pages ( netlify_url, status )
      `)
      .order('created_at', { ascending: false })
      .limit(100)

    if (data) setOrders(data as unknown as OrderRow[])
  }

  async function regenereer(orderId: string) {
    setRegenLoading(orderId)
    await supabase.from('orders').update({ status: 'paid' }).eq('id', orderId)
    const res = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ order_id: orderId }),
    })
    const data = await res.json()
    if (data.success) await laadOrders()
    setRegenLoading(null)
  }

  useEffect(() => {
    if (auth) laadOrders()
  }, [auth])

  const stats = {
    totaal: orders.length,
    betaald: orders.filter(o => o.status !== 'pending').length,
    completed: orders.filter(o => o.status === 'completed').length,
    omzet: orders.filter(o => o.status !== 'pending').reduce((sum, o) => {
      return sum + ({ starter: 299, pro: 499, premium: 899 }[o.pakket] ?? 0)
    }, 0),
  }

  if (!auth) {
    return (
      <>
        <style>{styles}</style>
        <div className="login-wrap">
          <div className="login-box">
            <h2 className="login-title">Admin</h2>
            {pwErr && <p className="login-err">{pwErr}</p>}
            <input
              className="login-input"
              type="password"
              placeholder="Wachtwoord"
              value={pw}
              onChange={e => setPw(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && login()}
            />
            <button className="login-btn" onClick={login}>Inloggen</button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <style>{styles}</style>
      <nav>
        <a href="/" className="nav-logo">landing<span>site</span>.nl — admin</a>
        <button onClick={() => setAuth(false)} style={{ background: 'transparent', border: '1px solid #444', color: 'var(--paper)', cursor: 'pointer', padding: '0.4rem 0.9rem', fontFamily: 'var(--font-dm-mono)', fontSize: '0.7rem' }}>Uitloggen</button>
      </nav>

      <div className="admin-wrap">
        <h1 className="admin-title">Dashboard</h1>
        <p className="admin-sub">Overzicht van alle orders en gegenereerde pagina&apos;s</p>

        <div className="stats">
          <div className="stat-box"><div className="stat-num">{stats.totaal}</div><div className="stat-label">Orders</div></div>
          <div className="stat-box"><div className="stat-num">{stats.betaald}</div><div className="stat-label">Betaald</div></div>
          <div className="stat-box"><div className="stat-num">{stats.completed}</div><div className="stat-label">Afgerond</div></div>
          <div className="stat-box"><div className="stat-num">€{stats.omzet}</div><div className="stat-label">Omzet</div></div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Datum</th>
              <th>Bedrijf</th>
              <th>E-mail</th>
              <th>Pakket</th>
              <th>Status</th>
              <th>Pagina</th>
              <th>Acties</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id}>
                <td style={{ whiteSpace: 'nowrap' }}>{new Date(order.created_at).toLocaleDateString('nl-NL')}</td>
                <td>{order.intake_forms?.bedrijfsnaam ?? '—'}</td>
                <td style={{ color: 'var(--muted)' }}>{order.email}</td>
                <td style={{ textTransform: 'capitalize' }}>{order.pakket}</td>
                <td><span className={`status-badge status-${order.status}`}>{order.status}</span></td>
                <td>
                  {order.generated_pages?.netlify_url ? (
                    <a href={order.generated_pages.netlify_url} target="_blank" rel="noopener noreferrer" className="link-btn">
                      Bekijk →
                    </a>
                  ) : '—'}
                </td>
                <td>
                  {(order.status === 'failed' || order.status === 'paid') && (
                    <button
                      className="regen-btn"
                      onClick={() => regenereer(order.id)}
                      disabled={regenLoading === order.id}
                    >
                      {regenLoading === order.id ? 'Bezig...' : 'Regenereer'}
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {orders.length === 0 && (
              <tr><td colSpan={7} style={{ color: 'var(--muted)', textAlign: 'center', padding: '3rem' }}>Nog geen orders</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  )
}
