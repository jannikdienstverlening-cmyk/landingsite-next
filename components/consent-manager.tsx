'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { consentConfig } from '@/config/consent'
import { trackingConfig, type ConsentChoice } from '@/config/tracking'

declare global {
  interface Window {
    dataLayer?: Array<unknown>
    gtag?: (...args: unknown[]) => void
    fbq?: (...args: unknown[]) => void
  }
}

const defaultChoice: ConsentChoice = {
  analytics: false,
  marketing: false,
  preferences: false,
  version: consentConfig.analytics.consentVersion,
}

function readChoice(): ConsentChoice | null {
  if (typeof document === 'undefined') return null
  const raw = document.cookie.split('; ').find((item) => item.startsWith(`${consentConfig.analytics.consentCookie}=`))?.split('=').slice(1).join('=')
  if (!raw) return null
  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as ConsentChoice
    return parsed.version === consentConfig.analytics.consentVersion ? parsed : null
  } catch {
    return null
  }
}

function writeChoice(choice: ConsentChoice) {
  const maxAge = consentConfig.analytics.maxAgeDays * 24 * 60 * 60
  document.cookie = `${consentConfig.analytics.consentCookie}=${encodeURIComponent(JSON.stringify(choice))}; Path=/; Max-Age=${maxAge}; SameSite=Lax; Secure`
}

function loadScript(id: string, src: string) {
  if (document.getElementById(id)) return
  const script = document.createElement('script')
  script.id = id
  script.async = true
  script.src = src
  document.head.appendChild(script)
}

function applyConsent(choice: ConsentChoice) {
  window.dataLayer = window.dataLayer ?? []
  window.gtag = window.gtag ?? function gtag(...args: unknown[]) { window.dataLayer?.push(args) }
  window.gtag('consent', 'update', {
    analytics_storage: choice.analytics ? 'granted' : 'denied',
    ad_storage: choice.marketing ? 'granted' : 'denied',
    ad_user_data: choice.marketing ? 'granted' : 'denied',
    ad_personalization: choice.marketing ? 'granted' : 'denied',
    functionality_storage: choice.preferences ? 'granted' : 'denied',
  })

  if (!trackingConfig.enabled) return
  if (choice.analytics && trackingConfig.googleMeasurementId) {
    loadScript('landingsite-google-tag', `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(trackingConfig.googleMeasurementId)}`)
    window.gtag('js', new Date())
    window.gtag('config', trackingConfig.googleMeasurementId, { anonymize_ip: true })
  }
  if (choice.marketing && trackingConfig.googleAdsId) window.gtag('config', trackingConfig.googleAdsId)
  if (choice.marketing && trackingConfig.metaPixelId) {
    if (!window.fbq) {
      type MetaPixelQueue = ((...args: unknown[]) => void) & {
        callMethod?: (...args: unknown[]) => void
        queue: unknown[][]
        loaded: boolean
        version: string
      }
      const fbq = function (...args: unknown[]) {
        if (fbq.callMethod) fbq.callMethod(...args)
        else fbq.queue.push(args)
      } as MetaPixelQueue
      fbq.loaded = true
      fbq.version = '2.0'
      fbq.queue = []
      window.fbq = fbq
    }
    loadScript('landingsite-meta-pixel', 'https://connect.facebook.net/en_US/fbevents.js')
    window.fbq('init', trackingConfig.metaPixelId)
    window.fbq('track', 'PageView')
  }
  window.dispatchEvent(new CustomEvent('landingsite:consent', { detail: choice }))
}

export function ConsentManager() {
  const titleId = useId()
  const panelRef = useRef<HTMLElement>(null)
  const [choice, setChoice] = useState<ConsentChoice>(defaultChoice)
  const [visible, setVisible] = useState(false)
  const [details, setDetails] = useState(false)

  useEffect(() => {
    const saved = readChoice()
    if (saved) {
      applyConsent(saved)
    } else {
      applyConsent(defaultChoice)
    }
    queueMicrotask(() => {
      if (saved) setChoice(saved)
      else setVisible(true)
    })
    const reopen = () => { setDetails(true); setVisible(true) }
    window.addEventListener('landingsite:open-consent', reopen)
    return () => window.removeEventListener('landingsite:open-consent', reopen)
  }, [])

  useEffect(() => {
    if (!visible) return
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const focusable = () => Array.from(panelRef.current?.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input:not([disabled])') ?? [])
    focusable()[0]?.focus()
    function keepFocusInside(event: KeyboardEvent) {
      if (event.key !== 'Tab') return
      const items = focusable()
      const first = items[0]
      const last = items.at(-1)
      if (!first || !last) return
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', keepFocusInside)
    return () => {
      document.removeEventListener('keydown', keepFocusInside)
      if (previousFocus && previousFocus !== document.body && previousFocus.isConnected) previousFocus.focus()
    }
  }, [visible, details])

  function save(next: ConsentChoice) {
    writeChoice(next)
    setChoice(next)
    applyConsent(next)
    setVisible(false)
  }

  if (!visible) return null
  return (
    <section ref={panelRef} className="consent-panel" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <div className="consent-panel__copy">
        <p className="consent-panel__eyebrow">Jouw keuze</p>
        <h2 id={titleId}>Alleen meten met jouw toestemming.</h2>
        <p>Noodzakelijke cookies houden de site en checkout werkend. Analyse en advertentiemeting staan standaard uit.</p>
      </div>
      {details && <div className="consent-options">
        <div><strong>Noodzakelijk</strong><span>Altijd actief voor beveiliging, formulieren en betaling.</span></div>
        <label><input type="checkbox" checked={choice.analytics} onChange={(event) => setChoice({ ...choice, analytics: event.target.checked })} /><span><strong>Analyse</strong>Helpt ons zien welke pagina&apos;s worden gebruikt.</span></label>
        <label><input type="checkbox" checked={choice.marketing} onChange={(event) => setChoice({ ...choice, marketing: event.target.checked })} /><span><strong>Marketing</strong>Meet campagnes van Google en Meta.</span></label>
        <label><input type="checkbox" checked={choice.preferences} onChange={(event) => setChoice({ ...choice, preferences: event.target.checked })} /><span><strong>Voorkeuren</strong>Onthoudt niet-essentiële keuzes.</span></label>
      </div>}
      <div className="consent-panel__actions">
        <button type="button" className="consent-button consent-button--primary" onClick={() => save({ ...choice, analytics: true, marketing: true, preferences: true })}>Alles accepteren</button>
        <button type="button" className="consent-button" onClick={() => save(defaultChoice)}>Alles weigeren</button>
        {details
          ? <button type="button" className="consent-button" onClick={() => save(choice)}>Keuze bewaren</button>
          : <button type="button" className="consent-button" onClick={() => setDetails(true)}>Zelf instellen</button>}
      </div>
      <a href="/privacybeleid">Lees het privacybeleid</a>
    </section>
  )
}

export function ConsentSettingsButton() {
  return <button className="consent-settings" type="button" onClick={() => window.dispatchEvent(new Event('landingsite:open-consent'))}>Cookievoorkeuren</button>
}
