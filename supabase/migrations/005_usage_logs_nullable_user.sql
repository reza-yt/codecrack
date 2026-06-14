-- ============================================================
-- Migration 005: allow usage_logs.user_id to be NULL
-- ============================================================
-- Migration 002 dropped NOT NULL on api_keys.user_id so the operator
-- could mint admin-issued resale keys (cc_live_…) that aren't tied
-- to a Supabase auth account. The gateway happily uses those keys,
-- deducts quota via consume_tokens, and forwards traffic — but then
-- the after() hook tries `INSERT INTO usage_logs (user_id, ...)`
-- with user_id = NULL and hits a NOT NULL violation. The error is
-- swallowed (just console.error in Vercel logs) so /admin/usage
-- shows "Belum ada pemakaian." even though tokens_used on the key
-- is going up.
--
-- Fix: drop NOT NULL on usage_logs.user_id. We still keep the FK
-- (with on delete cascade for the legacy multi-tenant case) — NULL
-- is a valid value for admin-issued resale traffic.
--
-- Also rebuild the (user_id, created_at) index to cover NULL rows
-- so admin-side queries that don't filter by user remain fast.

alter table usage_logs
  alter column user_id drop not null;

-- The existing partial-ish index idx_usage_user_time was created on
-- (user_id, created_at desc) without a WHERE clause, so it already
-- indexes NULLs in PG ≥ 11 — no rebuild needed. We add a dedicated
-- created_at index for the admin /usage page which scans all rows
-- ordered by time, regardless of user.
create index if not exists idx_usage_created_at
  on usage_logs(created_at desc);

-- Sanity check
do $$
begin
  if (
    select is_nullable
    from information_schema.columns
    where table_schema = 'public'
      and table_name = 'usage_logs'
      and column_name = 'user_id'
  ) <> 'YES' then
    raise exception 'usage_logs.user_id is still NOT NULL';
  end if;
end $$;
