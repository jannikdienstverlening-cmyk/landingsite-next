-- Landingsite Lead Engine — fase 1
-- Idempotent uit te voeren na supabase-migration.sql.

CREATE TABLE IF NOT EXISTS prospects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dedupe_key TEXT UNIQUE NOT NULL,
  kvk_number TEXT,
  establishment_number TEXT,
  source TEXT NOT NULL DEFAULT 'KVK',
  source_record_id TEXT,
  company_name TEXT NOT NULL,
  trade_names JSONB NOT NULL DEFAULT '[]'::jsonb,
  place TEXT NOT NULL DEFAULT '',
  postcode TEXT,
  address TEXT,
  legal_form TEXT,
  registration_date DATE,
  active BOOLEAN NOT NULL DEFAULT true,
  employee_count INTEGER,
  non_mailing BOOLEAN NOT NULL DEFAULT false,
  sbi_codes JSONB NOT NULL DEFAULT '[]'::jsonb,
  source_payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  website_url TEXT,
  phone TEXT,
  email TEXT,
  google_place_id TEXT,
  google_rating NUMERIC(2,1),
  google_review_count INTEGER,
  opportunity_score INTEGER NOT NULL DEFAULT 0 CHECK (opportunity_score BETWEEN 0 AND 100),
  score_class TEXT NOT NULL DEFAULT 'LOW' CHECK (score_class IN ('LOW','MEDIUM','GOOD','HOT','VERY_HOT')),
  pipeline_status TEXT NOT NULL DEFAULT 'NEW' CHECK (pipeline_status IN ('NEW','RESEARCHED','HOT','CONTACT_READY','CONTACTED','REPLIED','INTERESTED','APPOINTMENT','PROPOSAL','WON','LOST','DO_NOT_CONTACT')),
  recommended_channel TEXT CHECK (recommended_channel IS NULL OR recommended_channel IN ('EMAIL','INSTAGRAM','LINKEDIN','WHATSAPP','PHONE')),
  next_action TEXT,
  next_action_at TIMESTAMPTZ,
  estimated_value_cents INTEGER NOT NULL DEFAULT 0 CHECK (estimated_value_cents >= 0),
  legitimate_interest_note TEXT,
  retention_until TIMESTAMPTZ,
  discovered_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_enriched_at TIMESTAMPTZ,
  last_audited_at TIMESTAMPTZ,
  last_activity_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE prospects ALTER COLUMN kvk_number DROP NOT NULL;
ALTER TABLE prospects ADD COLUMN IF NOT EXISTS source_record_id TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS idx_prospects_kvk_establishment
  ON prospects (kvk_number, COALESCE(establishment_number, ''));
CREATE UNIQUE INDEX IF NOT EXISTS idx_prospects_source_record
  ON prospects (source, source_record_id) WHERE source_record_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_prospects_priority ON prospects (score_class, opportunity_score DESC, discovered_at DESC);
CREATE INDEX IF NOT EXISTS idx_prospects_place ON prospects (place, opportunity_score DESC);
CREATE INDEX IF NOT EXISTS idx_prospects_pipeline ON prospects (pipeline_status, next_action_at);

CREATE TABLE IF NOT EXISTS prospect_urls (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id UUID NOT NULL REFERENCES prospects(id) ON DELETE CASCADE,
  kind TEXT NOT NULL CHECK (kind IN ('WEBSITE','GOOGLE_BUSINESS','INSTAGRAM','FACEBOOK','TIKTOK','LINKEDIN')),
  url TEXT NOT NULL,
  normalized_url TEXT NOT NULL,
  confidence NUMERIC(4,3) NOT NULL CHECK (confidence BETWEEN 0 AND 1),
  source TEXT NOT NULL,
  evidence JSONB NOT NULL DEFAULT '{}'::jsonb,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (prospect_id, kind, normalized_url)
);

