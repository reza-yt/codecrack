-- Migration 003: Single-admin lock + auto-promote
-- Run this in Supabase SQL Editor.
--
-- Scope:
--   1. Hard-lock admin email — only this email can sign in
--   2. Auto-promote admin email on login (handle_new_user trigger updated)
--   3. Block any non-admin email from creating a profile
--   4. Backfill: ensure mvgreza@gmail.com profile exists, role=admin, status=approved
--
-- Idempotent. Safe to re-run.
--
-- IMPORTANT: Update Supabase Auth → URL Configuration → restrict to single email
-- via "Email auth → Email allowlist" if you want a hard wall at the auth layer
-- too. This migration handles the database layer.

begin;

-- ────────────────────────────────────────────────────────
-- 1. Replace handle_new_user trigger to auto-promote admin email
--    and reject any other email from creating a profile.
-- ────────────────────────────────────────────────────────
create or replace function handle_new_user()
returns trigger language plpgsql security definer
set search_path = public as $$
declare
  v_admin_email text := 'mvgreza@gmail.com';
begin
  -- Reject any non-admin email at the database layer.
  -- Auth layer (Supabase Email allowlist) should also be configured.
  if new.email is distinct from v_admin_email then
    raise exception 'Akses ditolak. Email % tidak diperbolehkan masuk.', new.email
      using errcode = 'P0001';
  end if;

  insert into profiles (id, email, role, status, approved_at)
    values (new.id, new.email, 'admin', 'approved', now())
    on conflict (id) do update
      set role = 'admin',
          status = 'approved',
          approved_at = coalesce(profiles.approved_at, now());

  insert into credits (user_id, balance_usd) values (new.id, 0)
    on conflict (user_id) do nothing;
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- ────────────────────────────────────────────────────────
-- 2. Backfill: force admin email to be admin + approved
--    (in case profile was created before this migration)
-- ────────────────────────────────────────────────────────
update profiles
  set role = 'admin', status = 'approved', approved_at = coalesce(approved_at, now())
  where email = 'mvgreza@gmail.com';

-- ────────────────────────────────────────────────────────
-- 3. Demote any other admin (single-admin guarantee)
-- ────────────────────────────────────────────────────────
update profiles
  set role = 'user'
  where role = 'admin' and email <> 'mvgreza@gmail.com';

-- ────────────────────────────────────────────────────────
-- 4. Suspend any other existing user account
--    (they can't login anyway, but lock their data too)
-- ────────────────────────────────────────────────────────
update profiles
  set status = 'suspended'
  where email <> 'mvgreza@gmail.com' and status <> 'suspended';

commit;

-- Verification:
--   select id, email, role, status from profiles;
--   -- harus cuma mvgreza@gmail.com dengan role=admin, status=approved
--
--   select count(*) from profiles where role = 'admin';
--   -- harus 1
