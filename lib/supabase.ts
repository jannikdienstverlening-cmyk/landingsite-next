import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

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
