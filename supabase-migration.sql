-- Landingsite.nl — database migratie
-- Veilig opnieuw uitvoerbaar in de Supabase SQL Editor.

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_session_id TEXT UNIQUE NOT NULL,
  stripe_payment_intent TEXT,
  email TEXT NOT NULL DEFAULT '',
  business_name TEXT NOT NULL DEFAULT '',
  kvk_number TEXT NOT NULL DEFAULT '',
  pakket TEXT NOT NULL CHECK (pakket IN ('starter', 'pro', 'premium')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'generating', 'completed', 'failed')),
  last_error TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS intake_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  bedrijfsnaam TEXT NOT NULL,
  niche TEXT NOT NULL,
  beschrijving TEXT NOT NULL,
  usp_1 TEXT NOT NULL DEFAULT '',
  usp_2 TEXT NOT NULL DEFAULT '',
  usp_3 TEXT NOT NULL DEFAULT '',
  extra_fields JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS generated_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  netlify_site_id TEXT,
  netlify_url TEXT,
  html_content TEXT,
  lead_token TEXT,
  workflow_run_id TEXT,
  error_message TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'generating', 'completed', 'failed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS stripe_webhook_events (
  event_id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'processed' CHECK (status IN ('processing', 'processed', 'failed')),
  attempts INTEGER NOT NULL DEFAULT 1,
  last_error TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_partner_id UUID REFERENCES partners(id) ON DELETE SET NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  partner_type TEXT NOT NULL CHECK (partner_type IN ('particulier', 'ondernemer')),
  company_name TEXT NOT NULL DEFAULT '',
  kvk_number TEXT NOT NULL DEFAULT '',
  vat_number TEXT NOT NULL DEFAULT '',
  referral_code TEXT UNIQUE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'suspended')),
  terms_version TEXT NOT NULL,
  terms_accepted_at TIMESTAMPTZ NOT NULL,
  privacy_accepted_at TIMESTAMPTZ NOT NULL,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_partners_email_unique ON partners(lower(email));
CREATE UNIQUE INDEX IF NOT EXISTS idx_partners_referral_code ON partners(referral_code) WHERE referral_code IS NOT NULL;

CREATE TABLE IF NOT EXISTS referral_attributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE RESTRICT,
  referral_code TEXT NOT NULL,
  first_visited_at TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  landing_page TEXT NOT NULL,
  utm_source TEXT NOT NULL DEFAULT '',
  utm_medium TEXT NOT NULL DEFAULT '',
  utm_campaign TEXT NOT NULL DEFAULT '',
  ip_hash TEXT,
  customer_id TEXT,
  chosen_package TEXT CHECK (chosen_package IS NULL OR chosen_package IN ('starter', 'pro', 'premium')),
  subscription_status TEXT,
  converted_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'visited' CHECK (status IN ('visited', 'converted', 'expired', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS partner_commissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES partners(id) ON DELETE RESTRICT,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
  level INTEGER NOT NULL CHECK (level BETWEEN 1 AND 3),
  amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
  currency TEXT NOT NULL DEFAULT 'EUR',
  stripe_subscription_id TEXT NOT NULL,
  stripe_invoice_id TEXT NOT NULL,
  invoice_period_start TIMESTAMPTZ,
  invoice_period_end TIMESTAMPTZ,
  paid_at TIMESTAMPTZ NOT NULL,
  available_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending_review' CHECK (status IN ('pending_review', 'approved', 'paid', 'reversed', 'rejected')),
  audit_note TEXT NOT NULL DEFAULT 'Handmatige controle vereist',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (stripe_invoice_id, partner_id, level)
);

CREATE TABLE IF NOT EXISTS subscription_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
  stripe_event_id TEXT,
  action TEXT NOT NULL,
  from_status TEXT,
  to_status TEXT,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  generated_page_id UUID NOT NULL REFERENCES generated_pages(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  message TEXT NOT NULL DEFAULT '',
  ip_hash TEXT,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'closed', 'spam')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Bestaande installaties bijwerken.
ALTER TABLE orders ADD COLUMN IF NOT EXISTS last_error TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS business_name TEXT NOT NULL DEFAULT '';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS kvk_number TEXT NOT NULL DEFAULT '';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE orders ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS build_payment_intent_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS management_checkout_session_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS management_subscription_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS management_status TEXT NOT NULL DEFAULT 'pending';
ALTER TABLE orders ADD COLUMN IF NOT EXISTS went_live_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS management_started_at TIMESTAMPTZ;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS management_cancel_at_period_end BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS referral_attribution_id UUID REFERENCES referral_attributions(id) ON DELETE SET NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'orders_management_status_check'
  ) THEN
    ALTER TABLE orders ADD CONSTRAINT orders_management_status_check
      CHECK (management_status IN (
        'pending',
        'awaiting_go_live',
        'active',
        'payment_failed',
        'past_due',
        'cancelled',
        'transferred'
      ));
  END IF;
END $$;

ALTER TABLE intake_forms ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE generated_pages ADD COLUMN IF NOT EXISTS lead_token TEXT;
ALTER TABLE generated_pages ADD COLUMN IF NOT EXISTS workflow_run_id TEXT;
ALTER TABLE generated_pages ADD COLUMN IF NOT EXISTS error_message TEXT;
ALTER TABLE generated_pages ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE stripe_webhook_events ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'processed';
ALTER TABLE stripe_webhook_events ADD COLUMN IF NOT EXISTS attempts INTEGER NOT NULL DEFAULT 1;
ALTER TABLE stripe_webhook_events ADD COLUMN IF NOT EXISTS last_error TEXT;
ALTER TABLE stripe_webhook_events ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_stripe_session ON orders(stripe_session_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_intake_order_unique ON intake_forms(order_id);
CREATE INDEX IF NOT EXISTS idx_pages_order ON generated_pages(order_id, created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_pages_lead_token ON generated_pages(lead_token) WHERE lead_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_leads_page ON leads(generated_page_id, created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_management_subscription ON orders(management_subscription_id) WHERE management_subscription_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_referral_attributions_partner ON referral_attributions(partner_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_commissions_partner_status ON partner_commissions(partner_id, status, available_at);
CREATE INDEX IF NOT EXISTS idx_subscription_audit_order ON subscription_audit_log(order_id, created_at DESC);

-- Alle browsertoegang blijft dicht; serverroutes gebruiken uitsluitend de service-role key.
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE intake_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE referral_attributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE partner_commissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_audit_log ENABLE ROW LEVEL SECURITY;

-- Klantassets blijven privé en worden uitsluitend via betaalde serverroutes verwerkt.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('customer-assets', 'customer-assets', false, 5242880, ARRAY['image/jpeg','image/png','image/webp'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;
