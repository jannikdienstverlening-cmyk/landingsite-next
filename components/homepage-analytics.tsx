'use client'

import { useEffect } from 'react'
import { trackMarketingEvent, type MarketingEvent } from '@/lib/analytics'

export function HomepageAnalytics() {
  useEffect(() => {
    function trackClick(event: MouseEvent) {
      const element = (event.target as Element | null)?.closest<HTMLElement>('[data-analytics-event]')
      if (!element) return
      const { analyticsEvent, ...properties } = element.dataset
      if (!analyticsEvent) return
      trackMarketingEvent(analyticsEvent as MarketingEvent, properties as Record<string, string>)
    }

    document.addEventListener('click', trackClick)
    return () => document.removeEventListener('click', trackClick)
  }, [])

  return null
}
