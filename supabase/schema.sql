-- =============================================================================
-- codecrack.dev — database schema
-- Run this in Supabase SQL Editor on a fresh project.
-- =============================================================================

-- Required extension
create extension if not exists pgcrypto;

-- profiles: extends auth.users, gates access via status
create table profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text not null,
  display_name  text,
  status        text not null default 'waitlist'
                check (status in ('waitlist','approved','suspended')),
  created_at    timestamptz default now(),
  approved_at   timestamptz
);

-- api_keys: never store plaintext, only SHA-256 hash
create table api_keys (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  name         text not null,
  key_hash     text not null unique,    -- sha256(full_key) hex
  key_prefix   text not null,           -- first 12 chars for display
  revoked      boolean not null default false,
  last_used_at timestamptz,
  created_at   timestamptz default now()
);
create index idx_api_keys_hash on api_keys(key_hash) where revoked = false;
create index idx_api_keys_user on api_keys(user_id) where revoked = false;

-- credits: USD balance per user, atomic decrement via RPC
create table credits (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  balance_usd numeric(12,6) not null default 0
              check (balance_usd >= -0.01),
  updated_at  timestamptz default now()
);

-- usage_logs: one row per gateway request
create table usage_logs (
  id                uuid primary key default gen_random_uuid(),
  user_id           uuid not null references auth.users(id) on delete cascade,
  api_key_id        uuid references api_keys(id) on delete set null,
  request_id        text,
  model             text not null default 'hermes-agent',
  prompt_tokens     integer not null default 0,
  completion_tokens integer not null default 0,
  total_tokens      integer not null default 0,
  cost_usd          numeric(12,8) not null default 0,
  status_code       integer not null,
  duration_ms       integer,
  streaming         boolean not null default false,
  created_at        timestamptz default now()
);
create index idx_usage_user_time on usage_logs(user_id, created_at desc);

-- waitlist: anonymous signups
create table waitlist (
  id         uuid primary key default gen_random_uuid(),
  email      text not null unique,
  use_case   text,
  source     text,
  approved   boolean not null default false,
  created_at timestamptz default now()
);

-- RLS: enable everywhere, self-read policies
alter table profiles    enable row level security;
alter table api_keys    enable row level security;
alter table credits     enable row level security;
alter table usage_logs  enable row level security;
alter table waitlist    enable row level security;

create policy profiles_self_read on profiles
  for select using (auth.uid() = id);
create policy api_keys_self_read on api_keys
  for select using (auth.uid() = user_id);
create policy api_keys_self_insert on api_keys
  for insert with check (auth.uid() = user_id);
create policy api_keys_self_update on api_keys
  for update using (auth.uid() = user_id);
create policy credits_self_read on credits
  for select using (auth.uid() = user_id);
create policy usage_logs_self_read on usage_logs
  for select using (auth.uid() = user_id);
create policy waitlist_anon_insert on waitlist
  for insert with check (true);

-- Auto-create profile + zero credits on signup
create or replace function handle_new_user()
returns trigger language plpgsql security definer
set search_path = public as $$
begin
  insert into profiles (id, email) values (new.id, new.email)
    on conflict (id) do nothing;
  insert into credits (user_id, balance_usd) values (new.id, 0)
    on conflict (user_id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Atomic credit deduction (called from gateway via service-role)
create or replace function deduct_credits(p_user_id uuid, p_amount numeric)
returns numeric language plpgsql security definer as $$
declare v_balance numeric;
begin
  update credits set balance_usd = balance_usd - p_amount,
                     updated_at = now()
  where user_id = p_user_id
  returning balance_usd into v_balance;
  return v_balance;
end; $$;
