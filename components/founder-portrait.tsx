'use client'

import Image from 'next/image'
import { Check, Pause, Play, RotateCcw } from 'lucide-react'
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
      <Image src="/images/jannik-cartoon-builder.webp" alt="AI-cartoon van Jannik die glimlachend een miniwebsite bouwt" width={900} height={1200} sizes="(max-width: 599px) 270px, 320px" onLoad={() => setImageReady(true)} />
      <div key={run} className="founder-portrait__animation" aria-hidden="true">
        <span className="founder-portrait__tile" onAnimationEnd={event => {
          if (event.animationName === 'founder-button-flight') setFinished(true)
        }}><Check strokeWidth={3} /></span>
        <span className="founder-portrait__impact"><i /><i /><i /></span>
      </div>
      {motionAllowed && <button className="motion-control founder-portrait__replay" type="button" onClick={togglePlayback} aria-label={controlLabel} title={controlLabel}><ControlIcon size={18} aria-hidden="true" /></button>}
    </div>
    <figcaption>Jannik · oprichter en bouwer<small>AI-illustratie</small></figcaption>
  </figure>
}
