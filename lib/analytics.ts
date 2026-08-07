export type MarketingEvent =
  | 'hero_start_click'
  | 'hero_work_click'
  | 'portfolio_case_open'
  | 'package_view'
  | 'package_select'
  | 'checkout_start'
  | 'checkout_cancel'
  | 'checkout_complete'
  | 'contact_form_start'
  | 'contact_form_submit'
  | 'intake_start'
  | 'intake_complete'
  | 'partner_page_view'
  | 'customer_portal_open'

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
