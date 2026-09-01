create table if not exists public.social_api_connections (
  platform text primary key check (platform in ('instagram', 'tiktok')),
  account_id text not null,
  account_username text,
  access_token_ciphertext text not null,
  refresh_token_ciphertext text,
  access_expires_at timestamptz,
  refresh_expires_at timestamptz,
  scopes text[] not null default '{}',
  metadata jsonb not null default '{}'::jsonb,
  connected_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.social_api_connections enable row level security;
revoke all on public.social_api_connections from anon, authenticated;

comment on table public.social_api_connections is
  'Versleutelde server-side OAuth-koppelingen voor de officiële Landingsite.nl-socialaccounts.';
