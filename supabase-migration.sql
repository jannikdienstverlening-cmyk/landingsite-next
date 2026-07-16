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
  processed_at TIMESTAMPTZ NOT NULL DEFAULT now()
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
ALTER TABLE intake_forms ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
ALTER TABLE generated_pages ADD COLUMN IF NOT EXISTS lead_token TEXT;
ALTER TABLE generated_pages ADD COLUMN IF NOT EXISTS workflow_run_id TEXT;
ALTER TABLE generated_pages ADD COLUMN IF NOT EXISTS error_message TEXT;
ALTER TABLE generated_pages ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ NOT NULL DEFAULT now();

CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_stripe_session ON orders(stripe_session_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_intake_order_unique ON intake_forms(order_id);
CREATE INDEX IF NOT EXISTS idx_pages_order ON generated_pages(order_id, created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_pages_lead_token ON generated_pages(lead_token) WHERE lead_token IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_leads_page ON leads(generated_page_id, created_at DESC);

-- Alle browsertoegang blijft dicht; serverroutes gebruiken uitsluitend de service-role key.
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE intake_forms ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE stripe_webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Publieke klantassets worden uitsluitend via een betaalde, server-side uploadroute geplaatst.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('customer-assets', 'customer-assets', true, 5242880, ARRAY['image/jpeg','image/png','image/webp'])
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;
