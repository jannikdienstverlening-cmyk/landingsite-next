'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { pricingConfig } from '@/config/pricing'

const css = `.admin-page{min-height:100vh;background:#f1f6f3;color:#0a2119;padding:96px 24px 60px}.admin-nav{position:fixed;inset:0 0 auto;z-index:10;height:68px;background:#071c16;color:#fff;display:flex;align-items:center;justify-content:space-between;padding:0 28px}.admin-logo{font-family:var(--font-syne),sans-serif;font-weight:850;text-decoration:none}.admin-logo span{color:#47dda3}.admin-nav button,.admin-button{border:1px solid #a9bbb3;background:#fff;color:#0a2119;border-radius:99px;padding:8px 12px;cursor:pointer;font-weight:750;text-decoration:none}.admin-nav button{background:transparent;border-color:#ffffff35;color:#fff}.admin-button.primary{background:#0b4936;color:#fff;border-color:#0b4936}.admin-button.danger{color:#9d3029}.admin-button:disabled{opacity:.5;cursor:wait}.admin-wrap{width:min(1180px,100%);margin:auto}.admin-head{display:flex;justify-content:space-between;gap:20px;align-items:end;margin-bottom:28px}.admin-head h1{font-family:var(--font-syne),sans-serif;font-size:clamp(2.3rem,6vw,3.4rem);margin:0}.admin-head p{color:#657a72}.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:34px}.stat{padding:20px;border:1px solid #d5e2dc;border-radius:16px;background:#fff}.stat strong{display:block;font-family:var(--font-syne),sans-serif;font-size:1.9rem}.stat span{font-size:.65rem;color:#70847c;text-transform:uppercase}.admin-section{margin-top:36px}.admin-section h2{font-family:var(--font-syne),sans-serif;font-size:1.8rem}.management-workflow{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:1px;margin:18px 0 20px;overflow:hidden;border:1px solid #d5e2dc;border-radius:16px;background:#d5e2dc}.management-workflow>div{display:grid;grid-template-columns:30px minmax(0,1fr);gap:10px;padding:16px;background:#fff}.management-workflow>div>strong{display:grid;width:30px;height:30px;place-items:center;border-radius:50%;background:#e4f7ee;color:#0b4936}.management-workflow span{color:#657a72;font-size:.75rem;line-height:1.45}.management-workflow b{display:block;margin-bottom:2px;color:#0a2119;font-size:.8rem}.table-wrap{overflow:auto;border:1px solid #d5e2dc;border-radius:18px;background:#fff}table{width:100%;min-width:980px;border-collapse:collapse;font-size:.72rem}th,td{text-align:left;padding:14px;border-bottom:1px solid #e2ebe7;vertical-align:top}th{font-size:.6rem;text-transform:uppercase;color:#71867d}td a{color:#147c59}.status{display:inline-block;padding:4px 7px;border-radius:99px;background:#edf3f0;text-transform:none;font-size:.6rem}.status-active,.status-approved,.status-completed{background:#dff8ec;color:#126d4a}.status-failed,.status-rejected,.status-payment_failed,.status-past_due{background:#fee9e7;color:#a52f27}.status-awaiting_go_live,.status-pending,.status-pending_review{background:#fff3d6;color:#805f14}.actions{display:flex;min-width:230px;flex-wrap:wrap;gap:6px}.management-link-box{display:grid;width:280px;max-width:100%;gap:7px;margin-top:6px;padding:10px;border:1px solid #b9dfcf;border-radius:10px;background:#f0faf5}.management-link-box>span{color:#126d4a;font-size:.62rem;font-weight:800;text-transform:uppercase}.management-link-box code{display:block;overflow:hidden;color:#42574e;font:500 .65rem/1.4 ui-monospace,monospace;text-overflow:ellipsis;white-space:nowrap}.management-link-actions{display:flex;flex-wrap:wrap;gap:6px}.row-error{max-width:250px;color:#a52f27}.login-page{min-height:100vh;display:grid;place-items:center;background:#071c16;padding:24px}.login-box{width:min(400px,100%);background:#f3f8f5;border-radius:24px;padding:36px;color:#0a2119}.login-box h1{font-family:var(--font-syne),sans-serif}.login-box label{display:block;font-size:.75rem;font-weight:800}.login-box input{width:100%;padding:13px;margin:8px 0 14px;border:1px solid #cbdad3;border-radius:11px}.login-box button{width:100%;padding:14px;border:0;border-radius:99px;background:#0b4936;color:#fff;font-weight:800}.admin-error{color:#a52f27}.admin-note{color:#657a72;font-size:.8rem}@media(max-width:760px){.stats{grid-template-columns:1fr 1fr}.admin-head{align-items:flex-start;flex-direction:column}.admin-page{padding-inline:12px}.management-workflow{grid-template-columns:1fr}}`

