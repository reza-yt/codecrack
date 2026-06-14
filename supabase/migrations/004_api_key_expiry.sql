-- Migration 004: API key expiry
-- Run di Supabase SQL Editor.
--
-- Scope:
--   1. Tambah kolom api_keys.expires_at (NULL = tidak pernah expire)
--   2. Index untuk filter cepat key yang masih aktif
--   3. Update consume_tokens() untuk tolak key yang sudah expired
--
-- Idempotent. Aman re-run.

begin;

-- 1. Kolom expires_at
alter table api_keys
  add column if not exists expires_at timestamptz;

-- Index untuk filter active+not-expired keys (gateway hot path).
-- Catatan: Postgres tidak izinkan now() di partial index predicate karena
-- now() bukan IMMUTABLE. Kita filter expired di query layer aja, dan tetap
-- kasih index buat (revoked, expires_at) supaya gateway lookup tetap cepat.
create index if not exists idx_api_keys_lookup
  on api_keys(key_hash)
  where revoked = false;
create index if not exists idx_api_keys_expires
  on api_keys(expires_at)
  where expires_at is not null;

-- 2. Update consume_tokens() supaya tolak key yang sudah expired.
--    Schema migration 002 punya consume_tokens dengan signature:
--      consume_tokens(p_api_key_id uuid, p_tokens int)
--    returns boolean — true kalau commit, false kalau quota habis.
--    Kita extend untuk reject expired juga.
create or replace function consume_tokens(
  p_api_key_id uuid,
  p_tokens int
) returns boolean
language plpgsql
security definer
set search_path = public as $$
declare
  v_quota int;
  v_used int;
  v_revoked boolean;
  v_expires timestamptz;
begin
  select token_quota, tokens_used, revoked, expires_at
    into v_quota, v_used, v_revoked, v_expires
    from api_keys
    where id = p_api_key_id
    for update;

  if not found then
    return false;
  end if;

  if v_revoked then
    return false;
  end if;

  if v_expires is not null and v_expires <= now() then
    return false;
  end if;

  -- Quota keys harus punya v_quota tidak null. Kalau null, ini USD-credit
  -- key, jangan consume_tokens — caller seharusnya panggil deduct_credits.
  if v_quota is null then
    return false;
  end if;

  if v_used + p_tokens > v_quota then
    return false;
  end if;

  update api_keys
    set tokens_used = tokens_used + p_tokens
    where id = p_api_key_id;

  return true;
end; $$;

commit;

-- Verification:
--   select column_name, data_type from information_schema.columns
--     where table_name = 'api_keys' and column_name = 'expires_at';
--   -- harus ada row 'expires_at | timestamp with time zone'
