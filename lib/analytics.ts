import { consentConfig } from '@/config/consent'

export type MarketingEvent =
  | 'hero_start_click'
  | 'hero_work_click'
  | 'case_view'
  | 'case_outbound_click'
  | 'organic_landing'
  | 'pricing_view'
  | 'package_compare'
  | 'package_select'
  | 'checkout_view'
  | 'checkout_start'
  | 'checkout_cancel'
  | 'checkout_complete'
  | 'question_form_submit'
  | 'contact_form_start'
  | 'intake_start'
  | 'intake_step_complete'
  | 'intake_complete'
  | 'faq_open'
  | 'social_feed_view'
  | 'social_post_open'
  | 'partner_page_view'
  | 'customer_portal_open'

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>
  }
}

export function trackMarketingEvent(event: MarketingEvent, properties: Record<string, string> = {}) {
  if (typeof window === 'undefined') return
  const query = new URLSearchParams(window.location.search)
  const allowedPropertyKeys = new Set(['location', 'project', 'package', 'section', 'form', 'question_index', 'platform'])
  const safeProperties = Object.fromEntries(
    Object.entries(properties).filter(([key, value]) => allowedPropertyKeys.has(key) && value.length <= 100),
  )
  const payload = {
    event,
    page_path: window.location.pathname,
    device_category: window.matchMedia('(max-width: 767px)').matches ? 'mobile' : window.matchMedia('(max-width: 1023px)').matches ? 'tablet' : 'desktop',
    utm_source: query.get('utm_source') ?? undefined,
    utm_medium: query.get('utm_medium') ?? undefined,
    utm_campaign: query.get('utm_campaign') ?? undefined,
    utm_content: query.get('utm_content') ?? undefined,
    utm_term: query.get('utm_term') ?? undefined,
    ...safeProperties,
  }
  const hasExternalAnalyticsConsent = document.cookie
    .split('; ')
    .includes(`${consentConfig.analytics.consentCookie}=${consentConfig.analytics.consentVersion}`)
  if (consentConfig.analytics.externalCollectionEnabled && hasExternalAnalyticsConsent) {
    window.dataLayer?.push(payload)
  }
  window.dispatchEvent(new CustomEvent('landingsite:analytics', { detail: payload }))
}
