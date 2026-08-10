import Link from 'next/link'
import type { ReactNode } from 'react'
import { commercialConfig, euro, packageFirstPayment, type CommercialPackageId } from '@/config/commercial'
import { AnalyticsLayer } from './site-interactions'
import { StudioFooter, StudioHeader } from './studio-site'

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify({ '@context': 'https://schema.org', ...data }).replace(/</g, '\\u003c') }} />
}

export function Breadcrumbs({ items }: { items: Array<{ label: string; href: string }> }) {
  return (
    <nav className="seo-breadcrumbs studio-shell" aria-label="Kruimelpad">
      <ol><li><Link href="/">Home</Link></li>{items.map((item) => <li key={item.href}><span aria-hidden="true">/</span><Link href={item.href} aria-current={item === items.at(-1) ? 'page' : undefined}>{item.label}</Link></li>)}</ol>
    </nav>
  )
}

export function SeoPage({ children, breadcrumbs, schema }: { children: ReactNode; breadcrumbs: Array<{ label: string; href: string }>; schema?: Record<string, unknown> }) {
  return (
    <div className="studio studio-page seo-page">
      <a className="skip-link" href="#main-content">Ga naar de inhoud</a>
      <AnalyticsLayer />
      {schema && <JsonLd data={schema} />}
      <StudioHeader />
      <Breadcrumbs items={breadcrumbs} />
      <main id="main-content">{children}</main>
      <StudioFooter />
    </div>
  )
}

export function PageProvenance({ updatedAt }: { updatedAt: string }) {
  return <p className="seo-provenance">Inhoud gecontroleerd door Jannik · laatst inhoudelijk bijgewerkt <time dateTime={updatedAt}>{new Intl.DateTimeFormat('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(`${updatedAt}T12:00:00+02:00`))}</time></p>
}

export function StartCta({ compact = false }: { compact?: boolean }) {
  return (
    <div className={`seo-start-cta${compact ? ' seo-start-cta--compact' : ''}`}>
      <div><strong>Weet je al wat je nodig hebt?</strong><span>Vergelijk de pakketten en bekijk de volledige eerste betaling vóór Stripe.</span></div>
      <Link className="button button--primary" href="/start" data-analytics-event="hero_start_click" data-analytics-location="seo_page">Start mijn website</Link>
    </div>
  )
}

export function PackageStrip() {
  const entries = Object.entries(commercialConfig.packages) as Array<[CommercialPackageId, typeof commercialConfig.packages[CommercialPackageId]]>
  return (
    <div className="seo-package-strip" data-analytics-view="package_compare">
      {entries.map(([id, item]) => (
        <article key={id} data-recommended={item.recommended}>
          <span>{item.recommended ? 'Aanbevolen' : `${item.pages} ${item.pages === 1 ? 'pagina' : 'pagina’s'}`}</span>
          <h3>{item.name}</h3>
          <p>{item.audience}</p>
          <strong>{euro(item.oneTimePrice)}</strong>
          <p>Eerste betaling {euro(packageFirstPayment(id))} excl. btw. Daarna {euro(commercialConfig.management.monthlyPrice)} per maand.</p>
          <Link className={`button ${item.recommended ? 'button--primary' : 'button--outline'} button--full`} href={`/start?pakket=${id}`} data-analytics-event="package_select" data-analytics-package={id}>Kies {item.name}</Link>
        </article>
      ))}
    </div>
  )
}
