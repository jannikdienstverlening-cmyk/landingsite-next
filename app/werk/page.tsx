import type { Metadata } from 'next'
import { AnalyticsLayer } from '@/components/site-interactions'
import { Breadcrumbs, PageProvenance } from '@/components/seo-page'
import { BrowserFrame, MobileProjectFrame, StudioFooter, StudioHeader } from '@/components/studio-site'
import { seoPage } from '@/content/seo-pages'
import { portfolioProjects } from '@/data/portfolio'
import { breadcrumbSchema, seoMetadata } from '@/lib/seo'

const content = seoPage('/werk')
export const metadata: Metadata = seoMetadata(content)

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    breadcrumbSchema([{ name: 'Home', path: '/' }, { name: 'Werk', path: '/werk' }]),
    {
      '@type': 'ItemList',
      name: 'Live websites gebouwd door Landingsite.nl',
      itemListElement: portfolioProjects.map((project, index) => ({
        '@type': 'ListItem', position: index + 1, url: project.url, name: project.name, description: project.description,
      })),
    },
  ],
}

export default function WorkPage() {
  return (
    <div className="studio studio-page">
      <a className="skip-link" href="#main-content">Ga naar de inhoud</a>
      <AnalyticsLayer />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }} />
      <StudioHeader />
      <Breadcrumbs items={[{ label: 'Werk', href: '/werk' }]} />
      <main id="main-content">
        <header className="studio-page-hero studio-shell">
          <p className="overline">Live werk</p>
          <h1>{content.h1}</h1>
          <p>Geen conceptbeelden of niet-gemeten claims. Drie echte projecten, met per website de oorspronkelijke vraag en de gekozen oplossing.</p>
          <PageProvenance updatedAt={content.updatedAt} />
        </header>
        <section className="work-index studio-shell" aria-label="Projectoverzicht">
          {portfolioProjects.map((project, index) => (
            <article className="work-detail" id={project.slug} key={project.slug}>
              <div className="work-detail__meta"><p>{project.industry}</p><h2>{project.name}</h2><a href={project.url} target="_blank" rel="noopener noreferrer" data-analytics-event="case_outbound_click" data-analytics-project={project.slug}>Bekijk live website ↗</a></div>
              <div className="work-detail__media">
                <a href={project.url} target="_blank" rel="noopener noreferrer" aria-label={`Open ${project.name}`} data-analytics-event="case_outbound_click" data-analytics-project={project.slug}>
                  <BrowserFrame project={project} priority={index === 0} />
                </a>
                <MobileProjectFrame project={project} priority={index === 0} />
              </div>
              <div className="work-detail__story"><p><strong>De vraag</strong>{project.problem}</p><p><strong>Opgeleverd</strong>{project.result}</p><ul>{project.features.map((feature) => <li key={feature}>{feature}</li>)}</ul></div>
            </article>
          ))}
        </section>
      </main>
      <StudioFooter />
    </div>
  )
}
