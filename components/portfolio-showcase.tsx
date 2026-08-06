import Image from 'next/image'
import { portfolioProjects, type PortfolioProject } from '@/data/portfolio'

const featuredProject = portfolioProjects[0]
const otherProjects = portfolioProjects.slice(1, 3)

function BrowserPreview({ project, sizes, priority = false }: { project: PortfolioProject; sizes: string; priority?: boolean }) {
  return (
    <div className="case-preview">
      <div className="case-browserbar" aria-hidden="true">
        <span className="case-browserdots"><i /><i /><i /></span>
        <span className="case-domain">{project.domain}</span>
      </div>
      <a
        className="case-image"
        href={project.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Bekijk de live website van ${project.name}`}
        data-analytics-event="project_click"
        data-analytics-project={project.slug}
      >
        <Image src={project.image} alt={project.imageAlt} fill sizes={sizes} preload={priority} />
      </a>
    </div>
  )
}

export function PortfolioShowcase() {
  return (
    <section className="section portfolio" id="voorbeelden">
      <div className="shell">
        <div className="section-head portfolio-head">
          <p className="section-kicker">Voorbeelden</p>
          <h2>Websites die al voor echte ondernemers werken.</h2>
          <p>Geen conceptbeelden, maar live projecten met ieder een duidelijk doel en een eigen uitstraling.</p>
        </div>

        <article className="featured-case">
          <div className="featured-case-media">
            <BrowserPreview project={featuredProject} sizes="(max-width: 900px) 94vw, 720px" priority />
            <div className="featured-case-mobile" aria-hidden="true">
              <Image src={featuredProject.image} alt="" fill sizes="150px" />
            </div>
          </div>
          <div className="featured-case-copy">
            <div className="case-meta"><span>Hoofdcase</span><span>{featuredProject.industry}</span></div>
            <h3>{featuredProject.name}</h3>
            <p className="case-summary">{featuredProject.description}</p>
            <dl className="case-outcome">
              <div><dt>Vraag</dt><dd>{featuredProject.problem}</dd></div>
              <div><dt>Oplossing</dt><dd>{featuredProject.result}</dd></div>
            </dl>
            <div className="case-highlights">
              {featuredProject.features.map((feature) => <span key={feature}>{feature}</span>)}
            </div>
            <a className="case-link" href={featuredProject.url} target="_blank" rel="noopener noreferrer" data-analytics-event="project_click" data-analytics-project={featuredProject.slug}>Bekijk de website <span aria-hidden="true">↗</span></a>
          </div>
        </article>

        <div className="additional-cases">
          {otherProjects.map((project) => (
            <article className="additional-case" key={project.slug}>
              <BrowserPreview project={project} sizes="(max-width: 700px) 94vw, 560px" />
              <div className="additional-case-copy">
                <div className="case-meta"><span>{project.industry}</span></div>
                <h3>{project.name}</h3>
                <p><strong>Vraag:</strong> {project.problem}</p>
                <p><strong>Resultaat:</strong> {project.result}</p>
                <a className="text-link" href={project.url} target="_blank" rel="noopener noreferrer" data-analytics-event="project_click" data-analytics-project={project.slug}>Bekijk het project <span aria-hidden="true">↗</span></a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
