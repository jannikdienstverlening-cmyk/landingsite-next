import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let serverSupabase: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase server environment variables are missing.')
  }

  if (!serverSupabase) {
    serverSupabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  }

  return serverSupabase
}

export type Pakket = 'starter' | 'pro' | 'premium'
export type OrderStatus = 'pending' | 'paid' | 'generating' | 'completed' | 'failed'
export type ManagementStatus = 'pending' | 'awaiting_go_live' | 'active' | 'payment_failed' | 'past_due' | 'cancelled' | 'transferred'
export type PageStatus = 'pending' | 'generating' | 'completed' | 'failed'

export interface Order {
  id: string
  stripe_session_id: string
  stripe_payment_intent: string | null
  stripe_customer_id: string | null
  build_payment_intent_id: string | null
  management_checkout_session_id: string | null
  management_subscription_id: string | null
  management_status: ManagementStatus
  went_live_at: string | null
  management_started_at: string | null
  management_cancel_at_period_end: boolean
  referral_attribution_id: string | null
  email: string
  pakket: Pakket
  status: OrderStatus
  created_at: string
}

export interface IntakeForm {
  id: string
  order_id: string
  bedrijfsnaam: string
  niche: string
  beschrijving: string
  usp_1: string
  usp_2: string
  usp_3: string
  extra_fields: Record<string, unknown> | null
  created_at: string
}

export interface GeneratedPage {
  id: string
  order_id: string
  netlify_site_id: string | null
  netlify_url: string | null
  html_content: string | null
  status: PageStatus
  created_at: string
}
