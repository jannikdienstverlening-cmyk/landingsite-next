'use client'

import { useEffect, useRef, useState } from 'react'

/** Animation work stops offscreen, in background tabs and with reduced motion. */
export function useMotionVisibility<T extends HTMLElement>() {
  const ref = useRef<T>(null)
  const [state, setState] = useState({ inView: false, motionAllowed: false })

  useEffect(() => {
    const element = ref.current
    if (!element) return
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)')
    let intersecting = false
    const update = () => setState({
      inView: intersecting && !document.hidden,
      motionAllowed: !preference.matches,
    })
    const observer = new IntersectionObserver(([entry]) => {
      intersecting = entry.isIntersecting
      update()
    }, { threshold: 0.2 })
    observer.observe(element)
    preference.addEventListener('change', update)
    document.addEventListener('visibilitychange', update)
    return () => {
      observer.disconnect()
      preference.removeEventListener('change', update)
      document.removeEventListener('visibilitychange', update)
    }
  }, [])

  return { ref, ...state, canAnimate: state.inView && state.motionAllowed }
}
