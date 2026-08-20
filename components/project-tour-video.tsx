'use client'

import { useEffect, useRef, useState } from 'react'

type ProjectTourVideoProps = {
  src: string
  poster: string
  title: string
}

export function ProjectTourVideo({ src, poster, title }: ProjectTourVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [paused, setPaused] = useState(true)

  useEffect(() => {
    const video = videoRef.current
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!video || reducedMotion) return
    void video.play().catch(() => undefined)
  }, [])

  function togglePlayback() {
    const video = videoRef.current
    if (!video) return
    if (video.paused) {
      void video.play()
      setPaused(false)
    } else {
      video.pause()
      setPaused(true)
    }
  }

  return (
    <div className="project-tour">
      <video
        ref={videoRef}
        className="project-tour__video"
        src={src}
        poster={poster}
        muted
        loop
        playsInline
        preload="metadata"
        onPlay={() => setPaused(false)}
        onPause={() => setPaused(true)}
        aria-label={title}
      />
      <div className="project-tour__label">
        <span>Live site-tour</span>
        <strong>Van aanbod naar kennismaking</strong>
      </div>
      <button type="button" className="project-tour__control" onClick={togglePlayback} aria-label={paused ? 'Speel de site-tour af' : 'Pauzeer de site-tour'}>
        <span aria-hidden="true">{paused ? 'Afspelen' : 'Pauze'}</span>
      </button>
    </div>
  )
}
