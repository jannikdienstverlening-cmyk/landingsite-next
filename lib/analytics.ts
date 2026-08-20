import { consentConfig } from '@/config/consent'
import { trackingConfig, type ConsentChoice } from '@/config/tracking'

export type MarketingEvent =
  | 'hero_start_click'
  | 'hero_work_click'
  | 'case_view'
  | 'case_outbound_click'
  | 'view_item_list'
  | 'select_item'
  | 'view_item'
  | 'begin_checkout'
  | 'generate_lead'
  | 'purchase'
  | 'complete_intake'
  | 'view_case'
  | 'click_live_case'
  | 'form_start'
  | 'form_submit'
  | 'form_error'
  | 'organic_landing'
  | 'pricing_view'
  | 'package_compare'
  | 'package_select'
  | 'promotion_select'
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
  | 'blog_open'
  | 'chat_whatsapp_open'
  | 'customer_portal_open'

declare global {
  interface Window {
    dataLayer?: Array<unknown>
    gtag?: (...args: unknown[]) => void
    fbq?: (...args: unknown[]) => void
  }
}

const campaignStorageKey = 'landingsite_campaign_v1'

type CampaignContext = Partial<Record<(typeof trackingConfig.campaignKeys)[number], string>> & {
  landing_page?: string
  first_visit_at?: string
}

function consentChoice(): ConsentChoice | null {
  const raw = document.cookie.split('; ').find((item) => item.startsWith(`${consentConfig.analytics.consentCookie}=`))?.split('=').slice(1).join('=')
  if (!raw) return null
  try {
    const parsed = JSON.parse(decodeURIComponent(raw)) as ConsentChoice
    return parsed.version === consentConfig.analytics.consentVersion ? parsed : null
  } catch { return null }
}

export function captureCampaignContext() {
  if (typeof window === 'undefined') return
  const query = new URLSearchParams(window.location.search)
  const existing = campaignContext()
  const campaign: CampaignContext = {
    ...existing,
    landing_page: existing.landing_page ?? `${window.location.pathname}${window.location.search}`.slice(0, 500),
    first_visit_at: existing.first_visit_at ?? new Date().toISOString(),
    ...Object.fromEntries(trackingConfig.campaignKeys.flatMap((key) => {
    const value = query.get(key)
    return value && value.length <= 160 ? [[key, value]] : []
    })),
  }
  sessionStorage.setItem(campaignStorageKey, JSON.stringify(campaign))
  if (consentChoice()?.marketing) localStorage.setItem(campaignStorageKey, JSON.stringify(campaign))
}

function campaignContext() {
  try {
    const raw = sessionStorage.getItem(campaignStorageKey) ?? (consentChoice()?.marketing ? localStorage.getItem(campaignStorageKey) : null)
    return raw ? JSON.parse(raw) as Record<string, string> : {}
  } catch { return {} }
}

function cookieValue(name: string) {
  const raw = document.cookie.split('; ').find((item) => item.startsWith(`${name}=`))
  return raw ? decodeURIComponent(raw.split('=').slice(1).join('=')) : ''
}

function googleClientId() {
  const match = cookieValue('_ga').match(/^GA\d+\.\d+\.(\d+\.\d+)$/)
  return match?.[1]
}

export function checkoutAttributionContext() {
  if (typeof window === 'undefined') return undefined
  const choice = consentChoice()
  if (!choice || (!choice.analytics && !choice.marketing)) return undefined

  const campaign = campaignContext()
  if (choice.marketing) localStorage.setItem(campaignStorageKey, JSON.stringify(campaign))
  const fbclid = campaign.fbclid
  const firstVisit = campaign.first_visit_at ? Date.parse(campaign.first_visit_at) : Number.NaN
  const generatedFbc = fbclid && Number.isFinite(firstVisit) ? `fb.1.${Math.floor(firstVisit)}.${fbclid}` : undefined

  return {
    consentVersion: choice.version,
    analyticsConsent: choice.analytics,
    marketingConsent: choice.marketing,
    ...campaign,
    ga_client_id: choice.analytics ? googleClientId() : undefined,
    fbp: choice.marketing ? cookieValue('_fbp') || undefined : undefined,
    fbc: choice.marketing ? cookieValue('_fbc') || generatedFbc : undefined,
  }
}

export function trackMarketingEvent(event: MarketingEvent, properties: Record<string, string> = {}) {
  if (typeof window === 'undefined') return
  const allowedPropertyKeys = new Set(['location', 'project', 'package', 'section', 'form', 'question_index', 'platform', 'slug', 'event_id', 'transaction_id', 'value', 'currency'])
  const safeProperties = Object.fromEntries(
    Object.entries(properties).filter(([key, value]) => allowedPropertyKeys.has(key) && value.length <= 100),
  )
  const payload = {
    event,
    page_path: window.location.pathname,
    device_category: window.matchMedia('(max-width: 767px)').matches ? 'mobile' : window.matchMedia('(max-width: 1023px)').matches ? 'tablet' : 'desktop',
    ...campaignContext(),
    ...safeProperties,
  }
  const choice = consentChoice()
  const hasExternalAnalyticsConsent = Boolean(choice?.analytics)
  if (consentConfig.analytics.externalCollectionEnabled && hasExternalAnalyticsConsent) {
    window.dataLayer?.push(payload)
    window.gtag?.('event', event, safeProperties)
  }
  if (choice?.marketing && window.fbq) {
    const metaEvent = event === 'checkout_start' || event === 'begin_checkout'
      ? 'InitiateCheckout'
      : event === 'purchase'
        ? 'Purchase'
        : event === 'question_form_submit' || event === 'generate_lead' || event === 'form_submit'
          ? 'Lead'
          : event === 'case_view' || event === 'view_case'
            ? 'ViewContent'
            : null
    if (metaEvent) {
      const { event_id: eventId, ...metaProperties } = safeProperties
      window.fbq('track', metaEvent, metaProperties, eventId ? { eventID: eventId } : undefined)
    }
  }
  window.dispatchEvent(new CustomEvent('landingsite:analytics', { detail: payload }))
}
