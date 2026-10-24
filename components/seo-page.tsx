import Link from 'next/link'
import type { ReactNode } from 'react'
import { commercialConfig, euro, websiteOffer } from '@/config/commercial'
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
      <div><strong>Klaar voor je nieuwe website?</strong><span>Websitebouw, hosting en beheer voor één maandbedrag. Bekijk de eerste betaling vóór Stripe.</span></div>
      <Link className="button button--primary" href="/start" data-analytics-event="hero_start_click" data-analytics-location="seo_page">Start mijn website</Link>
    </div>
  )
}

export function PackageStrip() {
  return (
    <div className="seo-package-strip seo-single-offer" data-analytics-view="pricing_view">
        <article>
          <h3>{websiteOffer.name}</h3>
          <p>Tot {websiteOffer.pages} pagina’s, teksten op basis van je intake, een contactformulier en {websiteOffer.correctionRounds} gebundelde aanpassingsrondes.</p>
          <strong>{euro(commercialConfig.management.monthlyPrice)} per maand</strong>
          <p>Inclusief btw. Websitebouw, hosting en beheer inbegrepen. Maandelijks opzegbaar.</p>
          <Link className="button button--primary" href={websiteOffer.ctaHref} data-analytics-event="package_select" data-analytics-package={websiteOffer.packageId}>Start mijn website</Link>
        </article>
    </div>
  )
}
