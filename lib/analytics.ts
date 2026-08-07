export type MarketingEvent =
  | 'start_website'
  | 'view_examples'
  | 'project_click'
  | 'form_start'
  | 'form_submit_success'
  | 'direct_order_open'
  | 'direct_order_checkout'
  | 'consultation_click'
  | 'partner_click'
  | 'social_click'

declare global {
  interface Window {
    dataLayer?: Array<Record<string, unknown>>
  }
}

export function trackMarketingEvent(event: MarketingEvent, properties: Record<string, string> = {}) {
  if (typeof window === 'undefined') return
  const payload = { event, ...properties }
  window.dataLayer?.push(payload)
  window.dispatchEvent(new CustomEvent('landingsite:analytics', { detail: payload }))
}