type PageRow = { netlify_url: string | null; status: string; created_at: string }
type OrderRow = { id: string; email: string; pakket: 'starter' | 'pro' | 'premium'; status: string; management_status: string; management_started_at: string | null; management_subscription_id: string | null; went_live_at: string | null; created_at: string; last_error: string | null; intake_forms: { bedrijfsnaam: string } | Array<{ bedrijfsnaam: string }> | null; generated_pages: PageRow | PageRow[] | null }
type PartnerRow = { id: string; first_name: string; last_name: string; email: string; partner_type: string; company_name: string; kvk_number: string; referral_code: string | null; status: string; created_at: string }
type CommissionRow = { id: string; partner_id: string; order_id: string; level: number; amount_cents: number; stripe_invoice_id: string; available_at: string; status: string; audit_note: string; created_at: string }

function intakeName(order: OrderRow) { const value = Array.isArray(order.intake_forms) ? order.intake_forms[0] : order.intake_forms; return value?.bedrijfsnaam || 'Nog niet ingevuld' }
function latestPage(order: OrderRow) { const pages = Array.isArray(order.generated_pages) ? order.generated_pages : [order.generated_pages].filter(Boolean) as PageRow[]; return pages.sort((a, b) => b.created_at.localeCompare(a.created_at))[0] }
const managementStatusLabels: Record<string, string> = {
  pending: 'Nog niet gestart',
  awaiting_go_live: 'Link klaar / wacht op klant',
  active: 'Actief',
  payment_failed: 'Betaling mislukt',
  past_due: 'Betaling achterstallig',
  cancelled: 'Opgezegd',
  transferred: 'Overgedragen',
}

