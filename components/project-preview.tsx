'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Monitor, Smartphone } from 'lucide-react'
import type { PortfolioProject } from '@/data/portfolio'
import { trackMarketingEvent } from '@/lib/analytics'

export function ProjectPreview({ projects }: { projects: PortfolioProject[] }) {
  const [selected, setSelected] = useState(0)
  const [view, setView] = useState<'desktop' | 'mobile'>('desktop')
  const project = projects[selected]
  if (!project) return null

  function selectProject(index: number) {
    if (index === selected) return
    setSelected(index)
    trackMarketingEvent('case_view', { project: projects[index].slug, location: 'hero-preview' })
  }

  function selectView(nextView: 'desktop' | 'mobile') {
    if (nextView === view) return
    setView(nextView)
    trackMarketingEvent('case_view', { project: project.slug, location: 'hero-preview', section: nextView })
  }

  return (
    <article className="hero-case project-preview" aria-labelledby="hero-case-title">
      <div className="project-preview__toolbar">
        <span className="project-preview__domain">{project.domain}</span>
        <div className="project-preview__devices" role="group" aria-label="Projectweergave">
          <button type="button" aria-label="Desktopweergave" aria-pressed={view === 'desktop'} title="Desktopweergave" onClick={() => selectView('desktop')}>
            <Monitor size={18} aria-hidden="true" />
          </button>
          <button type="button" aria-label="Mobiele weergave" aria-pressed={view === 'mobile'} title="Mobiele weergave" onClick={() => selectView('mobile')}>
            <Smartphone size={18} aria-hidden="true" />
          </button>
        </div>
      </div>
      <a
        className={`project-preview__stage${view === 'mobile' ? ' project-preview__stage--mobile' : ''}`}
        href={project.url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`Open ${project.name} in een nieuw tabblad`}
        onClick={() => trackMarketingEvent('case_outbound_click', { project: project.slug, location: 'hero-preview' })}
      >
        <div className={view === 'mobile' ? 'project-preview__phone' : 'project-preview__image'}>
          <Image
            key={`${project.slug}-${view}`}
            src={view === 'mobile' ? project.mobileImage : project.image}
            alt={view === 'mobile' ? project.mobileImageAlt : project.imageAlt}
            fill
            sizes={view === 'mobile' ? '210px' : '(max-width: 600px) calc(100vw - 40px), (max-width: 1280px) calc(100vw - 64px), 1216px'}
            preload={selected === 0 && view === 'desktop'}
            loading="eager"
          />
        </div>
      </a>
      <div className="project-preview__caption">
        <div aria-live="polite" aria-atomic="true">
          <p>{project.industry}</p>
          <h2 id="hero-case-title">{project.name}</h2>
        </div>
        <a href={project.url} target="_blank" rel="noopener noreferrer" onClick={() => trackMarketingEvent('case_outbound_click', { project: project.slug, location: 'hero-preview' })}>
          Bekijk live
          <span className="sr-only">: {project.name}, in een nieuw tabblad</span>
        </a>
        <p className="project-preview__description">{project.description}</p>
      </div>
      <div className="project-preview__choices" role="group" aria-label="Project kiezen">
        {projects.map((item, index) => (
          <button key={item.slug} type="button" aria-pressed={selected === index} aria-controls="hero-case-title" onClick={() => selectProject(index)}>
            <span aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
            <span>{item.name}</span>
          </button>
        ))}
      </div>
      <noscript><style>{'.project-preview__devices, .project-preview__choices { display: none; }'}</style></noscript>
    </article>
  )
}
