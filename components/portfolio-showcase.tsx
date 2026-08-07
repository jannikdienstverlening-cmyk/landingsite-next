import Image from 'next/image'
import { portfolioProjects, type PortfolioProject } from '@/data/portfolio'

const featuredProject = portfolioProjects[0]
const projects = portfolioProjects.slice(1, 3)

function ProjectImage({ project, sizes, priority = false }: { project: PortfolioProject; sizes: string; priority?: boolean }) {
  return (
    <a
      className="project-image"
      href={project.url}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`Bekijk de live website van ${project.name}`}
      data-analytics-event="project_click"
      data-analytics-project={project.slug}
    >
      <Image src={project.image} alt={project.imageAlt} fill sizes={sizes} preload={priority} />
    </a>
  )
}

export function PortfolioShowcase() {
  return (
    <section className="section portfolio" id="voorbeelden">
      <div className="shell">
        <header className="portfolio-head">
          <p className="section-kicker">Projecten</p>
          <h2>Werk dat je kunt openen en bekijken.</h2>
          <p>Geen concepten of demo’s. Dit zijn websites die daadwerkelijk online staan.</p>
        </header>

        <article className="featured-case">
          <ProjectImage project={featuredProject} sizes="(max-width: 900px) 94vw, 1180px" priority />
          <div className="featured-case-copy">
            <div>
              <span className="project-index">01 / {featuredProject.industry}</span>
              <h3>{featuredProject.name}</h3>
            </div>
            <div className="case-story">
              <p>{featuredProject.description}</p>
              <p><strong>De opdracht.</strong> {featuredProject.problem}</p>
              <p><strong>De keuze.</strong> Ik koos voor ruime tekstblokken, rustige kleuren en vaste contactmomenten. Zo blijft de route naar een kennismaking ook op mobiel overzichtelijk.</p>
              <a href={featuredProject.url} target="_blank" rel="noopener noreferrer" data-analytics-event="project_click" data-analytics-project={featuredProject.slug}>Bekijk de website <span aria-hidden="true">↗</span></a>
            </div>
          </div>
        </article>

        <div className="project-rows">
          {projects.map((project, index) => (
            <article className="project-row" key={project.slug}>
              <ProjectImage project={project} sizes="(max-width: 900px) 94vw, 650px" />
              <div className="project-row-copy">
                <span className="project-index">0{index + 2} / {project.industry}</span>
                <h3>{project.name}</h3>
                <p><strong>De vraag.</strong> {project.problem}</p>
                <p><strong>Opgeleverd.</strong> {project.result}</p>
                <a href={project.url} target="_blank" rel="noopener noreferrer" data-analytics-event="project_click" data-analytics-project={project.slug}>Bekijk de website <span aria-hidden="true">↗</span></a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
