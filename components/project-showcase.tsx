'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import { portfolioProjects } from '@/data/portfolio'
import { trackMarketingEvent } from '@/lib/analytics'

const ROTATION_INTERVAL_MS = 6500
const SWIPE_THRESHOLD_PX = 48

export function ProjectShowcase() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward')
  const [isPaused, setIsPaused] = useState(false)
  const [isInteracting, setIsInteracting] = useState(false)
  const [isInView, setIsInView] = useState(true)
  const [isPageVisible, setIsPageVisible] = useState(true)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const pointerStartX = useRef<number | null>(null)
  const project = portfolioProjects[activeIndex]

  const activateProject = useCallback((nextIndex: number, nextDirection: 'forward' | 'backward', source: 'automatic' | 'manual') => {
    const normalizedIndex = (nextIndex + portfolioProjects.length) % portfolioProjects.length
    setDirection(nextDirection)
    setActiveIndex(normalizedIndex)
    if (source === 'manual') {
      trackMarketingEvent('case_open', {
        project: portfolioProjects[normalizedIndex].slug,
        source: 'project_showcase',
      })
    }
  }, [])

  const showProject = useCallback((nextIndex: number) => {
    const wrapsForward = activeIndex === portfolioProjects.length - 1 && nextIndex === 0
    activateProject(nextIndex, nextIndex < activeIndex && !wrapsForward ? 'backward' : 'forward', 'manual')
  }, [activeIndex, activateProject])

  const showNext = useCallback((source: 'automatic' | 'manual' = 'manual') => {
    activateProject(activeIndex + 1, 'forward', source)
  }, [activeIndex, activateProject])

  const showPrevious = useCallback(() => {
    activateProject(activeIndex - 1, 'backward', 'manual')
  }, [activeIndex, activateProject])

  useEffect(() => {
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const updateMotionPreference = () => setPrefersReducedMotion(motionQuery.matches)
    updateMotionPreference()
    motionQuery.addEventListener('change', updateMotionPreference)
    return () => motionQuery.removeEventListener('change', updateMotionPreference)
  }, [])

  useEffect(() => {
    const element = rootRef.current
    if (!element || !('IntersectionObserver' in window)) return

    const observer = new IntersectionObserver(
      ([entry]) => setIsInView(entry.isIntersecting && entry.intersectionRatio >= 0.35),
      { threshold: [0, 0.35, 0.7] },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const updatePageVisibility = () => setIsPageVisible(!document.hidden)
    updatePageVisibility()
    document.addEventListener('visibilitychange', updatePageVisibility)
    return () => document.removeEventListener('visibilitychange', updatePageVisibility)
  }, [])

  useEffect(() => {
    if (isPaused || isInteracting || !isInView || !isPageVisible || prefersReducedMotion) return
    const timer = window.setTimeout(() => showNext('automatic'), ROTATION_INTERVAL_MS)
    return () => window.clearTimeout(timer)
  }, [activeIndex, isInView, isInteracting, isPageVisible, isPaused, prefersReducedMotion, showNext])

  return (
    <div
      className="project-showcase"
      id="werk"
      ref={rootRef}
      role="region"
      aria-label="Live projecten"
      aria-roledescription="projectcarrousel"
      onPointerEnter={() => setIsInteracting(true)}
      onPointerLeave={() => setIsInteracting(false)}
      onFocusCapture={() => setIsInteracting(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setIsInteracting(false)
      }}
      onKeyDown={(event) => {
        if (event.key === 'ArrowLeft') {
          event.preventDefault()
          showPrevious()
        }
        if (event.key === 'ArrowRight') {
          event.preventDefault()
          showNext()
        }
      }}
    >
      <div className="project-showcase__header">
        <span>Live werk</span>
        <div className="project-showcase__controls">
          <span aria-live={isInteracting ? 'polite' : 'off'}>{String(activeIndex + 1).padStart(2, '0')} / {String(portfolioProjects.length).padStart(2, '0')}</span>
          <button type="button" onClick={showPrevious} aria-label="Vorig project" title="Vorig project">&larr;</button>
          <button type="button" onClick={() => showNext()} aria-label="Volgend project" title="Volgend project">&rarr;</button>
          <button
            type="button"
            className="project-showcase__pause"
            onClick={() => setIsPaused((current) => !current)}
            aria-label={isPaused ? 'Automatisch wisselen hervatten' : 'Automatisch wisselen pauzeren'}
            aria-pressed={isPaused}
            title={isPaused ? 'Automatisch wisselen hervatten' : 'Automatisch wisselen pauzeren'}
          >
            <span aria-hidden="true">{isPaused ? '\u25b6' : '\u2016'}</span>
          </button>
        </div>
      </div>

      <div
        className="project-showcase__viewport"
        onPointerDown={(event) => {
          pointerStartX.current = event.clientX
          event.currentTarget.setPointerCapture(event.pointerId)
        }}
        onPointerUp={(event) => {
          if (pointerStartX.current === null) return
          const distance = event.clientX - pointerStartX.current
          pointerStartX.current = null
          if (Math.abs(distance) < SWIPE_THRESHOLD_PX) return
          if (distance < 0) showNext()
          else showPrevious()
        }}
        onPointerCancel={() => { pointerStartX.current = null }}
      >
        <article
          className={`project-showcase__slide project-showcase__slide--${direction}`}
          key={project.slug}
          aria-label={`${project.name}, project ${activeIndex + 1} van ${portfolioProjects.length}`}
        >
          <a
            className="project-showcase__image-link"
            href={project.url}
            target="_blank"
            rel="noopener noreferrer"
            data-analytics-event="live_case_click"
            data-analytics-project={project.slug}
            aria-label={`Bekijk ${project.name} live`}
          >
            <div className="project-showcase__browser">
              <div className="project-showcase__browser-bar" aria-hidden="true">
                <span><i /><i /><i /></span>
                <strong>{project.domain}</strong>
                <em>Live</em>
              </div>
              <div className="project-showcase__image">
                <Image
                  src={project.image}
                  alt={project.imageAlt}
                  fill
                  sizes="(max-width: 820px) calc(100vw - 36px), 52vw"
                  priority={activeIndex === 0}
                  draggable={false}
                />
              </div>
            </div>
          </a>

          <div className="project-showcase__summary">
            <div>
              <span>{project.industry}</span>
              <h2>{project.name}</h2>
            </div>
            <p>{project.description}</p>
            <div className="project-showcase__links">
              <a href={project.url} target="_blank" rel="noopener noreferrer" data-analytics-event="live_case_click" data-analytics-project={project.slug}>
                Bekijk live <span aria-hidden="true">↗</span>
              </a>
              <Link href={`/werk#${project.slug}`}>Projectdetails</Link>
            </div>
          </div>
        </article>
      </div>

      <div className="project-showcase__rail" aria-label="Kies een project">
        {portfolioProjects.map((item, index) => (
          <button
            type="button"
            key={item.slug}
            className={index === activeIndex ? 'is-active' : undefined}
            aria-current={index === activeIndex ? 'true' : undefined}
            onClick={() => showProject(index)}
          >
            <span>{String(index + 1).padStart(2, '0')}</span>
            <strong>{item.name}</strong>
            {index === activeIndex && !isPaused && !isInteracting && !prefersReducedMotion ? (
              <i key={`${item.slug}-${activeIndex}`} className="project-showcase__progress" aria-hidden="true" />
            ) : null}
          </button>
        ))}
      </div>
    </div>
  )
}
