-- Landingsite.nl — Database migratie
-- Voer dit uit in de Supabase SQL Editor van je project

CREATE TABLE IF NOT EXISTS orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_session_id TEXT UNIQUE NOT NULL,
  stripe_payment_intent TEXT,
  email TEXT NOT NULL DEFAULT '',
  pakket TEXT NOT NULL CHECK (pakket IN ('starter', 'pro', 'premium')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'generating', 'completed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS intake_forms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  bedrijfsnaam TEXT NOT NULL,
  niche TEXT NOT NULL,
  beschrijving TEXT NOT NULL,
  usp_1 TEXT NOT NULL DEFAULT '',
  usp_2 TEXT NOT NULL DEFAULT '',
  usp_3 TEXT NOT NULL DEFAULT '',
  extra_fields JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS generated_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES orders(id) ON DELETE CASCADE,
  netlify_site_id TEXT,
  netlify_url TEXT,
  html_content TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'generating', 'completed', 'failed')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Row Level Security uitschakelen (we gebruiken service role key)
ALTER TABLE orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE intake_forms DISABLE ROW LEVEL SECURITY;
ALTER TABLE generated_pages DISABLE ROW LEVEL SECURITY;

-- Index voor snelle lookups
CREATE INDEX IF NOT EXISTS idx_orders_stripe_session ON orders(stripe_session_id);
CREATE INDEX IF NOT EXISTS idx_intake_order ON intake_forms(order_id);
CREATE INDEX IF NOT EXISTS idx_pages_order ON generated_pages(order_id);
