'use client'

import Image from 'next/image'
import { useRef, useState } from 'react'
import { portfolioProjects, type PortfolioProject } from '@/data/portfolio'

const featuredProject = portfolioProjects[0]
const otherProjects = portfolioProjects.slice(1)

function BrowserPreview({ project, sizes, priority = false }: { project: PortfolioProject; sizes: string; priority?: boolean }) {
  return (
    <div className="case-preview">
      <div className="case-browserbar" aria-hidden="true">
        <span className="case-browserdots"><i /><i /><i /></span>
        <span className="case-domain">{project.domain}</span>
        <span className="case-live-status"><i /> Live</span>
      </div>
      <a className="case-image" href={project.url} target="_blank" rel="noopener noreferrer" aria-label={`Bekijk ${project.name} live`}>
        <Image src={project.image} alt={project.imageAlt} fill sizes={sizes} preload={priority} />
      </a>
    </div>
  )
}

export function PortfolioShowcase() {
  const railRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)

  function updateActiveItem() {
    const rail = railRef.current
    if (!rail) return
    const cards = Array.from(rail.querySelectorAll<HTMLElement>('[data-reference-card]'))
    const center = rail.scrollLeft + rail.clientWidth / 2
    const closest = cards.reduce((best, card, index) => {
      const distance = Math.abs(card.offsetLeft + card.clientWidth / 2 - center)
      return distance < best.distance ? { index, distance } : best
    }, { index: 0, distance: Number.POSITIVE_INFINITY })
    setActiveIndex(closest.index)
  }

  function showProject(index: number) {
    const rail = railRef.current
    const card = rail?.querySelectorAll<HTMLElement>('[data-reference-card]')[index]
    if (!rail || !card) return
    rail.scrollTo({ left: card.offsetLeft - rail.offsetLeft, behavior: 'smooth' })
    setActiveIndex(index)
  }

  return (
    <section className="section portfolio" id="voorbeelden">
      <div className="shell">
        <div className="section-head portfolio-head">
          <p className="section-kicker">Recent werk</p>
          <h2>Geen standaardtemplate, maar een website die past bij het doel.</h2>
          <p>Ontwikkelbegeleiding staat centraal. Swipe of scroll verder voor meer websites die al live zijn.</p>
        </div>

        <article className="featured-reference">
          <BrowserPreview project={featuredProject} sizes="(max-width: 900px) 100vw, 1200px" priority />
          <div className="featured-reference-info">
            <div className="case-copy">
              <div className="case-meta">
                <span className="case-label">Hoofdreferentie</span>
                <span>{featuredProject.type}</span>
              </div>
              <h3>{featuredProject.name}</h3>
              <p>{featuredProject.description}</p>
            </div>
            <div className="case-details">
              <div className="case-tags">{featuredProject.features.map((feature) => <span key={feature}>{feature}</span>)}</div>
              <a className="case-link" href={featuredProject.url} target="_blank" rel="noopener noreferrer">Bekijk live website</a>
            </div>
          </div>
        </article>

        {otherProjects.length > 0 && (
          <div className="reference-more">
            <div className="reference-more-head">
              <div>
                <p className="section-kicker">Meer live werk</p>
                <h3>Bekijk de andere referenties.</h3>
              </div>
              <div className="reference-controls">
                <span aria-live="polite">{activeIndex + 1} / {otherProjects.length}</span>
                <button type="button" onClick={() => showProject(Math.max(0, activeIndex - 1))} disabled={activeIndex === 0} aria-label="Vorige referentie" title="Vorige referentie">←</button>
                <button type="button" onClick={() => showProject(Math.min(otherProjects.length - 1, activeIndex + 1))} disabled={activeIndex === otherProjects.length - 1} aria-label="Volgende referentie" title="Volgende referentie">→</button>
              </div>
            </div>
            <div className="reference-rail" ref={railRef} onScroll={updateActiveItem} tabIndex={0} aria-label="Overige live referenties">
              {otherProjects.map((project, index) => (
                <article className="reference-card" data-reference-card key={project.slug}>
                  <BrowserPreview project={project} sizes="(max-width: 700px) 88vw, 680px" />
                  <div className="reference-card-info">
                    <div className="case-meta">
                      <span className="case-label">Project {String(index + 2).padStart(2, '0')}</span>
                      <span>{project.type}</span>
                    </div>
                    <h4>{project.name}</h4>
                    <p>{project.description}</p>
                    <a className="case-link" href={project.url} target="_blank" rel="noopener noreferrer">Bekijk live website</a>
                  </div>
                </article>
              ))}
            </div>
            <p className="reference-swipe-hint">Sleep, scroll of swipe om meer werk te bekijken.</p>
          </div>
        )}
      </div>
    </section>
  )
}