export default function AdminPage() {
  const [auth, setAuth] = useState<boolean | null>(null)
  const [orders, setOrders] = useState<OrderRow[]>([])
  const [partners, setPartners] = useState<PartnerRow[]>([])
  const [commissions, setCommissions] = useState<CommissionRow[]>([])
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState('')
  const [notice, setNotice] = useState('')
  const [managementLinks, setManagementLinks] = useState<Record<string, string>>({})

  async function load() {
    const response = await fetch('/api/admin/orders', { cache: 'no-store' })
    const data = await response.json()
    if (response.status === 401) { setAuth(false); return }
    if (!response.ok) throw new Error(data.error || 'Beheerdata ophalen mislukt.')
    setOrders(data.orders); setPartners(data.partners); setCommissions(data.commissions); setAuth(true)
  }

  useEffect(() => { let active = true; load().catch((caught) => { if (active) { setError(caught instanceof Error ? caught.message : 'Dashboard controleren mislukt.'); setAuth(false) } }); return () => { active = false } }, [])

  async function login(event: React.FormEvent) { event.preventDefault(); setError(''); const response = await fetch('/api/admin/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ password }) }); const data = await response.json(); if (!response.ok) { setError(data.error); return } setPassword(''); await load() }
  async function logout() { await fetch('/api/admin/logout', { method: 'POST' }); setAuth(false) }

  async function action(key: string, url: string, body: Record<string, unknown>) {
    setBusy(key); setError(''); setNotice('')
    try {
      const response = await fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || 'Actie mislukt.')
      if (typeof body.order_id === 'string' && data.customer_page) {
        setManagementLinks((current) => ({ ...current, [body.order_id as string]: data.customer_page }))
        setNotice(data.email_sent
          ? 'De beveiligde €79-abonnementslink is naar de klant gemaild en staat hieronder klaar om te kopiëren.'
          : 'De €79-link is gemaakt, maar de e-mail kon niet worden verzonden. Kopieer de klantlink hieronder en verstuur hem handmatig.')
      }
      await load()
    }
    catch (caught) { setError(caught instanceof Error ? caught.message : 'Actie mislukt.') }
    finally { setBusy('') }
  }

  async function copyManagementLink(orderId: string) {
    const link = managementLinks[orderId]
    if (!link) return
    try {
      await navigator.clipboard.writeText(link)
      setNotice('Klantlink gekopieerd.')
    } catch {
      setError('Kopiëren lukt niet automatisch. Open de link en kopieer hem vanuit de adresbalk.')
      window.open(link, '_blank', 'noopener,noreferrer')
    }
  }

  async function sendManagementLink(order: OrderRow) {
    const confirmed = window.confirm(
      `Bevestig dat de website van ${intakeName(order)} is goedgekeurd en live staat. Daarna mailen we de beveiligde €${pricingConfig.websiteManagement.monthlyPrice}-abonnementslink naar ${order.email}.`,
    )
    if (!confirmed) return
    await action(`manage-${order.id}`, '/api/admin/activate-management', { order_id: order.id, requestId: crypto.randomUUID() })
  }

  if (auth === null) return <><style>{css}</style><div className="login-page"><p style={{ color: '#fff' }}>Beveiligde sessie controleren...</p></div></>
  if (!auth) return <><style>{css}</style><main className="login-page"><form className="login-box" onSubmit={login}><h1>Beheer</h1><label>Wachtwoord<input type="password" required value={password} onChange={(event) => setPassword(event.target.value)} /></label><button type="submit">Veilig inloggen</button>{error && <p className="admin-error" role="alert">{error}</p>}</form></main></>

  const activeManagement = orders.filter((order) => order.management_status === 'active').length
  const pendingCommission = commissions.filter((commission) => commission.status === 'pending_review').reduce((sum, commission) => sum + commission.amount_cents, 0) / 100
  return <><style>{css}</style><nav className="admin-nav"><Link href="/" className="admin-logo">landing<span>site</span>.nl · admin</Link><button onClick={logout}>Uitloggen</button></nav><main className="admin-page"><div className="admin-wrap">
    <header className="admin-head"><div><h1>Beheer en controle</h1><p>Bouworders, Websitebeheer, partners en commissies. Uitbetalingen blijven handmatig.</p></div><button className="admin-button" onClick={() => load().catch((caught) => setError(String(caught)))}>Vernieuwen</button></header>
    {error && <p className="admin-error" role="alert">{error}</p>}
    {notice && <p className="admin-note" role="status">{notice}</p>}
    <div className="stats"><div className="stat"><strong>{orders.length}</strong><span>Bouworders</span></div><div className="stat"><strong>{activeManagement}</strong><span>Actief beheer</span></div><div className="stat"><strong>{partners.filter((partner) => partner.status === 'pending').length}</strong><span>Partnerchecks</span></div><div className="stat"><strong>€{pendingCommission}</strong><span>Handmatige commissiecheck</span></div></div>

    <section className="admin-section">
      <h2>Orders en Websitebeheer</h2>
      <p className="admin-note">De bouwbetaling en Websitebeheer blijven bewust twee aparte transacties. Maak de abonnementslink pas nadat de website is goedgekeurd en live staat.</p>
      <div className="management-workflow" aria-label="Werkwijze Websitebeheer activeren">
        <div><strong>1</strong><span><b>Bouw betaald</b>De klant betaalt eerst alleen Starter, Pro of Premium.</span></div>
        <div><strong>2</strong><span><b>Website live</b>Controleer de website en bevestig hieronder de livegang.</span></div>
        <div><strong>3</strong><span><b>€{pricingConfig.websiteManagement.monthlyPrice} per maand</b>De klant ontvangt de beveiligde link en bevestigt zelf in Stripe.</span></div>
      </div>
      <div className="table-wrap"><table><thead><tr><th>Datum</th><th>Bedrijf</th><th>Pakket</th><th>Bouw</th><th>Websitebeheer</th><th>Preview</th><th>Melding</th><th>Acties</th></tr></thead><tbody>{orders.map((order) => {
        const page = latestPage(order)
        const managementLink = managementLinks[order.id]
        return <tr key={order.id}>
          <td>{new Date(order.created_at).toLocaleDateString('nl-NL')}</td>
          <td>{intakeName(order)}<br /><small>{order.email}</small></td>
          <td>{order.pakket}<br /><small>€{pricingConfig.buildPackages[order.pakket].oneTimePrice}</small></td>
          <td><span className={`status status-${order.status}`}>{order.status}</span></td>
          <td><span className={`status status-${order.management_status}`}>{managementStatusLabels[order.management_status] ?? order.management_status}</span></td>
          <td>{page?.netlify_url ? <a href={page.netlify_url} target="_blank" rel="noopener noreferrer">Open ↗</a> : '—'}</td>
          <td className="row-error">{order.last_error || '—'}</td>
          <td><div className="actions">
            {order.status === 'completed' && !order.management_subscription_id && <button className="admin-button primary" disabled={busy === `manage-${order.id}`} onClick={() => void sendManagementLink(order)}>{busy === `manage-${order.id}` ? 'Link maken...' : order.went_live_at ? 'Mail €79-link opnieuw' : 'Website live: maak + mail €79-link'}</button>}
            {managementLink && <div className="management-link-box"><span>Beveiligde klantlink</span><code title={managementLink}>{managementLink}</code><div className="management-link-actions"><button className="admin-button" type="button" onClick={() => copyManagementLink(order.id)}>Kopiëren</button><a className="admin-button" href={managementLink} target="_blank" rel="noopener noreferrer">Open klantpagina</a></div></div>}
            {['paid', 'failed', 'completed'].includes(order.status) && <button className="admin-button" disabled={busy === `regen-${order.id}`} onClick={() => action(`regen-${order.id}`, '/api/admin/regenerate', { order_id: order.id })}>Genereer opnieuw</button>}
          </div></td>
        </tr>
      })}{!orders.length && <tr><td colSpan={8}>Nog geen orders.</td></tr>}</tbody></table></div>
    </section>

    <section className="admin-section"><h2>Partneraanvragen</h2><div className="table-wrap"><table><thead><tr><th>Datum</th><th>Naam</th><th>Type</th><th>Bedrijf</th><th>Status</th><th>Code</th><th>Acties</th></tr></thead><tbody>{partners.map((partner) => <tr key={partner.id}><td>{new Date(partner.created_at).toLocaleDateString('nl-NL')}</td><td>{partner.first_name} {partner.last_name}<br /><small>{partner.email}</small></td><td>{partner.partner_type}</td><td>{partner.company_name || '—'}<br /><small>{partner.kvk_number || ''}</small></td><td><span className={`status status-${partner.status}`}>{partner.status}</span></td><td>{partner.referral_code || '—'}</td><td><div className="actions">{partner.status === 'pending' && <><button className="admin-button primary" disabled={busy === `approve-${partner.id}`} onClick={() => action(`approve-${partner.id}`, '/api/admin/partners/decision', { partner_id: partner.id, decision: 'approve' })}>Goedkeuren</button><button className="admin-button danger" disabled={busy === `reject-${partner.id}`} onClick={() => action(`reject-${partner.id}`, '/api/admin/partners/decision', { partner_id: partner.id, decision: 'reject' })}>Afwijzen</button></>}</div></td></tr>)}{!partners.length && <tr><td colSpan={7}>Nog geen partneraanvragen.</td></tr>}</tbody></table></div></section>

    <section className="admin-section"><h2>Commissie-audit</h2><p className="admin-note">Alle posten vereisen handmatige controle. Er vindt vanuit deze applicatie geen bankuitbetaling plaats.</p><div className="table-wrap"><table><thead><tr><th>Datum</th><th>Partner</th><th>Order</th><th>Niveau</th><th>Bedrag</th><th>Beschikbaar vanaf</th><th>Status</th><th>Audit</th></tr></thead><tbody>{commissions.map((commission) => <tr key={commission.id}><td>{new Date(commission.created_at).toLocaleDateString('nl-NL')}</td><td>{commission.partner_id}</td><td>{commission.order_id}</td><td>{commission.level}</td><td>€{commission.amount_cents / 100}</td><td>{new Date(commission.available_at).toLocaleDateString('nl-NL')}</td><td><span className={`status status-${commission.status}`}>{commission.status}</span></td><td>{commission.audit_note}</td></tr>)}{!commissions.length && <tr><td colSpan={8}>Nog geen commissieposten.</td></tr>}</tbody></table></div></section>
  </div></main></>
}
