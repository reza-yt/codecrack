-- Migration 001: Open access for MVP
-- Run this in Supabase SQL Editor on an EXISTING project to:
--   1. Flip default profile status from 'waitlist' to 'approved'
--   2. Auto-grant $1 starter credits to new signups
--   3. Bump existing waitlisted users to approved
--   4. Backfill $1 starter credits for existing users with $0 balance
--   5. Add a self-update RLS policy on profiles (so display_name save works)
--
-- Safe to re-run.

begin;

-- 1. Default new profiles to 'approved'
alter table profiles
  alter column status set default 'approved';

-- 2 & 3. Replace handle_new_user() to mint approved profile + $1 credits.
--        Bump existing waitlisted users at the same time.
create or replace function handle_new_user()
returns trigger language plpgsql security definer
set search_path = public as $$
begin
  insert into profiles (id, email, status, approved_at)
    values (new.id, new.email, 'approved', now())
    on conflict (id) do nothing;
  insert into credits (user_id, balance_usd) values (new.id, 1.00)
    on conflict (user_id) do nothing;
  return new;
end; $$;

update profiles
  set status = 'approved', approved_at = coalesce(approved_at, now())
  where status = 'waitlist';

-- 4. Backfill credits: any user at exactly $0 gets the starter $1.
--    Skips users with existing positive balance and users who've already
--    spent some credit (negative or non-zero).
update credits
  set balance_usd = 1.00, updated_at = now()
  where balance_usd = 0;

-- 5. Self-update policy on profiles (Settings page needs it).
do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
      and policyname = 'profiles_self_update'
  ) then
    create policy profiles_self_update on profiles
      for update using (auth.uid() = id);
  end if;
end $$;

commit;
