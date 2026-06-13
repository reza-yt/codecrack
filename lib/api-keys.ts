import crypto from "node:crypto";

/**
 * API key format:
 *   cc_live_<32 base62 chars>  → 40 chars total
 *
 * Storage:
 *   key_hash   = sha256(full_key) hex (lookup index)
 *   key_prefix = first 12 chars (display only)
 */

const KEY_PREFIX = "cc_live_";
const RANDOM_LEN = 32;
export const KEY_REGEX = /^cc_live_[A-Za-z0-9]{32}$/;

export interface GeneratedKey {
  full: string;
  prefix: string;
  hash: string;
}

/** Generate a fresh API key. Only call this server-side. */
export function generateApiKey(): GeneratedKey {
  // Use 48 random bytes, base64url encode, strip non-alphanumerics, take 32.
  // 48 * 8 / 6 = 64 base64 chars before stripping; well above 32 even after
  // dropping `-` and `_`. If we somehow come up short, top up with hex.
  let random = crypto
    .randomBytes(48)
    .toString("base64url")
    .replace(/[-_]/g, "");
  while (random.length < RANDOM_LEN) {
    random += crypto.randomBytes(8).toString("hex");
  }
  random = random.slice(0, RANDOM_LEN);
  const full = `${KEY_PREFIX}${random}`;
  const prefix = full.slice(0, 12);
  const hash = sha256Hex(full);
  return { full, prefix, hash };
}

/** Constant-time-friendly: lookup is by indexed hash, no string compare. */
export function sha256Hex(input: string): string {
  return crypto.createHash("sha256").update(input).digest("hex");
}

export function isValidKeyFormat(key: string): boolean {
  return KEY_REGEX.test(key);
}

/**
 * Mask a key prefix for display. The DB only stores the 12-char prefix,
 * so we render `cc_live_xxxx••••••••` style.
 */
export function maskKeyPrefix(prefix: string): string {
  return `${prefix}${"•".repeat(28)}`;
}
