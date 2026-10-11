import type { Metadata } from 'next'
import Link from 'next/link'
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
    <div className="studio studio-page studio--sales">
      <a className="skip-link" href="#main-content">Ga naar de inhoud</a>
      <AnalyticsLayer />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }} />
      <StudioHeader light />
      <Breadcrumbs items={[{ label: 'Werk', href: '/werk' }]} />
      <main id="main-content">
        <header className="studio-page-hero studio-shell">
          <p className="overline">Websites voor zzp’ers en kleine bedrijven</p>
          <h1>{content.h1}</h1>
          <p>Wij maken websites die je bedrijf duidelijk laten zien. Met je diensten, foto’s en een makkelijke manier om contact op te nemen. Jannik bouwt de website en verzorgt daarna de hosting en het beheer.</p>
          <div className="studio-actions"><Link className="button button--primary" href="/start" data-analytics-event="hero_start_click" data-analytics-location="work">Start mijn website</Link><a className="button button--text" href="#projecten">Bekijk de voorbeelden</a></div>
          <PageProvenance updatedAt={content.updatedAt} />
        </header>
        <section className="work-index studio-shell" id="projecten" aria-label="Projectoverzicht">
          {portfolioProjects.map((project, index) => (
            <article className="work-detail" id={project.slug} key={project.slug}>
              <div className="work-detail__meta"><p>{project.industry}</p><h2>{project.name.replace(/\.nl$/, '')}</h2><span className="work-detail__domain">{project.domain}</span><a href={project.url} target="_blank" rel="noopener noreferrer" aria-label={`Bekijk live website: ${project.name}`} data-analytics-event="case_outbound_click" data-analytics-project={project.slug}>Bekijk live website</a></div>
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
        <section className="studio-section studio-close"><div className="studio-shell studio-close__inner"><div><h2>Ook een website voor jouw bedrijf?</h2><p>Vertel wat je doet en lever je teksten en beelden aan. Je krijgt eerst een werkende versie om te bekijken.</p></div><Link className="button button--primary" href="/start" data-analytics-event="hero_start_click" data-analytics-location="work_close">Start mijn website</Link></div></section>
      </main>
      <StudioFooter />
    </div>
  )
}
