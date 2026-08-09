import type { Metadata } from 'next'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { adminCookie, verifyAdminSession } from '@/lib/security'
import './lead-engine.css'

export const metadata: Metadata = {
  title: 'Lead Engine',
  robots: { index: false, follow: false },
}

const nav = [
  { href: '/dashboard', icon: '⌂', label: 'Overzicht' },
  { href: '/leads', icon: '◎', label: 'Hot leads' },
  { href: '/outreach', icon: '↗', label: 'Outreach' },
  { href: '/crm', icon: '▦', label: 'CRM' },
  { href: '/insights', icon: '↟', label: 'Wat werkt?' },
  { href: '/settings', icon: '⚙', label: 'Instellingen' },
]

export default async function LeadEngineLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  if (!verifyAdminSession(cookieStore.get(adminCookie.name)?.value)) redirect('/admin')
  return <div className="engine-shell">
    <aside className="engine-sidebar">
      <Link className="engine-brand" href="/dashboard" aria-label="Landingsite Lead Engine">
        <span className="engine-brand-mark">L</span>
        <span><strong>Lead Engine</strong><small>landingsite.nl</small></span>
      </Link>
      <nav className="engine-nav" aria-label="Lead Engine navigatie">
        <span className="engine-nav-label">Werkruimte</span>
        {nav.slice(0, 4).map((item) => <Link href={item.href} key={item.href}><i aria-hidden="true">{item.icon}</i>{item.label}</Link>)}
        <span className="engine-nav-label">Analyse</span>
        {nav.slice(4).map((item) => <Link href={item.href} key={item.href}><i aria-hidden="true">{item.icon}</i>{item.label}</Link>)}
      </nav>
      <div className="engine-sidebar-foot">
        <span className="system-dot" />
        <div><strong>Human approval</strong><small>Automatische social-DM uit</small><small><a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">© OpenStreetMap contributors · ODbL</a></small></div>
      </div>
    </aside>
    <div className="engine-workspace">
      <header className="engine-topbar">
        <div><span className="pulse-dot" />Fase 1 · Veenendaal + 30 km</div>
        <div className="topbar-actions"><Link href="/admin">Landingsite beheer</Link><span className="avatar">JD</span></div>
      </header>
      <main className="engine-main">{children}</main>
    </div>
  </div>
}
