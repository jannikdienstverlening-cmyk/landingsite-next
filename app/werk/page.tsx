import type { Metadata } from 'next'
import { AnalyticsLayer } from '@/components/site-interactions'
import { BrowserFrame, MobileProjectFrame, StudioFooter, StudioHeader } from '@/components/studio-site'
import { portfolioProjects } from '@/data/portfolio'

export const metadata: Metadata = {
  title: 'Live websites en landingspagina’s',
  description: 'Bekijk websites die Landingsite.nl heeft gebouwd voor Ontwikkelbegeleiding.nl, WIA Management en AIbouwers.nl.',
  alternates: { canonical: '/werk' },
}

export default function WorkPage() {
  return (
    <div className="studio studio-page">
      <a className="skip-link" href="#main-content">Ga naar de inhoud</a>
      <AnalyticsLayer />
      <StudioHeader />
      <main id="main-content">
        <header className="studio-page-hero studio-shell">
          <p className="overline">Live werk</p>
          <h1>Websites die je zelf kunt openen.</h1>
          <p>Geen conceptbeelden of niet-gemeten claims. Drie echte projecten, met per website de oorspronkelijke vraag en de gekozen oplossing.</p>
        </header>
        <section className="work-index studio-shell" aria-label="Projectoverzicht">
          {portfolioProjects.map((project, index) => (
            <article className="work-detail" id={project.slug} key={project.slug}>
              <div className="work-detail__meta"><p>{project.industry}</p><h2>{project.name}</h2><a href={project.url} target="_blank" rel="noopener noreferrer" data-analytics-event="live_case_click" data-analytics-project={project.slug}>Bekijk live website ↗</a></div>
              <div className="work-detail__media">
                <a href={project.url} target="_blank" rel="noopener noreferrer" aria-label={`Open ${project.name}`} data-analytics-event="case_open" data-analytics-project={project.slug}>
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
