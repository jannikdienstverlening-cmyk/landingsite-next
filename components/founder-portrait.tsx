'use client'

import Image from 'next/image'
import { Pause, Play, RotateCcw } from 'lucide-react'
import { useState } from 'react'
import { useMotionVisibility } from './use-motion-visibility'

export function FounderPortrait() {
  const { ref, canAnimate, motionAllowed } = useMotionVisibility<HTMLElement>()
  const [playing, setPlaying] = useState(true)
  const [finished, setFinished] = useState(false)
  const [run, setRun] = useState(0)
  const [imageReady, setImageReady] = useState(false)
  const running = canAnimate && playing && !finished && imageReady
  const controlLabel = finished ? 'Cartoon opnieuw afspelen' : playing ? 'Cartoon pauzeren' : 'Cartoon afspelen'
  const ControlIcon = finished ? RotateCcw : playing ? Pause : Play

  function togglePlayback() {
    if (finished) {
      setRun(value => value + 1)
      setFinished(false)
      setPlaying(true)
    } else {
      setPlaying(value => !value)
    }
  }

  return <figure ref={ref} className="experience-founder" data-motion={motionAllowed} data-running={running} data-finished={finished}>
    <div className="founder-portrait__stage">
      <div key={run} className="founder-portrait__frames">
        <Image className="founder-portrait__story" src="/images/jannik-cartoon-story-v2.webp" alt="Cartoon van Jannik die een website bouwt, een scheef blokje opvangt en afsluit met een duim omhoog en een knipoog" width={1536} height={1024} unoptimized onLoad={() => setImageReady(true)} onAnimationEnd={event => {
          if (event.animationName === 'founder-build-story') setFinished(true)
        }} />
      </div>
      {motionAllowed && <button className="motion-control founder-portrait__replay" type="button" onClick={togglePlayback} aria-label={controlLabel} title={controlLabel}><ControlIcon size={18} aria-hidden="true" /></button>}
    </div>
    <figcaption>Jannik · oprichter en bouwer<small>AI-illustratie</small></figcaption>
  </figure>
}
