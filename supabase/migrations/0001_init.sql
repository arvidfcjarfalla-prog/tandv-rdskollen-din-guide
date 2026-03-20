create extension if not exists pgcrypto;

create table if not exists clinics (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  org_number text,
  city text not null,
  municipality_code text not null,
  postal_code text,
  address text,
  lat numeric,
  lng numeric,
  phone text,
  email text,
  avg_rating numeric,
  review_count integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists procedures (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  category text not null,
  is_supported_by_state boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists reference_prices (
  id uuid primary key default gen_random_uuid(),
  procedure_id uuid not null references procedures(id) on delete cascade,
  amount_sek integer not null,
  valid_from date not null,
  valid_to date,
  unique (procedure_id, valid_from)
);

create table if not exists benchmark_snapshots (
  id uuid primary key default gen_random_uuid(),
  source text not null default 'tandpriskollen',
  source_version text,
  imported_at timestamptz not null default now(),
  effective_date date not null
);

create table if not exists benchmark_prices (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references clinics(id) on delete cascade,
  procedure_id uuid not null references procedures(id) on delete cascade,
  median_price_sek integer not null,
  snapshot_id uuid not null references benchmark_snapshots(id) on delete cascade,
  unique (clinic_id, procedure_id, snapshot_id)
);

create table if not exists damage_requests (
  id uuid primary key default gen_random_uuid(),
  patient_user_id uuid,
  status text not null check (status in ('new','matched','quoted','closed','expired')),
  municipality_code text not null,
  postal_code text not null,
  symptom_summary text not null,
  pain_level integer not null check (pain_level between 0 and 10),
  is_acute boolean not null default false,
  preferred_time_window text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists damage_request_procedures (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references damage_requests(id) on delete cascade,
  procedure_id uuid not null references procedures(id) on delete cascade,
  priority integer not null default 1
);

create table if not exists quotes (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references damage_requests(id) on delete cascade,
  clinic_id uuid not null references clinics(id) on delete cascade,
  status text not null check (status in ('submitted','withdrawn','accepted','rejected')),
  total_min_sek integer not null,
  total_max_sek integer not null,
  earliest_slot timestamptz,
  notes text,
  valid_until timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists quote_items (
  id uuid primary key default gen_random_uuid(),
  quote_id uuid not null references quotes(id) on delete cascade,
  procedure_id uuid not null references procedures(id) on delete cascade,
  price_min_sek integer not null,
  price_max_sek integer not null,
  comment text
);

create table if not exists lead_events (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references damage_requests(id) on delete cascade,
  event_name text not null,
  actor_type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists idx_clinics_city on clinics(city);
create index if not exists idx_clinics_municipality on clinics(municipality_code);
create index if not exists idx_requests_created on damage_requests(created_at desc);
create index if not exists idx_quotes_request on quotes(request_id);
