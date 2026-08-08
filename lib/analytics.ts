export type MarketingEvent =
  | 'hero_start_click'
  | 'hero_work_click'
  | 'case_open'
  | 'live_case_click'
  | 'pricing_view'
  | 'package_select'
  | 'checkout_view'
  | 'checkout_start'
  | 'checkout_cancel'
  | 'checkout_complete'
  | 'contact_submit'
  | 'contact_form_start'
  | 'intake_start'
  | 'intake_step_complete'
  | 'intake_complete'
  | 'faq_open'
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
  const payload = {
    event,
    page_path: window.location.pathname,
    device_category: window.matchMedia('(max-width: 767px)').matches ? 'mobile' : window.matchMedia('(max-width: 1023px)').matches ? 'tablet' : 'desktop',
    utm_source: query.get('utm_source') ?? undefined,
    utm_medium: query.get('utm_medium') ?? undefined,
    utm_campaign: query.get('utm_campaign') ?? undefined,
    ...properties,
  }
  window.dataLayer?.push(payload)
  window.dispatchEvent(new CustomEvent('landingsite:analytics', { detail: payload }))
}
