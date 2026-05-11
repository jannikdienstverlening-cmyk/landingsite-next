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
export type PageStatus = 'pending' | 'generating' | 'completed' | 'failed'

export interface Order {
  id: string
  stripe_session_id: string
  stripe_payment_intent: string | null
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
