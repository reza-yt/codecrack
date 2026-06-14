-- Migration 002: Token quota system + admin panel
-- Run this in Supabase SQL Editor.
--
-- Adds:
--   1. profiles.role ('user' | 'admin') for admin gate
--   2. api_keys.token_quota + tokens_used for hard token limits
--   3. consume_tokens() RPC: atomic deduction with hard limit check
--   4. promote operator email to admin (CHANGE THIS BEFORE RUNNING)
--   5. Admin RLS policies on tables
--
-- Idempotent. Safe to re-run.

begin;

-- ────────────────────────────────────────────────────────
-- 1. profiles.role for admin gate
-- ────────────────────────────────────────────────────────
alter table profiles
  add column if not exists role text not null default 'user'
    check (role in ('user', 'admin'));

create index if not exists idx_profiles_role on profiles(role) where role = 'admin';

-- ────────────────────────────────────────────────────────
-- 2. api_keys.token_quota + tokens_used
--    NULL = unlimited (uses USD credits, legacy behavior)
--    > 0  = hard token limit (admin-issued resale keys)
-- ────────────────────────────────────────────────────────
alter table api_keys
  add column if not exists token_quota bigint
    check (token_quota is null or token_quota > 0);

alter table api_keys
  add column if not exists tokens_used bigint not null default 0
    check (tokens_used >= 0);

-- Optional metadata for batch tracking (e.g. "batch-2026-06-13-resell")
alter table api_keys
  add column if not exists batch_label text;

-- Issued by admin (NULL = self-served via dashboard)
alter table api_keys
  add column if not exists issued_by uuid references auth.users(id) on delete set null;

create index if not exists idx_api_keys_batch on api_keys(batch_label) where batch_label is not null;

-- Allow api_keys without a user_id (admin-issued floating keys not tied to a user account).
alter table api_keys
  alter column user_id drop not null;

-- ────────────────────────────────────────────────────────
-- 3. consume_tokens RPC — atomic decrement with hard limit
-- ────────────────────────────────────────────────────────
-- Returns:
--   { ok: bool, remaining: bigint, billed_to: 'quota' | 'credits' | 'rejected' }
--
-- Logic:
--   - If api_keys.token_quota IS NOT NULL → check tokens_used + amount <= quota
--       → if ok: increment tokens_used, return ok=true, billed_to='quota'
--       → if exceeds: return ok=false, billed_to='rejected'
--   - Else (legacy USD): defer to caller (gateway still does deduct_credits)
--
-- This is wrapped in a single UPDATE so concurrent requests can't race past the limit.

create or replace function consume_tokens(
  p_api_key_id uuid,
  p_tokens bigint
)
returns table(ok boolean, remaining bigint, billed_to text)
language plpgsql security definer as $$
declare
  v_quota bigint;
  v_used  bigint;
  v_new_used bigint;
begin
  select token_quota, tokens_used
    into v_quota, v_used
    from api_keys
    where id = p_api_key_id and revoked = false
    for update;

  if not found then
    return query select false, 0::bigint, 'rejected'::text;
    return;
  end if;

  if v_quota is null then
    -- legacy: gateway falls back to USD credit deduction
    return query select true, (-1)::bigint, 'credits'::text;
    return;
  end if;

  v_new_used := v_used + p_tokens;
  if v_new_used > v_quota then
    return query select false, (v_quota - v_used)::bigint, 'rejected'::text;
    return;
  end if;

  update api_keys
    set tokens_used = v_new_used,
        last_used_at = now()
    where id = p_api_key_id;

  return query select true, (v_quota - v_new_used)::bigint, 'quota'::text;
end; $$;

-- Sanity check the new RPC exists with correct shape
do $$
begin
  if not exists (
    select 1 from pg_proc where proname = 'consume_tokens'
  ) then
    raise exception 'consume_tokens function not created';
  end if;
end $$;

-- ────────────────────────────────────────────────────────
-- 4. Promote operator to admin
--    Replace 'mvgreza@gmail.com' below with your email if different.
-- ────────────────────────────────────────────────────────
update profiles
  set role = 'admin'
  where email = 'mvgreza@gmail.com';

-- ────────────────────────────────────────────────────────
-- 5. Admin RLS policies
--    Admins can read all rows (read-only — mutations go through service-role
--    in Server Actions, so we don't grant insert/update/delete here).
-- ────────────────────────────────────────────────────────

drop policy if exists profiles_admin_read on profiles;
create policy profiles_admin_read on profiles
  for select using (
    exists (
      select 1 from profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

drop policy if exists api_keys_admin_read on api_keys;
create policy api_keys_admin_read on api_keys
  for select using (
    exists (
      select 1 from profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

drop policy if exists usage_logs_admin_read on usage_logs;
create policy usage_logs_admin_read on usage_logs
  for select using (
    exists (
      select 1 from profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

drop policy if exists credits_admin_read on credits;
create policy credits_admin_read on credits
  for select using (
    exists (
      select 1 from profiles p
      where p.id = auth.uid() and p.role = 'admin'
    )
  );

commit;

-- Verification queries (run after the migration to sanity-check):
--   select id, email, role from profiles where role = 'admin';
--   select column_name, data_type from information_schema.columns where table_name = 'api_keys' and column_name in ('token_quota', 'tokens_used', 'batch_label', 'issued_by');
--   select * from consume_tokens(gen_random_uuid(), 100);  -- should return rejected (no key)