CREATE TABLE IF NOT EXISTS website_audits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id UUID NOT NULL REFERENCES prospects(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  design_score INTEGER NOT NULL CHECK (design_score BETWEEN 0 AND 100),
  seo_score INTEGER NOT NULL CHECK (seo_score BETWEEN 0 AND 100),
  performance_score INTEGER NOT NULL CHECK (performance_score BETWEEN 0 AND 100),
  conversion_score INTEGER NOT NULL CHECK (conversion_score BETWEEN 0 AND 100),
  trust_score INTEGER NOT NULL CHECK (trust_score BETWEEN 0 AND 100),
  signals JSONB NOT NULL DEFAULT '{}'::jsonb,
  summary TEXT NOT NULL DEFAULT '',
  visual_assessment TEXT,
  audited_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_website_audits_latest ON website_audits (prospect_id, audited_at DESC);

CREATE TABLE IF NOT EXISTS score_weights (
  key TEXT PRIMARY KEY,
  label TEXT NOT NULL,
  value INTEGER NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO score_weights (key, label, value) VALUES
  ('no_website', 'Geen website', 35),
  ('outdated_website', 'Zeer slechte of verouderde website', 25),
  ('not_mobile_friendly', 'Niet mobielvriendelijk', 20),
  ('young_business', 'Bedrijf jonger dan 12 maanden', 20),
  ('active_instagram_bad_site', 'Actief Instagram en slechte/geen website', 20),
  ('google_reviews_20', '20+ Google-reviews', 15),
  ('slow_website', 'Website langzaam', 10),
  ('no_cta', 'Geen duidelijke CTA', 10),
  ('no_quote_or_booking', 'Geen offerte- of afspraakfunctie', 10),
  ('social_only', 'Alleen socialmedia-aanwezigheid', 15),
  ('modern_professional', 'Moderne professionele website', -35),
  ('digital_agency', 'Marketing-, webdesign- of IT-bedrijf', -50)
ON CONFLICT (key) DO NOTHING;

CREATE TABLE IF NOT EXISTS prospect_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id UUID NOT NULL REFERENCES prospects(id) ON DELETE CASCADE,
  score INTEGER NOT NULL CHECK (score BETWEEN 0 AND 100),
  class TEXT NOT NULL CHECK (class IN ('LOW','MEDIUM','GOOD','HOT','VERY_HOT')),
  breakdown JSONB NOT NULL DEFAULT '[]'::jsonb,
  model_version TEXT NOT NULL DEFAULT 'phase-1',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_prospect_scores_latest ON prospect_scores (prospect_id, created_at DESC);

CREATE TABLE IF NOT EXISTS sales_analyses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id UUID NOT NULL REFERENCES prospects(id) ON DELETE CASCADE,
  why_interesting TEXT NOT NULL,
  biggest_problem TEXT NOT NULL,
  recommended_improvement TEXT NOT NULL,
  recommended_service TEXT NOT NULL,
  opening_line TEXT NOT NULL,
  model TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_sales_analyses_latest ON sales_analyses (prospect_id, created_at DESC);

CREATE TABLE IF NOT EXISTS outreach_drafts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id UUID NOT NULL REFERENCES prospects(id) ON DELETE CASCADE,
  channel TEXT NOT NULL CHECK (channel IN ('EMAIL','INSTAGRAM','LINKEDIN','WHATSAPP','PHONE')),
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'READY' CHECK (status IN ('READY','APPROVED','SENT','SKIPPED','SNOOZED','FAILED')),
  send_mode TEXT NOT NULL DEFAULT 'MANUAL' CHECK (send_mode IN ('MANUAL','OFFICIAL_API')),
  profile_url TEXT,
  scheduled_for TIMESTAMPTZ,
  sent_at TIMESTAMPTZ,
  provider_message_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_outreach_queue ON outreach_drafts (status, scheduled_for, created_at);

CREATE TABLE IF NOT EXISTS crm_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id UUID NOT NULL REFERENCES prospects(id) ON DELETE CASCADE,
  body TEXT NOT NULL,
  author_subject TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS crm_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id UUID NOT NULL REFERENCES prospects(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  channel TEXT,
  outcome TEXT,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_crm_activity_timeline ON crm_activities (prospect_id, occurred_at DESC);

CREATE TABLE IF NOT EXISTS prospect_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id UUID NOT NULL REFERENCES prospects(id) ON DELETE CASCADE,
  from_status TEXT,
  to_status TEXT NOT NULL,
  actor_subject TEXT NOT NULL DEFAULT 'system',
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS outreach_outcomes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id UUID NOT NULL REFERENCES prospects(id) ON DELETE CASCADE,
  draft_id UUID REFERENCES outreach_drafts(id) ON DELETE SET NULL,
  channel TEXT NOT NULL,
  outcome TEXT NOT NULL CHECK (outcome IN ('NO_RESPONSE','POSITIVE','NEGATIVE','APPOINTMENT','CUSTOMER')),
  opening_variant TEXT,
  offer TEXT,
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS suppression_list (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kind TEXT NOT NULL CHECK (kind IN ('KVK','EMAIL','PHONE','DOMAIN','SOURCE')),
  normalized_value TEXT NOT NULL,
  reason TEXT NOT NULL,
  scope TEXT NOT NULL DEFAULT 'ALL',
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (kind, normalized_value)
);

ALTER TABLE suppression_list DROP CONSTRAINT IF EXISTS suppression_list_kind_check;
ALTER TABLE suppression_list ADD CONSTRAINT suppression_list_kind_check
  CHECK (kind IN ('KVK','EMAIL','PHONE','DOMAIN','SOURCE'));

CREATE TABLE IF NOT EXISTS lead_engine_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_subject TEXT NOT NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT,
  details JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_lead_engine_audit_log ON lead_engine_audit_log (created_at DESC);

CREATE TABLE IF NOT EXISTS lead_engine_job_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  workflow_run_id TEXT UNIQUE,
  job_type TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('RUNNING','COMPLETED','FAILED')),
  counters JSONB NOT NULL DEFAULT '{}'::jsonb,
  error_message TEXT,
  started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  finished_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS kvk_mutation_events (
  event_id TEXT PRIMARY KEY,
  subscription_id TEXT NOT NULL,
  signal_id TEXT NOT NULL,
  signal_type TEXT NOT NULL,
  kvk_number TEXT,
  establishment_number TEXT,
  registered_at TIMESTAMPTZ,
  payload JSONB NOT NULL,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS demo_previews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  prospect_id UUID NOT NULL REFERENCES prospects(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL,
  content JSONB NOT NULL,
  generated_fields JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'INTERNAL' CHECK (status IN ('INTERNAL','SHARED','ARCHIVED')),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS lead_engine_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO lead_engine_settings (key, value) VALUES
  ('retention', '{"uncontacted_days":180,"lost_days":365,"audit_log_days":730}'::jsonb),
  ('market', '{"name":"Veenendaal + 30 km","radius_km":30}'::jsonb)
ON CONFLICT (key) DO NOTHING;

CREATE TABLE IF NOT EXISTS lead_engine_roles (
  subject TEXT PRIMARY KEY,
  role TEXT NOT NULL CHECK (role IN ('ADMIN','SALES','RESEARCHER','VIEWER')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Browsertoegang is gesloten; alleen vertrouwde serverroutes gebruiken de service-role key.
ALTER TABLE prospects ENABLE ROW LEVEL SECURITY;
ALTER TABLE prospect_urls ENABLE ROW LEVEL SECURITY;
ALTER TABLE website_audits ENABLE ROW LEVEL SECURITY;
ALTER TABLE score_weights ENABLE ROW LEVEL SECURITY;
ALTER TABLE prospect_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE outreach_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE prospect_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE outreach_outcomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE suppression_list ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_engine_audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_engine_job_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE kvk_mutation_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE demo_previews ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_engine_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_engine_roles ENABLE ROW LEVEL SECURITY;
